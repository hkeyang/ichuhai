import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ensureDatabaseReady } from "@/lib/api/bootstrap";
import { jsonResponse, optionsResponse } from "@/lib/api/cors";
import { HttpError } from "@/lib/api/errors";
import { resolveUserId } from "@/lib/api/user-session";
import { DEFAULT_PAYMENT_EXPIRY_MINUTES, isSupportedTronNetwork, buildProviderPayload } from "@/lib/api/usdt-trc20";
import { formatWalletLedger, type WalletLedgerRow } from "@/lib/api/wallet";
import type { PaymentNetworkRow } from "@/lib/api/types";

function parseD1Utc(value: string) {
  return new Date(value.includes("T") ? value : `${value.replace(" ", "T")}Z`);
}

export async function OPTIONS(request: Request) {
  const { env } = await getCloudflareContext();
  return optionsResponse(request, env as CloudflareEnv);
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { env } = await getCloudflareContext();
  const cloudflareEnv = env as CloudflareEnv;

  try {
    const userId = await resolveUserId(request, cloudflareEnv);
    if (!userId) throw new HttpError(401, "unauthorized");

    const { id } = await params;
    const db = cloudflareEnv.DB;
    await ensureDatabaseReady(db);

    const ledger = await db
      .prepare("SELECT * FROM wallet_ledgers WHERE id = ? AND user_id = ? AND type = 'recharge' LIMIT 1")
      .bind(id, userId)
      .first<WalletLedgerRow>();
    if (!ledger) throw new HttpError(404, "recharge not found");

    const network = await db
      .prepare("SELECT * FROM payment_networks WHERE code = 'TRON' AND is_enabled = 1 LIMIT 1")
      .first<PaymentNetworkRow>();
    if (!isSupportedTronNetwork(network)) throw new HttpError(400, "TRON USDT payment network is not configured");

    const createdAt = parseD1Utc(ledger.created_at);
    const expiresAt = new Date(createdAt.getTime() + DEFAULT_PAYMENT_EXPIRY_MINUTES * 60 * 1000);
    const paymentStatus = ledger.status === "completed" ? "paid" : ledger.status === "failed" ? "failed" : "pending_payment";
    const providerPayload = buildProviderPayload({
      amount: ledger.amount_usdt,
      baseAmount: ledger.amount_usdt,
      suffixUnits: 0,
      suffix: "0",
    });

    return jsonResponse(
      {
        ledger: formatWalletLedger(ledger),
        payment: {
          id: ledger.id,
          orderNo: `CZ${ledger.id.slice(0, 8).toUpperCase()}`,
          status: paymentStatus,
          paymentStatus,
          amountUsdt: ledger.amount_usdt,
          payAmount: ledger.amount_usdt,
          fiatCurrency: "USD",
          fiatAmountSnapshot: ledger.amount_usdt,
          paymentCurrency: "USDT",
          paymentNetwork: "TRON",
          paymentAddress: network.address,
          paymentProvider: "usdt-trc20-direct",
          providerPayload,
          createdAt: ledger.created_at,
          expiresAt: expiresAt.toISOString(),
          updatedAt: ledger.updated_at,
          productSnapshot: { name: "余额充值" },
          skuSnapshot: { skuName: "USDT-TRC20" },
        },
      },
      200,
      request,
      cloudflareEnv
    );
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse({ error: error.message }, error.status, request, cloudflareEnv);
    }
    console.error("[GET /api/me/balance/recharges/[id]/payment] unexpected error:", error);
    return jsonResponse({ error: "internal server error" }, 500, request, cloudflareEnv);
  }
}
