# ichuhai 验收报告

## 1. 验收目标

按文件夹内 `README.md` 开发文档和 `01.png`、`02.png`、`03.png`、`04.png`、`05.png` 参考图，交付一个风格一致、功能完整、可本地运行的虚拟数字商品商城 MVP，并在交付前对每个功能和板块进行验收。

## 2. 提示词到产物清单

| 明确要求 | 产物 | 证据 |
| --- | --- | --- |
| 按开发文档完整规划 | `PRODUCT_PLAN.md` | 页面规划、业务模型、后台规划、技术规划、生产化缺口 |
| 照抄每页图片布局 | `styles.css`、`app.js` | 首页双栏、详情页、购买确认、支付页、完成页均按参考图结构实现 |
| 风格设计一致 | `styles.css` | 轻玻璃、蓝紫渐变、柔光背景、圆角、阴影、价格样式 |
| 可实际使用产品 | `index.html`、`app.js`、`server.mjs` | `npm start` 后访问 `http://localhost:4174` |
| 首页 | `home()` | Hero、商品分类、商品卡片、规格、说明、流程、快速下单 |
| 商品列表 | `productsPage()` | 全商品列表与分类/搜索 UI |
| 商品详情 | `detail()` | 商品主视觉、价格、规格、说明、相关推荐、订单摘要 |
| 购买确认 | `checkout()` | 步骤条、联系信息、支付网络、确认区、阅读确认 |
| 支付页面 | `pay()` | 状态步骤、钱包入口、二维码、复制地址/金额/网络、支付确认 |
| 订单完成 | `success()` | 成功 Hero、进度条、订单信息、发货结果、交付内容 |
| 订单查询 | `lookup()`、`/api/orders/lookup` | 支持订单号 + 邮箱或 Telegram 查询 |
| Telegram 登录 | `telegramLogin`、`/api/auth/telegram` | 前端模拟登录，服务端包含 hash 校验逻辑 |
| 法币参考价 | `CURRENCIES`、`/api/exchange-rates` | 支持 USD/CNY/GBP/EUR/AUD/JPY/HKD/KRW |
| 后台商品与 SKU | `renderAdmin()`、`/api/admin/products/:id`、`/api/admin/skus/:id` | 商品上下架、SKU 配置接口 |
| 后台订单管理 | `renderAdmin()`、`/api/admin/orders`、`/api/admin/orders/:id/status` | 订单列表、标记支付、状态更新、补发入口 |
| 后台支付配置 | `/api/admin/payment-networks`、`/api/admin/payment-networks/:id` | TRON/ETH/BSC/BASE、地址、确认数、启停、推荐 |
| 发货管理 | `/api/internal/orders/:id/deliver`、`/api/admin/orders/:id/manual-deliver`、`/api/admin/deliveries` | 自动/手动发货模拟与记录 |
| 支付监听 | `/api/internal/payment-listener/check` | 本地 mock listener，返回待付款扫描结果 |

## 3. 实际验收命令

已执行：

```bash
node --check app.js
node --check server.mjs
npm run verify
curl -s http://localhost:4174/api/products
curl -s http://localhost:4174/api/products/discord-nitro
curl -s http://localhost:4174/api/exchange-rates
curl -s -X POST http://localhost:4174/api/orders ...
curl -s http://localhost:4174/api/orders/:orderId/payment
curl -s -X POST http://localhost:4174/api/internal/payment-listener/check
curl -s -X POST http://localhost:4174/api/internal/orders/:orderId/mark-paid
curl -s -X POST http://localhost:4174/api/internal/orders/:orderId/deliver
curl -s http://localhost:4174/api/admin/deliveries
```

当前 `npm run verify` 覆盖 29 项静态检查：前端路由、SKU、订单创建、支付、后台、订单查询、Telegram、法币、玻璃样式、商品 API、订单 API、支付 API、状态 API、查询 API、Telegram API、支付监听 API、发货 API、后台 API、后台商品配置、后台 SKU 配置、后台支付配置、后台订单状态、后台人工发货、产品规划文档、验收报告、运行手册、smoke test、完成审计。

新增 `npm run smoke` 覆盖端到端 API 验收：商品、汇率、创建订单、支付信息、支付监听、标记已支付、发货、订单查询、后台订单、后台发货记录。

最近一次 smoke test 结果：

```text
ok: true
base: http://localhost:4174
orderNo: GF2605050931089293
checks: products, exchange-rates, orders, payment, payment-listener, mark-paid, deliver, lookup, admin, admin-product-config, admin-payment-config, admin-order-status, admin-manual-delivery
```

## 4. 视觉验收

已用本机 Chrome 无头模式截图检查：

- `/tmp/gf-home.png`：首页桌面布局。
- `/tmp/gf-mobile2.png`：移动端首页布局。
- `/tmp/gf-pay.png`：支付页布局。
- `/tmp/gf-success.png`：订单完成页布局。

修复记录：

- 移动端分类导航一度被压成竖排，已改为横向滚动。
- CNY 汇率调到 7.22，使 `1.80 USDT ≈ ¥13.0` 与参考图一致。
- 支付页和完成页补了 `demo` 订单，便于直接打开验收。

## 5. 验收结论

本地 MVP 已可运行并完成完整购买闭环。用户可以在浏览器中选择商品、选择规格、填写信息、创建订单、查看支付页、模拟支付完成、查看发货结果，并通过后台和 API 查看订单与发货记录。

## 6. 生产化补充验收

已继续完成后续重点任务：

- 新增 Next.js / Prisma / Redis / Worker 架构骨架，并通过 `npm run build:next`。
- 新增 USDT 链上监听适配层，支持 TronGrid / Moralis 配置入口，未配置时回退 mock。
- 接入 Telegram Login Widget 配置化加载与服务端 hash 校验。
- 接入邮件通知适配层，订单创建和发货会生成邮件通知记录，配置 SMTP 后可真实发送。
- 后台新增登录 token、生产环境权限校验、审计日志。
- 后台新增商品、SKU、批量生成 SKU、库存导入 API。
- 新增 `npm run visual:audit`，生成 01-05 页面截图对照报告。

最新验收：

```bash
npm run build:next
npm audit --audit-level=moderate
npm run verify
npm run smoke
npm run visual:audit
```

结果：

- Next 构建通过。
- npm audit：0 vulnerabilities。
- verify：39+ 项静态检查通过。
- smoke：端到端 API 验收通过。
- visual audit：生成 `VISUAL_AUDIT.md` 与 `artifacts/visual-audit/*.png`。

未纳入本地完成范围的生产依赖：

- 真实链上 USDT 监听。
- Telegram Login Widget 正式域名绑定。
- 邮件服务真实投递。
- PostgreSQL/Redis/Prisma 生产化数据层。
- 管理后台权限与审计日志。

这些需要外部账号、密钥、域名和部署环境才能继续接入。
