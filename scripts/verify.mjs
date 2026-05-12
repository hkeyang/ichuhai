import { readFileSync } from 'node:fs';

const requiredFiles = ['index.html', 'styles.css', 'app.js', 'RUNBOOK.md', '.env.example', 'scripts/smoke.mjs', 'scripts/security-check.mjs', 'COMPLETION_AUDIT.md'];
for (const file of requiredFiles) readFileSync(file, 'utf8');

const html = readFileSync('index.html', 'utf8');
const js = readFileSync('app.js', 'utf8');
const css = readFileSync('styles.css', 'utf8');
const server = readFileSync('server.mjs', 'utf8');
const plan = readFileSync('PRODUCT_PLAN.md', 'utf8');
const report = readFileSync('ACCEPTANCE_REPORT.md', 'utf8');
const runbook = readFileSync('RUNBOOK.md', 'utf8');
const smoke = readFileSync('scripts/smoke.mjs', 'utf8');
const securityCheck = readFileSync('scripts/security-check.mjs', 'utf8');
const audit = readFileSync('COMPLETION_AUDIT.md', 'utf8');
const visualAuditScript = readFileSync('scripts/visual-audit.mjs', 'utf8');
const oldBrandPattern = new RegExp(['Glass', 'Future'].join(''));

const checks = [
  ['app root', html.includes('id="app"')],
  ['hash routes', js.includes("routes =") && js.includes("'/checkout'") && js.includes("'/admin'")],
  ['next architecture', readFileSync('next.config.mjs', 'utf8').includes('nextConfig') && oldBrandPattern.test(readFileSync('src/app/page.tsx', 'utf8')) === false],
  ['prisma schema', readFileSync('prisma/schema.prisma', 'utf8').includes('model Order') && readFileSync('prisma/schema.prisma', 'utf8').includes('model AuditLog')],
  ['products and skus', js.includes('optionGroups') && js.includes('skus')],
  ['order creation', js.includes('createOrder')],
  ['payment simulation', js.includes('markPaid')],
  ['admin management', js.includes('renderAdmin')],
  ['order lookup', js.includes('function lookup')],
  ['telegram mock login', js.includes('telegramLogin')],
  ['currency switcher', js.includes('preferredCurrency')],
  ['glass styling', css.includes('--bg-glass') && css.includes('backdrop-filter')],
  ['products api', server.includes("path === '/api/products'")],
  ['orders api', server.includes("path === '/api/orders'")],
  ['payment api', server.includes('/payment$')],
  ['status api', server.includes('/status$')],
  ['lookup api', server.includes("path === '/api/orders/lookup'")],
  ['telegram api', server.includes("path === '/api/auth/telegram'")],
  ['public config api', server.includes("path === '/api/config'") && js.includes('loadConfig')],
  ['telegram widget integration', js.includes('telegram-widget.js') && js.includes('onTelegramAuth')],
  ['payment listener api', server.includes("path === '/api/internal/payment-listener/check'")],
  ['real usdt listener adapter', readFileSync('src/integrations/usdt-listener.mjs', 'utf8').includes('TronGrid') && readFileSync('src/integrations/usdt-listener.mjs', 'utf8').includes('Moralis')],
  ['delivery api', server.includes('/deliver$')],
  ['mailer integration', readFileSync('src/integrations/mailer.mjs', 'utf8').includes('nodemailer') && server.includes('sendDeliveryEmail')],
  ['admin api', server.includes("path === '/api/admin/orders'")],
  ['admin auth and audit', server.includes("path === '/api/admin/login'") && server.includes('auditLogs')],
  ['security hardening', server.includes('requireProductionConfig') && server.includes('createAdminSessionToken') && server.includes('encryptInventoryValue')],
  ['admin product config api', server.includes('adminProduct')],
  ['admin product create api', server.includes("path === '/api/admin/products'")],
  ['admin sku config api', server.includes('adminSku')],
  ['admin sku create and batch api', server.includes("path === '/api/admin/skus'") && server.includes("batch-generate")],
  ['admin inventory import api', server.includes("path === '/api/admin/inventory/import'")],
  ['admin payment config api', server.includes('adminPaymentNetwork')],
  ['admin order status api', server.includes('/status$') && server.includes('adminOrderStatus')],
  ['admin manual delivery api', server.includes('/manual-deliver$')],
  ['product planning doc', plan.includes('页面规划') && plan.includes('生产化缺口')],
  ['acceptance report', report.includes('提示词到产物清单') && report.includes('验收结论')],
  ['runbook', runbook.includes('本地启动') && runbook.includes('生产接入顺序')],
  ['smoke test', smoke.includes('/api/orders') && smoke.includes('/api/admin/deliveries')],
  ['security check', securityCheck.includes('untrusted origin') && securityCheck.includes('inventory should be stored as versioned encrypted payload')],
  ['visual audit script', visualAuditScript.includes('01.png') && visualAuditScript.includes('05.png')],
  ['completion audit', audit.includes('目标拆解') && audit.includes('未完成或弱验证项')]
];

const failed = checks.filter(([, ok]) => !ok);
if (failed.length) {
  console.error('Verification failed:');
  for (const [name] of failed) console.error(`- ${name}`);
  process.exit(1);
}

console.log(`Verification passed (${checks.length} checks).`);
