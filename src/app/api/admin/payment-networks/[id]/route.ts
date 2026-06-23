// src/app/api/admin/payment-networks/[id]/route.ts
// PATCH /api/admin/payment-networks/[id] — 更新支付网络（需 admin token）

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ensureDatabaseReady } from "@/lib/api/bootstrap";
import { parseBody } from "@/lib/api/body-parser";
import { jsonResponse, optionsResponse } from "@/lib/api/cors";
import { HttpError } from "@/lib/api/errors";
import { verifyAdminSessionToken } from "@/lib/api/admin-session";
import { writeAuditLog } from "@/lib/api/audit";
import { cleanString } from "@/lib/api/validators";
import { formatPaymentNetwork } from "@/lib/api/formatters";
import { isValidTronAddressFormat } from "@/lib/api/usdt-trc20";
import type { PaymentNetworkRow } from "@/lib/api/types";

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
    await ensureDatabaseReady(db);

    const existing = await db
      .prepare("SELECT * FROM payment_networks WHERE id = ? OR code = ?")
      .bind(id, id)
      .first<PaymentNetworkRow>();

    if (!existing) throw new HttpError(404, "payment network not found");

    const body = await parseBody<{
      displayName?: unknown;
      address?: unknown;
      isEnabled?: unknown;
      isRecommended?: unknown;
      confirmations?: unknown;
      warningText?: unknown;
    }>(request);

    const fields: string[] = [];
    const values: unknown[] = [];

    if (body.displayName !== undefined) {
      fields.push("display_name = ?");
      values.push(cleanString(body.displayName, "displayName", { max: 80 }));
    }
    if (body.address !== undefined) {
      const nextAddress = cleanString(body.address, "address", { max: 200 });
      if (existing.code === "TRON" && !isValidTronAddressFormat(nextAddress)) {
        throw new HttpError(422, "TRON address is invalid");
      }
      fields.push("address = ?");
      values.push(nextAddress);
    }
    if (body.isEnabled !== undefined) {
      fields.push("is_enabled = ?");
      values.push(body.isEnabled ? 1 : 0);
    }
    if (body.isRecommended !== undefined) {
      fields.push("is_recommended = ?");
      values.push(body.isRecommended ? 1 : 0);
    }
    if (body.confirmations !== undefined) {
      const confirmations = Math.max(1, Math.floor(Number(body.confirmations)));
      if (isNaN(confirmations)) throw new HttpError(422, "confirmations is invalid");
      fields.push("confirmations = ?");
      values.push(confirmations);
    }
    if (body.warningText !== undefined) {
      fields.push("warning_text = ?");
      values.push(
        body.warningText === null || body.warningText === ""
          ? null
          : cleanString(body.warningText, "warningText", { max: 300 })
      );
    }

    if (fields.length === 0) throw new HttpError(422, "no fields to update");

    fields.push("updated_at = datetime('now')");
    values.push(existing.id);

    await db
      .prepare(`UPDATE payment_networks SET ${fields.join(", ")} WHERE id = ?`)
      .bind(...values)
      .run();

    if (body.isRecommended) {
      await db
        .prepare("UPDATE payment_networks SET is_recommended = 0, updated_at = datetime('now') WHERE id <> ?")
        .bind(existing.id)
        .run();
    }

    const updated = await db
      .prepare("SELECT * FROM payment_networks WHERE id = ?")
      .bind(existing.id)
      .first<PaymentNetworkRow>();

    await writeAuditLog(
      db,
      request,
      { actorId: "admin", role: "admin" },
      "payment_network.update",
      "payment_network",
      existing.id,
      {
        code: existing.code,
        changedFields: Object.keys(body),
        previousAddress: body.address !== undefined ? existing.address : undefined,
        nextAddress: body.address !== undefined ? updated?.address : undefined,
        previousEnabled: body.isEnabled !== undefined ? existing.is_enabled === 1 : undefined,
        nextEnabled: body.isEnabled !== undefined ? updated?.is_enabled === 1 : undefined,
        previousConfirmations: body.confirmations !== undefined ? existing.confirmations : undefined,
        nextConfirmations: body.confirmations !== undefined ? updated?.confirmations : undefined,
      }
    );

    return jsonResponse(updated ? formatPaymentNetwork(updated) : null, 200, request, cloudflareEnv);
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse({ error: error.message }, error.status, request, cloudflareEnv);
    }
    console.error("[PATCH /api/admin/payment-networks/[id]] unexpected error:", error);
    return jsonResponse({ error: "internal server error" }, 500, request, cloudflareEnv);
  }
}
