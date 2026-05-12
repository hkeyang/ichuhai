import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync, createReadStream } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { createHmac, createHash, randomUUID } from 'node:crypto';
import { scanUsdtPayments } from './src/integrations/usdt-listener.mjs';
import { sendDeliveryEmail, sendOrderCreatedEmail } from './src/integrations/mailer.mjs';

const PORT = Number(process.env.PORT || 4174);
const ROOT = process.cwd();
const DATA_DIR = join(ROOT, 'data');
const DB_FILE = join(DATA_DIR, 'db.json');
const TELEGRAM_BOT_USERNAME = process.env.TELEGRAM_BOT_USERNAME || '';
const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET || '';

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.json': 'application/json; charset=utf-8'
};

const seed = {
  products: [
    { id: 'discord-nitro', slug: 'discord-nitro', name: 'Discord Nitro', categoryId: 'social', status: 'active', deliveryType: 'auto', baseCurrency: 'USDT' },
    { id: 'spotify-premium', slug: 'spotify-premium', name: 'Spotify Premium', categoryId: 'music', status: 'active', deliveryType: 'auto', baseCurrency: 'USDT' },
    { id: 'youtube-premium', slug: 'youtube-premium', name: 'YouTube Premium', categoryId: 'video', status: 'active', deliveryType: 'mixed', baseCurrency: 'USDT' },
    { id: 'steam-wallet', slug: 'steam-wallet', name: 'Steam Wallet', categoryId: 'game', status: 'active', deliveryType: 'manual', baseCurrency: 'USDT' },
    { id: 'microsoft-365', slug: 'microsoft-365', name: 'Microsoft 365', categoryId: 'software', status: 'active', deliveryType: 'auto', baseCurrency: 'USDT' }
  ],
  skus: [
    { id: 'dn-g-new-1', productId: 'discord-nitro', optionValues: { region: 'Global', account_type: '新号', duration: '1个月' }, priceUsdt: '1.80', stockStatus: 'in_stock', deliveryType: 'auto', isDefault: true },
    { id: 'dn-g-new-3', productId: 'discord-nitro', optionValues: { region: 'Global', account_type: '新号', duration: '3个月' }, priceUsdt: '4.80', stockStatus: 'in_stock', deliveryType: 'auto' },
    { id: 'dn-g-new-12', productId: 'discord-nitro', optionValues: { region: 'Global', account_type: '新号', duration: '12个月' }, priceUsdt: '16.20', stockStatus: 'in_stock', deliveryType: 'auto' },
    { id: 'dn-us-old-1', productId: 'discord-nitro', optionValues: { region: 'US', account_type: '老号', duration: '1个月' }, priceUsdt: '2.10', stockStatus: 'low_stock', deliveryType: 'manual' },
    { id: 'dn-eu-share-3', productId: 'discord-nitro', optionValues: { region: 'EU', account_type: '共享', duration: '3个月' }, priceUsdt: '3.90', stockStatus: 'in_stock', deliveryType: 'auto' },
    { id: 'dn-jp-new-1', productId: 'discord-nitro', optionValues: { region: 'JP', account_type: '新号', duration: '1个月' }, priceUsdt: '2.30', stockStatus: 'sold_out', deliveryType: 'manual' },
    { id: 'sp-1', productId: 'spotify-premium', optionValues: { duration: '1个月' }, priceUsdt: '2.20', stockStatus: 'in_stock', deliveryType: 'auto', isDefault: true },
    { id: 'sp-3', productId: 'spotify-premium', optionValues: { duration: '3个月' }, priceUsdt: '6.10', stockStatus: 'in_stock', deliveryType: 'auto' },
    { id: 'sp-12', productId: 'spotify-premium', optionValues: { duration: '12个月' }, priceUsdt: '21.80', stockStatus: 'low_stock', deliveryType: 'auto' },
    { id: 'yt-g-1', productId: 'youtube-premium', optionValues: { region: 'Global', duration: '1个月' }, priceUsdt: '2.50', stockStatus: 'in_stock', deliveryType: 'auto', isDefault: true },
    { id: 'yt-us-12', productId: 'youtube-premium', optionValues: { region: 'US', duration: '12个月' }, priceUsdt: '24.00', stockStatus: 'in_stock', deliveryType: 'manual' },
    { id: 'sw-5', productId: 'steam-wallet', optionValues: { amount: '5 USD' }, priceUsdt: '5.00', stockStatus: 'in_stock', deliveryType: 'manual', isDefault: true },
    { id: 'sw-10', productId: 'steam-wallet', optionValues: { amount: '10 USD' }, priceUsdt: '10.00', stockStatus: 'in_stock', deliveryType: 'manual' },
    { id: 'sw-20', productId: 'steam-wallet', optionValues: { amount: '20 USD' }, priceUsdt: '20.00', stockStatus: 'low_stock', deliveryType: 'manual' },
    { id: 'ms-personal', productId: 'microsoft-365', optionValues: { plan: '个人版' }, priceUsdt: '3.50', stockStatus: 'in_stock', deliveryType: 'auto', isDefault: true },
    { id: 'ms-family', productId: 'microsoft-365', optionValues: { plan: '家庭版' }, priceUsdt: '8.80', stockStatus: 'in_stock', deliveryType: 'auto' }
  ],
  paymentNetworks: [
    { id: 'net_tron', code: 'TRON', displayName: 'TRON', tokenStandard: 'TRC20', isEnabled: true, isRecommended: true, address: 'TXL8d1e7hVKZy8vY8g9a6n3sJX4mP6u6wJ', confirmations: 1 },
    { id: 'net_eth', code: 'ETH', displayName: 'ETH', tokenStandard: 'ERC20', isEnabled: true, isRecommended: false, address: '0x7fE9A4b11cE5A9E2fA40eB3fA2465d9E4c07F001', confirmations: 12 },
    { id: 'net_bsc', code: 'BSC', displayName: 'BSC', tokenStandard: 'BEP20', isEnabled: true, isRecommended: false, address: '0xB35b2C2f9B5f3A7D61d5b3f82D82d9a89Ce7b002', confirmations: 15 },
    { id: 'net_base', code: 'BASE', displayName: 'BASE', tokenStandard: 'ERC20', isEnabled: true, isRecommended: false, address: '0xBA5E000000000000000000000000000000000001', confirmations: 12 }
  ],
  exchangeRates: { USD: '1', CNY: '7.22', GBP: '0.79', EUR: '0.93', AUD: '1.52', JPY: '155', HKD: '7.82', KRW: '1360' },
  users: [],
  orders: [],
  deliveries: [],
  notifications: [],
  auditLogs: [],
  inventoryItems: []
};

async function db() {
  await mkdir(DATA_DIR, { recursive: true });
  if (!existsSync(DB_FILE)) await writeFile(DB_FILE, JSON.stringify(seed, null, 2));
  const data = JSON.parse(await readFile(DB_FILE, 'utf8'));
  let changed = false;
  for (const key of ['users', 'orders', 'deliveries', 'notifications', 'auditLogs', 'inventoryItems']) {
    if (!Array.isArray(data[key])) {
      data[key] = [];
      changed = true;
    }
  }
  for (const key of ['products', 'skus', 'paymentNetworks']) {
    const existing = new Set((data[key] || []).map((item) => item.id));
    for (const item of seed[key]) {
      if (!existing.has(item.id)) {
        data[key].push(item);
        changed = true;
      }
    }
  }
  if (changed) await save(data);
  return data;
}

async function save(data) {
  await writeFile(DB_FILE, JSON.stringify(data, null, 2));
}

function json(res, status, value) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'access-control-allow-origin': '*' });
  res.end(JSON.stringify(value));
}

async function body(req) {
  let raw = '';
  for await (const chunk of req) raw += chunk;
  return raw ? JSON.parse(raw) : {};
}

function orderNo() {
  return `GF${new Date().toISOString().replace(/\D/g, '').slice(2, 14)}${Math.floor(Math.random() * 9000 + 1000)}`;
}

function verifyTelegramLogin(data, botToken = process.env.TELEGRAM_BOT_TOKEN || 'dev_bot_token') {
  if (!data.hash) return { ok: false, reason: 'missing hash' };
  const { hash, ...rest } = data;
  const dataCheckString = Object.keys(rest).sort().map((key) => `${key}=${rest[key]}`).join('\n');
  const secretKey = createHash('sha256').update(botToken).digest();
  const computedHash = createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
  const expired = data.auth_date && Date.now() / 1000 - Number(data.auth_date) > 86400;
  return { ok: computedHash === hash && !expired, reason: expired ? 'auth_date expired' : 'hash mismatch' };
}

function adminToken() {
  const secret = process.env.ADMIN_SESSION_SECRET || 'dev_admin_secret';
  const password = process.env.ADMIN_PASSWORD || 'admin';
  return createHmac('sha256', secret).update(password).digest('hex');
}

function adminActor(req) {
  if (process.env.NODE_ENV !== 'production') return { ok: true, actorId: 'dev-admin', role: 'admin' };
  const expected = adminToken();
  const provided = req.headers['x-admin-token'];
  if (provided && provided === expected) return { ok: true, actorId: 'admin', role: 'admin' };
  return { ok: false, reason: 'admin auth required' };
}

function internalActor(req) {
  if (process.env.NODE_ENV !== 'production') return { ok: true, actorId: 'dev-internal', role: 'internal' };
  if (!INTERNAL_API_SECRET) return { ok: false, reason: 'internal api secret not configured' };
  const provided = req.headers['x-internal-token'];
  if (provided && provided === INTERNAL_API_SECRET) return { ok: true, actorId: 'internal', role: 'internal' };
  return { ok: false, reason: 'internal auth required' };
}

function audit(data, req, actor, action, target, targetId, metadata = {}) {
  data.auditLogs.unshift({
    id: randomUUID(),
    actorId: actor.actorId,
    actorRole: actor.role,
    action,
    target,
    targetId,
    ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
    userAgent: req.headers['user-agent'],
    metadata,
    createdAt: new Date().toISOString()
  });
}

async function api(req, res, url) {
  const data = await db();
  const path = url.pathname;

  if (req.method === 'GET' && path === '/api/config') return json(res, 200, {
    telegram: {
      botUsername: TELEGRAM_BOT_USERNAME,
      loginMode: TELEGRAM_BOT_USERNAME ? 'widget' : 'mock'
    },
    admin: {
      authMode: process.env.NODE_ENV === 'production' ? 'token' : 'dev-open'
    }
  });

  if (req.method === 'POST' && path === '/api/admin/login') {
    const input = await body(req);
    const expected = process.env.ADMIN_PASSWORD || 'admin';
    if (String(input.password || '') !== expected) return json(res, 401, { error: 'invalid admin password' });
    return json(res, 200, { token: adminToken(), role: 'admin' });
  }

  if (req.method === 'GET' && path === '/api/products') return json(res, 200, data.products.map((product) => ({
    ...product,
    skus: data.skus.filter((sku) => sku.productId === product.id),
    supportedPaymentNetworks: data.paymentNetworks.filter((network) => network.isEnabled)
  })));

  if (req.method === 'GET' && path.startsWith('/api/products/')) {
    const slug = decodeURIComponent(path.split('/').pop());
    const product = data.products.find((item) => item.slug === slug || item.id === slug);
    if (!product) return json(res, 404, { error: 'product not found' });
    return json(res, 200, { ...product, skus: data.skus.filter((sku) => sku.productId === product.id), supportedPaymentNetworks: data.paymentNetworks });
  }

  if (req.method === 'GET' && path === '/api/exchange-rates') return json(res, 200, { base: 'USDT', rates: data.exchangeRates, updatedAt: new Date().toISOString() });
  if (req.method === 'GET' && path === '/api/payment-networks') return json(res, 200, data.paymentNetworks);

  if (req.method === 'POST' && path === '/api/orders') {
    const input = await body(req);
    const product = data.products.find((item) => item.id === input.productId);
    const sku = data.skus.find((item) => item.id === input.skuId && item.productId === input.productId);
    const network = data.paymentNetworks.find((item) => item.code === input.paymentNetwork && item.isEnabled);
    if (!product) return json(res, 404, { error: 'product not found' });
    if (product.status !== 'active') return json(res, 409, { error: 'product is not available' });
    if (!sku) return json(res, 404, { error: 'sku not found' });
    if (sku.stockStatus === 'sold_out') return json(res, 409, { error: 'sku is sold out' });
    if (!network) return json(res, 400, { error: 'payment network not found or disabled' });
    const telegramUsername = String(input.telegramUsername || '').trim();
    const email = String(input.email || '').trim();
    if (!/^@?[a-zA-Z0-9_]{5,32}$/.test(telegramUsername)) return json(res, 422, { error: 'invalid telegram username' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json(res, 422, { error: 'invalid email' });
    const rate = Number(data.exchangeRates[input.fiatCurrency] || data.exchangeRates.USD);
    const order = {
      id: randomUUID(),
      orderNo: orderNo(),
      productId: product.id,
      skuId: sku.id,
      productSnapshot: product,
      skuSnapshot: sku,
      telegramUsername: telegramUsername.startsWith('@') ? telegramUsername : `@${telegramUsername}`,
      email,
      amountUsdt: sku.priceUsdt,
      fiatCurrency: input.fiatCurrency || 'USD',
      fiatAmountSnapshot: (Number(sku.priceUsdt) * rate).toFixed(2),
      exchangeRateSnapshot: String(rate),
      paymentCurrency: 'USDT',
      paymentNetwork: network.code,
      paymentAddress: network.address,
      status: 'pending_payment',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    data.orders.unshift(order);
    let notification;
    try {
      notification = await sendOrderCreatedEmail(order);
    } catch (error) {
      notification = {
        ok: false,
        provider: 'smtp',
        messageId: null,
        error: error instanceof Error ? error.message : 'order notification failed'
      };
    }
    data.notifications.unshift({
      id: randomUUID(),
      orderId: order.id,
      channel: 'email',
      type: 'order_created',
      provider: notification.provider,
      status: notification.ok ? 'sent' : 'failed',
      messageId: notification.messageId,
      error: notification.error || notification.note || null,
      createdAt: new Date().toISOString()
    });
    await save(data);
    return json(res, 201, { orderId: order.id, orderNo: order.orderNo, paymentUrl: `/pay/${order.id}` });
  }

  const orderPayment = path.match(/^\/api\/orders\/([^/]+)\/payment$/);
  if (req.method === 'GET' && orderPayment) {
    const order = data.orders.find((item) => item.id === orderPayment[1] || item.orderNo === orderPayment[1]);
    if (!order) return json(res, 404, { error: 'order not found' });
    return json(res, 200, order);
  }

  const orderStatus = path.match(/^\/api\/orders\/([^/]+)\/status$/);
  if (req.method === 'GET' && orderStatus) {
    const order = data.orders.find((item) => item.id === orderStatus[1] || item.orderNo === orderStatus[1]);
    if (!order) return json(res, 404, { error: 'order not found' });
    return json(res, 200, { orderId: order.id, orderNo: order.orderNo, status: order.status, updatedAt: order.updatedAt });
  }

  if (req.method === 'POST' && path === '/api/orders/lookup') {
    const input = await body(req);
    const orderNo = String(input.orderNo || '').trim();
    const contact = String(input.contact || '').toLowerCase();
    const contactVariants = new Set([contact, contact.startsWith('@') ? contact.slice(1) : `@${contact}`].filter(Boolean));
    const order = data.orders.find((item) => item.orderNo === orderNo && [item.email.toLowerCase(), item.telegramUsername.toLowerCase()].some((value) => contactVariants.has(value)));
    if (!order) return json(res, 404, { error: 'order not found' });
    return json(res, 200, order);
  }

  if (req.method === 'POST' && path === '/api/auth/telegram') {
    const input = await body(req);
    const verified = verifyTelegramLogin(input);
    if (!verified.ok && process.env.NODE_ENV === 'production') return json(res, 401, { error: verified.reason });
    const user = { id: `user_${input.id || randomUUID()}`, telegramId: String(input.id || 'dev'), telegramUsername: input.username || 'glass_user', defaultCurrency: 'CNY', lastLoginAt: new Date().toISOString() };
    data.users = data.users.filter((item) => item.telegramId !== user.telegramId).concat(user);
    await save(data);
    return json(res, 200, { token: `dev.${Buffer.from(user.id).toString('base64')}.token`, user, verified: verified.ok });
  }

  if (req.method === 'PATCH' && path === '/api/me/preferences') {
    const input = await body(req);
    return json(res, 200, { defaultCurrency: input.defaultCurrency || 'USD' });
  }

  const internalMarkPaid = path.match(/^\/api\/internal\/orders\/([^/]+)\/mark-paid$/);
  if (req.method === 'POST' && internalMarkPaid) {
    const actor = internalActor(req);
    if (!actor.ok) return json(res, 401, { error: actor.reason });
    const order = data.orders.find((item) => item.id === internalMarkPaid[1] || item.orderNo === internalMarkPaid[1]);
    if (!order) return json(res, 404, { error: 'order not found' });
    order.status = 'paid';
    order.paidAt = new Date().toISOString();
    order.txHash = (await body(req)).txHash || `mock_${randomUUID()}`;
    order.updatedAt = new Date().toISOString();
    await save(data);
    return json(res, 200, order);
  }

  const internalDeliver = path.match(/^\/api\/internal\/orders\/([^/]+)\/deliver$/);
  if (req.method === 'POST' && internalDeliver) {
    const actor = internalActor(req);
    if (!actor.ok) return json(res, 401, { error: actor.reason });
    const order = data.orders.find((item) => item.id === internalDeliver[1] || item.orderNo === internalDeliver[1]);
    if (!order) return json(res, 404, { error: 'order not found' });
    order.status = order.skuSnapshot.deliveryType === 'manual' ? 'delivering' : 'completed';
    order.deliveredAt = new Date().toISOString();
    order.updatedAt = new Date().toISOString();
    data.deliveries.unshift({ id: randomUUID(), orderId: order.id, method: order.skuSnapshot.deliveryType, channel: ['telegram', 'email'], maskedContent: '********-****-****-********', createdAt: new Date().toISOString() });
    let notification;
    try {
      notification = await sendDeliveryEmail(order, data.deliveries[0]);
    } catch (error) {
      notification = {
        ok: false,
        provider: 'smtp',
        messageId: null,
        error: error instanceof Error ? error.message : 'delivery notification failed'
      };
    }
    data.notifications.unshift({
      id: randomUUID(),
      orderId: order.id,
      channel: 'email',
      type: 'delivery',
      provider: notification.provider,
      status: notification.ok ? 'sent' : 'failed',
      messageId: notification.messageId,
      error: notification.error || notification.note || null,
      createdAt: new Date().toISOString()
    });
    await save(data);
    return json(res, 200, { order, delivery: data.deliveries[0], notification });
  }

  if (req.method === 'POST' && path === '/api/internal/payment-listener/check') {
    const actor = internalActor(req);
    if (!actor.ok) return json(res, 401, { error: actor.reason });
    const result = await scanUsdtPayments({
      orders: data.orders,
      networks: data.paymentNetworks,
      usedTxHashes: data.orders.map((order) => order.txHash)
    });
    for (const match of result.matched || []) {
      const order = data.orders.find((item) => item.id === match.orderId);
      if (!order) continue;
      order.status = 'paid';
      order.paidAt = new Date().toISOString();
      order.txHash = match.txHash;
      order.updatedAt = new Date().toISOString();
    }
    if ((result.matched || []).length) await save(data);
    return json(res, 200, result);
  }

  if (path.startsWith('/api/admin/') || path === '/api/admin/orders' || path === '/api/admin/payment-networks' || path === '/api/admin/deliveries') {
    const actor = adminActor(req);
    if (!actor.ok) return json(res, 401, { error: actor.reason });
  }

  if (req.method === 'GET' && path === '/api/admin/orders') return json(res, 200, data.orders);
  if (req.method === 'GET' && path === '/api/admin/payment-networks') return json(res, 200, data.paymentNetworks);
  if (req.method === 'GET' && path === '/api/admin/deliveries') return json(res, 200, data.deliveries);
  if (req.method === 'GET' && path === '/api/admin/notifications') return json(res, 200, data.notifications || []);
  if (req.method === 'GET' && path === '/api/admin/audit-logs') return json(res, 200, data.auditLogs || []);

  if (req.method === 'POST' && path === '/api/admin/products') {
    const input = await body(req);
    if (!input.id || !input.slug || !input.name) return json(res, 422, { error: 'id, slug and name are required' });
    if (data.products.some((item) => item.id === input.id || item.slug === input.slug)) return json(res, 409, { error: 'product id or slug already exists' });
    const product = {
      id: input.id,
      slug: input.slug,
      name: input.name,
      categoryId: input.categoryId || 'more',
      status: input.status || 'active',
      deliveryType: input.deliveryType || 'manual',
      baseCurrency: 'USDT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    data.products.push(product);
    audit(data, req, adminActor(req), 'product.create', 'product', product.id, product);
    await save(data);
    return json(res, 201, product);
  }

  const adminProduct = path.match(/^\/api\/admin\/products\/([^/]+)$/);
  if (req.method === 'PATCH' && adminProduct) {
    const product = data.products.find((item) => item.id === adminProduct[1]);
    if (!product) return json(res, 404, { error: 'product not found' });
    const input = await body(req);
    for (const key of ['name', 'status', 'deliveryType', 'categoryId']) {
      if (input[key] !== undefined) product[key] = input[key];
    }
    product.updatedAt = new Date().toISOString();
    audit(data, req, adminActor(req), 'product.update', 'product', product.id, input);
    await save(data);
    return json(res, 200, product);
  }

  const adminSku = path.match(/^\/api\/admin\/skus\/([^/]+)$/);
  if (req.method === 'PATCH' && adminSku) {
    const sku = data.skus.find((item) => item.id === adminSku[1]);
    if (!sku) return json(res, 404, { error: 'sku not found' });
    const input = await body(req);
    for (const key of ['priceUsdt', 'stockStatus', 'deliveryType', 'isDefault']) {
      if (input[key] !== undefined) sku[key] = input[key];
    }
    sku.updatedAt = new Date().toISOString();
    audit(data, req, adminActor(req), 'sku.update', 'sku', sku.id, input);
    await save(data);
    return json(res, 200, sku);
  }

  if (req.method === 'POST' && path === '/api/admin/skus') {
    const input = await body(req);
    const product = data.products.find((item) => item.id === input.productId);
    if (!product) return json(res, 404, { error: 'product not found' });
    if (!input.id || data.skus.some((item) => item.id === input.id)) return json(res, 409, { error: 'sku id already exists or missing' });
    const sku = {
      id: input.id,
      productId: product.id,
      optionValues: input.optionValues || {},
      priceUsdt: String(input.priceUsdt || '0'),
      stockStatus: input.stockStatus || 'in_stock',
      deliveryType: input.deliveryType || product.deliveryType,
      isDefault: Boolean(input.isDefault),
      isRecommended: Boolean(input.isRecommended),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    data.skus.push(sku);
    audit(data, req, adminActor(req), 'sku.create', 'sku', sku.id, sku);
    await save(data);
    return json(res, 201, sku);
  }

  if (req.method === 'POST' && path === '/api/admin/skus/batch-generate') {
    const input = await body(req);
    const product = data.products.find((item) => item.id === input.productId);
    if (!product) return json(res, 404, { error: 'product not found' });
    const groups = input.optionGroups || [];
    const combinations = groups.reduce((acc, group) => acc.flatMap((row) => (group.options || []).map((option) => ({ ...row, [group.key]: option }))), [{}]);
    const created = [];
    for (const values of combinations) {
      const suffix = Object.values(values).join('-').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const id = `${product.id}-${suffix || randomUUID().slice(0, 8)}`;
      if (data.skus.some((item) => item.id === id)) continue;
      const sku = {
        id,
        productId: product.id,
        optionValues: values,
        priceUsdt: String(input.priceUsdt || '0'),
        stockStatus: input.stockStatus || 'in_stock',
        deliveryType: input.deliveryType || product.deliveryType,
        isDefault: false,
        isRecommended: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      data.skus.push(sku);
      created.push(sku);
    }
    audit(data, req, adminActor(req), 'sku.batch_generate', 'product', product.id, { count: created.length });
    await save(data);
    return json(res, 201, { created: created.length, skus: created });
  }

  if (req.method === 'POST' && path === '/api/admin/inventory/import') {
    const input = await body(req);
    const sku = data.skus.find((item) => item.id === input.skuId);
    if (!sku) return json(res, 404, { error: 'sku not found' });
    const lines = Array.isArray(input.items) ? input.items : String(input.items || '').split(/\r?\n/).filter(Boolean);
    const imported = lines.map((value) => ({
      id: randomUUID(),
      skuId: sku.id,
      maskedValue: String(value).replace(/.(?=.{4})/g, '*'),
      encryptedValue: Buffer.from(String(value)).toString('base64'),
      status: 'available',
      createdAt: new Date().toISOString()
    }));
    data.inventoryItems.unshift(...imported);
    sku.stockStatus = imported.length ? 'in_stock' : sku.stockStatus;
    sku.stockQuantity = (Number(sku.stockQuantity || 0) + imported.length);
    audit(data, req, adminActor(req), 'inventory.import', 'sku', sku.id, { count: imported.length });
    await save(data);
    return json(res, 201, { imported: imported.length, items: imported.map(({ encryptedValue, ...item }) => item) });
  }

  const adminPaymentNetwork = path.match(/^\/api\/admin\/payment-networks\/([^/]+)$/);
  if (req.method === 'PATCH' && adminPaymentNetwork) {
    const network = data.paymentNetworks.find((item) => item.id === adminPaymentNetwork[1] || item.code === adminPaymentNetwork[1]);
    if (!network) return json(res, 404, { error: 'payment network not found' });
    const input = await body(req);
    for (const key of ['address', 'isEnabled', 'isRecommended', 'confirmations', 'warningText']) {
      if (input[key] !== undefined) network[key] = input[key];
    }
    if (input.isRecommended) {
      for (const item of data.paymentNetworks) {
        if (item.id !== network.id) item.isRecommended = false;
      }
    }
    network.updatedAt = new Date().toISOString();
    audit(data, req, adminActor(req), 'payment_network.update', 'payment_network', network.id, input);
    await save(data);
    return json(res, 200, network);
  }

  const adminOrderStatus = path.match(/^\/api\/admin\/orders\/([^/]+)\/status$/);
  if (req.method === 'PATCH' && adminOrderStatus) {
    const order = data.orders.find((item) => item.id === adminOrderStatus[1] || item.orderNo === adminOrderStatus[1]);
    if (!order) return json(res, 404, { error: 'order not found' });
    const input = await body(req);
    const allowedStatuses = new Set(['created', 'pending_payment', 'payment_confirming', 'paid', 'delivering', 'completed', 'expired', 'failed', 'refunding', 'refunded']);
    if (input.status && !allowedStatuses.has(input.status)) return json(res, 422, { error: 'invalid order status' });
    order.status = input.status || order.status;
    order.adminNote = input.adminNote || order.adminNote;
    order.updatedAt = new Date().toISOString();
    audit(data, req, adminActor(req), 'order.status.update', 'order', order.id, { status: order.status, adminNote: order.adminNote });
    await save(data);
    return json(res, 200, order);
  }

  const adminManualDeliver = path.match(/^\/api\/admin\/orders\/([^/]+)\/manual-deliver$/);
  if (req.method === 'POST' && adminManualDeliver) {
    const order = data.orders.find((item) => item.id === adminManualDeliver[1] || item.orderNo === adminManualDeliver[1]);
    if (!order) return json(res, 404, { error: 'order not found' });
    const input = await body(req);
    order.status = 'completed';
    order.deliveredAt = new Date().toISOString();
    order.updatedAt = new Date().toISOString();
    data.deliveries.unshift({
      id: randomUUID(),
      orderId: order.id,
      method: 'manual',
      operator: input.operator || 'admin',
      channel: input.channel || ['telegram', 'email'],
      maskedContent: input.maskedContent || 'manual-********',
      createdAt: new Date().toISOString()
    });
    let notification;
    try {
      notification = await sendDeliveryEmail(order, data.deliveries[0]);
    } catch (error) {
      notification = {
        ok: false,
        provider: 'smtp',
        messageId: null,
        error: error instanceof Error ? error.message : 'manual delivery notification failed'
      };
    }
    data.notifications.unshift({ id: randomUUID(), orderId: order.id, channel: 'email', type: 'manual_delivery', provider: notification.provider, status: notification.ok ? 'sent' : 'failed', messageId: notification.messageId, error: notification.error || notification.note || null, createdAt: new Date().toISOString() });
    audit(data, req, adminActor(req), 'order.manual_deliver', 'order', order.id, { deliveryId: data.deliveries[0].id });
    await save(data);
    return json(res, 200, { order, delivery: data.deliveries[0], notification });
  }

  return json(res, 404, { error: 'api route not found' });
}

function staticFile(req, res, url) {
  const clean = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, '');
  const publicFile = ['/assets/', '/favicon.ico', '/apple-touch-icon.png', '/android-chrome-192x192.png', '/android-chrome-512x512.png']
    .some((prefix) => clean === prefix || clean.startsWith(prefix))
    ? join(ROOT, 'public', clean)
    : null;
  const file = publicFile || (clean === '/' ? join(ROOT, 'index.html') : join(ROOT, clean));
  if (!file.startsWith(ROOT)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }
  const target = existsSync(file) ? file : join(ROOT, 'index.html');
  res.writeHead(200, { 'content-type': mime[extname(target)] || 'application/octet-stream' });
  createReadStream(target).pipe(res);
}

createServer(async (req, res) => {
  try {
    if (req.method === 'OPTIONS') return json(res, 204, {});
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname.startsWith('/api/')) return api(req, res, url);
    return staticFile(req, res, url);
  } catch (error) {
    console.error(error);
    return json(res, 500, { error: 'internal server error' });
  }
}).listen(PORT, () => {
  console.log(`ichuhai running at http://localhost:${PORT}`);
});
