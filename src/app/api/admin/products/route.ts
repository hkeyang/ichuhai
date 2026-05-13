// src/app/api/admin/products/route.ts
// POST /api/admin/products — 创建商品（需 admin token）

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { parseBody } from "@/lib/api/body-parser";
import { jsonResponse, optionsResponse } from "@/lib/api/cors";
import { HttpError } from "@/lib/api/errors";
import { verifyAdminSessionToken } from "@/lib/api/admin-session";
import { cleanString, cleanEnum } from "@/lib/api/validators";
import type { ProductRow } from "@/lib/api/types";

const PRODUCT_STATUSES = new Set(["active", "hidden", "archived"]);
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
      slug?: unknown;
      name?: unknown;
      categoryId?: unknown;
      status?: unknown;
      deliveryType?: unknown;
      baseCurrency?: unknown;
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
      pattern: /^[A-Z]{3}$/,
    });

    const id = crypto.randomUUID();

    await db
      .prepare(
        `INSERT INTO products (id, slug, name, category_id, status, delivery_type, base_currency, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
      )
      .bind(id, slug, name, categoryId, status, deliveryType, baseCurrency)
      .run();

    const product = await db
      .prepare("SELECT * FROM products WHERE id = ?")
      .bind(id)
      .first<ProductRow>();

    return jsonResponse(product, 201, request, cloudflareEnv);
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse({ error: error.message }, error.status, request, cloudflareEnv);
    }
    console.error("[POST /api/admin/products] unexpected error:", error);
    return jsonResponse({ error: "internal server error" }, 500, request, cloudflareEnv);
  }
}
