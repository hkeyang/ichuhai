// src/app/api/admin/products/[id]/route.ts
// PATCH /api/admin/products/[id] — 更新商品（需 admin token）

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ensureDatabaseReady } from "@/lib/api/bootstrap";
import { parseBody } from "@/lib/api/body-parser";
import { jsonResponse, optionsResponse } from "@/lib/api/cors";
import { HttpError } from "@/lib/api/errors";
import { cleanString, cleanEnum } from "@/lib/api/validators";
import { writeAuditLog } from "@/lib/api/audit";
import { requireAdmin } from "@/lib/api/admin-guard";
import { formatProduct } from "@/lib/api/formatters";
import type { ProductRow } from "@/lib/api/types";

const PRODUCT_STATUSES = new Set(["active", "hidden", "archived"]);
const DELIVERY_TYPES = new Set(["auto", "manual", "mixed"]);
const PRODUCT_TYPES = new Set(["subscription", "card", "account", "recharge", "service"]);

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
    const actor = await requireAdmin(request, cloudflareEnv);

    const { id } = await params;
    const db = cloudflareEnv.DB;
    await ensureDatabaseReady(db);

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
      productType?: unknown;
      baseCurrency?: unknown;
      shortDescription?: unknown;
      featureTags?: unknown;
      detailDescription?: unknown;
      purchaseNotice?: unknown;
      afterSaleRule?: unknown;
      isHomeVisible?: unknown;
      isRecommended?: unknown;
      sortOrder?: unknown;
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
    if (body.productType !== undefined) {
      fields.push("product_type = ?");
      values.push(cleanEnum(body.productType, "productType", PRODUCT_TYPES));
    }
    if (body.baseCurrency !== undefined) {
      fields.push("base_currency = ?");
      values.push(cleanString(body.baseCurrency, "baseCurrency", { max: 10, pattern: /^[A-Z]{3}$/ }));
    }
    if (body.shortDescription !== undefined) {
      fields.push("subtitle = ?");
      values.push(cleanString(body.shortDescription, "shortDescription", { max: 300, allowEmpty: true }));
    }
    if (body.detailDescription !== undefined) {
      fields.push("description = ?");
      values.push(cleanString(body.detailDescription, "detailDescription", { max: 2000, allowEmpty: true }));
    }
    if (body.purchaseNotice !== undefined) {
      fields.push("purchase_notice = ?");
      values.push(cleanString(body.purchaseNotice, "purchaseNotice", { max: 2000, allowEmpty: true }));
    }
    if (body.afterSaleRule !== undefined) {
      fields.push("after_sale_rule = ?");
      values.push(cleanString(body.afterSaleRule, "afterSaleRule", { max: 2000, allowEmpty: true }));
    }
    if (body.isHomeVisible !== undefined) {
      fields.push("is_home_visible = ?");
      values.push(body.isHomeVisible ? 1 : 0);
    }
    if (body.isRecommended !== undefined) {
      fields.push("is_recommended = ?");
      values.push(body.isRecommended ? 1 : 0);
    }
    if (body.sortOrder !== undefined) {
      fields.push("sort_order = ?");
      values.push(Math.floor(Number(body.sortOrder)) || 0);
    }
    if (body.featureTags !== undefined) {
      const tags = Array.isArray(body.featureTags)
        ? body.featureTags
        : String(body.featureTags || "").split(/[,，\n]/);
      fields.push("tags_json = ?");
      values.push(JSON.stringify(tags.map((tag) => String(tag || "").trim()).filter(Boolean).slice(0, 6).map((tag) => cleanString(tag, "featureTag", { max: 40 }))));
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

    // 上下架/字段变更写审计
    await writeAuditLog(db, request, actor, "product.update", "product", id, {
      changedFields: Object.keys(body),
      previousStatus: body.status !== undefined ? existing.status : undefined,
      nextStatus: body.status !== undefined ? updated?.status : undefined,
    });

    return jsonResponse(updated ? formatProduct(updated) : null, 200, request, cloudflareEnv);
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse({ error: error.message }, error.status, request, cloudflareEnv);
    }
    console.error("[PATCH /api/admin/products/[id]] unexpected error:", error);
    return jsonResponse({ error: "internal server error" }, 500, request, cloudflareEnv);
  }
}
