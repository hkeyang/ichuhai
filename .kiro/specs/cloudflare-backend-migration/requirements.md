# 需求文档

## 简介

本文档定义了 ichuhai 虚拟数字商品商城后端从独立 Node.js 服务器（`server.mjs`）迁移至 Cloudflare Workers（Next.js App Router Route Handlers + D1 + MailChannels）的功能需求与非功能需求。迁移后所有 `/api/*` 路由在 Cloudflare 边缘完整可用，前端 `public/app.js` 无需任何修改。

## 术语表

- **Worker**：Cloudflare Workers 运行时，承载 Next.js App Router Route Handlers
- **D1**：Cloudflare 边缘 SQLite 数据库服务
- **Route_Handler**：Next.js App Router 中的 API 路由处理函数（`src/app/api/**/route.ts`）
- **MailChannels**：Cloudflare Workers 免费邮件发送服务（HTTP API）
- **Admin_Panel**：管理员后台界面（`/#/manage-x0509y`）
- **HMAC_Session**：基于 HMAC-SHA256 签名的管理员会话令牌
- **Web_Crypto**：Workers 运行时内置的 Web Crypto API
- **CORS**：跨域资源共享（Cross-Origin Resource Sharing）
- **AES_GCM**：AES-256-GCM 对称加密算法
- **Telegram_Widget**：Telegram Login Widget 第三方登录组件
- **DKIM**：DomainKeys Identified Mail 邮件域名签名

## 需求

### 需求 1：公开商品与配置查询

**用户故事：** 作为商城访客，我希望能查询商品列表、商品详情、汇率和支付网络信息，以便浏览和选购商品。

#### 验收标准

1. WHEN 客户端请求 GET `/api/config` THEN Route_Handler SHALL 返回包含站点配置信息的 JSON 响应（状态码 200）
2. WHEN 客户端请求 GET `/api/products` THEN Route_Handler SHALL 从 D1 查询所有 status 为 active 的商品并返回 JSON 数组（状态码 200）
3. WHEN 客户端请求 GET `/api/products/[slug]` 且 slug 对应的商品存在 THEN Route_Handler SHALL 返回该商品详情及其关联 SKU 列表（状态码 200）
4. IF 客户端请求 GET `/api/products/[slug]` 且 slug 不存在 THEN Route_Handler SHALL 返回 404 错误响应
5. WHEN 客户端请求 GET `/api/exchange-rates` THEN Route_Handler SHALL 从 D1 查询所有汇率记录并返回 JSON 对象（状态码 200）
6. WHEN 客户端请求 GET `/api/payment-networks` THEN Route_Handler SHALL 从 D1 查询所有 is_enabled 为 1 的支付网络并返回 JSON 数组（状态码 200）

---

### 需求 2：用户下单

**用户故事：** 作为商城用户，我希望能提交订单并获得支付信息，以便完成虚拟商品购买。

#### 验收标准

1. WHEN 客户端提交 POST `/api/orders` 且请求体包含有效的 productId、skuId、paymentNetwork、telegramUsername、email、fiatCurrency THEN Route_Handler SHALL 创建订单记录、发送订单确认邮件、写入审计日志，并返回 orderId、orderNo、paymentUrl（状态码 201）
2. IF 客户端提交 POST `/api/orders` 且 productId 对应的商品不存在或状态非 active THEN Route_Handler SHALL 返回 404 或 409 错误响应
3. IF 客户端提交 POST `/api/orders` 且 skuId 对应的 SKU 库存状态为 sold_out THEN Route_Handler SHALL 返回 409 错误响应
4. IF 客户端提交 POST `/api/orders` 且 paymentNetwork 对应的支付网络未启用 THEN Route_Handler SHALL 返回 409 错误响应
5. WHEN 订单创建成功 THEN Route_Handler SHALL 将商品快照和 SKU 快照以 JSON 形式存入订单记录
6. WHEN 订单创建成功 THEN Route_Handler SHALL 设置订单过期时间为创建时间后 15 分钟

---

### 需求 3：订单查询与状态跟踪

**用户故事：** 作为商城用户，我希望能查询订单支付信息和状态，以便跟踪订单进度。

#### 验收标准

1. WHEN 客户端请求 GET `/api/orders/[id]/payment` 且订单存在 THEN Route_Handler SHALL 返回订单支付地址、金额、支付网络等信息（状态码 200）
2. WHEN 客户端请求 GET `/api/orders/[id]/status` 且订单存在 THEN Route_Handler SHALL 返回订单当前状态（状态码 200）
3. WHILE 订单状态为 pending_payment 且当前时间超过 expires_at THEN Route_Handler SHALL 将订单状态标记为 expired 并返回更新后的状态
4. IF 客户端请求 GET `/api/orders/[id]/payment` 或 `/api/orders/[id]/status` 且订单不存在 THEN Route_Handler SHALL 返回 404 错误响应
5. WHEN 客户端提交 POST `/api/orders/lookup` 且请求体包含有效的 orderNo 和 contact（email 或 telegramUsername） THEN Route_Handler SHALL 返回匹配的订单信息（状态码 200）
6. IF 客户端提交 POST `/api/orders/lookup` 且 orderNo 或 contact 不匹配 THEN Route_Handler SHALL 返回 404 错误响应

---

### 需求 4：用户交易哈希提交与工单

**用户故事：** 作为商城用户，我希望能提交交易哈希和售后工单，以便证明支付并获得售后支持。

#### 验收标准

1. WHEN 客户端提交 POST `/api/orders/[id]/txhash` 且请求体包含有效的 txHash THEN Route_Handler SHALL 更新订单的 tx_hash 字段并将状态变更为 payment_confirming（状态码 200）
2. IF 客户端提交 POST `/api/orders/[id]/txhash` 且订单状态非 pending_payment THEN Route_Handler SHALL 返回 409 错误响应
3. IF 客户端提交 POST `/api/orders/[id]/txhash` 且 txHash 已被其他订单使用 THEN Route_Handler SHALL 返回 409 错误响应
4. WHEN 客户端提交 POST `/api/orders/[id]/tickets` 且请求体包含有效的 type 和 description THEN Route_Handler SHALL 创建工单记录并返回工单信息（状态码 201）

---

### 需求 5：Telegram 登录认证

**用户故事：** 作为商城用户，我希望通过 Telegram 账号登录，以便获得个性化体验和偏好设置。

#### 验收标准

1. WHEN 客户端提交 POST `/api/auth/telegram` 且请求体包含有效的 Telegram Widget 回调数据（id、username、auth_date、hash） THEN Route_Handler SHALL 使用 Web_Crypto HMAC-SHA256 验证签名，创建或更新用户记录，并返回认证令牌（状态码 200）
2. IF 客户端提交的 auth_date 距当前时间超过 86400 秒 THEN Route_Handler SHALL 返回 401 错误响应并说明认证已过期
3. IF 客户端提交的 hash 与服务端计算的 HMAC 签名不匹配 THEN Route_Handler SHALL 返回 401 错误响应
4. WHEN 用户认证成功 THEN Route_Handler SHALL 使用 timing-safe 比较防止时序攻击
5. WHEN 客户端提交 PATCH `/api/me/preferences` 且请求体包含有效的偏好设置 THEN Route_Handler SHALL 更新用户偏好并返回更新后的用户信息（状态码 200）

---

### 需求 6：管理员认证与会话

**用户故事：** 作为管理员，我希望通过密码登录并获得安全的会话令牌，以便管理商城后台。

#### 验收标准

1. WHEN 管理员提交 POST `/api/admin/login` 且密码正确 THEN Route_Handler SHALL 使用 Web_Crypto 生成 HMAC_Session 令牌（12 小时有效期）并返回（状态码 200）
2. IF 管理员提交 POST `/api/admin/login` 且密码错误 THEN Route_Handler SHALL 返回 401 错误响应
3. WHILE HMAC_Session 令牌未过期 THEN Route_Handler SHALL 允许携带该令牌的管理员请求访问受保护端点
4. IF 管理员请求携带的 x-admin-token 无效或已过期 THEN Route_Handler SHALL 返回 401 错误响应
5. THE HMAC_Session SHALL 使用 Web_Crypto HMAC-SHA256 签名，并通过 timing-safe 比较验证

---

### 需求 7：管理员订单管理

**用户故事：** 作为管理员，我希望能查看所有订单、更新订单状态和手动发货，以便管理订单生命周期。

#### 验收标准

1. WHEN 管理员请求 GET `/api/admin/orders` 且携带有效的 x-admin-token THEN Route_Handler SHALL 从 D1 查询所有订单并返回 JSON 数组（状态码 200）
2. WHEN 管理员提交 PATCH `/api/admin/orders/[id]/status` 且请求体包含有效的新状态 THEN Route_Handler SHALL 更新订单状态、写入审计日志并返回更新后的订单（状态码 200）
3. WHEN 管理员提交 POST `/api/admin/orders/[id]/manual-deliver` THEN Route_Handler SHALL 将订单状态更新为 completed、创建发货记录、发送发货邮件、写入通知记录和审计日志，并返回完整结果（状态码 200）
4. IF 管理员请求的订单 ID 不存在 THEN Route_Handler SHALL 返回 404 错误响应

---

### 需求 8：管理员商品与 SKU 管理

**用户故事：** 作为管理员，我希望能创建和更新商品及 SKU，以便维护商品目录。

#### 验收标准

1. WHEN 管理员提交 POST `/api/admin/products` 且请求体包含有效的商品信息 THEN Route_Handler SHALL 创建商品记录并返回新商品（状态码 201）
2. WHEN 管理员提交 PATCH `/api/admin/products/[id]` 且请求体包含有效的更新字段 THEN Route_Handler SHALL 更新商品记录并返回更新后的商品（状态码 200）
3. WHEN 管理员提交 POST `/api/admin/skus` 且请求体包含有效的 SKU 信息 THEN Route_Handler SHALL 创建 SKU 记录并返回新 SKU（状态码 201）
4. WHEN 管理员提交 PATCH `/api/admin/skus/[id]` 且请求体包含有效的更新字段 THEN Route_Handler SHALL 更新 SKU 记录并返回更新后的 SKU（状态码 200）
5. WHEN 管理员提交 POST `/api/admin/skus/batch-generate` 且请求体包含批量生成参数 THEN Route_Handler SHALL 批量创建 SKU 记录并返回创建结果（状态码 201）

---

### 需求 9：管理员库存管理

**用户故事：** 作为管理员，我希望能导入库存项（卡密/兑换码），以便为自动发货商品补充库存。

#### 验收标准

1. WHEN 管理员提交 POST `/api/admin/inventory/import` 且请求体包含 skuId 和库存项列表 THEN Route_Handler SHALL 使用 AES_GCM 加密每个库存项的值，存储加密后的数据和脱敏值到 D1，并返回导入结果（状态码 200）
2. THE Route_Handler SHALL 使用 Web_Crypto AES-256-GCM 加密库存项，加密格式为 `v1:iv:tag:ciphertext`（base64url 编码）
3. WHEN 库存项被导入 THEN Route_Handler SHALL 生成脱敏值（masked_value）用于管理员界面展示
4. IF 请求体中的 skuId 不存在 THEN Route_Handler SHALL 返回 404 错误响应

---

### 需求 10：管理员支付网络管理

**用户故事：** 作为管理员，我希望能查看和更新支付网络配置，以便管理加密货币收款渠道。

#### 验收标准

1. WHEN 管理员请求 GET `/api/admin/payment-networks` 且携带有效的 x-admin-token THEN Route_Handler SHALL 返回所有支付网络记录（状态码 200）
2. WHEN 管理员提交 PATCH `/api/admin/payment-networks/[id]` 且请求体包含有效的更新字段 THEN Route_Handler SHALL 更新支付网络记录并返回更新后的记录（状态码 200）

---

### 需求 11：管理员运营数据查询

**用户故事：** 作为管理员，我希望能查看发货记录、通知记录和售后工单，以便监控运营状况。

#### 验收标准

1. WHEN 管理员请求 GET `/api/admin/deliveries` 且携带有效的 x-admin-token THEN Route_Handler SHALL 返回所有发货记录（状态码 200）
2. WHEN 管理员请求 GET `/api/admin/notifications` 且携带有效的 x-admin-token THEN Route_Handler SHALL 返回所有通知记录（状态码 200）
3. WHEN 管理员请求 GET `/api/admin/support-tickets` 且携带有效的 x-admin-token THEN Route_Handler SHALL 返回所有售后工单（状态码 200）

---

### 需求 12：内部 API（支付确认与自动发货）

**用户故事：** 作为系统内部服务，我希望能标记订单已付款和触发发货，以便实现支付确认和自动发货流程。

#### 验收标准

1. WHEN 内部服务提交 POST `/api/internal/orders/[id]/mark-paid` 且携带有效的 x-internal-token 和 txHash THEN Route_Handler SHALL 将订单状态更新为 paid、记录 tx_hash 和 paid_at、写入审计日志（状态码 200）
2. WHEN 内部服务提交 POST `/api/internal/orders/[id]/deliver` 且携带有效的 x-internal-token THEN Route_Handler SHALL 执行发货流程（解密库存项、更新订单状态为 completed、创建发货记录、发送发货邮件、写入审计日志）并返回结果（状态码 200）
3. IF 内部服务请求未携带有效的 x-internal-token THEN Route_Handler SHALL 返回 401 错误响应
4. IF 内部服务请求的订单 ID 不存在 THEN Route_Handler SHALL 返回 404 错误响应
5. WHEN 自动发货执行时 THEN Route_Handler SHALL 使用 Web_Crypto AES-256-GCM 解密库存项，解密后的明文通过邮件发送给用户

---

### 需求 13：邮件通知

**用户故事：** 作为商城用户，我希望在订单创建和发货时收到邮件通知，以便及时了解订单进展。

#### 验收标准

1. WHEN 订单创建成功 THEN Route_Handler SHALL 通过 MailChannels HTTP API 发送订单确认邮件至用户邮箱
2. WHEN 订单发货完成 THEN Route_Handler SHALL 通过 MailChannels HTTP API 发送发货通知邮件至用户邮箱
3. THE MailChannels 请求 SHALL 包含 DKIM 签名参数（dkim_domain、dkim_selector、dkim_private_key）
4. IF MailChannels API 返回非 202 状态码 THEN Route_Handler SHALL 将错误信息记录到 notifications 表且不阻塞主流程
5. WHEN 邮件发送完成（成功或失败） THEN Route_Handler SHALL 在 notifications 表中记录发送结果

---

### 需求 14：CORS 与安全响应头

**用户故事：** 作为系统架构师，我希望所有 API 响应包含正确的 CORS 头和安全头，以便保障跨域访问安全和防御常见 Web 攻击。

#### 验收标准

1. THE Route_Handler SHALL 在所有响应中包含以下安全头：`x-content-type-options: nosniff`、`referrer-policy: strict-origin-when-cross-origin`、`cache-control: no-store`
2. WHEN 请求的 Origin 头在白名单中（PUBLIC_SITE_URL 和 ALLOWED_ORIGINS） THEN Route_Handler SHALL 在响应中设置 `access-control-allow-origin` 为该 Origin 值
3. IF 请求的 Origin 头不在白名单中 THEN Route_Handler SHALL 不设置 `access-control-allow-origin` 响应头
4. WHEN 客户端发送 OPTIONS 预检请求 THEN Route_Handler SHALL 返回 204 状态码并包含正确的 CORS 头（allow-methods、allow-headers）
5. THE Route_Handler SHALL 在所有端点导出 OPTIONS handler 以支持 CORS preflight

---

### 需求 15：请求体解析与输入校验

**用户故事：** 作为系统架构师，我希望所有 API 请求经过统一的输入校验，以便防止恶意输入和保障数据完整性。

#### 验收标准

1. IF 请求体大小超过 128KB THEN Route_Handler SHALL 返回 413 错误响应
2. IF POST/PATCH 请求的 Content-Type 不包含 `application/json` THEN Route_Handler SHALL 返回 415 错误响应
3. IF 请求体不是有效的 JSON THEN Route_Handler SHALL 返回 400 错误响应
4. THE Route_Handler SHALL 对所有用户输入执行清洗（cleanString/cleanId/cleanEnum），拒绝包含 `<` 或 `>` 字符的输入以防止 HTML 注入
5. WHEN 输入字段格式或长度不符合要求 THEN Route_Handler SHALL 返回 422 错误响应并说明具体校验失败原因

---

### 需求 16：数据库迁移与数据持久化

**用户故事：** 作为开发者，我希望数据存储在 Cloudflare D1 中并通过迁移脚本管理 schema，以便实现可靠的边缘数据持久化。

#### 验收标准

1. THE D1 数据库 SHALL 通过 `wrangler d1 migrations` 管理 schema 变更，迁移文件存放在 `migrations/` 目录
2. THE D1 schema SHALL 包含以下表：products、skus、payment_networks、exchange_rates、users、orders、deliveries、notifications、support_tickets、audit_logs、inventory_items
3. THE D1 schema SHALL 对所有外键关系启用 `PRAGMA foreign_keys = ON`
4. WHEN 订单创建成功 THEN D1 SHALL 持久化订单记录，后续查询可获取该记录
5. THE Route_Handler SHALL 使用参数化查询（`?` 占位符）执行所有 SQL 操作以防止注入攻击

---

### 需求 17：审计日志

**用户故事：** 作为管理员，我希望所有关键操作被记录到审计日志，以便追踪操作历史和排查问题。

#### 验收标准

1. WHEN 订单创建、状态变更、发货等关键操作执行时 THEN Route_Handler SHALL 在 audit_logs 表中记录操作者 ID、角色、动作、目标、目标 ID、IP 地址和 User-Agent
2. WHEN 管理员执行商品/SKU/支付网络的创建或更新操作时 THEN Route_Handler SHALL 写入审计日志
3. THE 审计日志 SHALL 记录请求的 `cf-connecting-ip` 或 `x-forwarded-for` 作为客户端 IP

---

### 需求 18：库存加解密

**用户故事：** 作为系统架构师，我希望库存项（卡密/兑换码）以加密形式存储，以便保护敏感数据安全。

#### 验收标准

1. THE Route_Handler SHALL 使用 Web_Crypto AES-256-GCM 加密库存项，密钥通过 SHA-256 派生自 INVENTORY_ENCRYPTION_KEY 环境变量
2. THE 加密格式 SHALL 为 `v1:<iv_base64url>:<tag_base64url>:<ciphertext_base64url>`，与原 server.mjs 实现兼容
3. WHEN 自动发货需要读取库存项时 THEN Route_Handler SHALL 解密 encrypted_value 字段获取明文
4. FOR ALL 有效的库存项明文值，加密后再解密 SHALL 产生与原始值相同的结果（往返一致性）

---

### 需求 19：统一错误响应

**用户故事：** 作为前端开发者，我希望所有 API 错误响应遵循统一格式，以便前端统一处理错误。

#### 验收标准

1. THE Route_Handler SHALL 对所有错误响应使用统一的 JSON 格式：`{"error": "<人类可读的错误信息>"}`
2. THE Route_Handler SHALL 使用以下 HTTP 状态码：400（无效 JSON）、401（认证失败）、404（资源不存在）、409（业务冲突）、413（请求体过大）、415（Content-Type 错误）、422（输入校验失败）、500（内部错误）
3. IF Route_Handler 内部发生未预期异常 THEN Route_Handler SHALL 返回 500 状态码和 `{"error": "internal server error"}` 响应

---

### 需求 20：环境配置与生产启动校验

**用户故事：** 作为运维人员，我希望系统在生产环境启动时校验所有必需配置，以便及早发现配置缺失问题。

#### 验收标准

1. WHILE NODE_ENV 为 production THEN Route_Handler SHALL 校验以下 secret 的存在和最小长度：ADMIN_PASSWORD（≥12）、ADMIN_SESSION_SECRET（≥32）、INTERNAL_API_SECRET（≥32）、INVENTORY_ENCRYPTION_KEY（≥32）
2. IF 生产环境中任何必需 secret 缺失或长度不足 THEN Route_Handler SHALL 返回 500 错误响应
3. THE 非敏感配置变量 SHALL 通过 wrangler.jsonc 的 vars 字段管理，敏感 secret SHALL 通过 `wrangler secret put` 管理

---

## 非功能需求

### 需求 21：性能

**用户故事：** 作为商城用户，我希望 API 响应快速，以便获得流畅的购物体验。

#### 验收标准

1. THE D1 读取操作 SHALL 在同区域内延迟低于 5ms
2. THE Worker 冷启动时间 SHALL 低于 100ms
3. THE MailChannels 邮件发送 SHALL 采用异步模式（fire-and-forget），不阻塞 API 主响应

---

### 需求 22：兼容性

**用户故事：** 作为前端开发者，我希望迁移后的 API 与原 server.mjs 行为完全一致，以便前端 `public/app.js` 无需任何修改。

#### 验收标准

1. THE 迁移后的 Route_Handler SHALL 保持与原 server.mjs 相同的请求/响应格式
2. THE 迁移后的 Route_Handler SHALL 保持与原 server.mjs 相同的 HTTP 状态码语义
3. THE 迁移后的 Route_Handler SHALL 保持与原 server.mjs 相同的错误响应格式
4. THE 库存加密格式 SHALL 与原 server.mjs 的 `v1:iv:tag:ciphertext` 格式兼容，确保已有加密数据可被正确解密

---

### 需求 23：可部署性

**用户故事：** 作为开发者，我希望通过单条命令完成部署，以便简化发布流程。

#### 验收标准

1. THE 系统 SHALL 通过 `wrangler deploy` 单条命令完成全部后端部署
2. THE D1 数据库迁移 SHALL 通过 `wrangler d1 migrations apply` 独立执行
3. THE 本地开发 SHALL 通过 `wrangler dev` 启动，本地 D1 使用 SQLite 文件模拟

---

### 需求 24：可观测性

**用户故事：** 作为运维人员，我希望系统具备基本的可观测性，以便监控运行状态和排查问题。

#### 验收标准

1. THE wrangler.jsonc SHALL 启用 `observability: { enabled: true }` 以开启 Workers 日志
2. WHEN MailChannels 发送失败 THEN 系统 SHALL 在 notifications 表中记录错误详情，管理员可通过 `/api/admin/notifications` 查询
3. THE audit_logs 表 SHALL 记录所有关键操作的完整上下文（操作者、动作、目标、时间、IP）
