// src/app/api/admin/inventory/[id]/route.ts
// PATCH /api/admin/inventory/[id] — 作废库存（高风险，需 admin token + 审计）

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ensureDatabaseReady } from "@/lib/api/bootstrap";
import { parseBody } from "@/lib/api/body-parser";
import { jsonResponse, optionsResponse } from "@/lib/api/cors";
import { HttpError } from "@/lib/api/errors";
import { requireAdmin } from "@/lib/api/admin-guard";
import { writeAuditLog } from "@/lib/api/audit";
import { formatInventoryItem } from "@/lib/api/formatters";
import type { InventoryItemRow } from "@/lib/api/types";

export async function OPTIONS(request: Request) {
  const { env } = await getCloudflareContext();
  return optionsResponse(request, env as CloudflareEnv);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { env } = await getCloudflareContext();
  const cloudflareEnv = env as CloudflareEnv;

  try {
    const actor = await requireAdmin(request, cloudflareEnv);
    const { id } = await params;
    const db = cloudflareEnv.DB;
    await ensureDatabaseReady(db);

    const body = await parseBody<{ status?: unknown; remark?: unknown }>(request);
    const status = String(body.status ?? "").trim();
    const remark = String(body.remark ?? "").trim();

    if (status !== "revoked") {
      throw new HttpError(422, "only revoke (status='revoked') is supported");
    }

    const item = await db
      .prepare("SELECT * FROM inventory_items WHERE id = ?")
      .bind(id)
      .first<InventoryItemRow>();
    if (!item) throw new HttpError(404, "inventory item not found");

    // 仅允许作废未交付的库存：available / reserved
    if (item.status !== "available" && item.status !== "reserved") {
      throw new HttpError(409, `cannot revoke inventory in status '${item.status}'`);
    }

    await db
      .prepare(
        "UPDATE inventory_items SET status = 'revoked', remark = COALESCE(NULLIF(?, ''), remark) WHERE id = ?"
      )
      .bind(remark, id)
      .run();

    const updated = await db
      .prepare(
        `SELECT i.*, s.product_id AS sku_product_id, p.name AS product_name
         FROM inventory_items i
         LEFT JOIN skus s ON s.id = i.sku_id
         LEFT JOIN products p ON p.id = COALESCE(i.product_id, s.product_id)
         WHERE i.id = ?`
      )
      .bind(id)
      .first<InventoryItemRow & { product_name?: string | null; sku_product_id?: string | null }>();

    await writeAuditLog(db, request, actor, "inventory.revoke", "inventory_item", id, {
      skuId: item.sku_id,
      maskedValue: item.masked_value,
      previousStatus: item.status,
      remark,
    });

    return jsonResponse(updated ? formatInventoryItem(updated) : { id }, 200, request, cloudflareEnv);
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse({ error: error.message }, error.status, request, cloudflareEnv);
    }
    console.error("[PATCH /api/admin/inventory/[id]] unexpected error:", error);
    return jsonResponse({ error: "internal server error" }, 500, request, cloudflareEnv);
  }
}
