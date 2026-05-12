# GlassFuture Market 生产化开发进度

## 已完成

1. Next.js / PostgreSQL / Prisma / Redis / Worker 架构骨架
   - 新增 `next.config.mjs`、`src/app`、`prisma/schema.prisma`。
   - 新增 `src/lib/db.ts`、`src/lib/redis.ts`、`src/lib/jobs.ts`。
   - `npm run build:next` 已通过。

2. USDT 链上监听适配层
   - 新增 `src/integrations/usdt-listener.mjs`。
   - 支持 TRON TronGrid 和 EVM Moralis 适配入口。
   - 未配置 API key 时回退为 mock-listener。
   - 新增 `workers/payment-listener.mjs` 和 `workers/order-maintenance.mjs`。

3. Telegram Login Widget
   - 新增 `/api/config` 暴露前端安全配置。
   - 前端配置 `TELEGRAM_BOT_USERNAME` 后加载 Telegram 官方 Login Widget。
   - 服务端继续通过 `TELEGRAM_BOT_TOKEN` 校验 hash。

4. 邮件服务
   - 新增 `src/integrations/mailer.mjs`。
   - 订单创建和发货流程会触发邮件通知。
   - 未配置 SMTP 时记录 mock-mailer。

5. 后台权限与审计日志
   - 新增 `/api/admin/login`。
   - 生产环境 admin API 需要 `x-admin-token`。
   - 新增 `/api/admin/audit-logs`。
   - 商品、SKU、支付网络、订单状态、人工发货、库存导入都会写审计日志。

6. 商品 / SKU / 库存后台 API
   - 新增商品：`POST /api/admin/products`。
   - 新增 SKU：`POST /api/admin/skus`。
   - 批量生成 SKU：`POST /api/admin/skus/batch-generate`。
   - 导入库存：`POST /api/admin/inventory/import`。

7. 视觉逐页验收
   - 新增 `scripts/visual-audit.mjs`。
   - 生成 `VISUAL_AUDIT.md` 和 `artifacts/visual-audit/*.png`。

## 最新验收

- `npm run build:next`：通过。
- `npm audit --audit-level=moderate`：0 vulnerabilities。
- `npm run verify`：通过 39+ 项静态检查。
- `npm run smoke`：通过端到端 API 验收。
- `npm run visual:audit`：生成 01-05 页面截图与移动端首页截图。

## 仍需外部配置

- `DATABASE_URL`：正式 PostgreSQL。
- `REDIS_URL`：正式 Redis。
- `TRON_GRID_API_KEY` 或 `MORALIS_API_KEY`：真实链上监听。
- `TELEGRAM_BOT_USERNAME`、`TELEGRAM_BOT_TOKEN`、BotFather `/setdomain`：真实 Telegram 登录。
- `SMTP_HOST`、`SMTP_USER`、`SMTP_PASS`：真实邮件投递。
- `ADMIN_SESSION_SECRET`、`ADMIN_PASSWORD`：后台生产权限。
