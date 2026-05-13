// src/app/api/admin/skus/route.ts
// POST /api/admin/skus — 创建 SKU（需 admin token）

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { parseBody } from "@/lib/api/body-parser";
import { jsonResponse, optionsResponse } from "@/lib/api/cors";
import { HttpError } from "@/lib/api/errors";
import { verifyAdminSessionToken } from "@/lib/api/admin-session";
import { cleanEnum, cleanPrice, cleanOptionValues } from "@/lib/api/validators";
import type { SkuRow, ProductRow } from "@/lib/api/types";

const STOCK_STATUSES = new Set(["in_stock", "low_stock", "sold_out"]);
const DELIVERY_TYPES = new Set(["auto", "manual", "mixed"]);

export async function OPTIONS(request: Request) {
  const { env } = await getCloudflareContext();
  return optionsResponse(request, env as CloudflareEnv);
}

export async function POST(request: Request) {
  const { env } = await getCloudflareContext();
  const cloudflareEnv = env as CloudflareEnv;

  try {
    const token = request.headers.get("x-admin-token") || "";
    const isProduction = cloudflareEnv.NODE_ENV === "production";
    if (isProduction) {
      const valid = await verifyAdminSessionToken(token, cloudflareEnv);
      if (!valid) return jsonResponse({ error: "admin auth required" }, 401, request, cloudflareEnv);
    }

    const db = cloudflareEnv.DB;
    const body = await parseBody<{
      productId?: unknown;
      optionValues?: unknown;
      priceUsdt?: unknown;
      stockStatus?: unknown;
      stockQuantity?: unknown;
      deliveryType?: unknown;
      isDefault?: unknown;
      isRecommended?: unknown;
    }>(request);

    const productId = String(body.productId ?? "").trim();
    if (!productId) throw new HttpError(422, "productId is required");

    const product = await db
      .prepare("SELECT id FROM products WHERE id = ?")
      .bind(productId)
      .first<ProductRow>();
    if (!product) throw new HttpError(404, "product not found");

    const optionValues = cleanOptionValues(body.optionValues);
    const priceUsdt = cleanPrice(body.priceUsdt);
    const stockStatus = cleanEnum(body.stockStatus, "stockStatus", STOCK_STATUSES, "in_stock");
    const stockQuantity = Math.max(0, Math.floor(Number(body.stockQuantity ?? 0)));
    const deliveryType = cleanEnum(body.deliveryType, "deliveryType", DELIVERY_TYPES, "auto");
    const isDefault = body.isDefault ? 1 : 0;
    const isRecommended = body.isRecommended ? 1 : 0;

    const id = crypto.randomUUID();

    await db
      .prepare(
        `INSERT INTO skus (id, product_id, option_values, price_usdt, stock_status, stock_quantity, delivery_type, is_default, is_recommended, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
      )
      .bind(
        id,
        productId,
        JSON.stringify(optionValues),
        priceUsdt,
        stockStatus,
        stockQuantity,
        deliveryType,
        isDefault,
        isRecommended
      )
      .run();

    const sku = await db
      .prepare("SELECT * FROM skus WHERE id = ?")
      .bind(id)
      .first<SkuRow>();

    return jsonResponse(sku, 201, request, cloudflareEnv);
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse({ error: error.message }, error.status, request, cloudflareEnv);
    }
    console.error("[POST /api/admin/skus] unexpected error:", error);
    return jsonResponse({ error: "internal server error" }, 500, request, cloudflareEnv);
  }
}
