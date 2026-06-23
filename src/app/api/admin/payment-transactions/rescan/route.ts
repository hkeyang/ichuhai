// src/app/api/admin/payment-transactions/rescan/route.ts
// POST /api/admin/payment-transactions/rescan — 手动触发链上重扫（需 admin token + 审计）

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ensureDatabaseReady } from "@/lib/api/bootstrap";
import { jsonResponse, optionsResponse } from "@/lib/api/cors";
import { HttpError } from "@/lib/api/errors";
import { requireAdmin } from "@/lib/api/admin-guard";
import { writeAuditLog } from "@/lib/api/audit";
import { scanTronPayments } from "@/lib/api/payment-scan";

export async function OPTIONS(request: Request) {
  const { env } = await getCloudflareContext();
  return optionsResponse(request, env as CloudflareEnv);
}

export async function POST(request: Request) {
  const { env } = await getCloudflareContext();
  const cloudflareEnv = env as CloudflareEnv;

  try {
    const actor = await requireAdmin(request, cloudflareEnv);
    const db = cloudflareEnv.DB;
    await ensureDatabaseReady(db);

    const result = await scanTronPayments(db, request, cloudflareEnv, actor);

    await writeAuditLog(db, request, actor, "payment.rescan", "payment_transactions", "trongrid", {
      checked: result.checked,
      matched: result.matched,
      exceptions: result.exceptions,
      error: result.error ?? null,
    });

    return jsonResponse(result, 200, request, cloudflareEnv);
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse({ error: error.message }, error.status, request, cloudflareEnv);
    }
    console.error("[POST /api/admin/payment-transactions/rescan] unexpected error:", error);
    return jsonResponse({ error: "internal server error" }, 500, request, cloudflareEnv);
  }
}
