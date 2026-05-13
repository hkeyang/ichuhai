/**
 * @deprecated 此文件已被 Next.js Route Handlers（src/app/api/**/route.ts）替代。
 * 迁移至 Cloudflare Workers + D1 后，所有 API 逻辑均通过 Route Handlers 提供服务。
 * 本文件仅作为本地开发回退和迁移参考保留，请勿在生产环境中使用。
 * 参见：.kiro/specs/cloudflare-backend-migration/design.md
 */
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync, createReadStream } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { createCipheriv, createHmac, createHash, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';

// Load .env file if present (Node 20.6+ built-in dotenv support)
try {
  const { readFileSync } = await import('node:fs');
  const envPath = new URL('.env', import.meta.url).pathname;
  if (existsSync(envPath)) {
    for (const line of readFileSync(envPath, 'utf8').split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq < 1) continue;
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
      if (!(key in process.env)) process.env[key] = val;
    }
  }
} catch { /* ignore */ }
import { scanUsdtPayments } from './src/integrations/usdt-listener.mjs';
import { sendDeliveryEmail, sendOrderCreatedEmail } from './src/integrations/mailer.mjs';

const PORT = Number(process.env.PORT || 4174);
const ROOT = process.cwd();
const DATA_DIR = process.env.DATA_DIR || join(ROOT, 'data');
const DB_FILE = join(DATA_DIR, 'db.json');
const TELEGRAM_BOT_USERNAME = process.env.TELEGRAM_BOT_USERNAME || '';
const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET || '';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const MAX_BODY_BYTES = Number(process.env.MAX_BODY_BYTES || 128 * 1024);
const ADMIN_SESSION_TTL_MS = Number(process.env.ADMIN_SESSION_TTL_MS || 12 * 60 * 60 * 1000);

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.json': 'application/json; charset=utf-8'
};

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function configuredOrigins() {
  return new Set([
    process.env.PUBLIC_SITE_URL,
    ...(process.env.ALLOWED_ORIGINS || '').split(',')
  ].filter(Boolean).map((origin) => origin.trim().replace(/\/$/, '')));
}

function securityHeaders(req = {}) {
  const origin = String(req.headers?.origin || '').replace(/\/$/, '');
  const headers = {
    'x-content-type-options': 'nosniff',
    'referrer-policy': 'strict-origin-when-cross-origin',
    'cache-control': 'no-store',
    vary: 'Origin'
  };
  const allowed = configuredOrigins();
  if (!IS_PRODUCTION || (origin && allowed.has(origin))) {
    headers['access-control-allow-origin'] = origin || '*';
    headers['access-control-allow-methods'] = 'GET,POST,PATCH,OPTIONS';
    headers['access-control-allow-headers'] = 'content-type,x-admin-token,x-internal-token';
  }
  return headers;
}

function staticSecurityHeaders(target) {
  const headers = {
    'content-type': mime[extname(target)] || 'application/octet-stream',
    'x-content-type-options': 'nosniff',
    'referrer-policy': 'strict-origin-when-cross-origin',
    'content-security-policy': [
      "default-src 'self'",
      "script-src 'self' https://telegram.org",
      "connect-src 'self'",
      "img-src 'self' data:",
      "style-src 'self'",
      "base-uri 'self'",
      "frame-ancestors 'none'",
      "form-action 'self'"
    ].join('; ')
  };
  if (target.includes(`${join(ROOT, 'public')}/assets/`) || target.includes('/_next/static/')) {
    headers['cache-control'] = 'public, max-age=31536000, immutable';
  }
  return headers;
}

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
  supportTickets: [],
  auditLogs: [],
  inventoryItems: []
};

async function db() {
  await mkdir(DATA_DIR, { recursive: true });
  if (!existsSync(DB_FILE)) await writeFile(DB_FILE, JSON.stringify(seed, null, 2));
  const data = JSON.parse(await readFile(DB_FILE, 'utf8'));
  let changed = false;
  for (const key of ['users', 'orders', 'deliveries', 'notifications', 'supportTickets', 'auditLogs', 'inventoryItems']) {
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

function json(req, res, status, value) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', ...securityHeaders(req) });
  res.end(JSON.stringify(value));
}

async function body(req) {
  const contentType = String(req.headers['content-type'] || '');
  if (['POST', 'PATCH', 'PUT'].includes(req.method || '') && contentType && !contentType.includes('application/json')) {
    throw new HttpError(415, 'content-type must be application/json');
  }
  let raw = '';
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) throw new HttpError(413, 'request body too large');
    raw += chunk;
  }
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    throw new HttpError(400, 'invalid json body');
  }
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
  return { ok: safeEqual(computedHash, hash) && !expired, reason: expired ? 'auth_date expired' : 'hash mismatch' };
}

function safeEqual(left, right) {
  const a = Buffer.from(String(left || ''));
  const b = Buffer.from(String(right || ''));
  return a.length === b.length && timingSafeEqual(a, b);
}

function base64Url(value) {
  return Buffer.from(value).toString('base64url');
}

function signAdminPayload(payload) {
  const secret = process.env.ADMIN_SESSION_SECRET || 'dev_admin_secret';
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

function createAdminSessionToken() {
  const payload = base64Url(JSON.stringify({
    role: 'admin',
    nonce: randomUUID(),
    exp: Date.now() + ADMIN_SESSION_TTL_MS
  }));
  return `${payload}.${signAdminPayload(payload)}`;
}

function verifyAdminSessionToken(token) {
  const [payload, signature] = String(token || '').split('.');
  if (!payload || !signature || !safeEqual(signAdminPayload(payload), signature)) return false;
  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return session.role === 'admin' && Number(session.exp) > Date.now();
  } catch {
    return false;
  }
}

function adminActor(req) {
  if (!IS_PRODUCTION) return { ok: true, actorId: 'dev-admin', role: 'admin' };
  const provided = req.headers['x-admin-token'];
  if (verifyAdminSessionToken(provided)) return { ok: true, actorId: 'admin', role: 'admin' };
  return { ok: false, reason: 'admin auth required' };
}

function internalActor(req) {
  if (!IS_PRODUCTION) return { ok: true, actorId: 'dev-internal', role: 'internal' };
  if (!INTERNAL_API_SECRET) return { ok: false, reason: 'internal api secret not configured' };
  const provided = req.headers['x-internal-token'];
  if (provided && safeEqual(provided, INTERNAL_API_SECRET)) return { ok: true, actorId: 'internal', role: 'internal' };
  return { ok: false, reason: 'internal auth required' };
}

function requireProductionConfig() {
  if (!IS_PRODUCTION) return;
  const required = [
    ['ADMIN_PASSWORD', 12],
    ['ADMIN_SESSION_SECRET', 32],
    ['INTERNAL_API_SECRET', 32],
    ['INVENTORY_ENCRYPTION_KEY', 32]
  ];
  const missing = required.filter(([name, min]) => String(process.env[name] || '').length < min).map(([name]) => name);
  if (missing.length) {
    throw new Error(`Missing or weak production secrets: ${missing.join(', ')}`);
  }
  if (process.env.ADMIN_PASSWORD === 'admin') {
    throw new Error('ADMIN_PASSWORD must not use the default value in production');
  }
}

function cleanString(value, name, { min = 1, max = 120, pattern, allowEmpty = false } = {}) {
  const text = String(value ?? '').trim();
  if (!text && allowEmpty) return '';
  if (text.length < min || text.length > max) throw new HttpError(422, `${name} is invalid`);
  if (/[<>]/.test(text)) throw new HttpError(422, `${name} must not contain html`);
  if (pattern && !pattern.test(text)) throw new HttpError(422, `${name} is invalid`);
  return text;
}

function cleanId(value, name = 'id') {
  return cleanString(value, name, { min: 2, max: 64, pattern: /^[a-z0-9][a-z0-9_-]*$/ });
}

function cleanEnum(value, name, allowed, fallback) {
  const text = value === undefined ? fallback : String(value);
  if (!allowed.has(text)) throw new HttpError(422, `${name} is invalid`);
  return text;
}

function cleanPrice(value) {
  const text = String(value ?? '0').trim();
  if (!/^\d{1,5}(\.\d{1,2})?$/.test(text) || Number(text) <= 0) throw new HttpError(422, 'priceUsdt is invalid');
  return Number(text).toFixed(2);
}

function cleanOptionValues(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).slice(0, 12).map(([key, val]) => [
    cleanString(key, 'option key', { max: 40, pattern: /^[a-zA-Z0-9_-]+$/ }),
    cleanString(val, 'option value', { max: 80 })
  ]));
}

function cleanOptionGroups(groups) {
  if (!Array.isArray(groups) || groups.length > 6) throw new HttpError(422, 'optionGroups is invalid');
  return groups.map((group) => ({
    key: cleanString(group.key, 'option group key', { max: 40, pattern: /^[a-zA-Z0-9_-]+$/ }),
    options: (Array.isArray(group.options) ? group.options : []).slice(0, 20).map((option) => cleanString(option, 'option', { max: 80 }))
  }));
}

function encryptInventoryValue(value) {
  const secret = process.env.INVENTORY_ENCRYPTION_KEY || (!IS_PRODUCTION ? 'dev_inventory_encryption_key_32_chars' : '');
  if (!secret) throw new HttpError(500, 'inventory encryption key is not configured');
  const key = createHash('sha256').update(secret).digest();
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(String(value), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1:${iv.toString('base64url')}:${tag.toString('base64url')}:${encrypted.toString('base64url')}`;
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

  if (req.method === 'GET' && path === '/api/config') return json(req, res, 200, {
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
    if (!safeEqual(String(input.password || ''), expected)) return json(req, res, 401, { error: 'invalid admin password' });
    return json(req, res, 200, { token: createAdminSessionToken(), role: 'admin', expiresInSeconds: Math.floor(ADMIN_SESSION_TTL_MS / 1000) });
  }

  if (req.method === 'GET' && path === '/api/products') return json(req, res, 200, data.products.map((product) => ({
    ...product,
    skus: data.skus.filter((sku) => sku.productId === product.id),
    supportedPaymentNetworks: data.paymentNetworks.filter((network) => network.isEnabled)
  })));

  if (req.method === 'GET' && path.startsWith('/api/products/')) {
    const slug = decodeURIComponent(path.split('/').pop());
    const product = data.products.find((item) => item.slug === slug || item.id === slug);
    if (!product) return json(req, res, 404, { error: 'product not found' });
    return json(req, res, 200, { ...product, skus: data.skus.filter((sku) => sku.productId === product.id), supportedPaymentNetworks: data.paymentNetworks });
  }

  if (req.method === 'GET' && path === '/api/exchange-rates') return json(req, res, 200, { base: 'USDT', rates: data.exchangeRates, updatedAt: new Date().toISOString() });
  if (req.method === 'GET' && path === '/api/payment-networks') return json(req, res, 200, data.paymentNetworks);

  if (req.method === 'POST' && path === '/api/orders') {
    const input = await body(req);
    const product = data.products.find((item) => item.id === input.productId);
    const sku = data.skus.find((item) => item.id === input.skuId && item.productId === input.productId);
    const network = data.paymentNetworks.find((item) => item.code === input.paymentNetwork && item.isEnabled);
    if (!product) return json(req, res, 404, { error: 'product not found' });
    if (product.status !== 'active') return json(req, res, 409, { error: 'product is not available' });
    if (!sku) return json(req, res, 404, { error: 'sku not found' });
    if (sku.stockStatus === 'sold_out') return json(req, res, 409, { error: 'sku is sold out' });
    if (!network) return json(req, res, 400, { error: 'payment network not found or disabled' });
    const telegramUsername = String(input.telegramUsername || '').trim();
    const email = String(input.email || '').trim().toLowerCase();
    if (!/^@?[a-zA-Z0-9_]{5,32}$/.test(telegramUsername)) return json(req, res, 422, { error: 'invalid telegram username' });
    if (email.length > 254 || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)) return json(req, res, 422, { error: 'invalid email' });
    const fiatCurrency = data.exchangeRates[input.fiatCurrency] ? input.fiatCurrency : 'USD';
    const rate = Number(data.exchangeRates[fiatCurrency]);
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
      fiatCurrency,
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
    return json(req, res, 201, { orderId: order.id, orderNo: order.orderNo, paymentUrl: `/pay/${order.id}` });
  }

  const orderPayment = path.match(/^\/api\/orders\/([^/]+)\/payment$/);
  if (req.method === 'GET' && orderPayment) {
    const order = data.orders.find((item) => item.id === orderPayment[1] || item.orderNo === orderPayment[1]);
    if (!order) return json(req, res, 404, { error: 'order not found' });
    return json(req, res, 200, order);
  }

  const orderStatus = path.match(/^\/api\/orders\/([^/]+)\/status$/);
  if (req.method === 'GET' && orderStatus) {
    const order = data.orders.find((item) => item.id === orderStatus[1] || item.orderNo === orderStatus[1]);
    if (!order) return json(req, res, 404, { error: 'order not found' });
    return json(req, res, 200, { orderId: order.id, orderNo: order.orderNo, status: order.status, updatedAt: order.updatedAt });
  }

  if (req.method === 'POST' && path === '/api/orders/lookup') {
    const input = await body(req);
    const orderNo = String(input.orderNo || '').trim();
    const contact = String(input.contact || '').toLowerCase();
    const txHash = String(input.txHash || '').trim();
    const contactVariants = new Set([contact, contact.startsWith('@') ? contact.slice(1) : `@${contact}`].filter(Boolean));
    const order = txHash
      ? data.orders.find((item) => item.txHash === txHash)
      : data.orders.find((item) => item.orderNo === orderNo && [item.email.toLowerCase(), item.telegramUsername.toLowerCase()].some((value) => contactVariants.has(value)));
    if (!order) return json(req, res, 404, { error: 'order not found' });
    return json(req, res, 200, order);
  }

  const orderTxHash = path.match(/^\/api\/orders\/([^/]+)\/txhash$/);
  if (req.method === 'POST' && orderTxHash) {
    const order = data.orders.find((item) => item.id === orderTxHash[1] || item.orderNo === orderTxHash[1]);
    if (!order) return json(req, res, 404, { error: 'order not found' });
    const input = await body(req);
    const txHash = String(input.txHash || '').trim();
    if (txHash.length < 12 || /[<>]/.test(txHash)) return json(req, res, 422, { error: 'invalid tx hash' });
    const duplicate = data.orders.find((item) => item.id !== order.id && item.txHash === txHash);
    if (duplicate) return json(req, res, 409, { error: 'tx hash already used' });
    order.txHash = txHash;
    order.status = order.status === 'pending_payment' ? 'payment_confirming' : order.status;
    order.updatedAt = new Date().toISOString();
    data.auditLogs.unshift({
      id: randomUUID(),
      actorId: 'customer',
      actorRole: 'customer',
      action: 'order.txhash.submit',
      target: 'order',
      targetId: order.id,
      metadata: { txHash },
      createdAt: new Date().toISOString()
    });
    await save(data);
    return json(req, res, 200, order);
  }

  const orderTicket = path.match(/^\/api\/orders\/([^/]+)\/tickets$/);
  if (req.method === 'POST' && orderTicket) {
    const order = data.orders.find((item) => item.id === orderTicket[1] || item.orderNo === orderTicket[1]);
    if (!order) return json(req, res, 404, { error: 'order not found' });
    const input = await body(req);
    const description = String(input.description || '').trim();
    if (!description || description.length > 1000 || /[<>]/.test(description)) return json(req, res, 422, { error: 'description is invalid' });
    const ticket = {
      id: randomUUID(),
      ticketNo: `TK${new Date().toISOString().replace(/\D/g, '').slice(2, 14)}${Math.floor(Math.random() * 900 + 100)}`,
      orderId: order.id,
      orderNo: order.orderNo,
      type: String(input.type || 'after_sales').slice(0, 80),
      description,
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    data.supportTickets.unshift(ticket);
    data.notifications.unshift({
      id: randomUUID(),
      orderId: order.id,
      channel: 'internal',
      type: 'support_ticket_created',
      provider: 'system',
      status: 'sent',
      messageId: ticket.ticketNo,
      error: null,
      createdAt: new Date().toISOString()
    });
    await save(data);
    return json(req, res, 201, ticket);
  }

  if (req.method === 'POST' && path === '/api/auth/telegram') {
    const input = await body(req);
    const verified = verifyTelegramLogin(input);
    if (!verified.ok && process.env.NODE_ENV === 'production') return json(req, res, 401, { error: verified.reason });
    const user = { id: `user_${input.id || randomUUID()}`, telegramId: String(input.id || 'dev'), telegramUsername: input.username || 'glass_user', defaultCurrency: 'CNY', lastLoginAt: new Date().toISOString() };
    data.users = data.users.filter((item) => item.telegramId !== user.telegramId).concat(user);
    await save(data);
    return json(req, res, 200, { token: `dev.${Buffer.from(user.id).toString('base64')}.token`, user, verified: verified.ok });
  }

  if (req.method === 'PATCH' && path === '/api/me/preferences') {
    const input = await body(req);
    const defaultCurrency = data.exchangeRates[input.defaultCurrency] ? input.defaultCurrency : 'USD';
    return json(req, res, 200, { defaultCurrency });
  }

  const internalMarkPaid = path.match(/^\/api\/internal\/orders\/([^/]+)\/mark-paid$/);
  if (req.method === 'POST' && internalMarkPaid) {
    const actor = internalActor(req);
    if (!actor.ok) return json(req, res, 401, { error: actor.reason });
    const order = data.orders.find((item) => item.id === internalMarkPaid[1] || item.orderNo === internalMarkPaid[1]);
    if (!order) return json(req, res, 404, { error: 'order not found' });
    order.status = 'paid';
    order.paidAt = new Date().toISOString();
    order.txHash = (await body(req)).txHash || `mock_${randomUUID()}`;
    order.updatedAt = new Date().toISOString();
    await save(data);
    return json(req, res, 200, order);
  }

  const internalDeliver = path.match(/^\/api\/internal\/orders\/([^/]+)\/deliver$/);
  if (req.method === 'POST' && internalDeliver) {
    const actor = internalActor(req);
    if (!actor.ok) return json(req, res, 401, { error: actor.reason });
    const order = data.orders.find((item) => item.id === internalDeliver[1] || item.orderNo === internalDeliver[1]);
    if (!order) return json(req, res, 404, { error: 'order not found' });
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
    return json(req, res, 200, { order, delivery: data.deliveries[0], notification });
  }

  if (req.method === 'POST' && path === '/api/internal/payment-listener/check') {
    const actor = internalActor(req);
    if (!actor.ok) return json(req, res, 401, { error: actor.reason });
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
    return json(req, res, 200, result);
  }

  if (path.startsWith('/api/admin/') || path === '/api/admin/orders' || path === '/api/admin/payment-networks' || path === '/api/admin/deliveries') {
    const actor = adminActor(req);
    if (!actor.ok) return json(req, res, 401, { error: actor.reason });
  }

  if (req.method === 'GET' && path === '/api/admin/orders') return json(req, res, 200, data.orders);
  if (req.method === 'GET' && path === '/api/admin/payment-networks') return json(req, res, 200, data.paymentNetworks);
  if (req.method === 'GET' && path === '/api/admin/deliveries') return json(req, res, 200, data.deliveries);
  if (req.method === 'GET' && path === '/api/admin/notifications') return json(req, res, 200, data.notifications || []);
  if (req.method === 'GET' && path === '/api/admin/support-tickets') return json(req, res, 200, data.supportTickets || []);
  if (req.method === 'GET' && path === '/api/admin/audit-logs') return json(req, res, 200, data.auditLogs || []);

  if (req.method === 'POST' && path === '/api/admin/products') {
    const input = await body(req);
    if (!input.id || !input.slug || !input.name) return json(req, res, 422, { error: 'id, slug and name are required' });
    const id = cleanId(input.id);
    const slug = cleanId(input.slug, 'slug');
    if (data.products.some((item) => item.id === id || item.slug === slug)) return json(req, res, 409, { error: 'product id or slug already exists' });
    const product = {
      id,
      slug,
      name: cleanString(input.name, 'name'),
      categoryId: cleanString(input.categoryId || 'more', 'categoryId', { max: 40, pattern: /^[a-zA-Z0-9_-]+$/ }),
      status: cleanEnum(input.status, 'status', new Set(['active', 'hidden', 'archived']), 'active'),
      deliveryType: cleanEnum(input.deliveryType, 'deliveryType', new Set(['auto', 'manual', 'mixed']), 'manual'),
      baseCurrency: 'USDT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    data.products.push(product);
    audit(data, req, adminActor(req), 'product.create', 'product', product.id, product);
    await save(data);
    return json(req, res, 201, product);
  }

  const adminProduct = path.match(/^\/api\/admin\/products\/([^/]+)$/);
  if (req.method === 'PATCH' && adminProduct) {
    const product = data.products.find((item) => item.id === adminProduct[1]);
    if (!product) return json(req, res, 404, { error: 'product not found' });
    const input = await body(req);
    for (const key of ['name', 'status', 'deliveryType', 'categoryId']) {
      if (input[key] === undefined) continue;
      if (key === 'name') product[key] = cleanString(input[key], key);
      if (key === 'status') product[key] = cleanEnum(input[key], key, new Set(['active', 'hidden', 'archived']), product[key]);
      if (key === 'deliveryType') product[key] = cleanEnum(input[key], key, new Set(['auto', 'manual', 'mixed']), product[key]);
      if (key === 'categoryId') product[key] = cleanString(input[key], key, { max: 40, pattern: /^[a-zA-Z0-9_-]+$/ });
    }
    product.updatedAt = new Date().toISOString();
    audit(data, req, adminActor(req), 'product.update', 'product', product.id, input);
    await save(data);
    return json(req, res, 200, product);
  }

  const adminSku = path.match(/^\/api\/admin\/skus\/([^/]+)$/);
  if (req.method === 'PATCH' && adminSku) {
    const sku = data.skus.find((item) => item.id === adminSku[1]);
    if (!sku) return json(req, res, 404, { error: 'sku not found' });
    const input = await body(req);
    for (const key of ['priceUsdt', 'stockStatus', 'deliveryType', 'isDefault']) {
      if (input[key] === undefined) continue;
      if (key === 'priceUsdt') sku[key] = cleanPrice(input[key]);
      if (key === 'stockStatus') sku[key] = cleanEnum(input[key], key, new Set(['in_stock', 'low_stock', 'sold_out']), sku[key]);
      if (key === 'deliveryType') sku[key] = cleanEnum(input[key], key, new Set(['auto', 'manual', 'mixed']), sku[key]);
      if (key === 'isDefault') sku[key] = Boolean(input[key]);
    }
    sku.updatedAt = new Date().toISOString();
    audit(data, req, adminActor(req), 'sku.update', 'sku', sku.id, input);
    await save(data);
    return json(req, res, 200, sku);
  }

  if (req.method === 'POST' && path === '/api/admin/skus') {
    const input = await body(req);
    const product = data.products.find((item) => item.id === input.productId);
    if (!product) return json(req, res, 404, { error: 'product not found' });
    const id = input.id ? cleanId(input.id) : '';
    if (!id || data.skus.some((item) => item.id === id)) return json(req, res, 409, { error: 'sku id already exists or missing' });
    const sku = {
      id,
      productId: product.id,
      optionValues: cleanOptionValues(input.optionValues),
      priceUsdt: cleanPrice(input.priceUsdt),
      stockStatus: cleanEnum(input.stockStatus, 'stockStatus', new Set(['in_stock', 'low_stock', 'sold_out']), 'in_stock'),
      deliveryType: cleanEnum(input.deliveryType, 'deliveryType', new Set(['auto', 'manual', 'mixed']), product.deliveryType),
      isDefault: Boolean(input.isDefault),
      isRecommended: Boolean(input.isRecommended),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    data.skus.push(sku);
    audit(data, req, adminActor(req), 'sku.create', 'sku', sku.id, sku);
    await save(data);
    return json(req, res, 201, sku);
  }

  if (req.method === 'POST' && path === '/api/admin/skus/batch-generate') {
    const input = await body(req);
    const product = data.products.find((item) => item.id === input.productId);
    if (!product) return json(req, res, 404, { error: 'product not found' });
    const groups = cleanOptionGroups(input.optionGroups || []);
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
        priceUsdt: cleanPrice(input.priceUsdt),
        stockStatus: cleanEnum(input.stockStatus, 'stockStatus', new Set(['in_stock', 'low_stock', 'sold_out']), 'in_stock'),
        deliveryType: cleanEnum(input.deliveryType, 'deliveryType', new Set(['auto', 'manual', 'mixed']), product.deliveryType),
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
    return json(req, res, 201, { created: created.length, skus: created });
  }

  if (req.method === 'POST' && path === '/api/admin/inventory/import') {
    const input = await body(req);
    const sku = data.skus.find((item) => item.id === input.skuId);
    if (!sku) return json(req, res, 404, { error: 'sku not found' });
    const lines = Array.isArray(input.items) ? input.items : String(input.items || '').split(/\r?\n/).filter(Boolean);
    if (lines.length > 500) throw new HttpError(422, 'too many inventory items');
    const imported = lines.map((value) => {
      const secret = cleanString(value, 'inventory item', { max: 4096 });
      return {
      id: randomUUID(),
      skuId: sku.id,
      maskedValue: secret.replace(/.(?=.{4})/g, '*'),
      encryptedValue: encryptInventoryValue(secret),
      status: 'available',
      createdAt: new Date().toISOString()
    };
    });
    data.inventoryItems.unshift(...imported);
    sku.stockStatus = imported.length ? 'in_stock' : sku.stockStatus;
    sku.stockQuantity = (Number(sku.stockQuantity || 0) + imported.length);
    audit(data, req, adminActor(req), 'inventory.import', 'sku', sku.id, { count: imported.length });
    await save(data);
    return json(req, res, 201, { imported: imported.length, items: imported.map(({ encryptedValue, ...item }) => item) });
  }

  const adminPaymentNetwork = path.match(/^\/api\/admin\/payment-networks\/([^/]+)$/);
  if (req.method === 'PATCH' && adminPaymentNetwork) {
    const network = data.paymentNetworks.find((item) => item.id === adminPaymentNetwork[1] || item.code === adminPaymentNetwork[1]);
    if (!network) return json(req, res, 404, { error: 'payment network not found' });
    const input = await body(req);
    for (const key of ['address', 'isEnabled', 'isRecommended', 'confirmations', 'warningText']) {
      if (input[key] === undefined) continue;
      if (key === 'address') network[key] = cleanString(input[key], key, { max: 120, pattern: /^[a-zA-Z0-9]+$/ });
      if (key === 'isEnabled' || key === 'isRecommended') network[key] = Boolean(input[key]);
      if (key === 'confirmations') {
        const confirmations = Number(input[key]);
        if (!Number.isInteger(confirmations) || confirmations < 1 || confirmations > 100) throw new HttpError(422, 'confirmations is invalid');
        network[key] = confirmations;
      }
      if (key === 'warningText') network[key] = cleanString(input[key], key, { max: 240, allowEmpty: true });
    }
    if (input.isRecommended) {
      for (const item of data.paymentNetworks) {
        if (item.id !== network.id) item.isRecommended = false;
      }
    }
    network.updatedAt = new Date().toISOString();
    audit(data, req, adminActor(req), 'payment_network.update', 'payment_network', network.id, input);
    await save(data);
    return json(req, res, 200, network);
  }

  const adminOrderStatus = path.match(/^\/api\/admin\/orders\/([^/]+)\/status$/);
  if (req.method === 'PATCH' && adminOrderStatus) {
    const order = data.orders.find((item) => item.id === adminOrderStatus[1] || item.orderNo === adminOrderStatus[1]);
    if (!order) return json(req, res, 404, { error: 'order not found' });
    const input = await body(req);
    const allowedStatuses = new Set(['created', 'pending_payment', 'payment_confirming', 'paid', 'delivering', 'completed', 'expired', 'failed', 'refunding', 'refunded']);
    if (input.status && !allowedStatuses.has(input.status)) return json(req, res, 422, { error: 'invalid order status' });
    order.status = input.status || order.status;
    order.adminNote = input.adminNote ? cleanString(input.adminNote, 'adminNote', { max: 500 }) : order.adminNote;
    order.updatedAt = new Date().toISOString();
    audit(data, req, adminActor(req), 'order.status.update', 'order', order.id, { status: order.status, adminNote: order.adminNote });
    await save(data);
    return json(req, res, 200, order);
  }

  const adminManualDeliver = path.match(/^\/api\/admin\/orders\/([^/]+)\/manual-deliver$/);
  if (req.method === 'POST' && adminManualDeliver) {
    const order = data.orders.find((item) => item.id === adminManualDeliver[1] || item.orderNo === adminManualDeliver[1]);
    if (!order) return json(req, res, 404, { error: 'order not found' });
    const input = await body(req);
    order.status = 'completed';
    order.deliveredAt = new Date().toISOString();
    order.updatedAt = new Date().toISOString();
    data.deliveries.unshift({
      id: randomUUID(),
      orderId: order.id,
      method: 'manual',
      operator: cleanString(input.operator || 'admin', 'operator', { max: 80 }),
      channel: input.channel || ['telegram', 'email'],
      maskedContent: cleanString(input.maskedContent || 'manual-********', 'maskedContent', { max: 240 }),
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
    return json(req, res, 200, { order, delivery: data.deliveries[0], notification });
  }

  return json(req, res, 404, { error: 'api route not found' });
}

function staticFile(req, res, url) {
  const clean = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, '');
  const publicFile = ['/assets/', '/favicon.ico', '/apple-touch-icon.png', '/android-chrome-192x192.png', '/android-chrome-512x512.png']
    .some((prefix) => clean === prefix || clean.startsWith(prefix))
    ? join(ROOT, 'public', clean)
    : null;
  const file = publicFile || (clean === '/' ? join(ROOT, 'index.html') : join(ROOT, clean));
  if (file !== ROOT && !file.startsWith(`${ROOT}/`)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }
  const target = existsSync(file) ? file : join(ROOT, 'index.html');
  res.writeHead(200, staticSecurityHeaders(target));
  createReadStream(target).pipe(res);
}

requireProductionConfig();

createServer(async (req, res) => {
  try {
    if (req.method === 'OPTIONS') return json(req, res, 204, {});
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname.startsWith('/api/')) return await api(req, res, url);
    return staticFile(req, res, url);
  } catch (error) {
    console.error(error);
    const status = error instanceof HttpError ? error.status : 500;
    return json(req, res, status, { error: error instanceof HttpError ? error.message : 'internal server error' });
  }
}).listen(PORT, () => {
  console.log(`ichuhai running at http://localhost:${PORT}`);
});
