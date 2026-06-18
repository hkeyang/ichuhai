import { timingSafeEqual } from "./admin-session";

const DEFAULT_API_BASE_URL = "https://api.nowpayments.io/v1";

const DEFAULT_PAY_CURRENCY_BY_NETWORK: Record<string, string> = {
  TRON: "usdttrc20",
  ETH: "usdterc20",
  BSC: "usdtbsc",
  BASE: "usdcbase",
};

export interface NowPaymentsCreatePaymentResponse {
  payment_id?: string | number;
  payment_status?: string;
  pay_address?: string;
  pay_amount?: number | string;
  pay_currency?: string;
  price_amount?: number | string;
  price_currency?: string;
  order_id?: string;
  order_description?: string;
  purchase_id?: string;
  network?: string;
  expiration_estimate_date?: string;
  [key: string]: unknown;
}

export interface NowPaymentsIpnPayload {
  payment_id?: string | number;
  payment_status?: string;
  pay_address?: string;
  pay_amount?: number | string;
  pay_currency?: string;
  price_amount?: number | string;
  price_currency?: string;
  order_id?: string;
  purchase_id?: string;
  actually_paid?: number | string;
  outcome_amount?: number | string;
  outcome_currency?: string;
  network?: string;
  [key: string]: unknown;
}

export interface NowPaymentsMinimumAmountResponse {
  currency_from?: string;
  currency_to?: string;
  min_amount?: number | string;
  [key: string]: unknown;
}

export function isNowPaymentsEnabled(env: CloudflareEnv): boolean {
  return Boolean(env.NOWPAYMENTS_API_KEY);
}

export function nowPaymentsApiBaseUrl(env: CloudflareEnv): string {
  return (env.NOWPAYMENTS_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/+$/, "");
}

export function nowPaymentsPayCurrencyMap(env: CloudflareEnv): Record<string, string> {
  if (!env.NOWPAYMENTS_PAY_CURRENCY_MAP) return DEFAULT_PAY_CURRENCY_BY_NETWORK;
  try {
    const parsed = JSON.parse(env.NOWPAYMENTS_PAY_CURRENCY_MAP) as Record<string, string>;
    return Object.fromEntries(
      Object.entries(parsed)
        .map(([network, currency]) => [network.trim().toUpperCase(), String(currency).trim().toLowerCase()])
        .filter(([network, currency]) => network && currency)
    );
  } catch {
    return {};
  }
}

export function isNowPaymentsNetworkSupported(
  networkCode: string,
  env: CloudflareEnv
): boolean {
  const configuredMap = nowPaymentsPayCurrencyMap(env);
  return Boolean(configuredMap[networkCode.trim().toUpperCase()]);
}

export function resolveNowPaymentsPayCurrency(
  networkCode: string,
  env: CloudflareEnv
): string {
  const configuredDefault = (env.NOWPAYMENTS_PAY_CURRENCY_DEFAULT || "").trim();
  const fallback = configuredDefault || DEFAULT_PAY_CURRENCY_BY_NETWORK.TRON;
  const configuredMap = nowPaymentsPayCurrencyMap(env);

  const normalizedCode = networkCode.trim().toUpperCase();
  return (
    configuredMap[normalizedCode] ||
    DEFAULT_PAY_CURRENCY_BY_NETWORK[normalizedCode] ||
    fallback
  ).trim().toLowerCase();
}

export function mapNowPaymentsStatus(status: string | null | undefined): string {
  switch ((status || "").toLowerCase()) {
    case "finished":
    case "confirmed":
      return "paid";
    case "confirming":
    case "sending":
      return "payment_confirming";
    case "failed":
    case "refunded":
    case "expired":
      return "failed";
    case "partially_paid":
      return "payment_confirming";
    default:
      return "pending_payment";
  }
}

export async function createNowPaymentsPayment(
  env: CloudflareEnv,
  input: {
    orderId: string;
    orderNo: string;
    amountUsdt: string;
    payCurrency: string;
    description: string;
  }
): Promise<NowPaymentsCreatePaymentResponse> {
  const siteUrl = (env.PUBLIC_SITE_URL || "").replace(/\/+$/, "");
  const response = await fetch(`${nowPaymentsApiBaseUrl(env)}/payment`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": env.NOWPAYMENTS_API_KEY,
    },
    body: JSON.stringify({
      price_amount: Number(input.amountUsdt),
      price_currency: "usd",
      pay_currency: input.payCurrency,
      order_id: input.orderId,
      order_description: input.description,
      ipn_callback_url: siteUrl ? `${siteUrl}/api/nowpayments/ipn` : undefined,
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof payload?.message === "string" ? payload.message : "NOWPayments payment creation failed";
    throw new Error(message);
  }
  return payload as NowPaymentsCreatePaymentResponse;
}

export async function getNowPaymentsMinimumAmount(
  env: CloudflareEnv,
  payCurrency: string
): Promise<number | null> {
  const url = new URL(`${nowPaymentsApiBaseUrl(env)}/min-amount`);
  url.searchParams.set("currency_from", "usd");
  url.searchParams.set("currency_to", payCurrency);

  const response = await fetch(url, {
    headers: {
      "x-api-key": env.NOWPAYMENTS_API_KEY,
    },
  });

  const payload = await response.json().catch(() => ({})) as NowPaymentsMinimumAmountResponse;
  if (!response.ok) return null;

  const minAmount = Number(payload.min_amount);
  return Number.isFinite(minAmount) && minAmount > 0 ? minAmount : null;
}

function sortForSignature(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortForSignature);
  if (value && typeof value === "object") {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((sorted, key) => {
        sorted[key] = sortForSignature((value as Record<string, unknown>)[key]);
        return sorted;
      }, {});
  }
  return value;
}

async function hmacSha512Hex(message: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return [...new Uint8Array(signature)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function verifyNowPaymentsIpnSignature(
  rawBody: string,
  signature: string,
  secret: string
): Promise<boolean> {
  if (!signature || !secret) return false;
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return false;
  }
  const signedBody = JSON.stringify(sortForSignature(parsed));
  const expected = await hmacSha512Hex(signedBody, secret);
  return timingSafeEqual(signature.toLowerCase(), expected.toLowerCase());
}
