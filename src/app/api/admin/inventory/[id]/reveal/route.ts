// src/app/api/admin/inventory/[id]/reveal/route.ts
// POST /api/admin/inventory/[id]/reveal — 查看库存明文（高风险，需 admin token + 审计）

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ensureDatabaseReady } from "@/lib/api/bootstrap";
import { parseBody } from "@/lib/api/body-parser";
import { jsonResponse, optionsResponse } from "@/lib/api/cors";
import { HttpError } from "@/lib/api/errors";
import { requireAdmin } from "@/lib/api/admin-guard";
import { writeAuditLog } from "@/lib/api/audit";
import { decryptInventoryValue } from "@/lib/api/inventory-crypto";
import type { InventoryItemRow } from "@/lib/api/types";

export async function OPTIONS(request: Request) {
  const { env } = await getCloudflareContext();
  return optionsResponse(request, env as CloudflareEnv);
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { env } = await getCloudflareContext();
  const cloudflareEnv = env as CloudflareEnv;

  try {
    const actor = await requireAdmin(request, cloudflareEnv);
    const { id } = await params;
    const db = cloudflareEnv.DB;
    await ensureDatabaseReady(db);

    // 二次确认原因（前端弹窗采集），用于审计留痕
    const body = await parseBody<{ reason?: unknown }>(request).catch(() => ({ reason: "" }));
    const reason = String((body as { reason?: unknown }).reason ?? "").trim();

    const item = await db
      .prepare("SELECT * FROM inventory_items WHERE id = ?")
      .bind(id)
      .first<InventoryItemRow>();
    if (!item) throw new HttpError(404, "inventory item not found");

    // 两套历史密钥兼容：dedicated import 用 INVENTORY_ENCRYPTION_KEY，ops import 在未配置时回落 dev-inventory-key
    const candidateKeys = [cloudflareEnv.INVENTORY_ENCRYPTION_KEY, "dev-inventory-key"].filter(Boolean) as string[];
    let plaintext: string | null = null;
    for (const key of candidateKeys) {
      try {
        plaintext = await decryptInventoryValue(item.encrypted_value, key);
        break;
      } catch {
        // 尝试下一个密钥
      }
    }
    if (plaintext === null) throw new HttpError(500, "无法解密该库存，请检查 INVENTORY_ENCRYPTION_KEY");

    // 审计：记录查看明文行为，但绝不记录明文本身
    await writeAuditLog(db, request, actor, "inventory.reveal", "inventory_item", id, {
      skuId: item.sku_id,
      maskedValue: item.masked_value,
      status: item.status,
      reason,
    });

    return jsonResponse(
      { id: item.id, value: plaintext, maskedValue: item.masked_value, status: item.status },
      200,
      request,
      cloudflareEnv
    );
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse({ error: error.message }, error.status, request, cloudflareEnv);
    }
    console.error("[POST /api/admin/inventory/[id]/reveal] unexpected error:", error);
    return jsonResponse({ error: "internal server error" }, 500, request, cloudflareEnv);
  }
}
