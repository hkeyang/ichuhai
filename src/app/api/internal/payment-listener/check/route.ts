import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ensureDatabaseReady } from "@/lib/api/bootstrap";
import { jsonResponse, optionsResponse } from "@/lib/api/cors";
import { HttpError } from "@/lib/api/errors";
import { timingSafeEqual } from "@/lib/api/admin-session";
import { writeAuditLog } from "@/lib/api/audit";
import type { OrderRow } from "@/lib/api/types";

export async function OPTIONS(request: Request) {
  const { env } = await getCloudflareContext();
  return optionsResponse(request, env as CloudflareEnv);
}

export async function POST(request: Request) {
  const { env } = await getCloudflareContext();
  const cloudflareEnv = env as CloudflareEnv;

  try {
    const internalToken = request.headers.get("x-internal-token") || "";
    if (cloudflareEnv.NODE_ENV === "production") {
      if (!cloudflareEnv.INTERNAL_API_SECRET || !timingSafeEqual(internalToken, cloudflareEnv.INTERNAL_API_SECRET)) {
        return jsonResponse({ error: "internal auth required" }, 401, request, cloudflareEnv);
      }
    }

    const db = cloudflareEnv.DB;
    await ensureDatabaseReady(db);
    const { results } = await db
      .prepare(
        `SELECT * FROM orders
         WHERE status IN ('pending_payment', 'payment_confirming')
         ORDER BY created_at ASC
         LIMIT 50`
      )
      .all<OrderRow>();

    let matched = 0;
    const matchedOrderIds: string[] = [];

    for (const order of results) {
      if (order.status !== "payment_confirming" || !order.tx_hash) continue;
      matched += 1;
      matchedOrderIds.push(order.id);
      await db
        .prepare(
          "UPDATE orders SET status = 'paid', paid_at = COALESCE(paid_at, datetime('now')), updated_at = datetime('now') WHERE id = ?"
        )
        .bind(order.id)
        .run();
      await writeAuditLog(
        db,
        request,
        { actorId: "payment-listener", role: "internal" },
        "payment_listener.match",
        "order",
        order.id,
        { txHash: order.tx_hash, network: order.payment_network }
      );
    }

    return jsonResponse(
      {
        checked: results.length,
        matched,
        matchedOrderIds,
      },
      200,
      request,
      cloudflareEnv
    );
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse({ error: error.message }, error.status, request, cloudflareEnv);
    }
    console.error("[POST /api/internal/payment-listener/check] unexpected error:", error);
    return jsonResponse({ error: "internal server error" }, 500, request, cloudflareEnv);
  }
}
