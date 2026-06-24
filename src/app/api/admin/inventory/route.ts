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

function parseOptionValues(value: string | null | undefined) {
  if (!value) return {};
  try {
    return JSON.parse(value) as Record<string, string>;
  } catch {
    return {};
  }
}

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
    const view = param(url, "view");
    const pagination = parsePagination(url);

    if (view === "summary") {
      const where: string[] = [];
      const binds: unknown[] = [];

      if (skuId) {
        where.push("s.id = ?");
        binds.push(skuId);
      }
      if (productId) {
        where.push("s.product_id = ?");
        binds.push(productId);
      }
      if (type) {
        where.push("COALESCE(i.type,'card') = ?");
        binds.push(type);
      }
      if (q) {
        where.push("(p.name LIKE ? OR s.id LIKE ? OR s.option_values LIKE ?)");
        const like = `%${q}%`;
        binds.push(like, like, like);
      }

      const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
      const statusHaving =
        status && STATUS_VALUES.has(status)
          ? `HAVING SUM(CASE WHEN i.status = ? THEN 1 ELSE 0 END) > 0`
          : "";
      const countBinds = statusHaving ? [...binds, status] : binds;

      const totalRow = await db
        .prepare(
          `SELECT COUNT(*) AS total FROM (
             SELECT s.id
             FROM skus s
             LEFT JOIN products p ON p.id = s.product_id
             LEFT JOIN inventory_items i ON i.sku_id = s.id
             ${whereSql}
             GROUP BY s.id
             ${statusHaving}
           )`
        )
        .bind(...countBinds)
        .first<{ total: number }>();

      const listResult = await db
        .prepare(
          `SELECT
             s.id AS sku_id,
             s.product_id,
             s.sku_name,
             s.option_values,
             s.delivery_type,
             s.warning_stock,
             s.stock_status,
             s.updated_at,
             p.name AS product_name,
             p.delivery_type AS product_delivery_type,
             SUM(CASE WHEN i.status = 'available' THEN 1 ELSE 0 END) AS available_count,
             SUM(CASE WHEN i.status = 'reserved' THEN 1 ELSE 0 END) AS reserved_count,
             SUM(CASE WHEN i.status = 'delivered' THEN 1 ELSE 0 END) AS delivered_count,
             SUM(CASE WHEN i.status = 'revoked' THEN 1 ELSE 0 END) AS revoked_count,
             COUNT(i.id) AS total_count,
             MAX(i.created_at) AS last_inventory_at
           FROM skus s
           LEFT JOIN products p ON p.id = s.product_id
           LEFT JOIN inventory_items i ON i.sku_id = s.id
           ${whereSql}
           GROUP BY s.id
           ${statusHaving}
           ORDER BY p.name ASC, s.created_at ASC
           LIMIT ? OFFSET ?`
        )
        .bind(...countBinds, pagination.pageSize, pagination.offset)
        .all<{
          sku_id: string;
          product_id: string;
          sku_name?: string | null;
          option_values?: string | null;
          delivery_type?: string | null;
          warning_stock?: number | null;
          stock_status?: string | null;
          updated_at?: string | null;
          product_name?: string | null;
          product_delivery_type?: string | null;
          available_count?: number | null;
          reserved_count?: number | null;
          delivered_count?: number | null;
          revoked_count?: number | null;
          total_count?: number | null;
          last_inventory_at?: string | null;
        }>();

      const items = listResult.results.map((row) => ({
        skuId: row.sku_id,
        productId: row.product_id,
        productName: row.product_name ?? row.product_id,
        skuName: row.sku_name ?? null,
        optionValues: parseOptionValues(row.option_values),
        deliveryType: row.delivery_type ?? row.product_delivery_type ?? "manual",
        productDeliveryType: row.product_delivery_type ?? null,
        stockStatus: row.stock_status ?? "in_stock",
        warningStock: row.warning_stock ?? 5,
        available: Number(row.available_count ?? 0),
        reserved: Number(row.reserved_count ?? 0),
        delivered: Number(row.delivered_count ?? 0),
        revoked: Number(row.revoked_count ?? 0),
        total: Number(row.total_count ?? 0),
        updatedAt: row.last_inventory_at ?? row.updated_at ?? null,
      }));

      return jsonResponse(pageEnvelope(items, Number(totalRow?.total ?? 0), pagination), 200, request, cloudflareEnv);
    }

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
