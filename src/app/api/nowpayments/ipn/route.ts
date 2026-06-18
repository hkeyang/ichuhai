import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ensureDatabaseReady } from "@/lib/api/bootstrap";
import { jsonResponse, optionsResponse } from "@/lib/api/cors";
import { HttpError } from "@/lib/api/errors";
import { writeAuditLog } from "@/lib/api/audit";
import {
  mapNowPaymentsStatus,
  verifyNowPaymentsIpnSignature,
  type NowPaymentsIpnPayload,
} from "@/lib/api/nowpayments";
import type { OrderRow } from "@/lib/api/types";

export async function OPTIONS(request: Request) {
  const { env } = await getCloudflareContext();
  return optionsResponse(request, env as CloudflareEnv);
}

async function triggerDelivery(env: CloudflareEnv, orderId: string) {
  const siteUrl = (env.PUBLIC_SITE_URL || "").replace(/\/+$/, "");
  if (!siteUrl) return;
  await fetch(`${siteUrl}/api/internal/orders/${orderId}/deliver`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-internal-token": env.INTERNAL_API_SECRET || "",
    },
    body: "{}",
  }).catch(() => undefined);
}

export async function POST(request: Request) {
  const { env, ctx } = await getCloudflareContext();
  const cloudflareEnv = env as CloudflareEnv;

  try {
    if (!cloudflareEnv.NOWPAYMENTS_IPN_SECRET) {
      throw new HttpError(500, "NOWPayments IPN secret is not configured");
    }

    const rawBody = await request.text();
    const signature = request.headers.get("x-nowpayments-sig") || "";
    const isValid = await verifyNowPaymentsIpnSignature(
      rawBody,
      signature,
      cloudflareEnv.NOWPAYMENTS_IPN_SECRET
    );

    if (!isValid) {
      return jsonResponse({ error: "invalid NOWPayments signature" }, 401, request, cloudflareEnv);
    }

    const payload = JSON.parse(rawBody) as NowPaymentsIpnPayload;
    const orderId = String(payload.order_id || "").trim();
    const providerPaymentId = payload.payment_id !== undefined ? String(payload.payment_id) : "";
    if (!orderId) throw new HttpError(422, "order_id is required");

    const db = cloudflareEnv.DB;
    await ensureDatabaseReady(db);

    const order = await db
      .prepare("SELECT * FROM orders WHERE id = ? LIMIT 1")
      .bind(orderId)
      .first<OrderRow>();

    if (!order) throw new HttpError(404, "order not found");
    if (
      order.payment_provider &&
      order.payment_provider !== "nowpayments"
    ) {
      throw new HttpError(409, "order uses another payment provider");
    }

    const nextStatus = mapNowPaymentsStatus(payload.payment_status);
    const txHash = providerPaymentId ? `nowpayments:${providerPaymentId}` : order.tx_hash;
    const shouldMarkPaid = nextStatus === "paid" && !["paid", "delivering", "completed"].includes(order.status);
    const shouldUpdateStatus = !["completed", "refunded"].includes(order.status);

    if (shouldUpdateStatus) {
      await db
        .prepare(
          `UPDATE orders
           SET status = ?,
               payment_status = ?,
               paid_at = CASE WHEN ? = 'paid' THEN COALESCE(paid_at, datetime('now')) ELSE paid_at END,
               tx_hash = COALESCE(tx_hash, ?),
               payment_provider = 'nowpayments',
               provider_payment_id = COALESCE(provider_payment_id, ?),
               provider_payment_status = ?,
               provider_payload_json = ?,
               updated_at = datetime('now')
           WHERE id = ?`
        )
        .bind(
          nextStatus,
          nextStatus === "paid" ? "paid" : "unpaid",
          nextStatus,
          txHash,
          providerPaymentId || null,
          String(payload.payment_status || ""),
          JSON.stringify(payload),
          order.id
        )
        .run();
    } else {
      await db
        .prepare(
          `UPDATE orders
           SET provider_payment_status = ?, provider_payload_json = ?, updated_at = datetime('now')
           WHERE id = ?`
        )
        .bind(String(payload.payment_status || ""), JSON.stringify(payload), order.id)
        .run();
    }

    await writeAuditLog(
      db,
      request,
      { actorId: "nowpayments", role: "payment_provider" },
      "payment.nowpayments_ipn",
      "order",
      order.id,
      {
        paymentId: providerPaymentId || null,
        paymentStatus: payload.payment_status || null,
        mappedStatus: nextStatus,
        shouldMarkPaid,
      }
    );

    if (shouldMarkPaid) {
      const deliveryPromise = triggerDelivery(cloudflareEnv, order.id);
      if (ctx && typeof (ctx as { waitUntil?: (p: Promise<unknown>) => void }).waitUntil === "function") {
        (ctx as { waitUntil: (p: Promise<unknown>) => void }).waitUntil(deliveryPromise);
      }
    }

    return jsonResponse({ ok: true, orderId: order.id, status: nextStatus }, 200, request, cloudflareEnv);
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse({ error: error.message }, error.status, request, cloudflareEnv);
    }
    console.error("[POST /api/nowpayments/ipn] unexpected error:", error);
    return jsonResponse({ error: "internal server error" }, 500, request, cloudflareEnv);
  }
}
