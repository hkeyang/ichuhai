// src/app/api/admin/inventory/route.ts
// GET /api/admin/inventory — 库存列表（服务端筛选 + 分页，需 admin token）

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ensureDatabaseReady } from "@/lib/api/bootstrap";
import { jsonResponse, optionsResponse } from "@/lib/api/cors";
import { HttpError } from "@/lib/api/errors";
import { requireAdmin, parsePagination, param, pageEnvelope } from "@/lib/api/admin-guard";
import { formatInventoryItem } from "@/lib/api/formatters";
import type { InventoryItemRow } from "@/lib/api/types";

const STATUS_VALUES = new Set(["available", "reserved", "delivered", "revoked"]);

export async function OPTIONS(request: Request) {
  const { env } = await getCloudflareContext();
  return optionsResponse(request, env as CloudflareEnv);
}

export async function GET(request: Request) {
  const { env } = await getCloudflareContext();
  const cloudflareEnv = env as CloudflareEnv;

  try {
    await requireAdmin(request, cloudflareEnv);
    const db = cloudflareEnv.DB;
    await ensureDatabaseReady(db);

    const url = new URL(request.url);
    const q = param(url, "q");
    const skuId = param(url, "skuId");
    const productId = param(url, "productId");
    const type = param(url, "type");
    const status = param(url, "status");
    const batchId = param(url, "batchId");
    const pagination = parsePagination(url);

    const where: string[] = [];
    const binds: unknown[] = [];

    if (skuId) {
      where.push("i.sku_id = ?");
      binds.push(skuId);
    }
    if (productId) {
      where.push("COALESCE(i.product_id, s.product_id) = ?");
      binds.push(productId);
    }
    if (type) {
      where.push("COALESCE(i.type,'card') = ?");
      binds.push(type);
    }
    if (status && STATUS_VALUES.has(status)) {
      where.push("i.status = ?");
      binds.push(status);
    }
    if (batchId) {
      where.push("i.import_batch_id = ?");
      binds.push(batchId);
    }
    if (q) {
      where.push("(i.masked_value LIKE ? OR i.order_id LIKE ? OR p.name LIKE ?)");
      const like = `%${q}%`;
      binds.push(like, like, like);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const totalRow = await db
      .prepare(
        `SELECT COUNT(*) AS total FROM inventory_items i
         LEFT JOIN skus s ON s.id = i.sku_id
         LEFT JOIN products p ON p.id = COALESCE(i.product_id, s.product_id)
         ${whereSql}`
      )
      .bind(...binds)
      .first<{ total: number }>();

    const listResult = await db
      .prepare(
        `SELECT i.*, s.product_id AS sku_product_id, p.name AS product_name, o.order_no AS order_no
         FROM inventory_items i
         LEFT JOIN skus s ON s.id = i.sku_id
         LEFT JOIN products p ON p.id = COALESCE(i.product_id, s.product_id)
         LEFT JOIN orders o ON o.id = i.order_id
         ${whereSql}
         ORDER BY i.created_at DESC
         LIMIT ? OFFSET ?`
      )
      .bind(...binds, pagination.pageSize, pagination.offset)
      .all<InventoryItemRow & { product_name?: string | null; sku_product_id?: string | null; order_no?: string | null }>();

    return jsonResponse(
      pageEnvelope(listResult.results.map(formatInventoryItem), Number(totalRow?.total ?? 0), pagination),
      200,
      request,
      cloudflareEnv
    );
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse({ error: error.message }, error.status, request, cloudflareEnv);
    }
    console.error("[GET /api/admin/inventory] unexpected error:", error);
    return jsonResponse({ error: "internal server error" }, 500, request, cloudflareEnv);
  }
}
