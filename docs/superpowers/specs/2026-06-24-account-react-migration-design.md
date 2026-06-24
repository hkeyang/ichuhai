# 个人中心迁移到 React — 设计文档

日期：2026-06-24
分支：feat/cloudflare-backend-migration
状态：已与用户逐节确认，待复核

## 背景与目标

当前前端是一个单文件原生 JS 的 SPA（根目录 `app.js`，约 400KB，由 `scripts/sync-public-app.mjs` 同步到 `public/app.js`）。它维护一个巨大的全局 `state` 对象，所有页面通过 `shell()` 中的一行 `app.innerHTML = header() + main` **整页重建**来渲染，没有局部更新。

由此导致个人中心的三个痛点：

1. **卡顿/难刷新**：点击左侧标签触发 `selectAccountSection` → 改 state → `route()` → 整页 `innerHTML` 重建 + 全量 `persist()`（一次写约 20 个 localStorage key）+ `account()` 结尾无条件 `loadAccountOrders()` 又触发一到两次 `route()`。
2. **大量缓存**：用户、钱包余额、消息等都缓存在 localStorage，账号页直接读缓存，数据粘滞、过期。
3. **排版不一致**：账号设置曾走一套放大版专属样式（已在前置任务中降级统一，本次不再涉及）。

**目标**：把整个个人中心（`/account`）迁移成真正的 React 页面，根治卡顿与缓存问题，并把这套做法沉淀为**以后逐页迁移的可复用模板**。

**非目标**：本次不迁移首页/商品/结算/支付/后台/登录等其他页面，它们继续由 app.js 托管。卡顿根治本次只覆盖账号页，其余页面待后续逐页迁移。

## 已确认的关键决策

| 决策点 | 选择 |
|--------|------|
| 迁移范围 | 个人中心全部面板（订单/余额/售后/账号设置/帮助） |
| 共存模式 | 独立 Next.js React 路由，`/account` 不再加载 app.js |
| 数据来源 | 服务器实时拉取（`/api/me/*`），不再依赖 localStorage 缓存 |
| 顶部 header | 全功能 React header（logo/导航/货币切换/消息中心/账号下拉/登录态） |
| 状态管理 | 原生 React hooks + 轻量 SessionContext，零新依赖 |
| 余额后端 | 只建「读」接口 + 表结构（不做充值入账/扣减/退款等动钱逻辑） |

## 核实到的现状事实（设计基于这些，而非假设）

- `/account` **已经是** Next.js 路由（`src/app/account/page.tsx`），但当前仅渲染 `AppRouteShell`（注入 app.js 整页托管）。
- app.js **按页注入**（在各 `page.tsx` 里通过 `InteractiveAppScript`，不在 `layout.tsx`），所以 `/account` 不注入 app.js 不影响其他页。
- app.js 在 `app.js:6114` 拦截站内 `/` 链接走自己的 hash 路由 —— 需要为 `/account` 开放行白名单。
- 后端接口现状（已逐个读源码确认）：
  - `GET /api/me/orders` → `{ orders: [...] }`，需 `Authorization: Bearer <token>`。
  - `PATCH /api/me/profile`（仅改 nickname）→ `{ user: {id,email,nickname,defaultCurrency} }`，**无 GET**。
  - `PATCH /api/me/preferences`（仅改 defaultCurrency）→ `{ defaultCurrency }`。
  - `PATCH /api/me/password`（currentPassword,newPassword）→ `{ ok: true }`。
  - `POST /api/auth/login` → `{ token, expiresInDays, user: {id,email,nickname,authType,defaultCurrency} }`。
- **余额是前端假数据**：账号页显示的 128.60 USDT 来自 `app.js:408` localStorage 默认值硬编码，从未向服务器请求。users 表无 balance 列，无余额流水表，无面向用户的余额接口（`admin/users/[id]` 里的 `walletAddresses` 是订单聚合出的 TRC20 收款地址，非账户余额）。

## 架构设计

### 目录结构

```
src/app/account/
  page.tsx                 # 服务端入口：metadata（noindex）+ 渲染 <AccountApp/>
  AccountApp.tsx           # "use client" 根组件：会话态 + activeSection + 渲染 header/侧栏/主面板
  panels/
    OrdersPanel.tsx        # 我的订单（GET /api/me/orders）
    WalletPanel.tsx        # 余额中心 + 全部流水（GET /api/me/balance）
    SupportPanel.tsx       # 售后服务 + 售后详情（静态/本地，沿用现状）
    ProfilePanel.tsx       # 账号设置（GET/PATCH profile、PATCH preferences、PATCH password）
    HelpPanel.tsx          # 帮助中心（静态）
  hooks/
    useMeProfile.ts        # 当前用户资料 + 余额（含 balanceUsdt）
    useMeOrders.ts         # 订单列表
    useMeBalance.ts        # 余额流水
src/components/site/
  SiteHeader.tsx           # 全功能 React header
src/lib/session/
  SessionContext.tsx       # 轻量会话 Context（user/token/currency/messages）
  api.ts                   # fetch 封装：自动带 Bearer、统一错误/401 处理
```

样式零改动：复用现有 `styles.css` 的 `member-center` / `member-panel` / `member-nav` 等类，外观与当前（已统一后的）账号页一致。

### 状态分层（根治卡顿的核心）

三层，互不耦合：

1. **会话态 `SessionContext`**：`user`、`token`、`fiatCurrency`、`messages`。token 从 localStorage 读取作为唯一持久来源；header 与账号页共享同一份。切货币等只更新 Context，不触发整页重建。
2. **页面 UI 态（`AccountApp` 内 `useState`）**：`activeSection`（当前标签）、表单输入、筛选条件。**点标签 = `setActiveSection()` → 只重渲染主面板**，侧栏与 header 不动。这是替换 `app.innerHTML=整页` 的关键。
3. **服务器数据（自定义 hook）**：`useMeOrders` / `useMeProfile` / `useMeBalance`，进入面板时 fetch，返回 `{ data, loading, error, reload }`。订单/资料/余额实时来自服务器，**不读 localStorage 缓存**——根治"大量缓存"。

对比：现状点一次标签 = 整页 innerHTML 重建 + 全量 persist + 重复 route()；新方案点标签 = 一次局部 setState。

### 与 app.js 的边界 / 链接桥接

- app.js 按页注入，`/account` 不注入即可；其他页不受影响。
- **桥接点（唯一需要改 app.js 的地方）**：在 `app.js:6114` 的站内链接拦截逻辑里给 `/account` 加白名单——命中则不 `preventDefault`，走浏览器真实导航进入 React 路由。改动极小。改完需 `node scripts/sync-public-app.mjs` 同步到 `public/app.js`。
- React 账号页内指向其他页的链接（`/products`、`/login` 等）用普通 `<a href>`，浏览器导航后由 app.js 接管。
- 退出登录：清 token + Context，跳 `/login`（app.js 接管的登录页），保持现有行为。

### 数据接口契约

复用现有接口，并**新增以下读接口与表结构**（本次需要做的后端改动）：

| 用途 | 接口 | 方法 | 状态 |
|------|------|------|------|
| 订单列表 | `/api/me/orders` | GET | 已存在 |
| 偏好（默认货币） | `/api/me/preferences` | PATCH | 已存在 |
| 修改密码 | `/api/me/password` | PATCH | 已存在 |
| 修改昵称 | `/api/me/profile` | PATCH | 已存在 |
| **读取当前用户资料 + 余额** | `/api/me/profile` | **GET（新增）** | 新增 |
| **读取余额流水** | `/api/me/balance` | **GET（新增）** | 新增 |

新增 GET `/api/me/profile` 返回 `{ user: {id,email,nickname,defaultCurrency,balanceUsdt} }`。这是"服务器为唯一真相"的前提——刷新页面后账号页必须能重新从服务器取回身份与余额，否则不依赖缓存就无法工作。

### 余额后端（只读，不动钱）

- 新增 migration：users 表加 `balance_usdt` 列（默认 '0'），新建余额流水表（如 `wallet_ledgers`：id / user_id / type / amount_usdt / balance_after / note / created_at）。
- 新增 `GET /api/me/balance` 返回当前余额 + 流水列表。
- **不实现**充值入账、下单扣减、退款、后台调账、并发一致性等"动钱"逻辑——这些属于独立的完整钱包系统，应单独立项。初期余额对所有用户显示 0.00，流水为空。
- 充值按钮暂保持"待开放"提示。

### 错误处理与边界态

- 每个数据 hook 三态：加载中（骨架/「加载中」）、错误（错误文案 + 重试）、空（复用现有 empty-state 文案）。
- 未登录：复刻现有访客视图（"登录后管理订单"）。
- token 失效（401）：清会话跳登录。
- 无后端接口的面板（帮助中心、内容/卡密示例、售后）：原样静态搬，不强行接数据。

## 验证与收尾

- `npm run build`（Next 构建）确保类型与编译通过；新增 migration 在本地 D1 应用并验证。
- 手动验证：登录后进 `/account`，逐个点 5 个标签确认**不卡、局部刷新**；账号设置/余额数据来自服务器不再粘滞；排版与其他标签一致；从其他页点"个人中心"能正常跳入 React 路由；退出登录流程正常。
- 清理临时文件。
- 本套做法（独立路由 + SessionContext + 局部 setState + 数据 hook + 复用 styles.css + app.js 链接白名单 + sync 脚本）即为**后续逐页迁移的标准模板**。

## 风险与诚实说明

1. **app.js 不会因本次工作消失**。仅账号页迁移，卡顿根治只覆盖账号页；"以后改别处不出问题"需逐页迁完才完全实现。
2. **余额是新功能而非"顺手"**。本次只建只读骨架（表 + 读接口），真正的充值/扣减/退款是独立的动钱系统，不在本次范围，需另行立项做完整设计。
3. 迁移期间 `/account` 与其他 app.js 页面在导航体验上需保证无缝（链接白名单是关键，需重点测试）。
