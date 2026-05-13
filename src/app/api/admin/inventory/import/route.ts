// src/app/api/admin/inventory/import/route.ts
// POST /api/admin/inventory/import — 导入库存项（需 admin token），AES-GCM 加密每个值

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ensureDatabaseReady } from "@/lib/api/bootstrap";
import { parseBody } from "@/lib/api/body-parser";
import { jsonResponse, optionsResponse } from "@/lib/api/cors";
import { HttpError } from "@/lib/api/errors";
import { verifyAdminSessionToken } from "@/lib/api/admin-session";
import { encryptInventoryValue } from "@/lib/api/inventory-crypto";
import type { SkuRow } from "@/lib/api/types";

/** 生成 masked_value：前3字符 + *** + 后3字符 */
function maskValue(value: string): string {
  if (value.length <= 6) return "***";
  return `${value.slice(0, 3)}***${value.slice(-3)}`;
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
    const body = await parseBody<{ skuId?: unknown; items?: unknown }>(request);

    const skuId = String(body.skuId ?? "").trim();
    if (!skuId) throw new HttpError(422, "skuId is required");

    if (!Array.isArray(body.items) || body.items.length === 0) {
      throw new HttpError(422, "items must be a non-empty array");
    }

    if (body.items.length > 500) {
      throw new HttpError(422, "too many items (max 500 per import)");
    }

    // 验证 sku 存在
    const sku = await db
      .prepare("SELECT id FROM skus WHERE id = ?")
      .bind(skuId)
      .first<SkuRow>();
    if (!sku) throw new HttpError(404, "sku not found");

    const encryptionKey = cloudflareEnv.INVENTORY_ENCRYPTION_KEY;
    let imported = 0;

    for (const rawItem of body.items) {
      const item = String(rawItem ?? "").trim();
      if (!item) continue;

      const encryptedValue = await encryptInventoryValue(item, encryptionKey);
      const maskedValue = maskValue(item);
      const id = crypto.randomUUID();

      await db
        .prepare(
          `INSERT INTO inventory_items (id, sku_id, masked_value, encrypted_value, status, order_id, created_at)
           VALUES (?, ?, ?, ?, 'available', NULL, datetime('now'))`
        )
        .bind(id, skuId, maskedValue, encryptedValue)
        .run();

      imported++;
    }

    return jsonResponse({ imported }, 201, request, cloudflareEnv);
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse({ error: error.message }, error.status, request, cloudflareEnv);
    }
    console.error("[POST /api/admin/inventory/import] unexpected error:", error);
    return jsonResponse({ error: "internal server error" }, 500, request, cloudflareEnv);
  }
}
