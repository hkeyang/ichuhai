import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';

const port = 49174 + Math.floor(Math.random() * 1000);
const base = `http://127.0.0.1:${port}`;
const dataDir = await mkdtemp(join(tmpdir(), 'ichuhai-security-'));
const adminPassword = 'correct-horse-42';
const adminSecret = 'admin-session-secret-with-32-chars-min';
const internalSecret = 'internal-api-secret-with-32-chars-min';
const inventoryKey = 'inventory-encryption-key-32-chars-min';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function request(path, options = {}) {
  const response = await fetch(`${base}${path}`, options);
  const text = await response.text();
  let payload = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = text;
  }
  return { response, payload };
}

async function waitForServer(child) {
  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`server exited early with code ${child.exitCode}`);
    try {
      const { response } = await request('/api/config');
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  throw new Error('server did not become ready');
}

const child = spawn(process.execPath, ['server.mjs'], {
  cwd: process.cwd(),
  env: {
    ...process.env,
    PORT: String(port),
    DATA_DIR: dataDir,
    NODE_ENV: 'production',
    PUBLIC_SITE_URL: 'https://shop.example',
    ADMIN_USERNAME: 'security-admin',
    ADMIN_PASSWORD: adminPassword,
    ADMIN_SESSION_SECRET: adminSecret,
    INTERNAL_API_SECRET: internalSecret,
    INVENTORY_ENCRYPTION_KEY: inventoryKey
  },
  stdio: ['ignore', 'pipe', 'pipe']
});

try {
  await waitForServer(child);

  const blockedCors = await request('/api/config', { headers: { origin: 'https://evil.example' } });
  assert(!blockedCors.response.headers.get('access-control-allow-origin'), 'untrusted origin should not receive CORS allow-origin');

  const badLogin = await request('/api/admin/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username: 'security-admin', password: 'admin' })
  });
  assert(badLogin.response.status === 401, 'default admin password must not authenticate');

  const login = await request('/api/admin/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username: 'security-admin', password: adminPassword })
  });
  assert(login.response.ok && login.payload.token?.includes('.'), 'admin login should return signed session token');

  const unauthAdmin = await request('/api/admin/orders');
  assert(unauthAdmin.response.status === 401, 'admin endpoint should require token in production');

  const authAdmin = await request('/api/admin/orders', { headers: { 'x-admin-token': login.payload.token } });
  assert(authAdmin.response.ok && Array.isArray(authAdmin.payload), 'signed admin token should access admin endpoint');

  let largeBodyRejected = false;
  try {
    const largeBody = await request('/api/orders', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ padding: 'x'.repeat(140 * 1024) })
    });
    largeBodyRejected = largeBody.response.status === 413;
  } catch {
    largeBodyRejected = true;
  }
  assert(largeBodyRejected, 'oversized JSON body should be rejected');

  const invalidProduct = await request('/api/admin/products', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-admin-token': login.payload.token },
    body: JSON.stringify({ id: 'bad<script>', slug: 'bad-script', name: '<img>', deliveryType: 'manual' })
  });
  assert(invalidProduct.response.status === 422, 'admin product input should reject html-bearing values');

  const createdProduct = await request('/api/admin/products', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-admin-token': login.payload.token },
    body: JSON.stringify({ id: 'secure-product', slug: 'secure-product', name: 'Secure Product', deliveryType: 'manual' })
  });
  assert(createdProduct.response.status === 201, 'valid admin product should be accepted');

  const createdSku = await request('/api/admin/skus', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-admin-token': login.payload.token },
    body: JSON.stringify({ id: 'secure-product-sku', productId: 'secure-product', optionValues: { plan: 'Basic' }, priceUsdt: '1.00' })
  });
  assert(createdSku.response.status === 201, 'valid admin sku should be accepted');

  const inventory = await request('/api/admin/inventory/import', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-admin-token': login.payload.token },
    body: JSON.stringify({ skuId: 'secure-product-sku', items: ['plain-secret-code'] })
  });
  assert(inventory.response.status === 201, 'inventory import should succeed');
  assert(!JSON.stringify(inventory.payload).includes('plain-secret-code'), 'inventory response must not leak secret content');

  const db = JSON.parse(await readFile(join(dataDir, 'db.json'), 'utf8'));
  const encryptedValue = db.inventoryItems[0]?.encryptedValue;
  assert(encryptedValue?.startsWith('v1:'), 'inventory should be stored as versioned encrypted payload');
  assert(!encryptedValue.includes(Buffer.from('plain-secret-code').toString('base64')), 'inventory must not use plain base64 storage');

  const internalWithoutSecret = await request('/api/internal/payment-listener/check', { method: 'POST' });
  assert(internalWithoutSecret.response.status === 401, 'internal endpoint should require secret in production');

  const internalWithSecret = await request('/api/internal/payment-listener/check', {
    method: 'POST',
    headers: { 'x-internal-token': internalSecret }
  });
  assert(internalWithSecret.response.ok, 'internal endpoint should accept configured secret');

  console.log(JSON.stringify({ ok: true, base, checks: 11 }, null, 2));
} finally {
  if (child.exitCode === null && !child.killed) {
    child.kill('SIGTERM');
    await new Promise((resolve) => child.once('close', resolve));
  }
  await rm(dataDir, { recursive: true, force: true });
}
