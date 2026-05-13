// src/app/api/internal/orders/[id]/mark-paid/route.ts
// POST /api/internal/orders/[id]/mark-paid — 内部标记订单已支付（需 x-internal-token）

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ensureDatabaseReady } from "@/lib/api/bootstrap";
import { parseBody } from "@/lib/api/body-parser";
import { jsonResponse, optionsResponse } from "@/lib/api/cors";
import { HttpError } from "@/lib/api/errors";
import { timingSafeEqual } from "@/lib/api/admin-session";
import { writeAuditLog } from "@/lib/api/audit";
import { formatOrder } from "@/lib/api/formatters";
import type { OrderRow } from "@/lib/api/types";

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

    const body = await parseBody<{ txHash?: unknown }>(request);
    const txHash = body.txHash !== undefined ? String(body.txHash).trim() : null;

    // 1. 查询订单，验证存在
    const order = await db
      .prepare("SELECT * FROM orders WHERE id = ?")
      .bind(id)
      .first<OrderRow>();

    if (!order) throw new HttpError(404, "order not found");

    // 2. UPDATE orders SET status='paid', paid_at=datetime('now'), tx_hash=?
    await db
      .prepare(
        `UPDATE orders
         SET status = 'paid', paid_at = datetime('now'), tx_hash = ?, updated_at = datetime('now')
         WHERE id = ?`
      )
      .bind(txHash, id)
      .run();

    // 3. 写入 audit_log
    await writeAuditLog(
      db,
      request,
      { actorId: "internal", role: "internal" },
      "order.mark_paid",
      "order",
      id,
      { txHash }
    );

    // 4. 返回更新后的订单
    const updated = await db
      .prepare("SELECT * FROM orders WHERE id = ?")
      .bind(id)
      .first<OrderRow>();

    return jsonResponse(updated ? formatOrder(updated) : null, 200, request, cloudflareEnv);
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
      "[POST /api/internal/orders/[id]/mark-paid] unexpected error:",
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
