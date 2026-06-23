// src/app/api/admin/payment-transactions/route.ts
// GET /api/admin/payment-transactions — 到账交易列表（服务端筛选 + 分页，需 admin token）

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ensureDatabaseReady } from "@/lib/api/bootstrap";
import { jsonResponse, optionsResponse } from "@/lib/api/cors";
import { HttpError } from "@/lib/api/errors";
import { requireAdmin, parsePagination, param, pageEnvelope } from "@/lib/api/admin-guard";
import { formatPaymentTransaction } from "@/lib/api/formatters";
import type { PaymentTransactionRow } from "@/lib/api/types";

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
    const matchStatus = param(url, "matchStatus");
    const exceptionType = param(url, "exceptionType");
    const orderNo = param(url, "orderNo");
    const onlyExceptions = param(url, "onlyExceptions") === "1";
    const pagination = parsePagination(url);

    const where: string[] = [];
    const binds: unknown[] = [];

    if (matchStatus) {
      where.push("match_status = ?");
      binds.push(matchStatus);
    }
    if (exceptionType) {
      where.push("exception_type = ?");
      binds.push(exceptionType);
    }
    if (orderNo) {
      where.push("matched_order_no = ?");
      binds.push(orderNo);
    }
    if (onlyExceptions) {
      where.push("match_status NOT IN ('matched','manual_confirm','ignored','resolved')");
    }
    if (q) {
      where.push("(tx_hash LIKE ? OR from_address LIKE ? OR to_address LIKE ? OR matched_order_no LIKE ?)");
      const like = `%${q}%`;
      binds.push(like, like, like, like);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const totalRow = await db
      .prepare(`SELECT COUNT(*) AS total FROM payment_transactions ${whereSql}`)
      .bind(...binds)
      .first<{ total: number }>();

    const listResult = await db
      .prepare(`SELECT * FROM payment_transactions ${whereSql} ORDER BY detected_at DESC LIMIT ? OFFSET ?`)
      .bind(...binds, pagination.pageSize, pagination.offset)
      .all<PaymentTransactionRow>();

    return jsonResponse(
      pageEnvelope(listResult.results.map(formatPaymentTransaction), Number(totalRow?.total ?? 0), pagination),
      200,
      request,
      cloudflareEnv
    );
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse({ error: error.message }, error.status, request, cloudflareEnv);
    }
    console.error("[GET /api/admin/payment-transactions] unexpected error:", error);
    return jsonResponse({ error: "internal server error" }, 500, request, cloudflareEnv);
  }
}
