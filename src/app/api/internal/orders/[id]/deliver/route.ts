// src/app/api/internal/orders/[id]/deliver/route.ts
// POST /api/internal/orders/[id]/deliver — 内部自动发货（需 x-internal-token）

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ensureDatabaseReady } from "@/lib/api/bootstrap";
import { jsonResponse, optionsResponse } from "@/lib/api/cors";
import { HttpError } from "@/lib/api/errors";
import { timingSafeEqual } from "@/lib/api/admin-session";
import { writeAuditLog } from "@/lib/api/audit";
import { writeNotification } from "@/lib/api/notifications";
import { sendDeliveryEmail } from "@/lib/api/mailer";
import { decryptInventoryValue, encryptInventoryValue } from "@/lib/api/inventory-crypto";
import { formatDelivery, formatOrder } from "@/lib/api/formatters";
import type { OrderRow, DeliveryRow, InventoryItemRow, SkuRow } from "@/lib/api/types";

function maskValue(value: string): string {
  const normalized = value.trim();
  if (normalized.length <= 6) return "***";
  return `${normalized.slice(0, 3)}***${normalized.slice(-3)}`;
}

export async function OPTIONS(request: Request) {
  const { env } = await getCloudflareContext();
  return optionsResponse(request, env as CloudflareEnv);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { env } = await getCloudflareContext();
  const cloudflareEnv = env as CloudflareEnv;

  try {
    // 内部 token 验证（生产环境强制）
    const internalToken = request.headers.get("x-internal-token") || "";
    const isProduction = cloudflareEnv.NODE_ENV === "production";
    if (isProduction) {
      if (
        !cloudflareEnv.INTERNAL_API_SECRET ||
        !timingSafeEqual(internalToken, cloudflareEnv.INTERNAL_API_SECRET)
      ) {
        return jsonResponse(
          { error: "internal auth required" },
          401,
          request,
          cloudflareEnv
        );
      }
    }

    const { id } = await params;
    const db = cloudflareEnv.DB;
    await ensureDatabaseReady(db);

    // 1. 查询订单，验证存在
    const order = await db
      .prepare("SELECT * FROM orders WHERE id = ?")
      .bind(id)
      .first<OrderRow>();

    if (!order) throw new HttpError(404, "order not found");

    if (order.status === "completed") {
      const delivery = await db
        .prepare("SELECT * FROM deliveries WHERE order_id = ? ORDER BY created_at DESC LIMIT 1")
        .bind(id)
        .first<DeliveryRow>();
      return jsonResponse(
        {
          order: formatOrder(order),
          delivery: delivery ? formatDelivery(delivery) : null,
          notification: null,
        },
        200,
        request,
        cloudflareEnv
      );
    }

    const sku = await db
      .prepare("SELECT * FROM skus WHERE id = ? LIMIT 1")
      .bind(order.sku_id)
      .first<SkuRow>();

    const skuSnapshot = (() => {
      try {
        return JSON.parse(order.sku_snapshot) as { deliveryType?: string };
      } catch {
        return {};
      }
    })();
    const deliveryType = sku?.delivery_type || skuSnapshot.deliveryType || "manual";

    if (deliveryType !== "auto") {
      await db
        .prepare(
          `UPDATE orders
           SET status = 'paid', delivery_status = 'manual_required', updated_at = datetime('now')
           WHERE id = ?`
        )
        .bind(id)
        .run();

      const updatedOrder = await db
        .prepare("SELECT * FROM orders WHERE id = ?")
        .bind(id)
        .first<OrderRow>();

      await writeAuditLog(
        db,
        request,
        { actorId: "internal", role: "internal" },
        "order.delivery_manual_required",
        "order",
        id,
        { deliveryType }
      );

      return jsonResponse(
        {
          order: updatedOrder ? formatOrder(updatedOrder) : null,
          delivery: null,
          notification: null,
          nextAction: "manual_delivery_required",
        },
        200,
        request,
        cloudflareEnv
      );
    }

    // 2. 原子领取一个可用库存项，避免并发订单拿到同一条卡密。
    const inventoryItem = await db
      .prepare(
        `UPDATE inventory_items
         SET status = 'delivered', order_id = ?, sold_at = datetime('now')
         WHERE id = (
           SELECT id FROM inventory_items
           WHERE sku_id = ? AND status = 'available'
           ORDER BY created_at ASC
           LIMIT 1
         )
         AND status = 'available'
         RETURNING *`
      )
      .bind(id, order.sku_id)
      .first<InventoryItemRow>();

    let decryptedValue: string | null = null;
    let deliveryId: string | null = null;

    if (!inventoryItem) {
      await db
        .prepare(
          `UPDATE orders
           SET status = 'delivering', delivery_status = 'manual_required', updated_at = datetime('now')
           WHERE id = ?`
        )
        .bind(id)
        .run();

      await writeAuditLog(
        db,
        request,
        { actorId: "internal", role: "internal" },
        "order.delivery_stockout",
        "order",
        id,
        { skuId: order.sku_id }
      );

      const updatedOrder = await db
        .prepare("SELECT * FROM orders WHERE id = ?")
        .bind(id)
        .first<OrderRow>();

      return jsonResponse(
        {
          order: updatedOrder ? formatOrder(updatedOrder) : null,
          delivery: null,
          notification: null,
          nextAction: "manual_delivery_required",
          error: "auto inventory is empty",
        },
        409,
        request,
        cloudflareEnv
      );
    }

    // 3. 解密库存值并保存到发货记录（加密），邮件和订单详情均来自同一份内容。
    decryptedValue = await decryptInventoryValue(
      inventoryItem.encrypted_value,
      cloudflareEnv.INVENTORY_ENCRYPTION_KEY
    );
    const encryptedDeliveryContent = await encryptInventoryValue(
      decryptedValue,
      cloudflareEnv.INVENTORY_ENCRYPTION_KEY
    );
    const maskedContent = maskValue(decryptedValue);

    // 4. UPDATE orders SET status='completed', delivered_at=datetime('now')
    await db
      .prepare(
        `UPDATE orders
         SET status = 'completed', delivery_status = 'delivered', delivered_at = datetime('now'), updated_at = datetime('now')
         WHERE id = ?`
      )
      .bind(id)
      .run();

    // 5. INSERT INTO deliveries
    deliveryId = crypto.randomUUID();
    await db
      .prepare(
        `INSERT INTO deliveries (id, order_id, method, operator, channel, masked_content, encrypted_content, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'sent', datetime('now'))`
      )
      .bind(
        deliveryId,
        id,
        "auto",
        "internal",
        JSON.stringify(["email"]),
        maskedContent,
        encryptedDeliveryContent
      )
      .run();

    const delivery = await db
      .prepare("SELECT * FROM deliveries WHERE id = ?")
      .bind(deliveryId)
      .first<DeliveryRow>();

    const updatedOrder = await db
      .prepare("SELECT * FROM orders WHERE id = ?")
      .bind(id)
      .first<OrderRow>();

    // 6. 发送发货邮件（fire-and-forget）+ 写 notification + audit_log
    const notificationId = crypto.randomUUID();

    const afterDeliver = (async () => {
      let mailResult: {
        ok: boolean;
        provider: string;
        messageId: string | null;
        error?: string;
      };
      try {
        mailResult = await sendDeliveryEmail(
          updatedOrder!,
          decryptedValue,
          cloudflareEnv
        );
      } catch (err) {
        mailResult = {
          ok: false,
          provider: "mailchannels",
          messageId: null,
          error:
            err instanceof Error
              ? err.message
              : "delivery notification failed",
        };
      }

      // 写 notification
      try {
        await writeNotification(db, {
          orderId: id,
          channel: "email",
          type: "delivery",
          provider: mailResult.provider,
          status: mailResult.ok ? "sent" : "failed",
          messageId: mailResult.messageId,
          error: mailResult.error,
        });
      } catch {
        // 通知写入失败不影响主流程
      }

      // 写 audit_log
      try {
        await writeAuditLog(
          db,
          request,
          { actorId: "internal", role: "internal" },
          "order.deliver",
          "order",
          id,
          {
            deliveryId,
            inventoryItemId: inventoryItem?.id ?? null,
            method: "auto",
          }
        );
      } catch {
        // 审计日志写入失败不影响主流程
      }
    })();

    try {
      const ctx = await getCloudflareContext();
      if (
        ctx.ctx &&
        typeof (ctx.ctx as { waitUntil?: (p: Promise<unknown>) => void })
          .waitUntil === "function"
      ) {
        (
          ctx.ctx as { waitUntil: (p: Promise<unknown>) => void }
        ).waitUntil(afterDeliver);
      }
    } catch {
      // waitUntil 不可用时忽略
    }

    // 7. 返回 { order, delivery, notification }
    return jsonResponse(
      {
        order: updatedOrder ? formatOrder(updatedOrder) : null,
        delivery: delivery ? formatDelivery(delivery) : null,
        notification: {
          id: notificationId,
          orderId: id,
          channel: "email",
          type: "delivery",
        },
      },
      200,
      request,
      cloudflareEnv
    );
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse(
        { error: error.message },
        error.status,
        request,
        cloudflareEnv
      );
    }
    console.error(
      "[POST /api/internal/orders/[id]/deliver] unexpected error:",
      error
    );
    return jsonResponse(
      { error: "internal server error" },
      500,
      request,
      cloudflareEnv
    );
  }
}
