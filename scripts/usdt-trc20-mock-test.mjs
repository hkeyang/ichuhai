import assert from 'node:assert/strict';

const ADDRESS = 'TPPHD2bUCbRLEt7aBMRoWQbD3aY69NnEe6';
const SCALE = 1000;

function units(value) {
  return Math.round(Number(value) * SCALE);
}

function inWindow(order, timestamp) {
  const createdAt = new Date(order.createdAt).getTime();
  const expiresAt = new Date(order.expiresAt).getTime();
  const graceEnd = expiresAt + 5 * 60 * 1000;
  return timestamp >= createdAt && timestamp <= graceEnd;
}

function matchTransfers({ orders, transfers, usedHashes = new Set() }) {
  const rows = [];
  const paid = [];

  for (const tx of transfers) {
    const exact = orders.filter((order) =>
      order.status === 'pending_payment' &&
      order.paymentAddress === tx.toAddress &&
      units(order.amountUsdt) === units(tx.amount) &&
      inWindow(order, tx.blockTimestamp)
    );

    if (usedHashes.has(tx.txHash)) {
      rows.push({ txHash: tx.txHash, matchStatus: 'duplicate', exceptionType: 'duplicate_tx' });
      continue;
    }

    if (tx.confirmations < 3) {
      rows.push({ txHash: tx.txHash, matchStatus: 'confirming', exceptionType: 'confirming' });
      continue;
    }

    if (exact.length === 1) {
      rows.push({ txHash: tx.txHash, matchStatus: 'matched', matchedOrderNo: exact[0].orderNo });
      paid.push(exact[0].id);
      usedHashes.add(tx.txHash);
      continue;
    }

    const candidates = orders.filter((order) =>
      order.status === 'pending_payment' &&
      order.paymentAddress === tx.toAddress &&
      inWindow(order, tx.blockTimestamp)
    );
    const overpaid = candidates.filter((order) => units(order.amountUsdt) < units(tx.amount));
    const underpaid = candidates.filter((order) => units(order.amountUsdt) > units(tx.amount));
    rows.push({
      txHash: tx.txHash,
      matchStatus: 'exception',
      exceptionType: overpaid.length ? 'overpaid' : underpaid.length ? 'underpaid' : 'unmatched',
    });
  }

  return { rows, paid };
}

const now = Date.now();
const baseOrder = {
  id: 'order_1',
  orderNo: 'GFMOCK001',
  status: 'pending_payment',
  amountUsdt: '1.801',
  paymentAddress: ADDRESS,
  createdAt: new Date(now - 60_000).toISOString(),
  expiresAt: new Date(now + 14 * 60_000).toISOString(),
};

const expiredOrder = {
  ...baseOrder,
  id: 'order_2',
  orderNo: 'GFMOCK002',
  amountUsdt: '2.001',
  createdAt: new Date(now - 30 * 60_000).toISOString(),
  expiresAt: new Date(now - 10 * 60_000).toISOString(),
};

const matched = matchTransfers({
  orders: [baseOrder],
  transfers: [{ txHash: 'tx_exact', toAddress: ADDRESS, amount: '1.801', confirmations: 3, blockTimestamp: now }],
});
assert.deepEqual(matched.paid, ['order_1']);
assert.equal(matched.rows[0].matchStatus, 'matched');

const underpaid = matchTransfers({
  orders: [baseOrder],
  transfers: [{ txHash: 'tx_under', toAddress: ADDRESS, amount: '1.800', confirmations: 3, blockTimestamp: now }],
});
assert.equal(underpaid.rows[0].matchStatus, 'exception');
assert.equal(underpaid.rows[0].exceptionType, 'underpaid');

const overpaid = matchTransfers({
  orders: [baseOrder],
  transfers: [{ txHash: 'tx_over', toAddress: ADDRESS, amount: '1.900', confirmations: 3, blockTimestamp: now }],
});
assert.equal(overpaid.rows[0].matchStatus, 'exception');
assert.equal(overpaid.rows[0].exceptionType, 'overpaid');

const duplicate = matchTransfers({
  orders: [baseOrder],
  usedHashes: new Set(['tx_used']),
  transfers: [{ txHash: 'tx_used', toAddress: ADDRESS, amount: '1.801', confirmations: 3, blockTimestamp: now }],
});
assert.equal(duplicate.rows[0].matchStatus, 'duplicate');

const expired = matchTransfers({
  orders: [expiredOrder],
  transfers: [{ txHash: 'tx_late', toAddress: ADDRESS, amount: '2.001', confirmations: 3, blockTimestamp: now }],
});
assert.equal(expired.rows[0].exceptionType, 'unmatched');
assert.deepEqual(expired.paid, []);

console.log('USDT TRC20 mock payment matching passed');
