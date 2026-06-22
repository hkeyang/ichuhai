import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ensureDatabaseReady } from "@/lib/api/bootstrap";
import { jsonResponse, optionsResponse } from "@/lib/api/cors";
import { HttpError } from "@/lib/api/errors";
import { timingSafeEqual } from "@/lib/api/admin-session";
import { writeAuditLog } from "@/lib/api/audit";
import {
  amountToUnits,
  DEFAULT_PAYMENT_GRACE_MINUTES,
  fetchTronUsdtTransfers,
  normalizeTronAddress,
  transactionIsInPaymentWindow,
} from "@/lib/api/usdt-trc20";
import type { OrderRow, PaymentNetworkRow } from "@/lib/api/types";

function estimatedConfirmations(blockTimestamp: number): number {
  if (!Number.isFinite(blockTimestamp) || blockTimestamp <= 0) return 0;
  return Math.max(0, Math.floor((Date.now() - blockTimestamp) / 3000));
}

function sqlDate(value: number): string {
  return new Date(value).toISOString();
}

export async function OPTIONS(request: Request) {
  const { env } = await getCloudflareContext();
  return optionsResponse(request, env as CloudflareEnv);
}

export async function POST(request: Request) {
  const { env } = await getCloudflareContext();
  const cloudflareEnv = env as CloudflareEnv;

  try {
    const internalToken = request.headers.get("x-internal-token") || "";
    if (cloudflareEnv.NODE_ENV === "production") {
      if (!cloudflareEnv.INTERNAL_API_SECRET || !timingSafeEqual(internalToken, cloudflareEnv.INTERNAL_API_SECRET)) {
        return jsonResponse({ error: "internal auth required" }, 401, request, cloudflareEnv);
      }
    }

    const db = cloudflareEnv.DB;
    await ensureDatabaseReady(db);
    const network = await db
      .prepare("SELECT * FROM payment_networks WHERE code = 'TRON' AND is_enabled = 1 LIMIT 1")
      .first<PaymentNetworkRow>();
    if (!network) throw new HttpError(400, "TRON payment network is not configured");

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

    let matched = 0;
    const matchedOrderIds: string[] = [];
    let exceptions = 0;

    if (!results.length) {
      return jsonResponse({ checked: 0, matched, exceptions, matchedOrderIds, provider: "trongrid" }, 200, request, cloudflareEnv);
    }

    const minCreatedAt = Math.min(...results.map((order) => new Date(order.created_at).getTime()));
    const tronEnv = cloudflareEnv as CloudflareEnv & { TRON_GRID_API_KEY?: string; Trongrid?: string };
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
      await writeAuditLog(
        db,
        request,
        { actorId: "payment-listener", role: "system" },
        "payment.listener.trongrid_failed",
        "payment_transactions",
        "trongrid",
        {
          provider: "trongrid",
          error: error instanceof Error ? error.message : "unknown error",
        }
      );
      return jsonResponse(
        {
          checked: results.length,
          matched,
          exceptions: results.length,
          matchedOrderIds,
          provider: "trongrid",
          error: error instanceof Error ? error.message : "TronGrid request failed",
        },
        200,
        request,
        cloudflareEnv
      );
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

      const exactCandidates = results.filter((order) =>
        amountToUnits(order.amount_usdt) === amountUnits &&
        transactionIsInPaymentWindow(order, transfer.blockTimestamp) &&
        normalizeTronAddress(order.payment_address) === normalizeTronAddress(network.address)
      );

      let matchStatus = "unmatched";
      let exceptionType: string | null = null;
      let note = "未匹配到有效订单";
      let matchedOrder: OrderRow | null = null;

      if (!isReusable) {
        matchStatus = "duplicate";
        exceptionType = "duplicate_tx";
        note = "交易 Hash 已被使用";
      } else if (!confirmed) {
        matchStatus = "confirming";
        exceptionType = "confirming";
        note = `等待 ${requiredConfirmations} 次确认`;
      } else if (exactCandidates.length === 1) {
        matchStatus = "matched";
        note = "精确金额自动匹配";
        matchedOrder = exactCandidates[0];
      } else if (exactCandidates.length > 1) {
        matchStatus = "exception";
        exceptionType = "amount_collision";
        note = "同一精确金额命中多个订单，需要人工核验";
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
          matchedOrder?.order_no ?? null,
          matchStatus,
          exceptionType,
          matchStatus === "matched" ? sqlDate(transfer.blockTimestamp) : null,
          note
        )
        .run();

      if (!matchedOrder || matchStatus !== "matched") {
        if (matchStatus === "exception") exceptions += 1;
        continue;
      }

      matched += 1;
      matchedOrderIds.push(matchedOrder.id);
      usedTxHashes.add(transfer.txHash);
      await db
        .prepare(
          "UPDATE orders SET status = 'paid', payment_status = 'paid', tx_hash = ?, paid_at = COALESCE(paid_at, datetime('now')), updated_at = datetime('now') WHERE id = ? AND status IN ('pending_payment','payment_confirming')"
        )
        .bind(transfer.txHash, matchedOrder.id)
        .run();
      await writeAuditLog(
        db,
        request,
        { actorId: "payment-listener", role: "internal" },
        "payment_listener.match",
        "order",
        matchedOrder.id,
        { txHash: transfer.txHash, network: matchedOrder.payment_network, amount: transfer.amount, confirmations }
      );
    }

    return jsonResponse(
      {
        checked: results.length,
        matched,
        exceptions,
        matchedOrderIds,
        scannedTransfers: transfers.length,
        requiredConfirmations,
        provider: "trongrid",
      },
      200,
      request,
      cloudflareEnv
    );
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse({ error: error.message }, error.status, request, cloudflareEnv);
    }
    console.error("[POST /api/internal/payment-listener/check] unexpected error:", error);
    return jsonResponse({ error: "internal server error" }, 500, request, cloudflareEnv);
  }
}
