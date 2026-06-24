// src/app/api/admin/orders/[id]/status/route.ts
// PATCH /api/admin/orders/[id]/status — 更新订单状态（需 admin token），写 audit_log

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ensureDatabaseReady } from "@/lib/api/bootstrap";
import { parseBody } from "@/lib/api/body-parser";
import { jsonResponse, optionsResponse } from "@/lib/api/cors";
import { HttpError } from "@/lib/api/errors";
import { verifyAdminSessionToken } from "@/lib/api/admin-session";
import { writeAuditLog } from "@/lib/api/audit";
import { formatOrder } from "@/lib/api/formatters";
import { createWalletLedger } from "@/lib/api/wallet";
import type { OrderRow } from "@/lib/api/types";

const ALLOWED_STATUSES = new Set([
  "created",
  "pending_payment",
  "payment_confirming",
  "paid",
  "delivering",
  "completed",
  "expired",
  "failed",
  "refunding",
  "refunded",
]);

export async function OPTIONS(request: Request) {
  const { env } = await getCloudflareContext();
  return optionsResponse(request, env as CloudflareEnv);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { env } = await getCloudflareContext();
  const cloudflareEnv = env as CloudflareEnv;

  try {
    const token = request.headers.get("x-admin-token") || "";
    const isProduction = cloudflareEnv.NODE_ENV === "production";
    if (isProduction) {
      const valid = await verifyAdminSessionToken(token, cloudflareEnv);
      if (!valid) return jsonResponse({ error: "admin auth required" }, 401, request, cloudflareEnv);
    }

    const { id } = await params;
    const db = cloudflareEnv.DB;
    await ensureDatabaseReady(db);

    const body = await parseBody<{ status?: unknown; adminNote?: unknown }>(request);
    const newStatus = String(body.status ?? "").trim();
    const adminNote = body.adminNote !== undefined ? String(body.adminNote).trim() : undefined;

    if (!newStatus) throw new HttpError(422, "status is required");
    if (!ALLOWED_STATUSES.has(newStatus)) throw new HttpError(422, "status is invalid");

    const order = await db
      .prepare("SELECT * FROM orders WHERE id = ?")
      .bind(id)
      .first<OrderRow>();

    if (!order) throw new HttpError(404, "order not found");

    const oldStatus = order.status;

    if (adminNote !== undefined) {
      await db
        .prepare(
          "UPDATE orders SET status = ?, admin_note = ?, updated_at = datetime('now') WHERE id = ?"
        )
        .bind(newStatus, adminNote, id)
        .run();
    } else {
      await db
        .prepare(
          "UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?"
        )
        .bind(newStatus, id)
        .run();
    }

    if (newStatus === "refunded" && oldStatus !== "refunded") {
      const userId = order.user_id;
      if (userId) {
        const existingRefund = await db
          .prepare("SELECT id FROM wallet_ledgers WHERE reference_type = 'order_refund' AND reference_id = ? AND status = 'completed' LIMIT 1")
          .bind(id)
          .first<{ id: string }>();
        if (!existingRefund) {
          await createWalletLedger(db, {
            userId,
            type: "refund",
            amountUsdt: order.amount_usdt,
            method: "wallet",
            note: adminNote || `订单 ${order.order_no} 退款入余额`,
            referenceType: "order_refund",
            referenceId: id,
            createdBy: "admin",
          });
        }
      }
    }

    await writeAuditLog(
      db,
      request,
      { actorId: "admin", role: "admin" },
      "order.status_update",
      "order",
      id,
      { oldStatus, newStatus, adminNote }
    );

    const updated = await db
      .prepare("SELECT * FROM orders WHERE id = ?")
      .bind(id)
      .first<OrderRow>();

    return jsonResponse(updated ? formatOrder(updated) : null, 200, request, cloudflareEnv);
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse({ error: error.message }, error.status, request, cloudflareEnv);
    }
    console.error("[PATCH /api/admin/orders/[id]/status] unexpected error:", error);
    return jsonResponse({ error: "internal server error" }, 500, request, cloudflareEnv);
  }
}
