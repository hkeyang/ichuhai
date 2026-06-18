import type { OrderRow, PaymentNetworkRow } from "./types";

export const TRON_USDT_CONTRACT = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";
export const PAYMENT_AMOUNT_SCALE = 1000;
export const DEFAULT_PAYMENT_EXPIRY_MINUTES = 15;
export const DEFAULT_PAYMENT_GRACE_MINUTES = 5;
export const DEFAULT_TRON_CONFIRMATIONS = 3;
export const MAX_AMOUNT_SUFFIX_UNITS = 99;

export interface PaymentAmountAllocation {
  amount: string;
  baseAmount: string;
  suffixUnits: number;
  suffix: string;
}

export interface TronGridTransfer {
  txHash: string;
  fromAddress: string | null;
  toAddress: string;
  amount: string;
  rawAmount: string;
  confirmations: number;
  blockTimestamp: number;
}

export function normalizeTronAddress(value: string | null | undefined): string {
  return String(value || "").trim();
}

export function amountToUnits(value: string | number, scale = PAYMENT_AMOUNT_SCALE): number {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) return 0;
  return Math.round(numeric * scale);
}

export function unitsToAmount(units: number, scale = PAYMENT_AMOUNT_SCALE): string {
  return (units / scale).toFixed(3);
}

export function buildProviderPayload(input: PaymentAmountAllocation): Record<string, unknown> {
  return {
    provider: "usdt-trc20-direct",
    baseAmountUsdt: input.baseAmount,
    paymentAmountUsdt: input.amount,
    amountSuffix: input.suffix,
    amountSuffixUnits: input.suffixUnits,
    amountScale: PAYMENT_AMOUNT_SCALE,
    matching: {
      address: true,
      token: "USDT_TRC20",
      exactAmount: true,
      txHashUnique: true,
      timeWindow: true,
      confirmations: DEFAULT_TRON_CONFIRMATIONS,
    },
  };
}

export function paymentWindowEnd(expiresAt: string, graceMinutes = DEFAULT_PAYMENT_GRACE_MINUTES): Date {
  return new Date(new Date(expiresAt).getTime() + graceMinutes * 60 * 1000);
}

export function transactionIsInPaymentWindow(
  order: Pick<OrderRow, "created_at" | "expires_at">,
  blockTimestamp: number,
  graceMinutes = DEFAULT_PAYMENT_GRACE_MINUTES
): boolean {
  if (!Number.isFinite(blockTimestamp) || blockTimestamp <= 0) return false;
  const txTime = new Date(blockTimestamp).getTime();
  const createdAt = new Date(order.created_at).getTime();
  const windowEnd = paymentWindowEnd(order.expires_at, graceMinutes).getTime();
  return txTime >= createdAt && txTime <= windowEnd;
}

export function allocatePaymentAmount(
  baseAmount: string,
  activeOrders: Array<Pick<OrderRow, "amount_usdt" | "status" | "expires_at" | "payment_network">>
): PaymentAmountAllocation | null {
  const baseUnits = amountToUnits(baseAmount);
  const used = new Set<number>();
  const now = Date.now();

  for (const order of activeOrders) {
    if (order.payment_network !== "TRON") continue;
    if (!["created", "pending_payment", "payment_confirming"].includes(order.status)) continue;
    if (paymentWindowEnd(order.expires_at).getTime() <= now) continue;
    const orderUnits = amountToUnits(order.amount_usdt);
    const suffixUnits = orderUnits - baseUnits;
    if (suffixUnits >= 1 && suffixUnits <= MAX_AMOUNT_SUFFIX_UNITS) used.add(suffixUnits);
  }

  for (let suffixUnits = 1; suffixUnits <= MAX_AMOUNT_SUFFIX_UNITS; suffixUnits += 1) {
    if (used.has(suffixUnits)) continue;
    const amountUnits = baseUnits + suffixUnits;
    return {
      amount: unitsToAmount(amountUnits),
      baseAmount: unitsToAmount(baseUnits),
      suffixUnits,
      suffix: `+${unitsToAmount(suffixUnits).replace(/^0/, "")}`,
    };
  }

  return null;
}

export function isSupportedTronNetwork(network: PaymentNetworkRow | null | undefined): network is PaymentNetworkRow {
  return Boolean(
    network &&
      network.code === "TRON" &&
      network.is_enabled === 1 &&
      network.token_standard.toUpperCase() === "TRC20" &&
      normalizeTronAddress(network.address)
  );
}

export async function fetchTronUsdtTransfers(input: {
  address: string;
  apiKey?: string;
  minTimestamp?: number;
  limit?: number;
}): Promise<TronGridTransfer[]> {
  const url = new URL(`https://api.trongrid.io/v1/accounts/${input.address}/transactions/trc20`);
  url.searchParams.set("limit", String(input.limit ?? 200));
  url.searchParams.set("contract_address", TRON_USDT_CONTRACT);
  url.searchParams.set("only_confirmed", "true");
  url.searchParams.set("only_to", "true");
  if (input.minTimestamp) url.searchParams.set("min_timestamp", String(input.minTimestamp));

  const headers: HeadersInit = input.apiKey ? { "TRON-PRO-API-KEY": input.apiKey } : {};
  const response = await fetch(url, { headers });
  const payload = await response.json().catch(() => ({})) as { data?: unknown[] };
  if (!response.ok) {
    throw new Error(`TronGrid failed with ${response.status}`);
  }

  return (payload.data || []).map((item) => {
    const tx = item as Record<string, unknown>;
    const rawAmount = String(tx.value ?? "0");
    const decimals = Number((tx.token_info as Record<string, unknown> | undefined)?.decimals ?? 6);
    const amount = Number(rawAmount) / 10 ** (Number.isFinite(decimals) ? decimals : 6);
    return {
      txHash: String(tx.transaction_id || "").trim(),
      fromAddress: tx.from ? String(tx.from) : null,
      toAddress: String(tx.to || "").trim(),
      amount: amount.toFixed(6).replace(/\.?0+$/, ""),
      rawAmount,
      confirmations: Number(tx.confirmed ? DEFAULT_TRON_CONFIRMATIONS : 0),
      blockTimestamp: Number(tx.block_timestamp || 0),
    };
  }).filter((transfer) => transfer.txHash && transfer.toAddress);
}
