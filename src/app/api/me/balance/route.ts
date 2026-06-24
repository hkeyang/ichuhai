import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ensureDatabaseReady } from "@/lib/api/bootstrap";
import { parseBody } from "@/lib/api/body-parser";
import { jsonResponse, optionsResponse } from "@/lib/api/cors";
import { HttpError } from "@/lib/api/errors";
import { resolveUserId } from "@/lib/api/user-session";
import { createWalletLedger, formatWalletLedger, normalizeUsdt } from "@/lib/api/wallet";
import {
  allocatePaymentAmount,
  buildProviderPayload,
  DEFAULT_PAYMENT_EXPIRY_MINUTES,
  isSupportedTronNetwork,
} from "@/lib/api/usdt-trc20";
import type { OrderRow, PaymentNetworkRow } from "@/lib/api/types";

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
    if (method !== "usdt_trc20") throw new HttpError(422, "当前仅开放 USDT-TRC20 在线充值");

    const db = cloudflareEnv.DB;
    await ensureDatabaseReady(db);

    const network = await db
      .prepare("SELECT * FROM payment_networks WHERE code = 'TRON' AND is_enabled = 1 LIMIT 1")
      .first<PaymentNetworkRow>();
    if (!isSupportedTronNetwork(network)) throw new HttpError(400, "TRON USDT payment network is not configured");

    const activeOrders = await db
      .prepare(
        `SELECT amount_usdt, status, expires_at, payment_network
         FROM orders
         WHERE payment_network = 'TRON'
           AND status IN ('created','pending_payment','payment_confirming')
           AND expires_at > datetime('now')`
      )
      .all<Pick<OrderRow, "amount_usdt" | "status" | "expires_at" | "payment_network">>();
    const activeLedgers = await db
      .prepare(
        `SELECT amount_usdt, status, datetime(created_at, '+${DEFAULT_PAYMENT_EXPIRY_MINUTES} minutes') AS expires_at, 'TRON' AS payment_network
         FROM wallet_ledgers
         WHERE type = 'recharge'
           AND status = 'pending'
           AND method = 'usdt_trc20'
           AND datetime(created_at, '+${DEFAULT_PAYMENT_EXPIRY_MINUTES} minutes') > datetime('now')`
      )
      .all<Pick<OrderRow, "amount_usdt" | "status" | "expires_at" | "payment_network">>();
    const paymentAmount = allocatePaymentAmount(amount, [
      ...activeOrders.results,
      ...activeLedgers.results,
    ]);
    if (!paymentAmount) throw new HttpError(409, "当前同额充值较多，请稍后重试");

    const ledger = await createWalletLedger(db, {
      userId,
      type: "recharge",
      amountUsdt: paymentAmount.amount,
      status: "pending",
      method,
      note: note || `USDT-TRC20 在线充值，基础金额 ${paymentAmount.baseAmount} USDT`,
      referenceType: "recharge",
      referenceId: crypto.randomUUID(),
      createdBy: "user",
    });

    return jsonResponse(
      {
        ledger: formatWalletLedger(ledger),
        payment: {
          paymentUrl: `/pay/wallet-${ledger.id}`,
          paymentAddress: network.address,
          paymentNetwork: "TRON",
          paymentCurrency: "USDT",
          amountUsdt: paymentAmount.amount,
          provider: "usdt-trc20-direct",
          providerPayload: buildProviderPayload(paymentAmount),
        },
      },
      201,
      request,
      cloudflareEnv
    );
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse({ error: error.message }, error.status, request, cloudflareEnv);
    }
    console.error("[POST /api/me/balance] unexpected error:", error);
    return jsonResponse({ error: "internal server error" }, 500, request, cloudflareEnv);
  }
}
