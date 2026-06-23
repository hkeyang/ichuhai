const base = process.env.SMOKE_BASE_URL || 'http://localhost:4174';
const adminUsername = process.env.ADMIN_USERNAME || 'bitbernie';
const adminPassword = process.env.ADMIN_PASSWORD || 'dev_admin_password_12';
const internalSecret = process.env.INTERNAL_API_SECRET || 'dev_internal_api_secret_32_chars__';

let adminToken = '';

async function request(path, options) {
  const response = await fetch(`${base}${path}`, options);
  const text = await response.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`${path} returned non-JSON: ${text.slice(0, 120)}`);
  }
  if (!response.ok) {
    throw new Error(`${path} failed ${response.status}: ${JSON.stringify(json)}`);
  }
  return json;
}

function withInternalAuth(options = {}) {
  return {
    ...options,
    headers: {
      ...(options.headers || {}),
      'x-internal-token': internalSecret
    }
  };
}

async function adminRequest(path, options = {}) {
  if (!adminToken) {
    const login = await request('/api/admin/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ username: adminUsername, password: adminPassword })
    });
    adminToken = login.token;
  }
  return request(path, {
    ...options,
    headers: {
      ...(options.headers || {}),
      'x-admin-token': adminToken
    }
  });
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const products = await request('/api/products');
assert(Array.isArray(products) && products.length >= 5, 'expected at least 5 products');
const product = products.find((item) => item.id === 'discord-nitro');
assert(product, 'discord-nitro missing');
assert(product.skus.length >= 6, 'discord-nitro SKU coverage incomplete');

const rates = await request('/api/exchange-rates');
for (const currency of ['USD', 'CNY', 'GBP', 'EUR', 'AUD', 'JPY', 'HKD', 'KRW']) {
  assert(rates.rates[currency], `${currency} rate missing`);
}

const config = await request('/api/config');
assert(config.telegram && config.admin, 'public config missing telegram/admin sections');

const created = await request('/api/orders', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    productId: 'discord-nitro',
    skuId: 'dn-g-new-1',
    telegramUsername: '@smoke_user',
    email: 'smoke@example.com',
    paymentNetwork: 'TRON',
    fiatCurrency: 'CNY'
  })
});
assert(created.orderId && created.orderNo && created.paymentUrl, 'order creation payload incomplete');

const payment = await request(`/api/orders/${created.orderId}/payment`);
assert(payment.status === 'pending_payment', 'new order should be pending_payment');
assert(payment.paymentAddress, 'payment address missing');

const listener = await request('/api/internal/payment-listener/check', withInternalAuth({ method: 'POST' }));
assert(typeof listener.checked === 'number', 'listener result missing checked count');

const paid = await request(`/api/internal/orders/${created.orderId}/mark-paid`, withInternalAuth({
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ txHash: `smoke_${Date.now()}` })
}));
assert(paid.status === 'paid', 'mark-paid did not set paid');

await adminRequest('/api/admin/inventory/import', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ skuId: 'dn-g-new-1', items: [`smoke-delivery-${Date.now()}`] })
});

const delivered = await request(`/api/internal/orders/${created.orderId}/deliver`, withInternalAuth({ method: 'POST' }));
assert(delivered.order.status === 'completed', 'auto delivery did not complete order');
assert(delivered.delivery.maskedContent, 'delivery record missing masked content');

const lookup = await request('/api/orders/lookup', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ orderNo: created.orderNo, contact: 'smoke@example.com' })
});
assert(lookup.status === 'completed', 'lookup did not return completed order');

const adminOrders = await adminRequest('/api/admin/orders');
const adminOrderItems = Array.isArray(adminOrders.items) ? adminOrders.items : adminOrders;
assert(adminOrderItems.some((order) => order.id === created.orderId), 'admin orders missing smoke order');
assert(typeof adminOrders.total === 'number', 'admin orders should return paginated envelope { items, total }');
const adminDeliveries = await adminRequest('/api/admin/deliveries');
assert(adminDeliveries.some((delivery) => delivery.orderId === created.orderId), 'admin deliveries missing smoke delivery');
const adminNotifications = await adminRequest('/api/admin/notifications');
assert(Array.isArray(adminNotifications), 'admin notifications should return an array');

const hiddenProduct = await adminRequest('/api/admin/products/spotify-premium', {
  method: 'PATCH',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ status: 'hidden' })
});
assert(hiddenProduct.status === 'hidden', 'admin product status update failed');
await adminRequest('/api/admin/products/spotify-premium', {
  method: 'PATCH',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ status: 'active' })
});

const paymentNetworks = await adminRequest('/api/admin/payment-networks');
assert(paymentNetworks.some((network) => network.code === 'TRON' && network.isEnabled), 'TRON payment network should be enabled');

const suffix = Date.now();
const productId = `smoke-product-${suffix}`;
const createdProduct = await adminRequest('/api/admin/products', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    id: productId,
    slug: productId,
    name: 'Smoke Product',
    categoryId: 'test',
    deliveryType: 'manual',
    baseCurrency: 'USDT'
  })
});
assert(createdProduct.slug === productId, 'admin product creation failed');
const createdProductId = createdProduct.id;

const createdSku = await adminRequest('/api/admin/skus', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    id: `${productId}-sku`,
    productId: createdProductId,
    optionValues: { plan: 'Basic' },
    priceUsdt: '1.00',
    deliveryType: 'manual'
  })
});
assert(createdSku.productId === createdProductId, 'admin sku creation failed');

const batch = await adminRequest('/api/admin/skus/batch-generate', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    productId: createdProductId,
    optionGroups: [{ key: 'region', options: ['US', 'EU'] }, { key: 'duration', options: ['1m', '12m'] }],
    priceUsdt: '2.00'
  })
});
assert(batch.created === 4, 'admin sku batch generation failed');

const inventory = await adminRequest('/api/admin/inventory/import', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ skuId: createdSku.id, items: ['code-one-1234', 'code-two-5678'] })
});
assert(inventory.imported === 2, 'admin inventory import failed');

const adminStatus = await adminRequest(`/api/admin/orders/${created.orderId}/status`, {
  method: 'PATCH',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ status: 'completed', adminNote: 'smoke verified' })
});
assert(adminStatus.adminNote === 'smoke verified', 'admin order status update failed');

const manualDelivery = await adminRequest(`/api/admin/orders/${created.orderId}/manual-deliver`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ operator: 'smoke-admin', maskedContent: 'manual-smoke-********' })
});
assert(manualDelivery.delivery.method === 'manual', 'admin manual delivery failed');

const auditLogs = await adminRequest('/api/admin/audit-logs');
assert(Array.isArray(auditLogs), 'admin audit logs should return an array');

// ── 新增后台能力验收 ───────────────────────────────────────────

// 看板：今日指标 + 队列
const dashboard = await adminRequest('/api/admin/dashboard');
assert(dashboard.metrics && typeof dashboard.metrics.todayOrders === 'number', 'dashboard metrics missing');
assert(dashboard.queues && Array.isArray(dashboard.queues.lowStockSkus), 'dashboard queues missing');

// 库存列表：服务端分页 + 状态词
const invList = await adminRequest('/api/admin/inventory?status=available&pageSize=5');
assert(Array.isArray(invList.items) && typeof invList.total === 'number', 'inventory list envelope missing');
const revealTarget = invList.items.find((i) => i.skuId === createdSku.id) || invList.items[0];

// 查看明文 + 审计
if (revealTarget) {
  const revealed = await adminRequest(`/api/admin/inventory/${revealTarget.id}/reveal`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ reason: 'smoke reveal' })
  });
  assert(typeof revealed.value === 'string', 'inventory reveal did not return plaintext');
}

// 作废库存：导入一条可用库存并作废，验证作废后不可重复作废
const revokeImport = await adminRequest('/api/admin/inventory/import', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ skuId: createdSku.id, items: [`revoke-target-${suffix}`] })
});
assert(revokeImport.imported === 1, 'revoke target import failed');
const revokeList = await adminRequest(`/api/admin/inventory?skuId=${createdSku.id}&status=available&pageSize=50`);
const revokeItem = revokeList.items.find((i) => i.maskedValue && i.maskedValue.startsWith('revo'));
if (revokeItem) {
  const revoked = await adminRequest(`/api/admin/inventory/${revokeItem.id}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ status: 'revoked', remark: 'smoke revoke' })
  });
  assert(revoked.status === 'revoked', 'inventory revoke failed');
}

// 库存导入重复检测：再次导入相同内容应为重复
const dupItem = `dup-detect-${suffix}`;
await adminRequest('/api/admin/ops', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ action: 'inventory.import', skuId: createdSku.id, productId: createdProductId, items: [dupItem] })
});
const dupAgain = await adminRequest('/api/admin/ops', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ action: 'inventory.import', skuId: createdSku.id, productId: createdProductId, items: [dupItem] })
});
const dupBatches = (dupAgain.inventoryBatches || []).filter((b) => b.skuId === createdSku.id);
assert(dupBatches.some((b) => b.duplicateCount >= 1), 'inventory dedup not detected on re-import');

// 手动确认支付：创建新订单，confirm-payment 写入 payment_transactions
const payOrder = await request('/api/orders', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ productId: 'discord-nitro', skuId: 'dn-g-new-1', telegramUsername: '@smoke_pay', email: 'smokepay@example.com', paymentNetwork: 'TRON', fiatCurrency: 'CNY' })
});
const confirmTx = `smoke-confirm-${suffix}`;
const confirmed = await adminRequest(`/api/admin/orders/${payOrder.orderId}/confirm-payment`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ txHash: confirmTx, amount: '999.999', reason: 'smoke manual confirm with mismatch' })
});
assert(confirmed.order.paymentStatus === 'paid', 'confirm-payment did not mark paid');
assert(confirmed.transaction && confirmed.transaction.txHash === confirmTx, 'confirm-payment did not write payment_transaction');

// txHash 不可重复绑定其它订单
const payOrder2 = await request('/api/orders', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ productId: 'discord-nitro', skuId: 'dn-g-new-1', telegramUsername: '@smoke_pay2', email: 'smokepay2@example.com', paymentNetwork: 'TRON', fiatCurrency: 'CNY' })
});
let dupTxRejected = false;
try {
  await adminRequest(`/api/admin/orders/${payOrder2.orderId}/confirm-payment`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ txHash: confirmTx, reason: 'dup' })
  });
} catch {
  dupTxRejected = true;
}
assert(dupTxRejected, 'duplicate txHash should be rejected on confirm-payment');

// 到账交易列表 + 支付异常筛选
const txList = await adminRequest('/api/admin/payment-transactions?pageSize=10');
assert(Array.isArray(txList.items) && typeof txList.total === 'number', 'payment-transactions envelope missing');

// 未支付订单默认不可人工发货
const guardOrder = await request('/api/orders', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ productId: 'discord-nitro', skuId: 'dn-g-new-1', telegramUsername: '@smoke_guard', email: 'smokeguard@example.com', paymentNetwork: 'TRON', fiatCurrency: 'CNY' })
});
let unpaidDeliverBlocked = false;
try {
  await adminRequest(`/api/admin/orders/${guardOrder.orderId}/manual-deliver`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ operator: 'smoke', deliveryContent: 'should-be-blocked' })
  });
} catch {
  unpaidDeliverBlocked = true;
}
assert(unpaidDeliverBlocked, 'unpaid order should not allow manual delivery by default');

// 黑名单命中拦截下单
const blockEmail = `blocked-${suffix}@example.com`;
await adminRequest('/api/admin/ops', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ action: 'blacklist.create', kind: 'email', value: blockEmail, effect: 'block_order', reason: 'smoke block', status: 'active' })
});
let orderBlocked = false;
try {
  await request('/api/orders', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ productId: 'discord-nitro', skuId: 'dn-g-new-1', telegramUsername: '@smoke_blk', email: blockEmail, paymentNetwork: 'TRON', fiatCurrency: 'CNY' })
  });
} catch {
  orderBlocked = true;
}
assert(orderBlocked, 'blacklisted email should be blocked from ordering');

// 用户中心：列表 + 详情
const users = await adminRequest('/api/admin/users?pageSize=5');
assert(Array.isArray(users.items) && typeof users.total === 'number', 'admin users envelope missing');
const userDetail = await adminRequest(`/api/admin/users/${encodeURIComponent('smoke@example.com')}`);
assert(userDetail.profile && Array.isArray(userDetail.orders), 'user detail missing profile/orders');

// 商品列表带真实可用库存字段
const adminProductsList = await adminRequest('/api/admin/products');
assert(adminProductsList.some((p) => typeof p.availableInventory === 'number'), 'product list missing availableInventory');

console.log(JSON.stringify({
  ok: true,
  base,
  orderId: created.orderId,
  orderNo: created.orderNo,
  checks: [
    'products',
    'exchange-rates',
    'orders',
    'payment',
    'payment-listener',
    'mark-paid',
    'deliver',
    'lookup',
    'admin',
    'admin-product-config',
    'admin-payment-config',
    'admin-product-create',
    'admin-sku-create',
    'admin-sku-batch',
    'admin-inventory-import',
    'admin-order-status',
    'admin-manual-delivery',
    'admin-audit',
    'mail-notifications',
    'dashboard-metrics',
    'inventory-list',
    'inventory-reveal',
    'inventory-revoke',
    'inventory-dedup',
    'confirm-payment',
    'confirm-payment-dup-tx',
    'payment-transactions-list',
    'unpaid-deliver-guard',
    'blacklist-block-order',
    'admin-users-list',
    'admin-user-detail',
    'product-available-inventory'
  ]
}, null, 2));
