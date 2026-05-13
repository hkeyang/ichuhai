// src/app/api/admin/skus/batch-generate/route.ts
// POST /api/admin/skus/batch-generate — 批量生成 SKU（需 admin token）

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ensureDatabaseReady } from "@/lib/api/bootstrap";
import { parseBody } from "@/lib/api/body-parser";
import { jsonResponse, optionsResponse } from "@/lib/api/cors";
import { HttpError } from "@/lib/api/errors";
import { verifyAdminSessionToken } from "@/lib/api/admin-session";
import { cleanPrice, cleanEnum, cleanOptionGroups } from "@/lib/api/validators";
import { formatSku } from "@/lib/api/formatters";
import type { ProductRow, SkuRow } from "@/lib/api/types";

const DELIVERY_TYPES = new Set(["auto", "manual", "mixed"]);

/** 笛卡尔积：将多个选项组展开为所有组合 */
function cartesian(groups: { key: string; options: string[] }[]): Record<string, string>[] {
  if (groups.length === 0) return [{}];
  const [first, ...rest] = groups;
  const restCombinations = cartesian(rest);
  const result: Record<string, string>[] = [];
  for (const option of first.options) {
    for (const combo of restCombinations) {
      result.push({ [first.key]: option, ...combo });
    }
  }
  return result;
}

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
    await ensureDatabaseReady(db);
    const body = await parseBody<{
      productId?: unknown;
      optionGroups?: unknown;
      priceUsdt?: unknown;
      deliveryType?: unknown;
      stockQuantity?: unknown;
    }>(request);

    const productId = String(body.productId ?? "").trim();
    if (!productId) throw new HttpError(422, "productId is required");

    const product = await db
      .prepare("SELECT id FROM products WHERE id = ?")
      .bind(productId)
      .first<ProductRow>();
    if (!product) throw new HttpError(404, "product not found");

    const optionGroups = cleanOptionGroups(body.optionGroups);
    const priceUsdt = cleanPrice(body.priceUsdt);
    const deliveryType = cleanEnum(body.deliveryType, "deliveryType", DELIVERY_TYPES, "auto");
    const stockQuantity = Math.max(0, Math.floor(Number(body.stockQuantity ?? 0)));

    const combinations = cartesian(optionGroups);
    if (combinations.length === 0) throw new HttpError(422, "no sku combinations generated");
    if (combinations.length > 100) throw new HttpError(422, "too many sku combinations (max 100)");

    const skus: SkuRow[] = [];
    for (const optionValues of combinations) {
      const id = crypto.randomUUID();
      await db
        .prepare(
          `INSERT INTO skus (id, product_id, option_values, price_usdt, stock_status, stock_quantity, delivery_type, is_default, is_recommended, created_at, updated_at)
           VALUES (?, ?, ?, ?, 'in_stock', ?, ?, 0, 0, datetime('now'), datetime('now'))`
        )
        .bind(id, productId, JSON.stringify(optionValues), priceUsdt, stockQuantity, deliveryType)
        .run();

      const sku = await db
        .prepare("SELECT * FROM skus WHERE id = ?")
        .bind(id)
        .first<SkuRow>();
      if (sku) skus.push(sku);
    }

    return jsonResponse({ generated: skus.length, created: skus.length, skus: skus.map(formatSku) }, 201, request, cloudflareEnv);
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse({ error: error.message }, error.status, request, cloudflareEnv);
    }
    console.error("[POST /api/admin/skus/batch-generate] unexpected error:", error);
    return jsonResponse({ error: "internal server error" }, 500, request, cloudflareEnv);
  }
}
