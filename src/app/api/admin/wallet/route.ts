import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ensureDatabaseReady } from "@/lib/api/bootstrap";
import { parseBody } from "@/lib/api/body-parser";
import { jsonResponse, optionsResponse } from "@/lib/api/cors";
import { HttpError } from "@/lib/api/errors";
import { requireAdmin, parsePagination, param, pageEnvelope } from "@/lib/api/admin-guard";
import { writeAuditLog } from "@/lib/api/audit";
import {
  completePendingWalletLedger,
  createWalletLedger,
  failPendingWalletLedger,
  formatWalletLedger,
  normalizeUsdt,
  type WalletLedgerRow,
} from "@/lib/api/wallet";

interface WalletLedgerAdminRow extends WalletLedgerRow {
  email: string | null;
  nickname: string | null;
}

export async function OPTIONS(request: Request) {
  const { env } = await getCloudflareContext();
  return optionsResponse(request, env as CloudflareEnv);
}

export async function GET(request: Request) {
  const { env } = await getCloudflareContext();
  const cloudflareEnv = env as CloudflareEnv;

  try {
    await requireAdmin(request, cloudflareEnv);
    const db = cloudflareEnv.DB;
    await ensureDatabaseReady(db);

    const url = new URL(request.url);
    const q = param(url, "q");
    const type = param(url, "type");
    const status = param(url, "status");
    const pagination = parsePagination(url);
    const where: string[] = [];
    const binds: unknown[] = [];

    if (type && ["recharge", "consume", "refund", "adjust"].includes(type)) {
      where.push("l.type = ?");
      binds.push(type);
    }
    if (status && ["pending", "completed", "failed"].includes(status)) {
      where.push("l.status = ?");
      binds.push(status);
    }
    if (q) {
      where.push("(u.email LIKE ? OR u.nickname LIKE ? OR l.note LIKE ? OR l.reference_id LIKE ?)");
      const like = `%${q}%`;
      binds.push(like, like, like, like);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
    const totalRow = await db
      .prepare(`SELECT COUNT(*) AS total FROM wallet_ledgers l LEFT JOIN users u ON u.id = l.user_id ${whereSql}`)
      .bind(...binds)
      .first<{ total: number }>();
    const rows = await db
      .prepare(
        `SELECT l.*, u.email, u.nickname
         FROM wallet_ledgers l
         LEFT JOIN users u ON u.id = l.user_id
         ${whereSql}
         ORDER BY l.created_at DESC
         LIMIT ? OFFSET ?`
      )
      .bind(...binds, pagination.pageSize, pagination.offset)
      .all<WalletLedgerAdminRow>();

    const items = rows.results.map((row) => ({
      ...formatWalletLedger(row),
      email: row.email,
      nickname: row.nickname,
    }));

    return jsonResponse(pageEnvelope(items, Number(totalRow?.total ?? 0), pagination), 200, request, cloudflareEnv);
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse({ error: error.message }, error.status, request, cloudflareEnv);
    }
    console.error("[GET /api/admin/wallet] unexpected error:", error);
    return jsonResponse({ error: "internal server error" }, 500, request, cloudflareEnv);
  }
}

export async function POST(request: Request) {
  const { env } = await getCloudflareContext();
  const cloudflareEnv = env as CloudflareEnv;

  try {
    const actor = await requireAdmin(request, cloudflareEnv);
    const db = cloudflareEnv.DB;
    await ensureDatabaseReady(db);
    const body = await parseBody<{
      action?: unknown;
      ledgerId?: unknown;
      userId?: unknown;
      amountUsdt?: unknown;
      type?: unknown;
      method?: unknown;
      note?: unknown;
    }>(request);
    const action = String(body.action ?? "").trim();
    const note = String(body.note ?? "").trim();
    let ledger: WalletLedgerRow;

    if (action === "confirm") {
      const ledgerId = String(body.ledgerId ?? "").trim();
      if (!ledgerId) throw new HttpError(422, "ledgerId is required");
      ledger = await completePendingWalletLedger(db, ledgerId, actor.actorId);
      await writeAuditLog(db, request, actor, "wallet.recharge_confirm", "wallet_ledger", ledgerId, { note });
    } else if (action === "reject") {
      const ledgerId = String(body.ledgerId ?? "").trim();
      if (!ledgerId) throw new HttpError(422, "ledgerId is required");
      ledger = await failPendingWalletLedger(db, ledgerId, actor.actorId, note || "充值未通过");
      await writeAuditLog(db, request, actor, "wallet.recharge_reject", "wallet_ledger", ledgerId, { note });
    } else if (action === "adjust") {
      const userId = String(body.userId ?? "").trim();
      const type = String(body.type ?? "adjust").trim();
      if (!userId) throw new HttpError(422, "userId is required");
      if (!["recharge", "refund", "adjust"].includes(type)) throw new HttpError(422, "type is invalid");
      const amount = normalizeUsdt(String(body.amountUsdt ?? ""));
      if (amount === "0") throw new HttpError(422, "金额不能为 0");
      ledger = await createWalletLedger(db, {
        userId,
        type: type as "recharge" | "refund" | "adjust",
        amountUsdt: amount,
        method: String(body.method ?? "manual").trim() || "manual",
        note: note || "后台余额调整",
        referenceType: "admin_adjust",
        referenceId: crypto.randomUUID(),
        createdBy: actor.actorId,
      });
      await writeAuditLog(db, request, actor, "wallet.adjust", "user", userId, { amountUsdt: amount, type, note });
    } else {
      throw new HttpError(422, "action is invalid");
    }

    return jsonResponse({ ledger: formatWalletLedger(ledger) }, 200, request, cloudflareEnv);
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse({ error: error.message }, error.status, request, cloudflareEnv);
    }
    console.error("[POST /api/admin/wallet] unexpected error:", error);
    return jsonResponse({ error: "internal server error" }, 500, request, cloudflareEnv);
  }
}
