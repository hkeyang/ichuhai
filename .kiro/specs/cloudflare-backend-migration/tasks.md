# 实施计划：Cloudflare Backend Migration

## 概述

将 ichuhai 虚拟商城后端从独立 Node.js 服务器（`server.mjs`）迁移至 Cloudflare Workers（Next.js App Router Route Handlers + D1 + MailChannels）。按 6 个 Wave 分阶段实施：基础设施 → 共享工具库 → 公开 API → 管理员 API → 内部 API → 切换与验收。

## 任务

- [x] 1. Wave 1：D1 数据库 Schema、Seed 与 Wrangler 配置
  - [x] 1.1 创建 D1 迁移文件 `migrations/0001_initial.sql`
    - 编写完整的 DDL（products、skus、payment_networks、exchange_rates、users、orders、deliveries、notifications、support_tickets、audit_logs、inventory_items）
    - 包含所有索引、CHECK 约束、外键引用
    - 启用 `PRAGMA foreign_keys = ON` 和 `PRAGMA journal_mode = WAL`
    - _需求: 16.1, 16.2, 16.3_

  - [x] 1.2 创建 Seed 迁移文件 `migrations/0002_seed.sql`
    - 从 `server.mjs` 的 seed 数据转换为 INSERT 语句
    - 包含 products、skus、payment_networks、exchange_rates 初始数据
    - _需求: 16.4_

  - [x] 1.3 更新 `wrangler.jsonc` 添加 D1 绑定和环境变量
    - 添加 `d1_databases` 配置（binding: DB, database_name: ichuhai-db）
    - 添加 `vars` 字段（TELEGRAM_BOT_USERNAME、PUBLIC_SITE_URL、ALLOWED_ORIGINS、MAIL_FROM、DKIM_DOMAIN、DKIM_SELECTOR、NODE_ENV）
    - 添加 `observability: { enabled: true }`
    - _需求: 20.3, 23.1, 24.1_

  - [x] 1.4 创建 `cloudflare-env.d.ts` 类型声明文件
    - 声明 CloudflareEnv 接口（DB、ASSETS、所有 vars 和 secrets）
    - _需求: 20.1_

  - [x] 1.5 创建 `.dev.vars` 本地开发环境变量文件
    - 包含所有 secrets 的开发占位值
    - 添加到 `.gitignore`
    - _需求: 23.3_

- [x] 2. Wave 2：共享工具库（`src/lib/api/`）
  - [x] 2.1 实现 D1 客户端 `src/lib/api/d1.ts`
    - 通过 `getCloudflareContext()` 获取 D1 binding
    - 导出 `getD1()` 函数
    - _需求: 16.5_

  - [x] 2.2 实现类型定义 `src/lib/api/types.ts`
    - 定义所有数据库行类型接口（ProductRow、SkuRow、PaymentNetworkRow、OrderRow、UserRow、DeliveryRow、NotificationRow、SupportTicketRow、AuditLogRow、InventoryItemRow）
    - _需求: 22.1_

  - [x] 2.3 实现错误处理 `src/lib/api/errors.ts`
    - 创建 HttpError 类（status + message）
    - 导出统一错误响应构造函数
    - _需求: 19.1, 19.2, 19.3_

  - [x] 2.4 实现请求体解析器 `src/lib/api/body-parser.ts`
    - 128KB 大小限制
    - Content-Type 校验（application/json）
    - JSON 解析与错误处理
    - _需求: 15.1, 15.2, 15.3_

  - [ ]* 2.5 编写 body-parser 属性测试
    - **Property 8: 请求体大小限制**
    - **Property 9: 无效 JSON 请求体被拒绝**
    - **验证: 需求 15.1, 15.3**

  - [x] 2.6 实现 CORS + 安全头 `src/lib/api/cors.ts`
    - Origin 白名单过滤（PUBLIC_SITE_URL + ALLOWED_ORIGINS）
    - 安全响应头（nosniff、referrer-policy、no-store）
    - `jsonResponse()` 统一 JSON 响应构造器
    - `optionsResponse()` 处理 OPTIONS preflight
    - _需求: 14.1, 14.2, 14.3, 14.4, 14.5_

  - [ ]* 2.7 编写 CORS 属性测试
    - **Property 7: CORS Origin 白名单过滤**
    - **验证: 需求 14.2, 14.3**

  - [x] 2.8 实现管理员会话 `src/lib/api/admin-session.ts`
    - HMAC-SHA256 签名 payload（Web Crypto）
    - 12 小时 TTL 过期检查
    - timing-safe 比较
    - `createAdminSessionToken()` 和 `verifyAdminSessionToken()`
    - _需求: 6.1, 6.3, 6.4, 6.5_

  - [ ]* 2.9 编写管理员会话属性测试
    - **Property 3: HMAC 管理员会话签名验证往返**
    - **Property 4: 过期管理员令牌被拒绝**
    - **验证: 需求 6.3, 6.4, 6.5**

  - [x] 2.10 实现 Telegram 登录验证 `src/lib/api/telegram-auth.ts`
    - Web Crypto HMAC-SHA256 验证签名
    - auth_date 过期检查（86400 秒）
    - timing-safe 比较
    - _需求: 5.1, 5.2, 5.3, 5.4_

  - [ ]* 2.11 编写 Telegram 登录属性测试
    - **Property 5: Telegram 登录 HMAC 验证正确性**
    - **Property 6: 过期 Telegram auth_date 被拒绝**
    - **验证: 需求 5.1, 5.2, 5.4**

  - [x] 2.12 实现库存加解密 `src/lib/api/inventory-crypto.ts`
    - AES-256-GCM 加密（Web Crypto）
    - 格式 `v1:<iv_base64url>:<tag_base64url>:<ciphertext_base64url>`
    - 解密函数（兼容原 server.mjs 格式）
    - base64url 编解码辅助函数
    - _需求: 18.1, 18.2, 18.3, 9.2_

  - [ ]* 2.13 编写库存加解密属性测试
    - **Property 1: 库存加密解密往返一致性**
    - **Property 2: 加密输出格式合规**
    - **验证: 需求 18.2, 18.4, 22.4**

  - [x] 2.14 实现审计日志 `src/lib/api/audit.ts`
    - `writeAuditLog()` 函数
    - 记录 actor_id、role、action、target、target_id、IP、User-Agent
    - 使用 `cf-connecting-ip` 或 `x-forwarded-for` 获取客户端 IP
    - _需求: 17.1, 17.2, 17.3_

  - [x] 2.15 实现邮件发送 `src/lib/api/mailer.ts`
    - MailChannels HTTP API 集成
    - DKIM 签名参数
    - `sendOrderCreatedEmail()` 和 `sendDeliveryEmail()`
    - 错误处理（不阻塞主流程）
    - _需求: 13.1, 13.2, 13.3, 13.4_

  - [x] 2.16 实现输入校验 `src/lib/api/validators.ts`
    - `cleanString()`、`cleanId()`、`cleanEnum()` 清洗函数
    - 拒绝包含 `<` 或 `>` 的输入
    - 邮箱格式校验、长度校验
    - _需求: 15.4, 15.5_

  - [x] 2.17 实现通知持久化 `src/lib/api/notifications.ts`
    - `writeNotification()` 函数
    - 记录邮件发送结果（成功/失败）
    - _需求: 13.5_

- [x] 3. Checkpoint - 确保共享工具库编译通过
  - 确保所有测试通过，如有问题请询问用户。

- [x] 4. Wave 3：公开 API 路由
  - [x] 4.1 实现 `src/app/api/config/route.ts`
    - GET handler 返回站点配置
    - OPTIONS handler
    - _需求: 1.1_

  - [x] 4.2 实现 `src/app/api/products/route.ts`
    - GET handler 查询所有 active 商品
    - OPTIONS handler
    - _需求: 1.2_

  - [x] 4.3 实现 `src/app/api/products/[slug]/route.ts`
    - GET handler 返回商品详情 + 关联 SKU
    - 404 处理（slug 不存在）
    - OPTIONS handler
    - _需求: 1.3, 1.4_

  - [x] 4.4 实现 `src/app/api/exchange-rates/route.ts`
    - GET handler 查询所有汇率
    - OPTIONS handler
    - _需求: 1.5_

  - [x] 4.5 实现 `src/app/api/payment-networks/route.ts`
    - GET handler 查询所有启用的支付网络
    - OPTIONS handler
    - _需求: 1.6_

  - [x] 4.6 实现 `src/app/api/orders/route.ts`（POST 下单）
    - 解析请求体、校验输入
    - 查询商品/SKU/支付网络并校验状态
    - 生成订单号、计算金额、创建快照
    - 设置 15 分钟过期时间
    - 插入订单记录
    - 发送订单确认邮件（fire-and-forget）
    - 写入审计日志
    - 返回 orderId、orderNo、paymentUrl
    - OPTIONS handler
    - _需求: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [x] 4.7 实现 `src/app/api/orders/lookup/route.ts`
    - POST handler 通过 orderNo + contact 查询订单
    - 404 处理
    - OPTIONS handler
    - _需求: 3.5, 3.6_

  - [x] 4.8 实现 `src/app/api/orders/[id]/payment/route.ts`
    - GET handler 返回订单支付信息
    - 惰性过期检测
    - 404 处理
    - OPTIONS handler
    - _需求: 3.1, 3.3, 3.4_

  - [x] 4.9 实现 `src/app/api/orders/[id]/status/route.ts`
    - GET handler 返回订单状态
    - 惰性过期检测
    - 404 处理
    - OPTIONS handler
    - _需求: 3.2, 3.3, 3.4_

  - [x] 4.10 实现 `src/app/api/orders/[id]/txhash/route.ts`
    - POST handler 提交交易哈希
    - 校验订单状态为 pending_payment
    - 校验 txHash 唯一性
    - 更新状态为 payment_confirming
    - OPTIONS handler
    - _需求: 4.1, 4.2, 4.3_

  - [x] 4.11 实现 `src/app/api/orders/[id]/tickets/route.ts`
    - POST handler 创建售后工单
    - 生成工单号
    - OPTIONS handler
    - _需求: 4.4_

  - [x] 4.12 实现 `src/app/api/auth/telegram/route.ts`
    - POST handler 验证 Telegram Widget 回调
    - 创建或更新用户记录
    - 返回认证令牌
    - OPTIONS handler
    - _需求: 5.1, 5.2, 5.3, 5.4_

  - [x] 4.13 实现 `src/app/api/me/preferences/route.ts`
    - PATCH handler 更新用户偏好
    - OPTIONS handler
    - _需求: 5.5_

  - [ ]* 4.14 编写公开 API 路由单元测试
    - 测试订单创建流程（正常 + 异常）
    - 测试订单过期惰性检测
    - 测试 txHash 唯一性约束
    - **Property 10: 订单过期惰性检测**
    - **Property 11: txHash 唯一性约束**
    - **验证: 需求 3.3, 4.3**

- [x] 5. Checkpoint - 确保公开 API 路由编译通过
  - 确保所有测试通过，如有问题请询问用户。

- [x] 6. Wave 4：管理员 API 路由
  - [x] 6.1 实现 `src/app/api/admin/login/route.ts`
    - POST handler 验证密码
    - 生成 HMAC session token
    - OPTIONS handler
    - _需求: 6.1, 6.2_

  - [x] 6.2 实现 `src/app/api/admin/orders/route.ts`
    - GET handler 查询所有订单（需 admin token）
    - OPTIONS handler
    - _需求: 7.1_

  - [x] 6.3 实现 `src/app/api/admin/orders/[id]/status/route.ts`
    - PATCH handler 更新订单状态（需 admin token）
    - 写入审计日志
    - OPTIONS handler
    - _需求: 7.2_

  - [x] 6.4 实现 `src/app/api/admin/orders/[id]/manual-deliver/route.ts`
    - POST handler 手动发货（需 admin token）
    - 更新订单状态为 completed
    - 创建发货记录
    - 发送发货邮件
    - 写入通知和审计日志
    - OPTIONS handler
    - _需求: 7.3, 7.4_

  - [x] 6.5 实现 `src/app/api/admin/products/route.ts`
    - POST handler 创建商品（需 admin token）
    - OPTIONS handler
    - _需求: 8.1_

  - [x] 6.6 实现 `src/app/api/admin/products/[id]/route.ts`
    - PATCH handler 更新商品（需 admin token）
    - OPTIONS handler
    - _需求: 8.2_

  - [x] 6.7 实现 `src/app/api/admin/skus/route.ts`
    - POST handler 创建 SKU（需 admin token）
    - OPTIONS handler
    - _需求: 8.3_

  - [x] 6.8 实现 `src/app/api/admin/skus/[id]/route.ts`
    - PATCH handler 更新 SKU（需 admin token）
    - OPTIONS handler
    - _需求: 8.4_

  - [x] 6.9 实现 `src/app/api/admin/skus/batch-generate/route.ts`
    - POST handler 批量生成 SKU（需 admin token）
    - OPTIONS handler
    - _需求: 8.5_

  - [x] 6.10 实现 `src/app/api/admin/inventory/import/route.ts`
    - POST handler 导入库存项（需 admin token）
    - AES-GCM 加密每个库存项
    - 生成脱敏值
    - OPTIONS handler
    - _需求: 9.1, 9.2, 9.3, 9.4_

  - [x] 6.11 实现 `src/app/api/admin/payment-networks/route.ts`
    - GET handler 查询所有支付网络（需 admin token）
    - OPTIONS handler
    - _需求: 10.1_

  - [x] 6.12 实现 `src/app/api/admin/payment-networks/[id]/route.ts`
    - PATCH handler 更新支付网络（需 admin token）
    - OPTIONS handler
    - _需求: 10.2_

  - [x] 6.13 实现 `src/app/api/admin/deliveries/route.ts`
    - GET handler 查询所有发货记录（需 admin token）
    - OPTIONS handler
    - _需求: 11.1_

  - [x] 6.14 实现 `src/app/api/admin/notifications/route.ts`
    - GET handler 查询所有通知记录（需 admin token）
    - OPTIONS handler
    - _需求: 11.2_

  - [x] 6.15 实现 `src/app/api/admin/support-tickets/route.ts`
    - GET handler 查询所有售后工单（需 admin token）
    - OPTIONS handler
    - _需求: 11.3_

  - [ ]* 6.16 编写管理员 API 路由单元测试
    - 测试 admin token 验证（有效/无效/过期）
    - 测试手动发货流程
    - 测试库存导入加密
    - _需求: 6.4, 7.3, 9.2_

- [x] 7. Checkpoint - 确保管理员 API 路由编译通过
  - 确保所有测试通过，如有问题请询问用户。

- [x] 8. Wave 5：内部 API 路由 + MailChannels 集成
  - [x] 8.1 实现 `src/app/api/internal/orders/[id]/mark-paid/route.ts`
    - POST handler 标记订单已付款（需 x-internal-token）
    - 更新状态为 paid、记录 tx_hash 和 paid_at
    - 写入审计日志
    - OPTIONS handler
    - _需求: 12.1, 12.3, 12.4_

  - [x] 8.2 实现 `src/app/api/internal/orders/[id]/deliver/route.ts`
    - POST handler 执行自动发货（需 x-internal-token）
    - 解密库存项（AES-GCM）
    - 更新订单状态为 completed
    - 创建发货记录
    - 发送发货邮件（含解密明文）
    - 写入审计日志
    - OPTIONS handler
    - _需求: 12.2, 12.3, 12.4, 12.5_

  - [ ]* 8.3 编写内部 API 单元测试
    - 测试 internal token 验证
    - 测试发货流程（解密 + 邮件）
    - **Property 12: 邮件发送失败不阻塞主流程**
    - **验证: 需求 12.3, 13.4**

  - [x] 8.4 实现生产启动校验逻辑
    - 在共享工具库中添加 `requireProductionConfig()` 函数
    - 校验 ADMIN_PASSWORD（≥12）、ADMIN_SESSION_SECRET（≥32）、INTERNAL_API_SECRET（≥32）、INVENTORY_ENCRYPTION_KEY（≥32）
    - 在 Route Handler 中按需调用
    - _需求: 20.1, 20.2_

- [x] 9. Checkpoint - 确保内部 API 路由编译通过
  - 确保所有测试通过，如有问题请询问用户。

- [x] 10. Wave 6：切换、冒烟测试与清理
  - [x] 10.1 创建冒烟测试脚本 `scripts/smoke-test.sh`
    - 按 Cut-over 检查清单验证所有 30 个端点
    - 验证 CORS 头、安全头
    - 验证错误响应格式
    - _需求: 22.1, 22.2, 22.3, 14.1_

  - [ ]* 10.2 编写统一错误响应格式集成测试
    - **Property 13: 统一错误响应格式**
    - **验证: 需求 19.1, 19.3**

  - [x] 10.3 标记废弃文件
    - 在 `server.mjs` 顶部添加 `@deprecated` 注释
    - 在 `workers/payment-listener.mjs` 顶部添加 `@deprecated` 注释
    - 在 `src/integrations/usdt-listener.mjs` 顶部添加 `@deprecated` 注释
    - 删除 `src/integrations/mailer.mjs`（已被 `src/lib/api/mailer.ts` 替代）
    - 删除 `src/lib/redis.ts`（Phase 1 不需要）
    - 删除 `src/lib/db.ts`（Prisma 已被 D1 替代）
    - _需求: 23.1_

  - [x] 10.4 更新 `.gitignore` 和项目文档
    - 确保 `.dev.vars` 和 `.wrangler/` 在 `.gitignore` 中
    - 更新 README 说明新的开发/部署流程
    - _需求: 23.2, 23.3_

- [x] 11. 最终 Checkpoint - 全量验收
  - 确保所有测试通过，如有问题请询问用户。

## 备注

- 标记 `*` 的任务为可选任务，可跳过以加速 MVP 交付
- 每个任务引用具体需求编号以确保可追溯性
- Checkpoint 确保增量验证
- 属性测试验证设计文档中定义的通用正确性属性
- 单元测试验证具体示例和边界情况
- 所有 Route Handler 遵循统一模式：try/catch + HttpError + jsonResponse
- 所有 SQL 使用参数化查询（`?` 占位符）防止注入
- MailChannels 采用 fire-and-forget 模式，失败仅记录不阻塞

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.3", "1.4", "1.5"] },
    { "id": 1, "tasks": ["1.2"] },
    { "id": 2, "tasks": ["2.1", "2.2", "2.3"] },
    { "id": 3, "tasks": ["2.4", "2.6", "2.8", "2.10", "2.12", "2.14", "2.15", "2.16", "2.17"] },
    { "id": 4, "tasks": ["2.5", "2.7", "2.9", "2.11", "2.13"] },
    { "id": 5, "tasks": ["4.1", "4.2", "4.4", "4.5", "4.12", "4.13"] },
    { "id": 6, "tasks": ["4.3", "4.6", "4.7", "4.8", "4.9", "4.10", "4.11"] },
    { "id": 7, "tasks": ["4.14"] },
    { "id": 8, "tasks": ["6.1", "6.2", "6.5", "6.7", "6.11", "6.13", "6.14", "6.15"] },
    { "id": 9, "tasks": ["6.3", "6.4", "6.6", "6.8", "6.9", "6.10", "6.12"] },
    { "id": 10, "tasks": ["6.16"] },
    { "id": 11, "tasks": ["8.1", "8.2", "8.4"] },
    { "id": 12, "tasks": ["8.3"] },
    { "id": 13, "tasks": ["10.1", "10.2", "10.3", "10.4"] }
  ]
}
```
