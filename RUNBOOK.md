# ichuhai 运行手册

## 本地启动

```bash
npm start
```

打开：

```text
http://localhost:4174
```

默认端口为 `4174`，可通过环境变量覆盖：

```bash
PORT=4180 npm start
```

## 验证命令

```bash
node --check app.js
node --check server.mjs
npm run build:next
npm run verify
npm run smoke
npm run visual:audit
```

`npm run verify` 做静态交付检查，确认前端、API、规划文档和验收报告存在且覆盖关键功能。

`npm run smoke` 会调用本地 API，完整跑通：

1. 商品列表。
2. 汇率。
3. 创建订单。
4. 获取支付信息。
5. 支付监听扫描。
6. 标记已支付。
7. 触发发货。
8. 订单查询。
9. 后台订单和发货记录。
10. 后台新增商品、SKU、批量生成 SKU、库存导入。
11. 邮件通知记录与后台审计日志。

`npm run visual:audit` 会生成：

```text
VISUAL_AUDIT.md
artifacts/visual-audit/*.png
```

用于逐页对照 `01.png` 到 `05.png`。

## 演示路径

- 首页：`http://localhost:4174/#/`
- 商品列表：`http://localhost:4174/#/products`
- 商品详情：`http://localhost:4174/#/product/discord-nitro`
- 购买确认：`http://localhost:4174/#/checkout`
- 支付演示：`http://localhost:4174/#/pay/demo`
- 完成演示：`http://localhost:4174/#/order/demo/success`
- 订单查询：`http://localhost:4174/#/orders/lookup`
- 后台管理：`http://localhost:4174/#/manage-x0509y`

## 数据文件

本地数据保存在：

```text
data/db.json
```

其中包含商品、SKU、支付网络、订单、发货记录和用户登录模拟数据。删除该文件后，服务下次启动会自动用 `server.mjs` 的 seed 数据重建。

## 生产接入顺序

1. 配置正式域名和 HTTPS。
2. 创建 Telegram Bot，并通过 BotFather `/setdomain` 绑定域名。
3. 在 `.env` 中配置 `TELEGRAM_BOT_USERNAME` 和 `TELEGRAM_BOT_TOKEN`。
4. 替换 `/api/internal/payment-listener/check` 的 mock 逻辑，接入 TronGrid、Alchemy、QuickNode、Moralis 或自建节点。
5. 将 `data/db.json` 替换为 PostgreSQL + Prisma。
6. 配置邮件服务，用真实 SMTP 或邮件 API 发送订单和发货通知。
7. 为 `#/admin` 增加管理员登录、权限和审计日志。
8. 配置日志、告警、备份、限流和支付风控。

## 生产架构命令

当前仓库保留本地 MVP 启动方式：

```bash
npm start
```

同时已经加入生产化骨架：

```bash
npm run dev:next
npm run build:next
npm run start:next
npm run worker:payments
npm run worker:orders
```

## Telegram 登录说明

本地未配置 `TELEGRAM_BOT_USERNAME` 时，点击 Telegram 登录会显示模拟登录按钮，方便开发和验收。

生产环境配置 `TELEGRAM_BOT_USERNAME` 后，前端会加载 Telegram 官方 Login Widget。用户点击授权后，Telegram 会把用户资料和签名返回给前端，前端再提交到 `/api/auth/telegram`，服务端使用 `TELEGRAM_BOT_TOKEN` 校验 hash 和 auth_date。

`/setdomain` 的作用是把当前网站域名绑定到这个 Bot。否则 Telegram 官方 Widget 会拒绝未授权域名，避免别人把你的 Bot 登录能力嵌到任意网站上。

## 当前边界

本仓库当前交付的是本地可运行 MVP。链上交易、Telegram Login Widget、邮件投递、生产数据库和后台权限需要真实外部凭据与部署环境后才能上线。

---

## Cloudflare Workers 部署（新架构）

本节说明迁移至 Cloudflare Workers + D1 后的开发与部署流程。

### 本地开发

```bash
# 1. 首次初始化：创建本地 D1 数据库并执行迁移（含 seed 数据）
wrangler d1 migrations apply ichuhai-db --local

# 2. 启动本地开发服务器（含 D1 本地模拟，端口默认 8787）
wrangler dev
```

本地环境变量通过 `.dev.vars` 文件配置（已在 `.gitignore` 中排除）：

```ini
TELEGRAM_BOT_TOKEN=dev_bot_token
ADMIN_PASSWORD=dev_admin_password_12
ADMIN_SESSION_SECRET=dev_admin_session_secret_32_chars_
INTERNAL_API_SECRET=dev_internal_api_secret_32_chars__
INVENTORY_ENCRYPTION_KEY=dev_inventory_encryption_key_32ch
DKIM_PRIVATE_KEY=
```

### 生产部署

```bash
# 1. 首次部署：创建 D1 数据库（仅需执行一次）
wrangler d1 create ichuhai-db
# 将输出的 database_id 填入 wrangler.jsonc 的 d1_databases[0].database_id

# 2. 执行生产数据库迁移（含 seed 数据）
wrangler d1 migrations apply ichuhai-db --remote

# 3. 构建并部署 Worker
wrangler deploy
# 或使用 opennextjs-cloudflare 构建流程：
npx opennextjs-cloudflare build && wrangler deploy
```

### 设置 Secrets

所有敏感配置通过 `wrangler secret put` 设置，不存入代码仓库：

```bash
wrangler secret put TELEGRAM_BOT_TOKEN
wrangler secret put ADMIN_PASSWORD          # 最小长度 12 位
wrangler secret put ADMIN_SESSION_SECRET    # 最小长度 32 位
wrangler secret put INTERNAL_API_SECRET     # 最小长度 32 位
wrangler secret put INVENTORY_ENCRYPTION_KEY # 最小长度 32 位
wrangler secret put DKIM_PRIVATE_KEY        # MailChannels DKIM 私钥（PEM 格式）
```

### 冒烟测试

部署后运行冒烟测试验证所有 30 个 API 端点：

```bash
# 生产环境
BASE_URL=https://ichuhai.shop \
ADMIN_PASSWORD=<生产密码> \
INTERNAL_API_SECRET=<内部密钥> \
bash scripts/smoke-test.sh

# 本地开发环境
BASE_URL=http://localhost:8787 \
ADMIN_PASSWORD=dev_admin_password_12 \
INTERNAL_API_SECRET=dev_internal_api_secret_32_chars__ \
bash scripts/smoke-test.sh
```

### 数据库管理

```bash
# 查看本地数据库内容
wrangler d1 execute ichuhai-db --local --command "SELECT * FROM products"

# 查看生产数据库内容
wrangler d1 execute ichuhai-db --remote --command "SELECT COUNT(*) FROM orders"

# 新增迁移文件后应用
wrangler d1 migrations apply ichuhai-db --local   # 本地
wrangler d1 migrations apply ichuhai-db --remote  # 生产
```

### 架构说明

| 组件 | 旧架构 | 新架构 |
|---|---|---|
| API 服务 | `server.mjs`（Node.js HTTP） | Next.js Route Handlers（Cloudflare Workers） |
| 数据库 | `data/db.json`（本地文件） | Cloudflare D1（边缘 SQLite） |
| 邮件发送 | nodemailer + SMTP | MailChannels HTTP API |
| 加密 | Node `crypto` | Web Crypto API |
| 部署 | 独立 Node 进程 | `wrangler deploy` |

> **注意**：`server.mjs` 已标记为 `@deprecated`，仅作本地开发回退保留。生产环境请使用 `wrangler dev` / `wrangler deploy`。
