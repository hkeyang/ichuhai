/**
 * @deprecated Phase 2 参考实现。
 * 链上支付监听（Cron Trigger → TronGrid/Alchemy）将在 Phase 2 通过独立 Cloudflare Worker 实现。
 * Phase 1 使用管理员手动标记已付（/api/internal/orders/:id/mark-paid）。
 * 参见：.kiro/specs/cloudflare-backend-migration/design.md — "Phase 2 延迟项"章节
 */
import { scanUsdtPayments } from '../src/integrations/usdt-listener.mjs';
import { readFile, writeFile } from 'node:fs/promises';

const dbPath = new URL('../data/db.json', import.meta.url);
const data = JSON.parse(await readFile(dbPath, 'utf8'));
const result = await scanUsdtPayments({
  orders: data.orders || [],
  networks: data.paymentNetworks || [],
  usedTxHashes: (data.orders || []).map((order) => order.txHash)
});

for (const match of result.matched || []) {
  const order = data.orders.find((item) => item.id === match.orderId);
  if (!order) continue;
  order.status = 'paid';
  order.txHash = match.txHash;
  order.paidAt = new Date().toISOString();
  order.updatedAt = new Date().toISOString();
}

await writeFile(dbPath, JSON.stringify(data, null, 2));
console.log(JSON.stringify(result, null, 2));
