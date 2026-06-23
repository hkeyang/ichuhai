// src/app/api/admin/products/route.ts
// POST /api/admin/products — 创建商品（需 admin token）

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ensureDatabaseReady } from "@/lib/api/bootstrap";
import { parseBody } from "@/lib/api/body-parser";
import { jsonResponse, optionsResponse } from "@/lib/api/cors";
import { HttpError } from "@/lib/api/errors";
import { verifyAdminSessionToken } from "@/lib/api/admin-session";
import { cleanString, cleanEnum } from "@/lib/api/validators";
import { formatProduct, formatSku } from "@/lib/api/formatters";
import type { ProductRow, SkuRow } from "@/lib/api/types";

const PRODUCT_STATUSES = new Set(["active", "hidden", "archived"]);
const DELIVERY_TYPES = new Set(["auto", "manual", "mixed"]);

export async function OPTIONS(request: Request) {
  const { env } = await getCloudflareContext();
  return optionsResponse(request, env as CloudflareEnv);
}

export async function GET(request: Request) {
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
    const [productsResult, skusResult, invResult] = await db.batch<ProductRow | SkuRow | { sku_id: string; available: number }>([
      db.prepare("SELECT * FROM products ORDER BY created_at ASC"),
      db.prepare("SELECT * FROM skus ORDER BY product_id, created_at ASC"),
      db.prepare("SELECT sku_id, SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) AS available FROM inventory_items GROUP BY sku_id"),
    ]);
    const availableBySku = new Map<string, number>();
    for (const row of invResult.results as { sku_id: string; available: number }[]) {
      availableBySku.set(row.sku_id, Number(row.available || 0));
    }
    const skus = (skusResult.results as SkuRow[]).map((sku) => ({
      ...formatSku(sku),
      availableInventory: availableBySku.get(sku.id) ?? 0,
    }));
    const products = (productsResult.results as ProductRow[]).map((product) => {
      const productSkus = skus.filter((sku) => sku.productId === product.id);
      const sellableSkuCount = productSkus.filter((s) => s.stockStatus !== "sold_out").length;
      const outOfStockSkuCount = productSkus.filter(
        (s) => (s.deliveryType === "auto" || s.deliveryType === "mixed") && s.availableInventory <= 0
      ).length;
      const availableInventory = productSkus.reduce((sum, s) => sum + s.availableInventory, 0);
      return {
        ...formatProduct(product),
        skus: productSkus,
        skuCount: productSkus.length,
        sellableSkuCount,
        outOfStockSkuCount,
        availableInventory,
      };
    });

    return jsonResponse(products, 200, request, cloudflareEnv);
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse({ error: error.message }, error.status, request, cloudflareEnv);
    }
    console.error("[GET /api/admin/products] unexpected error:", error);
    return jsonResponse({ error: "internal server error" }, 500, request, cloudflareEnv);
  }
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
      slug?: unknown;
      name?: unknown;
      categoryId?: unknown;
      status?: unknown;
      deliveryType?: unknown;
      baseCurrency?: unknown;
      shortDescription?: unknown;
      featureTags?: unknown;
      detailDescription?: unknown;
      purchaseNotice?: unknown;
      afterSaleRule?: unknown;
    }>(request);

    const slug = cleanString(body.slug, "slug", {
      max: 80,
      pattern: /^[a-z0-9][a-z0-9-]*$/,
    });
    const name = cleanString(body.name, "name", { max: 120 });
    const categoryId = cleanString(body.categoryId, "categoryId", { max: 64 });
    const status = cleanEnum(body.status, "status", PRODUCT_STATUSES, "active");
    const deliveryType = cleanEnum(body.deliveryType, "deliveryType", DELIVERY_TYPES, "auto");
    const baseCurrency = cleanString(body.baseCurrency, "baseCurrency", {
      max: 10,
      pattern: /^[A-Z]{3,6}$/,
    });
    const featureTags = Array.isArray(body.featureTags)
      ? body.featureTags
      : String(body.featureTags || "").split(/[,，\n]/);
    const tagsJson = JSON.stringify(featureTags.map((tag) => String(tag || "").trim()).filter(Boolean).slice(0, 6).map((tag) => cleanString(tag, "featureTag", { max: 40 })));
    const shortDescription = cleanString(body.shortDescription, "shortDescription", { max: 300, allowEmpty: true });
    const detailDescription = cleanString(body.detailDescription, "detailDescription", { max: 2000, allowEmpty: true });
    const purchaseNotice = cleanString(body.purchaseNotice, "purchaseNotice", { max: 2000, allowEmpty: true });
    const afterSaleRule = cleanString(body.afterSaleRule, "afterSaleRule", { max: 2000, allowEmpty: true });

    const id = crypto.randomUUID();

    await db
      .prepare(
        `INSERT INTO products (id, slug, name, category_id, status, delivery_type, base_currency, subtitle, description, tags_json, purchase_notice, after_sale_rule, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
      )
      .bind(id, slug, name, categoryId, status, deliveryType, baseCurrency, shortDescription, detailDescription, tagsJson, purchaseNotice, afterSaleRule)
      .run();

    const product = await db
      .prepare("SELECT * FROM products WHERE id = ?")
      .bind(id)
      .first<ProductRow>();

    return jsonResponse(product ? formatProduct(product) : null, 201, request, cloudflareEnv);
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse({ error: error.message }, error.status, request, cloudflareEnv);
    }
    console.error("[POST /api/admin/products] unexpected error:", error);
    return jsonResponse({ error: "internal server error" }, 500, request, cloudflareEnv);
  }
}
