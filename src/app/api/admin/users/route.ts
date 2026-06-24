// src/app/api/admin/users/route.ts
// GET /api/admin/users — 用户列表（users 表为主，聚合订单与余额，需 admin token）

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ensureDatabaseReady } from "@/lib/api/bootstrap";
import { jsonResponse, optionsResponse } from "@/lib/api/cors";
import { HttpError } from "@/lib/api/errors";
import { requireAdmin, parsePagination, param, pageEnvelope } from "@/lib/api/admin-guard";

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
    const pagination = parsePagination(url);

    const where: string[] = [];
    const binds: unknown[] = [];
    if (q) {
      where.push("(u.email LIKE ? OR u.telegram_username LIKE ? OR u.nickname LIKE ?)");
      const like = `%${q}%`;
      binds.push(like, like, like);
    }
    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const totalRow = await db
      .prepare(`SELECT COUNT(*) AS total FROM users u ${whereSql}`)
      .bind(...binds)
      .first<{ total: number }>();

    const listResult = await db
      .prepare(
        `SELECT u.id,
                u.email,
                u.telegram_username AS telegramUsername,
                u.nickname,
                u.balance_usdt AS balanceUsdt,
                u.created_at AS createdAt,
                u.last_login_at AS lastLoginAt,
                COUNT(o.id) AS orderCount,
                SUM(CASE WHEN o.status IN ('paid','delivering','completed') AND o.paid_at IS NOT NULL THEN CAST(o.amount_usdt AS REAL) ELSE 0 END) AS paidAmount,
                SUM(CASE WHEN COALESCE(o.after_sale_status,'none') <> 'none' THEN 1 ELSE 0 END) AS afterSaleCount,
                MAX(o.created_at) AS lastOrderAt
         FROM users u
         LEFT JOIN orders o ON o.user_id = u.id OR (u.email IS NOT NULL AND LOWER(o.email) = LOWER(u.email))
         ${whereSql}
         GROUP BY u.id
         ORDER BY COALESCE(lastOrderAt, u.created_at) DESC
         LIMIT ? OFFSET ?`
      )
      .bind(...binds, pagination.pageSize, pagination.offset)
      .all<{
        id: string;
        email: string;
        telegramUsername: string | null;
        nickname: string | null;
        balanceUsdt: string | null;
        createdAt: string;
        lastLoginAt: string | null;
        orderCount: number;
        paidAmount: number;
        afterSaleCount: number;
        lastOrderAt: string | null;
      }>();

    // 命中黑名单的邮箱/telegram，用于标注风险状态
    const blacklistResult = await db
      .prepare("SELECT kind, value FROM blacklists WHERE status = 'active' AND kind IN ('email','telegram_username','telegram_id')")
      .all<{ kind: string; value: string }>();
    const blockedEmails = new Set<string>();
    const blockedTelegrams = new Set<string>();
    for (const row of blacklistResult.results) {
      const v = String(row.value ?? "").replace(/^@/, "").trim().toLowerCase();
      if (row.kind === "email") blockedEmails.add(v);
      else blockedTelegrams.add(v);
    }

    const items = listResult.results.map((row) => {
      const tg = String(row.telegramUsername ?? "").replace(/^@/, "").trim().toLowerCase();
      const email = row.email ?? "";
      const risk = blockedEmails.has(email.toLowerCase()) || (tg && blockedTelegrams.has(tg));
      return {
        id: row.id,
        email,
        telegramUsername: row.telegramUsername,
        nickname: row.nickname,
        balanceUsdt: row.balanceUsdt ?? "0",
        orderCount: row.orderCount,
        paidAmountUsdt: Number(row.paidAmount ?? 0).toFixed(3),
        afterSaleCount: row.afterSaleCount,
        lastOrderAt: row.lastOrderAt,
        createdAt: row.createdAt,
        lastLoginAt: row.lastLoginAt,
        riskStatus: risk ? "blacklisted" : "normal",
      };
    });

    return jsonResponse(pageEnvelope(items, Number(totalRow?.total ?? 0), pagination), 200, request, cloudflareEnv);
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse({ error: error.message }, error.status, request, cloudflareEnv);
    }
    console.error("[GET /api/admin/users] unexpected error:", error);
    return jsonResponse({ error: "internal server error" }, 500, request, cloudflareEnv);
  }
}
