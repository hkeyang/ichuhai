/**
 * @deprecated Phase 2 参考实现。
 * 此文件为链上 USDT 监听集成的参考实现，将在 Phase 2 通过 Cloudflare Cron Trigger 替代。
 * Phase 1 使用管理员手动标记已付（/api/internal/orders/:id/mark-paid）。
 * 参见：.kiro/specs/cloudflare-backend-migration/design.md — "Phase 2 延迟项"章节
 */
const TRON_USDT_CONTRACT = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';
const EVM_USDT_CONTRACTS = {
  ETH: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  BSC: '0x55d398326f99059fF775485246999027B3197955',
  BASE: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2'
};

function env(name) {
  return process.env[name] || '';
}

function amountMatches(order, rawAmount, decimals = 6) {
  const received = Number(rawAmount) / 10 ** decimals;
  return received >= Number(order.amountUsdt);
}

function normalizeTxHash(value) {
  return String(value || '').trim();
}

async function fetchTronTransfers(address) {
  const url = new URL(`https://api.trongrid.io/v1/accounts/${address}/transactions/trc20`);
  url.searchParams.set('limit', '50');
  url.searchParams.set('contract_address', TRON_USDT_CONTRACT);
  url.searchParams.set('only_confirmed', 'true');
  const headers = env('TRON_GRID_API_KEY') ? { 'TRON-PRO-API-KEY': env('TRON_GRID_API_KEY') } : {};
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`TronGrid failed: ${response.status}`);
  const payload = await response.json();
  return (payload.data || []).map((tx) => ({
    txHash: normalizeTxHash(tx.transaction_id),
    to: tx.to,
    rawAmount: tx.value,
    decimals: Number(tx.token_info?.decimals || 6),
    confirmed: true,
    network: 'TRON'
  }));
}

async function fetchMoralisTransfers(networkCode, address) {
  if (!env('MORALIS_API_KEY')) return [];
  const chain = { ETH: 'eth', BSC: 'bsc', BASE: 'base' }[networkCode];
  if (!chain) return [];
  const url = new URL(`https://deep-index.moralis.io/api/v2.2/${address}/erc20/transfers`);
  url.searchParams.set('chain', chain);
  url.searchParams.set('limit', '50');
  const response = await fetch(url, { headers: { 'X-API-Key': env('MORALIS_API_KEY') } });
  if (!response.ok) throw new Error(`Moralis failed: ${response.status}`);
  const payload = await response.json();
  const contract = EVM_USDT_CONTRACTS[networkCode]?.toLowerCase();
  return (payload.result || [])
    .filter((tx) => String(tx.address || '').toLowerCase() === contract)
    .map((tx) => ({
      txHash: normalizeTxHash(tx.transaction_hash),
      to: tx.to_address,
      rawAmount: tx.value,
      decimals: Number(tx.token_decimals || 6),
      confirmed: true,
      network: networkCode
    }));
}

export async function scanUsdtPayments({ orders, networks, usedTxHashes = [] }) {
  const payable = orders.filter((order) => order.status === 'pending_payment' && new Date(order.expiresAt).getTime() > Date.now());
  const providerEnabled = Boolean(env('TRON_GRID_API_KEY') || env('MORALIS_API_KEY'));
  if (!providerEnabled) {
    return {
      checked: payable.length,
      matched: [],
      provider: 'mock-listener',
      note: '未配置 TRON_GRID_API_KEY 或 MORALIS_API_KEY，当前仅返回待扫描订单数量。'
    };
  }

  const used = new Set(usedTxHashes.filter(Boolean));
  const matched = [];
  for (const order of payable) {
    const network = networks.find((item) => item.code === order.paymentNetwork);
    if (!network) continue;
    const transfers = order.paymentNetwork === 'TRON'
      ? await fetchTronTransfers(order.paymentAddress)
      : await fetchMoralisTransfers(order.paymentNetwork, order.paymentAddress);
    const tx = transfers.find((item) =>
      !used.has(item.txHash) &&
      item.confirmed &&
      String(item.to || '').toLowerCase() === String(order.paymentAddress).toLowerCase() &&
      amountMatches(order, item.rawAmount, item.decimals)
    );
    if (tx) {
      used.add(tx.txHash);
      matched.push({ orderId: order.id, orderNo: order.orderNo, txHash: tx.txHash, network: tx.network });
    }
  }

  return {
    checked: payable.length,
    matched,
    provider: env('TRON_GRID_API_KEY') ? 'trongrid+moralis' : 'moralis',
    note: matched.length ? '已匹配链上付款。' : '已扫描链上交易，暂无匹配付款。'
  };
}
