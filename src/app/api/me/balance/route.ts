import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ensureDatabaseReady } from "@/lib/api/bootstrap";
import { parseBody } from "@/lib/api/body-parser";
import { jsonResponse, optionsResponse } from "@/lib/api/cors";
import { HttpError } from "@/lib/api/errors";
import { resolveUserId } from "@/lib/api/user-session";
import { createWalletLedger, formatWalletLedger, normalizeUsdt } from "@/lib/api/wallet";

interface LedgerRow {
  id: string;
  type: string;
  amount_usdt: string;
  balance_after: string;
  status: string;
  method: string | null;
  note: string | null;
  reference_type: string | null;
  reference_id: string | null;
  created_at: string;
  updated_at: string | null;
}

export async function OPTIONS(request: Request) {
  const { env } = await getCloudflareContext();
  return optionsResponse(request, env as CloudflareEnv);
}

export async function GET(request: Request) {
  const { env } = await getCloudflareContext();
  const cloudflareEnv = env as CloudflareEnv;

  try {
    const userId = await resolveUserId(request, cloudflareEnv);
    if (!userId) throw new HttpError(401, "unauthorized");

    const db = cloudflareEnv.DB;
    await ensureDatabaseReady(db);

    const user = await db
      .prepare("SELECT balance_usdt FROM users WHERE id = ?")
      .bind(userId)
      .first<{ balance_usdt: string | null }>();
    if (!user) throw new HttpError(404, "user not found");

    const ledger = await db
      .prepare(
        `SELECT id, type, amount_usdt, balance_after, status, method, note, reference_type, reference_id, created_at, updated_at
         FROM wallet_ledgers WHERE user_id = ?
         ORDER BY created_at DESC LIMIT 50`
      )
      .bind(userId)
      .all<LedgerRow>();

    return jsonResponse(
      {
        balanceUsdt: user.balance_usdt ?? "0",
        ledger: ledger.results.map((row) => ({
          id: row.id,
          type: row.type,
          amountUsdt: row.amount_usdt,
          balanceAfter: row.balance_after,
          status: row.status,
          method: row.method,
          note: row.note,
          referenceType: row.reference_type,
          referenceId: row.reference_id,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        })),
      },
      200,
      request,
      cloudflareEnv
    );
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse({ error: error.message }, error.status, request, cloudflareEnv);
    }
    return jsonResponse({ error: "internal server error" }, 500, request, cloudflareEnv);
  }
}

export async function POST(request: Request) {
  const { env } = await getCloudflareContext();
  const cloudflareEnv = env as CloudflareEnv;

  try {
    const userId = await resolveUserId(request, cloudflareEnv);
    if (!userId) throw new HttpError(401, "unauthorized");

    const body = await parseBody<{ amountUsdt?: unknown; method?: unknown; note?: unknown }>(request);
    const amount = normalizeUsdt(String(body.amountUsdt ?? ""));
    const method = String(body.method ?? "usdt_trc20").trim();
    const note = String(body.note ?? "").trim();
    if (Number(amount) < 1) throw new HttpError(422, "充值金额不能低于 1 USDT");
    if (!["usdt_trc20", "alipay", "manual"].includes(method)) throw new HttpError(422, "充值方式无效");

    const db = cloudflareEnv.DB;
    await ensureDatabaseReady(db);

    const ledger = await createWalletLedger(db, {
      userId,
      type: "recharge",
      amountUsdt: amount,
      status: "pending",
      method,
      note: note || "用户提交充值申请",
      referenceType: "recharge",
      referenceId: crypto.randomUUID(),
      createdBy: "user",
    });

    return jsonResponse({ ledger: formatWalletLedger(ledger) }, 201, request, cloudflareEnv);
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse({ error: error.message }, error.status, request, cloudflareEnv);
    }
    console.error("[POST /api/me/balance] unexpected error:", error);
    return jsonResponse({ error: "internal server error" }, 500, request, cloudflareEnv);
  }
}
