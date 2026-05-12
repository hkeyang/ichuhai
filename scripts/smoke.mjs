const base = process.env.SMOKE_BASE_URL || 'http://localhost:4174';

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

const listener = await request('/api/internal/payment-listener/check', { method: 'POST' });
assert(typeof listener.checked === 'number', 'listener result missing checked count');

const paid = await request(`/api/internal/orders/${created.orderId}/mark-paid`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ txHash: `smoke_${Date.now()}` })
});
assert(paid.status === 'paid', 'mark-paid did not set paid');

const delivered = await request(`/api/internal/orders/${created.orderId}/deliver`, { method: 'POST' });
assert(delivered.order.status === 'completed', 'auto delivery did not complete order');
assert(delivered.delivery.maskedContent, 'delivery record missing masked content');

const lookup = await request('/api/orders/lookup', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ orderNo: created.orderNo, contact: 'smoke@example.com' })
});
assert(lookup.status === 'completed', 'lookup did not return completed order');

const adminOrders = await request('/api/admin/orders');
assert(adminOrders.some((order) => order.id === created.orderId), 'admin orders missing smoke order');
const adminDeliveries = await request('/api/admin/deliveries');
assert(adminDeliveries.some((delivery) => delivery.orderId === created.orderId), 'admin deliveries missing smoke delivery');
const adminNotifications = await request('/api/admin/notifications');
assert(adminNotifications.some((notification) => notification.orderId === created.orderId), 'admin notifications missing smoke notification');

const hiddenProduct = await request('/api/admin/products/spotify-premium', {
  method: 'PATCH',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ status: 'hidden' })
});
assert(hiddenProduct.status === 'hidden', 'admin product status update failed');
await request('/api/admin/products/spotify-premium', {
  method: 'PATCH',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ status: 'active' })
});

const disabledNetwork = await request('/api/admin/payment-networks/BASE', {
  method: 'PATCH',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ isEnabled: false })
});
assert(disabledNetwork.isEnabled === false, 'admin payment network toggle failed');
await request('/api/admin/payment-networks/BASE', {
  method: 'PATCH',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ isEnabled: true })
});

const suffix = Date.now();
const productId = `smoke-product-${suffix}`;
const createdProduct = await request('/api/admin/products', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    id: productId,
    slug: productId,
    name: 'Smoke Product',
    categoryId: 'test',
    deliveryType: 'manual'
  })
});
assert(createdProduct.id === productId, 'admin product creation failed');

const createdSku = await request('/api/admin/skus', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    id: `${productId}-sku`,
    productId,
    optionValues: { plan: 'Basic' },
    priceUsdt: '1.00',
    deliveryType: 'manual'
  })
});
assert(createdSku.productId === productId, 'admin sku creation failed');

const batch = await request('/api/admin/skus/batch-generate', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    productId,
    optionGroups: [{ key: 'region', options: ['US', 'EU'] }, { key: 'duration', options: ['1m', '12m'] }],
    priceUsdt: '2.00'
  })
});
assert(batch.created === 4, 'admin sku batch generation failed');

const inventory = await request('/api/admin/inventory/import', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ skuId: `${productId}-sku`, items: ['code-one-1234', 'code-two-5678'] })
});
assert(inventory.imported === 2, 'admin inventory import failed');

const adminStatus = await request(`/api/admin/orders/${created.orderId}/status`, {
  method: 'PATCH',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ status: 'completed', adminNote: 'smoke verified' })
});
assert(adminStatus.adminNote === 'smoke verified', 'admin order status update failed');

const manualDelivery = await request(`/api/admin/orders/${created.orderId}/manual-deliver`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ operator: 'smoke-admin', maskedContent: 'manual-smoke-********' })
});
assert(manualDelivery.delivery.method === 'manual', 'admin manual delivery failed');

const auditLogs = await request('/api/admin/audit-logs');
assert(auditLogs.some((entry) => entry.action === 'inventory.import'), 'admin audit log missing inventory import');

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
    'mail-notifications'
  ]
}, null, 2));
