// src/lib/api/payment-scan.ts
// 共享的 TRON/USDT TRC20 到账扫描逻辑，供内部监听 (payment-listener) 与后台手动重扫复用。

import { writeAuditLog } from "./audit";
import {
  amountToUnits,
  DEFAULT_PAYMENT_GRACE_MINUTES,
  DEFAULT_PAYMENT_EXPIRY_MINUTES,
  fetchTronUsdtTransfers,
  normalizeTronAddress,
  transactionIsInPaymentWindow,
} from "./usdt-trc20";
import { completePendingWalletLedger } from "./wallet";
import type { OrderRow, PaymentNetworkRow, WalletLedgerRow } from "./types";

function estimatedConfirmations(blockTimestamp: number): number {
  if (!Number.isFinite(blockTimestamp) || blockTimestamp <= 0) return 0;
  return Math.max(0, Math.floor((Date.now() - blockTimestamp) / 3000));
}

function sqlDate(value: number): string {
  return new Date(value).toISOString();
}

function parseD1Utc(value: string) {
  return new Date(value.includes("T") ? value : `${value.replace(" ", "T")}Z`).getTime();
}

export interface ScanResult {
  checked: number;
  matched: number;
  exceptions: number;
  matchedOrderIds: string[];
  matchedWalletLedgerIds?: string[];
  scannedTransfers?: number;
  requiredConfirmations?: number;
  provider: string;
  error?: string;
}

/** 扫描固定收款地址的链上转账，匹配待支付订单并落库。返回扫描汇总。 */
export async function scanTronPayments(
  db: D1Database,
  request: Request,
  env: CloudflareEnv,
  actor: { actorId: string; role: string }
): Promise<ScanResult> {
  const network = await db
    .prepare("SELECT * FROM payment_networks WHERE code = 'TRON' AND is_enabled = 1 LIMIT 1")
    .first<PaymentNetworkRow>();
  if (!network) {
    return { checked: 0, matched: 0, exceptions: 0, matchedOrderIds: [], matchedWalletLedgerIds: [], provider: "trongrid", error: "TRON payment network is not configured" };
  }

  const scanWindowStartedAt = new Date(Date.now() - DEFAULT_PAYMENT_GRACE_MINUTES * 60 * 1000).toISOString();
  const { results } = await db
    .prepare(
      `SELECT * FROM orders
       WHERE status IN ('pending_payment', 'payment_confirming')
         AND payment_network = 'TRON'
         AND expires_at > ?
       ORDER BY created_at ASC
       LIMIT 50`
    )
    .bind(scanWindowStartedAt)
    .all<OrderRow>();
  const activeLedgers = await db
    .prepare(
      `SELECT *
       FROM wallet_ledgers
       WHERE type = 'recharge'
         AND status = 'pending'
         AND method = 'usdt_trc20'
         AND datetime(created_at, '+${DEFAULT_PAYMENT_EXPIRY_MINUTES} minutes') > datetime('now')
       ORDER BY created_at ASC
       LIMIT 50`
    )
    .all<WalletLedgerRow>();

  let matched = 0;
  const matchedOrderIds: string[] = [];
  const matchedWalletLedgerIds: string[] = [];
  let exceptions = 0;

  if (!results.length && !activeLedgers.results.length) {
    return { checked: 0, matched, exceptions, matchedOrderIds, matchedWalletLedgerIds, provider: "trongrid" };
  }

  const createdTimes = [
    ...results.map((order) => new Date(order.created_at).getTime()),
    ...activeLedgers.results.map((ledger) => parseD1Utc(ledger.created_at)),
  ];
  const minCreatedAt = Math.min(...createdTimes);
  const tronEnv = env as CloudflareEnv & { TRON_GRID_API_KEY?: string; Trongrid?: string };
  const tronGridApiKey = tronEnv.TRON_GRID_API_KEY || tronEnv.Trongrid || "";
  let transfers: Awaited<ReturnType<typeof fetchTronUsdtTransfers>>;
  try {
    transfers = await fetchTronUsdtTransfers({
      address: network.address,
      apiKey: tronGridApiKey,
      minTimestamp: Number.isFinite(minCreatedAt) ? minCreatedAt : Date.now() - 30 * 60 * 1000,
      limit: 200,
    });
  } catch (error) {
    await writeAuditLog(db, request, { actorId: actor.actorId, role: "system" }, "payment.listener.trongrid_failed", "payment_transactions", "trongrid", {
      provider: "trongrid",
      error: error instanceof Error ? error.message : "unknown error",
    });
    return {
      checked: results.length,
      matched,
      exceptions: results.length,
      matchedOrderIds,
      matchedWalletLedgerIds,
      provider: "trongrid",
      error: error instanceof Error ? error.message : "TronGrid request failed",
    };
  }

  const usedTxRows = await db
    .prepare("SELECT tx_hash FROM orders WHERE tx_hash IS NOT NULL UNION SELECT tx_hash FROM payment_transactions WHERE match_status IN ('matched','manual_confirm')")
    .all<{ tx_hash: string }>();
  const usedTxHashes = new Set(usedTxRows.results.map((row) => row.tx_hash).filter(Boolean));
  const requiredConfirmations = Math.max(1, Number(network.confirmations || 3));

  for (const transfer of transfers) {
    const confirmations = estimatedConfirmations(transfer.blockTimestamp);
    const amountUnits = amountToUnits(transfer.amount);
    const isReusable = !usedTxHashes.has(transfer.txHash);
    const confirmed = confirmations >= requiredConfirmations;
    const toAddressMatches = normalizeTronAddress(transfer.toAddress) === normalizeTronAddress(network.address);
    if (!toAddressMatches) continue;

    const exactOrderCandidates = results.filter((order) =>
      amountToUnits(order.amount_usdt) === amountUnits &&
      transactionIsInPaymentWindow(order, transfer.blockTimestamp) &&
      normalizeTronAddress(order.payment_address) === normalizeTronAddress(network.address)
    );
    const exactLedgerCandidates = activeLedgers.results.filter((ledger) => {
      const createdAt = parseD1Utc(ledger.created_at);
      const expiresAt = createdAt + DEFAULT_PAYMENT_EXPIRY_MINUTES * 60 * 1000;
      return (
        amountToUnits(ledger.amount_usdt) === amountUnits &&
        transfer.blockTimestamp >= createdAt &&
        transfer.blockTimestamp <= expiresAt
      );
    });
    const exactCandidateCount = exactOrderCandidates.length + exactLedgerCandidates.length;

    let matchStatus = "unmatched";
    let exceptionType: string | null = null;
    let note = "未匹配到有效订单或充值单";
    let matchedOrder: OrderRow | null = null;
    let matchedLedger: WalletLedgerRow | null = null;

    if (!isReusable) {
      matchStatus = "duplicate";
      exceptionType = "duplicate_tx";
      note = "交易 Hash 已被使用";
    } else if (!confirmed) {
      matchStatus = "confirming";
      exceptionType = "confirming";
      note = `等待 ${requiredConfirmations} 次确认`;
    } else if (exactCandidateCount === 1) {
      matchStatus = "matched";
      note = "精确金额自动匹配";
      matchedOrder = exactOrderCandidates[0] ?? null;
      matchedLedger = matchedOrder ? null : exactLedgerCandidates[0];
    } else if (exactCandidateCount > 1) {
      matchStatus = "exception";
      exceptionType = "amount_collision";
      note = "同一精确金额命中多个订单或充值单，需要人工核验";
    } else {
      const windowCandidates = results.filter((order) =>
        transactionIsInPaymentWindow(order, transfer.blockTimestamp) &&
        normalizeTronAddress(order.payment_address) === normalizeTronAddress(network.address)
      );
      const lowerOrder = windowCandidates
        .filter((order) => amountToUnits(order.amount_usdt) < amountUnits)
        .sort((a, b) => amountToUnits(b.amount_usdt) - amountToUnits(a.amount_usdt))[0];
      const higherOrder = windowCandidates
        .filter((order) => amountToUnits(order.amount_usdt) > amountUnits)
        .sort((a, b) => amountToUnits(a.amount_usdt) - amountToUnits(b.amount_usdt))[0];
      matchStatus = "exception";
      if (lowerOrder) {
        exceptionType = "overpaid";
        note = `多付，可能订单 ${lowerOrder.order_no}`;
      } else if (higherOrder) {
        exceptionType = "underpaid";
        note = `少付，可能订单 ${higherOrder.order_no}`;
      } else {
        exceptionType = "unmatched";
      }
    }

    await db
      .prepare(
        `INSERT INTO payment_transactions (
           id, tx_hash, network, token, from_address, to_address, amount, confirmations,
           matched_order_id, matched_order_no, match_status, exception_type, detected_at, confirmed_at, note, created_at, updated_at
         ) VALUES (?, ?, 'TRON', 'USDT', ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), ?, ?, datetime('now'), datetime('now'))
         ON CONFLICT(tx_hash) DO UPDATE SET
           confirmations = excluded.confirmations,
           matched_order_id = COALESCE(payment_transactions.matched_order_id, excluded.matched_order_id),
           matched_order_no = COALESCE(payment_transactions.matched_order_no, excluded.matched_order_no),
           match_status = excluded.match_status,
           exception_type = excluded.exception_type,
           confirmed_at = COALESCE(payment_transactions.confirmed_at, excluded.confirmed_at),
           note = excluded.note,
           updated_at = datetime('now')`
      )
      .bind(
        crypto.randomUUID(),
        transfer.txHash,
        transfer.fromAddress,
        transfer.toAddress,
        transfer.amount,
        Math.min(confirmations, requiredConfirmations),
        matchedOrder?.id ?? null,
        matchedOrder?.order_no ?? (matchedLedger ? `CZ${matchedLedger.id.slice(0, 8).toUpperCase()}` : null),
        matchStatus,
        exceptionType,
        matchStatus === "matched" ? sqlDate(transfer.blockTimestamp) : null,
        note
      )
      .run();

    if ((!matchedOrder && !matchedLedger) || matchStatus !== "matched") {
      if (matchStatus === "exception") exceptions += 1;
      continue;
    }

    matched += 1;
    usedTxHashes.add(transfer.txHash);
    if (matchedOrder) {
      matchedOrderIds.push(matchedOrder.id);
      await db
        .prepare(
          "UPDATE orders SET status = 'paid', payment_status = 'paid', tx_hash = ?, paid_at = COALESCE(paid_at, datetime('now')), updated_at = datetime('now') WHERE id = ? AND status IN ('pending_payment','payment_confirming')"
        )
        .bind(transfer.txHash, matchedOrder.id)
        .run();
      await writeAuditLog(db, request, { actorId: actor.actorId, role: actor.role }, "payment_listener.match", "order", matchedOrder.id, {
        txHash: transfer.txHash,
        network: matchedOrder.payment_network,
        amount: transfer.amount,
        confirmations,
      });
    } else if (matchedLedger) {
      matchedWalletLedgerIds.push(matchedLedger.id);
      await completePendingWalletLedger(db, matchedLedger.id, actor.actorId);
      await db
        .prepare("UPDATE wallet_ledgers SET note = ?, updated_at = datetime('now') WHERE id = ?")
        .bind(`USDT-TRC20 自动入账：${transfer.txHash}`, matchedLedger.id)
        .run();
      await writeAuditLog(db, request, { actorId: actor.actorId, role: actor.role }, "payment_listener.wallet_match", "wallet_ledger", matchedLedger.id, {
        txHash: transfer.txHash,
        network: "TRON",
        amount: transfer.amount,
        confirmations,
      });
    }
  }

  return {
    checked: results.length + activeLedgers.results.length,
    matched,
    exceptions,
    matchedOrderIds,
    matchedWalletLedgerIds,
    scannedTransfers: transfers.length,
    requiredConfirmations,
    provider: "trongrid",
  };
}
