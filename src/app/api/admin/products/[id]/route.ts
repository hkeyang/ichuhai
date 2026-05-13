// src/app/api/admin/products/[id]/route.ts
// PATCH /api/admin/products/[id] — 更新商品（需 admin token）

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

    const existing = await db
      .prepare("SELECT * FROM products WHERE id = ?")
      .bind(id)
      .first<ProductRow>();

    if (!existing) throw new HttpError(404, "product not found");

    const body = await parseBody<{
      slug?: unknown;
      name?: unknown;
      categoryId?: unknown;
      status?: unknown;
      deliveryType?: unknown;
      baseCurrency?: unknown;
    }>(request);

    const fields: string[] = [];
    const values: unknown[] = [];

    if (body.slug !== undefined) {
      fields.push("slug = ?");
      values.push(cleanString(body.slug, "slug", { max: 80, pattern: /^[a-z0-9][a-z0-9-]*$/ }));
    }
    if (body.name !== undefined) {
      fields.push("name = ?");
      values.push(cleanString(body.name, "name", { max: 120 }));
    }
    if (body.categoryId !== undefined) {
      fields.push("category_id = ?");
      values.push(cleanString(body.categoryId, "categoryId", { max: 64 }));
    }
    if (body.status !== undefined) {
      fields.push("status = ?");
      values.push(cleanEnum(body.status, "status", PRODUCT_STATUSES));
    }
    if (body.deliveryType !== undefined) {
      fields.push("delivery_type = ?");
      values.push(cleanEnum(body.deliveryType, "deliveryType", DELIVERY_TYPES));
    }
    if (body.baseCurrency !== undefined) {
      fields.push("base_currency = ?");
      values.push(cleanString(body.baseCurrency, "baseCurrency", { max: 10, pattern: /^[A-Z]{3}$/ }));
    }

    if (fields.length === 0) throw new HttpError(422, "no fields to update");

    fields.push("updated_at = datetime('now')");
    values.push(id);

    await db
      .prepare(`UPDATE products SET ${fields.join(", ")} WHERE id = ?`)
      .bind(...values)
      .run();

    const updated = await db
      .prepare("SELECT * FROM products WHERE id = ?")
      .bind(id)
      .first<ProductRow>();

    return jsonResponse(updated, 200, request, cloudflareEnv);
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse({ error: error.message }, error.status, request, cloudflareEnv);
    }
    console.error("[PATCH /api/admin/products/[id]] unexpected error:", error);
    return jsonResponse({ error: "internal server error" }, 500, request, cloudflareEnv);
  }
}
