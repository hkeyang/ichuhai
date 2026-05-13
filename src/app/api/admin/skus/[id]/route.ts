// src/app/api/admin/skus/[id]/route.ts
// PATCH /api/admin/skus/[id] — 更新 SKU（需 admin token）

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { parseBody } from "@/lib/api/body-parser";
import { jsonResponse, optionsResponse } from "@/lib/api/cors";
import { HttpError } from "@/lib/api/errors";
import { verifyAdminSessionToken } from "@/lib/api/admin-session";
import { cleanEnum, cleanPrice, cleanOptionValues } from "@/lib/api/validators";
import type { SkuRow } from "@/lib/api/types";

const STOCK_STATUSES = new Set(["in_stock", "low_stock", "sold_out"]);
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
      .prepare("SELECT * FROM skus WHERE id = ?")
      .bind(id)
      .first<SkuRow>();

    if (!existing) throw new HttpError(404, "sku not found");

    const body = await parseBody<{
      optionValues?: unknown;
      priceUsdt?: unknown;
      stockStatus?: unknown;
      stockQuantity?: unknown;
      deliveryType?: unknown;
      isDefault?: unknown;
      isRecommended?: unknown;
    }>(request);

    const fields: string[] = [];
    const values: unknown[] = [];

    if (body.optionValues !== undefined) {
      fields.push("option_values = ?");
      values.push(JSON.stringify(cleanOptionValues(body.optionValues)));
    }
    if (body.priceUsdt !== undefined) {
      fields.push("price_usdt = ?");
      values.push(cleanPrice(body.priceUsdt));
    }
    if (body.stockStatus !== undefined) {
      fields.push("stock_status = ?");
      values.push(cleanEnum(body.stockStatus, "stockStatus", STOCK_STATUSES));
    }
    if (body.stockQuantity !== undefined) {
      fields.push("stock_quantity = ?");
      values.push(Math.max(0, Math.floor(Number(body.stockQuantity))));
    }
    if (body.deliveryType !== undefined) {
      fields.push("delivery_type = ?");
      values.push(cleanEnum(body.deliveryType, "deliveryType", DELIVERY_TYPES));
    }
    if (body.isDefault !== undefined) {
      fields.push("is_default = ?");
      values.push(body.isDefault ? 1 : 0);
    }
    if (body.isRecommended !== undefined) {
      fields.push("is_recommended = ?");
      values.push(body.isRecommended ? 1 : 0);
    }

    if (fields.length === 0) throw new HttpError(422, "no fields to update");

    fields.push("updated_at = datetime('now')");
    values.push(id);

    await db
      .prepare(`UPDATE skus SET ${fields.join(", ")} WHERE id = ?`)
      .bind(...values)
      .run();

    const updated = await db
      .prepare("SELECT * FROM skus WHERE id = ?")
      .bind(id)
      .first<SkuRow>();

    return jsonResponse(updated, 200, request, cloudflareEnv);
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse({ error: error.message }, error.status, request, cloudflareEnv);
    }
    console.error("[PATCH /api/admin/skus/[id]] unexpected error:", error);
    return jsonResponse({ error: "internal server error" }, 500, request, cloudflareEnv);
  }
}
