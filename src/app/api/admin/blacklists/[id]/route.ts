// src/app/api/admin/blacklists/[id]/route.ts
// PATCH /api/admin/blacklists/[id] — 停用/启用 + 编辑黑名单（需 admin token + 审计）
// GET   /api/admin/blacklists/[id]/hits 由 query ?hits=1 返回命中订单

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ensureDatabaseReady } from "@/lib/api/bootstrap";
import { parseBody } from "@/lib/api/body-parser";
import { jsonResponse, optionsResponse } from "@/lib/api/cors";
import { HttpError } from "@/lib/api/errors";
import { requireAdmin } from "@/lib/api/admin-guard";
import { writeAuditLog } from "@/lib/api/audit";
import { formatBlacklist, formatOrder } from "@/lib/api/formatters";
import type { BlacklistRow, OrderRow } from "@/lib/api/types";

export async function OPTIONS(request: Request) {
  const { env } = await getCloudflareContext();
  return optionsResponse(request, env as CloudflareEnv);
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { env } = await getCloudflareContext();
  const cloudflareEnv = env as CloudflareEnv;

  try {
    await requireAdmin(request, cloudflareEnv);
    const { id } = await params;
    const db = cloudflareEnv.DB;
    await ensureDatabaseReady(db);

    const entry = await db.prepare("SELECT * FROM blacklists WHERE id = ?").bind(id).first<BlacklistRow>();
    if (!entry) throw new HttpError(404, "blacklist entry not found");

    // 查命中订单：按 kind 匹配 orders
    const value = String(entry.value ?? "").replace(/^@/, "").trim().toLowerCase();
    let hits: OrderRow[] = [];
    if (entry.kind === "email") {
      hits = (await db.prepare("SELECT * FROM orders WHERE LOWER(email) = ? ORDER BY created_at DESC LIMIT 100").bind(value).all<OrderRow>()).results;
    } else if (entry.kind === "telegram_username" || entry.kind === "telegram_id") {
      hits = (await db.prepare("SELECT * FROM orders WHERE LOWER(REPLACE(telegram_username,'@','')) = ? ORDER BY created_at DESC LIMIT 100").bind(value).all<OrderRow>()).results;
    }

    return jsonResponse({ entry: formatBlacklist(entry), hits: hits.map(formatOrder) }, 200, request, cloudflareEnv);
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse({ error: error.message }, error.status, request, cloudflareEnv);
    }
    console.error("[GET /api/admin/blacklists/[id]] unexpected error:", error);
    return jsonResponse({ error: "internal server error" }, 500, request, cloudflareEnv);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { env } = await getCloudflareContext();
  const cloudflareEnv = env as CloudflareEnv;

  try {
    const actor = await requireAdmin(request, cloudflareEnv);
    const { id } = await params;
    const db = cloudflareEnv.DB;
    await ensureDatabaseReady(db);

    const body = await parseBody<{ status?: unknown; reason?: unknown; effect?: unknown }>(request);

    const entry = await db.prepare("SELECT * FROM blacklists WHERE id = ?").bind(id).first<BlacklistRow>();
    if (!entry) throw new HttpError(404, "blacklist entry not found");

    const fields: string[] = [];
    const values: unknown[] = [];

    if (body.status !== undefined) {
      const status = String(body.status).trim();
      if (status !== "active" && status !== "inactive") throw new HttpError(422, "invalid status");
      fields.push("status = ?");
      values.push(status);
    }
    if (body.reason !== undefined) {
      fields.push("reason = ?");
      values.push(String(body.reason).trim());
    }
    if (body.effect !== undefined) {
      const effect = String(body.effect).trim();
      if (!["block_order", "require_manual_review", "block_payment"].includes(effect)) {
        throw new HttpError(422, "invalid effect");
      }
      fields.push("effect = ?");
      values.push(effect);
    }
    if (!fields.length) throw new HttpError(422, "no fields to update");

    fields.push("updated_at = datetime('now')");
    values.push(id);
    await db.prepare(`UPDATE blacklists SET ${fields.join(", ")} WHERE id = ?`).bind(...values).run();

    const updated = await db.prepare("SELECT * FROM blacklists WHERE id = ?").bind(id).first<BlacklistRow>();
    await writeAuditLog(db, request, actor, "blacklist.update", "blacklist", id, {
      kind: entry.kind,
      value: entry.value,
      changedFields: Object.keys(body),
      previousStatus: entry.status,
      nextStatus: updated?.status,
    });

    return jsonResponse(updated ? formatBlacklist(updated) : null, 200, request, cloudflareEnv);
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse({ error: error.message }, error.status, request, cloudflareEnv);
    }
    console.error("[PATCH /api/admin/blacklists/[id]] unexpected error:", error);
    return jsonResponse({ error: "internal server error" }, 500, request, cloudflareEnv);
  }
}
