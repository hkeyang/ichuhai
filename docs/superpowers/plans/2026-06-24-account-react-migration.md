# 个人中心迁移到 React 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 `/account` 个人中心从 app.js 整页托管迁移成真正的 Next.js React 路由，根治标签切换卡顿与 localStorage 缓存粘滞，并沉淀为后续逐页迁移的模板。

**Architecture:** `/account` 改为不注入 app.js 的 React 客户端页。三层状态：跨页会话态用轻量 `SessionContext`（与 React header 共享，token 仍存 `gfAuthToken`）；页面内 UI 态（当前标签/表单）用 `useState`，点标签只局部 setState 重渲染主面板；服务器数据用自定义 hook 实时 fetch（`/api/me/*`），不读本地缓存。新增两个只读后端接口与余额表结构（不做动钱逻辑）。

**Tech Stack:** Next.js 16 + React 19（无新依赖）、Cloudflare D1（wrangler migrations）、复用现有 `styles.css`。

**验证方式:** 项目无单元测试框架；每个任务以 `npm run build`（tsc 类型检查 + Next 编译）为自动化关卡，配合手动验证。不引入测试框架（超出本次范围）。

**关键既有事实（已核实）:**
- token：`localStorage.gfAuthToken` + `localStorage.gfAuthExpiresAt`（毫秒时间戳），过期判定 `expiresAt <= Date.now()`。
- 后端鉴权：`resolveUserId(request, env): Promise<string|null>`（`@/lib/api/user-session`）。
- API helper：`jsonResponse(data,status,request,env)`、`optionsResponse(request,env)`（`@/lib/api/cors`）；`parseBody<T>(request)`（`@/lib/api/body-parser`）；`HttpError`（`@/lib/api/errors`）；`ensureDatabaseReady(db)`（`@/lib/api/bootstrap`）。
- D1 库：`(await getCloudflareContext()).env as CloudflareEnv`，`.DB`。
- migration 应用：`wrangler d1 migrations apply ichuhai-db --local`（下一个编号 0007）。
- app.js 链接拦截在 `app.js:6114` 起，命中站内 `/` 链接会 `preventDefault` + 走 hash 路由；源文件改后需 `node scripts/sync-public-app.mjs` 同步到 `public/app.js`。
- users 表当前列：id, telegram_id, telegram_username, default_currency, last_login_at, created_at（无 balance）。

---

## 阶段 A：后端只读接口与余额表结构

### Task 1: 新增余额表结构 migration

**Files:**
- Create: `migrations/0007_user_balance.sql`

- [ ] **Step 1: 写 migration**

```sql
-- 用户余额（只读骨架：本次不实现充值入账/扣减/退款等动钱逻辑）
ALTER TABLE users ADD COLUMN balance_usdt TEXT NOT NULL DEFAULT '0';

CREATE TABLE IF NOT EXISTS wallet_ledgers (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,            -- recharge | consume | refund | adjust
  amount_usdt TEXT NOT NULL,     -- 正负字符串
  balance_after TEXT NOT NULL,   -- 该笔之后的余额快照
  note TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_wallet_ledgers_user ON wallet_ledgers(user_id, created_at DESC);
```

- [ ] **Step 2: 本地应用 migration**

Run: `npx wrangler d1 migrations apply ichuhai-db --local`
Expected: 输出包含 `0007_user_balance.sql` 已应用，无错误。

- [ ] **Step 3: 验证列存在**

Run: `npx wrangler d1 execute ichuhai-db --local --command "SELECT balance_usdt FROM users LIMIT 1"`
Expected: 查询成功（无 "no such column" 错误），返回空集或 '0'。

- [ ] **Step 4: 提交**

```bash
git add migrations/0007_user_balance.sql
git commit -m "feat(db): add user balance column and wallet_ledgers table"
```

---

### Task 2: 给 `/api/me/profile` 增加 GET（读取资料+余额）

**Files:**
- Modify: `src/app/api/me/profile/route.ts`

- [ ] **Step 1: 在文件顶部 import 区补充 ensureDatabaseReady（已 import 则跳过）**

确认文件已有 `import { ensureDatabaseReady } from "@/lib/api/bootstrap";`（现状已有）。

- [ ] **Step 2: 新增 GET 导出（追加到 OPTIONS 之后、PATCH 之前或之后均可）**

```typescript
export async function GET(request: Request) {
  const { env } = await getCloudflareContext();
  const cloudflareEnv = env as CloudflareEnv;

  try {
    const userId = await resolveUserId(request, cloudflareEnv);
    if (!userId) throw new HttpError(401, "unauthorized");

    const db = cloudflareEnv.DB;
    await ensureDatabaseReady(db);

    const user = await db
      .prepare("SELECT id, email, nickname, default_currency, balance_usdt FROM users WHERE id = ?")
      .bind(userId)
      .first<{
        id: string;
        email: string | null;
        nickname: string | null;
        default_currency: string;
        balance_usdt: string | null;
      }>();
    if (!user) throw new HttpError(404, "user not found");

    return jsonResponse(
      {
        user: {
          id: user.id,
          email: user.email,
          nickname: user.nickname,
          defaultCurrency: user.default_currency,
          balanceUsdt: user.balance_usdt ?? "0",
        },
      },
      200,
      request,
      cloudflareEnv
    );
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse({ error: error.message }, error.status, request, cloudflareEnv);
    }
    return jsonResponse({ error: "internal server error" }, 500, request, cloudflareEnv);
  }
}
```

- [ ] **Step 3: 类型检查通过**

Run: `npm run build`
Expected: 编译成功，无 TS 错误。

- [ ] **Step 4: 提交**

```bash
git add src/app/api/me/profile/route.ts
git commit -m "feat(api): add GET /api/me/profile returning profile and balance"
```

---

### Task 3: 新增 `GET /api/me/balance`（余额流水）

**Files:**
- Create: `src/app/api/me/balance/route.ts`

- [ ] **Step 1: 写 route**

```typescript
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ensureDatabaseReady } from "@/lib/api/bootstrap";
import { jsonResponse, optionsResponse } from "@/lib/api/cors";
import { HttpError } from "@/lib/api/errors";
import { resolveUserId } from "@/lib/api/user-session";

interface LedgerRow {
  id: string;
  type: string;
  amount_usdt: string;
  balance_after: string;
  note: string | null;
  created_at: string;
}

export async function OPTIONS(request: Request) {
  const { env } = await getCloudflareContext();
  return optionsResponse(request, env as CloudflareEnv);
}

export async function GET(request: Request) {
  const { env } = await getCloudflareContext();
  const cloudflareEnv = env as CloudflareEnv;

  try {
    const userId = await resolveUserId(request, cloudflareEnv);
    if (!userId) throw new HttpError(401, "unauthorized");

    const db = cloudflareEnv.DB;
    await ensureDatabaseReady(db);

    const user = await db
      .prepare("SELECT balance_usdt FROM users WHERE id = ?")
      .bind(userId)
      .first<{ balance_usdt: string | null }>();
    if (!user) throw new HttpError(404, "user not found");

    const ledger = await db
      .prepare(
        `SELECT id, type, amount_usdt, balance_after, note, created_at
         FROM wallet_ledgers WHERE user_id = ?
         ORDER BY created_at DESC LIMIT 50`
      )
      .bind(userId)
      .all<LedgerRow>();

    return jsonResponse(
      {
        balanceUsdt: user.balance_usdt ?? "0",
        ledger: ledger.results.map((row) => ({
          id: row.id,
          type: row.type,
          amountUsdt: row.amount_usdt,
          balanceAfter: row.balance_after,
          note: row.note,
          createdAt: row.created_at,
        })),
      },
      200,
      request,
      cloudflareEnv
    );
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse({ error: error.message }, error.status, request, cloudflareEnv);
    }
    return jsonResponse({ error: "internal server error" }, 500, request, cloudflareEnv);
  }
}
```

- [ ] **Step 2: 类型检查通过**

Run: `npm run build`
Expected: 编译成功。

- [ ] **Step 3: 提交**

```bash
git add src/app/api/me/balance/route.ts
git commit -m "feat(api): add GET /api/me/balance returning balance and ledger"
```

---

## 阶段 B：前端会话基建

### Task 4: 会话 token 工具 + API fetch 封装

**Files:**
- Create: `src/lib/session/token.ts`
- Create: `src/lib/session/api.ts`

- [ ] **Step 1: 写 token.ts（读取与 app.js 同源的 token，含过期判定）**

```typescript
"use client";

const TOKEN_KEY = "gfAuthToken";
const EXPIRES_KEY = "gfAuthExpiresAt";

export function readAuthToken(): string {
  if (typeof window === "undefined") return "";
  const token = window.localStorage.getItem(TOKEN_KEY) || "";
  const expiresAt = Number(window.localStorage.getItem(EXPIRES_KEY) || 0);
  if (token && expiresAt && expiresAt <= Date.now()) {
    clearAuthToken();
    return "";
  }
  return token;
}

export function clearAuthToken(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(EXPIRES_KEY);
  window.localStorage.removeItem("gfUser");
}
```

- [ ] **Step 2: 写 api.ts（自动带 Bearer，统一 401 与错误）**

```typescript
"use client";

import { readAuthToken, clearAuthToken } from "./token";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = readAuthToken();
  const headers = new Headers(options.headers);
  if (token) headers.set("authorization", `Bearer ${token}`);
  if (options.body && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  const response = await fetch(path, { ...options, headers });
  const data = await response.json().catch(() => ({}));

  if (response.status === 401) {
    clearAuthToken();
    throw new ApiError(401, (data as { error?: string }).error || "未登录或登录已过期");
  }
  if (!response.ok) {
    throw new ApiError(response.status, (data as { error?: string }).error || "请求失败");
  }
  return data as T;
}
```

- [ ] **Step 3: 类型检查通过**

Run: `npm run build`
Expected: 编译成功。

- [ ] **Step 4: 提交**

```bash
git add src/lib/session/token.ts src/lib/session/api.ts
git commit -m "feat(session): add auth token reader and api fetch wrapper"
```

---

### Task 5: SessionContext（跨页会话态）

**Files:**
- Create: `src/lib/session/SessionContext.tsx`

- [ ] **Step 1: 写 Context（user/token/currency + 登出）**

```typescript
"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { readAuthToken, clearAuthToken } from "./token";

export interface SessionUser {
  id: string;
  email: string | null;
  nickname: string | null;
  defaultCurrency: string;
  balanceUsdt: string;
}

interface SessionValue {
  token: string;
  user: SessionUser | null;
  setUser: (user: SessionUser | null) => void;
  logout: () => void;
}

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState("");
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    setToken(readAuthToken());
  }, []);

  const logout = useCallback(() => {
    clearAuthToken();
    setToken("");
    setUser(null);
    window.location.href = "/login";
  }, []);

  return (
    <SessionContext.Provider value={{ token, user, setUser, logout }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
```

- [ ] **Step 2: 类型检查通过**

Run: `npm run build`
Expected: 编译成功。

- [ ] **Step 3: 提交**

```bash
git add src/lib/session/SessionContext.tsx
git commit -m "feat(session): add SessionProvider and useSession hook"
```

---

### Task 6: 服务器数据 hooks

**Files:**
- Create: `src/app/account/hooks/useMeProfile.ts`
- Create: `src/app/account/hooks/useMeOrders.ts`
- Create: `src/app/account/hooks/useMeBalance.ts`

- [ ] **Step 1: 写通用类型 + useMeProfile.ts**

```typescript
"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/session/api";
import type { SessionUser } from "@/lib/session/SessionContext";

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string;
  reload: () => void;
}

export function useMeProfile(token: string): AsyncState<SessionUser> {
  const [data, setData] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch<{ user: SessionUser }>("/api/me/profile");
      setData(res.user);
    } catch (e) {
      setError(e instanceof Error ? e.message : "资料加载失败");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, reload: load };
}
```

- [ ] **Step 2: 写 useMeOrders.ts**

```typescript
"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/session/api";
import type { AsyncState } from "./useMeProfile";

export interface MeOrder {
  orderId: string;
  orderNo: string;
  status: string;
  email: string | null;
  amountUsdt: string;
  createdAt: string;
  productSnapshot: Record<string, unknown>;
  skuSnapshot: Record<string, unknown>;
}

export function useMeOrders(token: string): AsyncState<MeOrder[]> {
  const [data, setData] = useState<MeOrder[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch<{ orders: MeOrder[] }>("/api/me/orders");
      setData(res.orders);
    } catch (e) {
      setError(e instanceof Error ? e.message : "订单加载失败");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, reload: load };
}
```

- [ ] **Step 3: 写 useMeBalance.ts**

```typescript
"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/session/api";
import type { AsyncState } from "./useMeProfile";

export interface LedgerEntry {
  id: string;
  type: string;
  amountUsdt: string;
  balanceAfter: string;
  note: string | null;
  createdAt: string;
}

export interface BalanceData {
  balanceUsdt: string;
  ledger: LedgerEntry[];
}

export function useMeBalance(token: string): AsyncState<BalanceData> {
  const [data, setData] = useState<BalanceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch<BalanceData>("/api/me/balance");
      setData(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "余额加载失败");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, reload: load };
}
```

- [ ] **Step 4: 类型检查通过**

Run: `npm run build`
Expected: 编译成功。

- [ ] **Step 5: 提交**

```bash
git add src/app/account/hooks/
git commit -m "feat(account): add server data hooks (profile/orders/balance)"
```

---

## 阶段 C：React 个人中心页面

### Task 7: 账号面板组件（订单/余额/售后/账号设置/帮助）

**Files:**
- Create: `src/app/account/panels/OrdersPanel.tsx`
- Create: `src/app/account/panels/WalletPanel.tsx`
- Create: `src/app/account/panels/SupportPanel.tsx`
- Create: `src/app/account/panels/ProfilePanel.tsx`
- Create: `src/app/account/panels/HelpPanel.tsx`

> 复用现有 `styles.css` 类（`member-panel` / `profile-form` / `order-tabs` 等），外观与当前账号页一致。

- [ ] **Step 1: 写 OrdersPanel.tsx（三态 + 列表）**

```tsx
"use client";

import { useMeOrders } from "../hooks/useMeOrders";

export function OrdersPanel({ token }: { token: string }) {
  const { data, loading, error, reload } = useMeOrders(token);

  if (loading) return <section className="member-panel"><p>加载中…</p></section>;
  if (error)
    return (
      <section className="member-panel">
        <p>{error}</p>
        <button className="primary small" onClick={reload} type="button">重试</button>
      </section>
    );
  const orders = data ?? [];
  if (!orders.length)
    return <section className="member-panel"><div className="account-empty"><b>暂无订单</b><span>下单后订单会显示在这里。</span></div></section>;

  return (
    <section className="member-panel">
      <div className="section-toolbar">
        <b>我的订单</b>
        <button className="primary small" onClick={reload} type="button">同步订单</button>
      </div>
      <div className="member-order-list">
        {orders.map((o) => {
          const product = (o.productSnapshot as { name?: string }).name || "商品";
          return (
            <div className="member-order-cells" key={o.orderId}>
              <span>{o.orderNo}</span>
              <span>{product}</span>
              <span>{o.status}</span>
              <strong>{Number(o.amountUsdt).toFixed(2)} USDT</strong>
              <small>{o.createdAt}</small>
            </div>
          );
        })}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: 写 WalletPanel.tsx（真实余额 + 流水，充值占位）**

```tsx
"use client";

import { useMeBalance } from "../hooks/useMeBalance";

export function WalletPanel({ token }: { token: string }) {
  const { data, loading, error, reload } = useMeBalance(token);

  if (loading) return <section className="member-panel"><p>加载中…</p></section>;
  if (error)
    return (
      <section className="member-panel">
        <p>{error}</p>
        <button className="primary small" onClick={reload} type="button">重试</button>
      </section>
    );

  const balance = Number(data?.balanceUsdt ?? "0");
  const ledger = data?.ledger ?? [];

  return (
    <>
      <section className="member-panel">
        <div className="section-toolbar"><b>账户余额</b></div>
        <strong style={{ fontSize: 28 }}>{balance.toFixed(2)} USDT</strong>
        <p className="muted">充值功能开放后可在此入账。</p>
        <button className="primary small" type="button" disabled>充值（待开放）</button>
      </section>
      <section className="member-panel">
        <div className="section-toolbar"><b>余额流水</b></div>
        {ledger.length ? (
          <div className="ledger-list">
            {ledger.map((l) => (
              <div key={l.id}>
                <span>{l.type}</span>
                <b>{l.amountUsdt} USDT</b>
                <small>{l.createdAt}</small>
              </div>
            ))}
          </div>
        ) : (
          <div className="account-empty"><b>暂无流水</b><span>充值或消费记录会显示在这里。</span></div>
        )}
      </section>
    </>
  );
}
```

- [ ] **Step 3: 写 SupportPanel.tsx 与 HelpPanel.tsx（静态，沿用现状文案）**

`SupportPanel.tsx`：
```tsx
"use client";

const SUPPORT_TELEGRAM_URL = "https://t.me/ichuhai";

export function SupportPanel() {
  return (
    <section className="member-panel">
      <div className="section-toolbar"><b>售后服务</b></div>
      <p>如需对订单或充值相关问题发起售后申请，欢迎随时与我们联系。</p>
      <a className="primary small link-button" href={SUPPORT_TELEGRAM_URL} target="_blank" rel="noopener">联系客服</a>
    </section>
  );
}
```

`HelpPanel.tsx`：
```tsx
"use client";

const FAQS: Array<[string, string]> = [
  ["购买说明", "选择商品和规格后进入结算，订单会绑定当前邮箱账号。"],
  ["充值说明", "余额单位为 USDT，支付宝通过第三方聚合支付折算入账。"],
  ["USDT TRC20 支付说明", "仅支持 TRC20，转账金额和网络必须与订单一致，到账后进入确认。"],
  ["发货说明", "自动发货会展示卡密、账号密码、兑换码、链接或文字说明；人工商品由后台处理。"],
  ["售后规则", "用户提交工单后，后台人工处理补发、退款、驳回或继续沟通。"],
];

export function HelpPanel() {
  return (
    <section className="member-panel help-list">
      {FAQS.map(([title, text]) => (
        <article key={title}><b>{title}</b><p>{text}</p></article>
      ))}
    </section>
  );
}
```

- [ ] **Step 4: 写 ProfilePanel.tsx（昵称/货币/密码，对接 PATCH 接口）**

```tsx
"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/session/api";
import type { SessionUser } from "@/lib/session/SessionContext";

const CURRENCIES = ["CNY", "GBP", "EUR", "AUD", "JPY", "HKD", "KRW"];

export function ProfilePanel({
  user,
  onUserChange,
  onToast,
}: {
  user: SessionUser;
  onUserChange: (u: SessionUser) => void;
  onToast: (msg: string) => void;
}) {
  const [nickname, setNickname] = useState(user.nickname ?? "");
  const [currency, setCurrency] = useState(user.defaultCurrency);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);

  async function saveProfile() {
    const name = nickname.trim();
    if (!name || name.length > 20) return onToast("昵称需为 1-20 个字符");
    setSaving(true);
    try {
      const res = await apiFetch<{ user: { nickname: string } }>("/api/me/profile", {
        method: "PATCH",
        body: JSON.stringify({ nickname: name }),
      });
      await apiFetch("/api/me/preferences", {
        method: "PATCH",
        body: JSON.stringify({ defaultCurrency: currency }),
      });
      onUserChange({ ...user, nickname: res.user.nickname, defaultCurrency: currency });
      onToast("账号资料已保存");
    } catch (e) {
      onToast(e instanceof Error ? e.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  async function changePassword() {
    if (!oldPassword) return onToast("请输入旧密码");
    setSaving(true);
    try {
      await apiFetch("/api/me/password", {
        method: "PATCH",
        body: JSON.stringify({ currentPassword: oldPassword, newPassword }),
      });
      setOldPassword("");
      setNewPassword("");
      onToast("密码已修改");
    } catch (e) {
      onToast(e instanceof Error ? e.message : "修改失败");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <section className="member-panel profile-form">
        <div className="section-toolbar"><b>账号资料</b></div>
        <label>昵称<input value={nickname} maxLength={20} onChange={(e) => setNickname(e.target.value)} placeholder="请输入昵称" /></label>
        <label>邮箱账号<input value={user.email ?? ""} disabled /></label>
        <label>默认货币
          <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
            {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <button className="primary small" onClick={saveProfile} disabled={saving} type="button">保存账号资料</button>
      </section>
      <section className="member-panel profile-form">
        <div className="section-toolbar"><b>修改密码</b></div>
        <label>旧密码<input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="请输入旧密码" /></label>
        <label>新密码<input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="请输入新密码" /></label>
        <button className="primary small" onClick={changePassword} disabled={saving} type="button">修改密码</button>
      </section>
    </>
  );
}
```

- [ ] **Step 5: 类型检查通过**

Run: `npm run build`
Expected: 编译成功。

- [ ] **Step 6: 提交**

```bash
git add src/app/account/panels/
git commit -m "feat(account): add React panels (orders/wallet/support/profile/help)"
```

---

### Task 8: 全功能 React header

**Files:**
- Create: `src/components/site/SiteHeader.tsx`

> 货币切换/消息中心若依赖 app.js 全局状态，本组件先实现 logo+导航+账号下拉+登录态；货币切换以 SessionContext 货币为准（仅 UI 展示，落库走 preferences）。

- [ ] **Step 1: 写 SiteHeader.tsx**

```tsx
"use client";

import { useState } from "react";
import { useSession } from "@/lib/session/SessionContext";

export function SiteHeader() {
  const { user, logout } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const name = user?.nickname || user?.email?.split("@")[0] || "用户";

  return (
    <header className="topbar">
      <a className="brand" href="/" aria-label="ichuhai 首页">ichuhai</a>
      <nav className="nav">
        <a href="/products">商品</a>
        <a href="/#/faq">FAQ</a>
      </nav>
      <div className="account-popover-wrap">
        {user ? (
          <>
            <button className="pill account-trigger logged-in" onClick={() => setMenuOpen((v) => !v)} type="button">
              {name}
            </button>
            {menuOpen && (
              <div className="account-dropdown">
                <a href="/account">个人中心</a>
                <button onClick={logout} type="button">退出登录</button>
              </div>
            )}
          </>
        ) : (
          <a className="pill" href="/login">登录</a>
        )}
      </div>
    </header>
  );
}
```

- [ ] **Step 2: 类型检查通过**

Run: `npm run build`
Expected: 编译成功。

- [ ] **Step 3: 提交**

```bash
git add src/components/site/SiteHeader.tsx
git commit -m "feat(site): add React SiteHeader with session-aware account menu"
```

---

### Task 9: AccountApp 根组件（侧栏 + 标签局部切换）

**Files:**
- Create: `src/app/account/AccountApp.tsx`

- [ ] **Step 1: 写 AccountApp.tsx**

```tsx
"use client";

import { useState, useEffect } from "react";
import { SessionProvider, useSession } from "@/lib/session/SessionContext";
import { SiteHeader } from "@/components/site/SiteHeader";
import { useMeProfile } from "./hooks/useMeProfile";
import { OrdersPanel } from "./panels/OrdersPanel";
import { WalletPanel } from "./panels/WalletPanel";
import { SupportPanel } from "./panels/SupportPanel";
import { ProfilePanel } from "./panels/ProfilePanel";
import { HelpPanel } from "./panels/HelpPanel";

type SectionKey = "orders" | "wallet" | "support" | "profile" | "help";

const SECTIONS: Array<{ key: SectionKey; label: string; desc: string }> = [
  { key: "orders", label: "我的订单", desc: "查看和管理您的订单，追踪订单状态与售后进度。" },
  { key: "wallet", label: "余额中心", desc: "管理 USDT 余额、充值记录与消费流水。" },
  { key: "support", label: "售后服务", desc: "如需对订单或充值相关问题发起售后申请，欢迎随时与我们联系。" },
  { key: "profile", label: "账号设置", desc: "管理您的账号与安全设置。" },
  { key: "help", label: "帮助中心", desc: "查看购买、充值、TRC20 支付、发货和售后规则。" },
];

function GuestView() {
  return (
    <section className="account-console account-console-guest">
      <div className="account-console-panel">
        <h1>登录后管理订单、余额与售后</h1>
        <p>使用邮箱账号登录。</p>
        <div className="console-actions">
          <a className="primary account-login" href="/login">邮箱登录</a>
          <a className="secondary" href="/login">创建账号</a>
        </div>
      </div>
    </section>
  );
}

function Toast({ msg }: { msg: string }) {
  if (!msg) return null;
  return <div className="toast show" role="status">{msg}</div>;
}

function AccountInner() {
  const { token, user, setUser } = useSession();
  const profile = useMeProfile(token);
  const [section, setSection] = useState<SectionKey>("orders");
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (profile.data) setUser(profile.data);
  }, [profile.data, setUser]);

  function showToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(""), 2400);
  }

  if (!token) {
    return (
      <>
        <SiteHeader />
        <main className="page account-console-shell"><GuestView /></main>
      </>
    );
  }
  if (profile.loading && !user) {
    return (
      <>
        <SiteHeader />
        <main className="member-page"><section className="member-panel"><p>加载中…</p></section></main>
      </>
    );
  }
  if (profile.error && !user) {
    return (
      <>
        <SiteHeader />
        <main className="member-page">
          <section className="member-panel">
            <p>{profile.error}</p>
            <button className="primary small" onClick={profile.reload} type="button">重试</button>
          </section>
        </main>
      </>
    );
  }

  const activeUser = user ?? profile.data;
  if (!activeUser) return null;
  const meta = SECTIONS.find((s) => s.key === section)!;

  return (
    <>
      <SiteHeader />
      <main className="member-page">
        <section className="member-center">
          <aside className="member-sidebar">
            <div className="member-user">
              <h2>{activeUser.nickname || activeUser.email}</h2>
              <div className="member-balance">
                <span>账户余额</span>
                <b>{Number(activeUser.balanceUsdt || "0").toFixed(2)} USDT</b>
              </div>
              <button onClick={() => setSection("wallet")} type="button">充值</button>
            </div>
            <nav className="member-nav">
              {SECTIONS.map((s) => (
                <button
                  key={s.key}
                  className={s.key === section ? "active" : ""}
                  onClick={() => setSection(s.key)}
                  type="button"
                >
                  {s.label}
                </button>
              ))}
            </nav>
            <button className="member-logout" onClick={() => useSessionLogout()} type="button">退出登录</button>
          </aside>
          <section className="member-main">
            <header className="member-title">
              <h1>个人中心 / {meta.label}</h1>
              <p>{meta.desc}</p>
            </header>
            {section === "orders" && <OrdersPanel token={token} />}
            {section === "wallet" && <WalletPanel token={token} />}
            {section === "support" && <SupportPanel />}
            {section === "profile" && <ProfilePanel user={activeUser} onUserChange={setUser} onToast={showToast} />}
            {section === "help" && <HelpPanel />}
          </section>
        </section>
      </main>
      <Toast msg={toast} />
    </>
  );
}

// 退出登录需在组件内拿到 logout；用包装避免在 JSX 内联调用 hook
function useSessionLogout() {
  // placeholder removed in Step 2 fix
}

export function AccountApp() {
  return (
    <SessionProvider>
      <AccountInner />
    </SessionProvider>
  );
}
```

- [ ] **Step 2: 修正退出登录调用（移除 useSessionLogout 占位，直接用 session.logout）**

把 `AccountInner` 顶部解构改为 `const { token, user, setUser, logout } = useSession();`，并把退出按钮改为 `onClick={logout}`，删除底部 `useSessionLogout` 函数。最终退出按钮：

```tsx
<button className="member-logout" onClick={logout} type="button">退出登录</button>
```

- [ ] **Step 3: 类型检查通过**

Run: `npm run build`
Expected: 编译成功，无未使用符号告警导致的错误。

- [ ] **Step 4: 提交**

```bash
git add src/app/account/AccountApp.tsx
git commit -m "feat(account): add AccountApp shell with local section switching"
```

---

### Task 10: 替换 `/account` 页为 React，停止注入 app.js

**Files:**
- Modify: `src/app/account/page.tsx`

- [ ] **Step 1: 改写 page.tsx**

```tsx
import type { Metadata } from "next";
import { AccountApp } from "./AccountApp";

export const metadata: Metadata = {
  title: "个人中心",
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return <AccountApp />;
}
```

- [ ] **Step 2: 类型检查 + 构建通过**

Run: `npm run build`
Expected: 编译成功；`/account` 不再引用 `AppRouteShell` / `InteractiveAppScript`。

- [ ] **Step 3: 提交**

```bash
git add src/app/account/page.tsx
git commit -m "feat(account): render React AccountApp instead of app.js shell"
```

---

## 阶段 D：导航桥接与验证

### Task 11: app.js 放行 `/account` 走真实导航

**Files:**
- Modify: `app.js`（约 6115-6132 的 click 链接拦截块）
- Run: `node scripts/sync-public-app.mjs`

- [ ] **Step 1: 阅读现有拦截块确认上下文**

Run: 在 `app.js` 中定位 `if (!href.startsWith('/')) return;` 一段（约 6125）。该块对站内 `/` 链接 `preventDefault` 并 `route()`。

- [ ] **Step 2: 在该块开头加入 `/account` 白名单放行**

在 `const url = new URL(href, location.origin);` 之后、`event.preventDefault();` 之前插入：

```js
  // /account 已迁移为独立 React 路由，放行给浏览器真实导航
  if (url.pathname === '/account' || url.pathname.startsWith('/account/')) return;
```

（命中则直接 return，不 preventDefault，浏览器执行真实跳转进入 Next.js React 路由。）

- [ ] **Step 3: 同步到 public/app.js**

Run: `node scripts/sync-public-app.mjs`
Expected: 输出 `Synced ... app.js -> ... public/app.js`。

- [ ] **Step 4: 语法校验**

Run: `node --check app.js && node --check public/app.js`
Expected: 无输出（通过）。

- [ ] **Step 5: 提交**

```bash
git add app.js public/app.js
git commit -m "feat(app): let /account use real navigation into React route"
```

---

### Task 12: 端到端构建与手动验证

**Files:** 无（验证任务）

- [ ] **Step 1: 全量构建**

Run: `npm run build`
Expected: 成功，无类型/编译错误。

- [ ] **Step 2: 本地启动并应用 migration（若尚未）**

Run: `npx wrangler d1 migrations apply ichuhai-db --local` 然后 `npm run preview`（wrangler dev）
Expected: 服务启动，`/account` 可访问。

- [ ] **Step 3: 手动验证清单（逐项确认）**

- 登录后访问 `/account`：页面由 React 渲染，不加载 app.js。
- 依次点击 我的订单 / 余额中心 / 售后服务 / 账号设置 / 帮助中心：**切换不卡、仅主面板刷新**，侧栏与 header 不重建。
- 账号设置：昵称/货币保存调用 PATCH 成功并 toast；改密码成功；数据来自服务器（刷新页面仍正确，不依赖旧缓存）。
- 余额中心：显示真实余额（初期 0.00）与空流水，充值按钮为"待开放"。
- 从首页/其他 app.js 页面点击指向 `/account` 的链接：能正常跳入 React 页（白名单生效）。
- 退出登录：清 token 跳 `/login`。
- 未登录直接访问 `/account`：显示访客视图。

- [ ] **Step 4: 清理临时文件（如有）并最终提交**

```bash
git status   # 确认无遗留临时文件
git commit --allow-empty -m "chore(account): verify React migration build and manual checks"
```

---

## 自检结果（已对照 spec）

- **范围覆盖**：订单/余额/售后/账号设置/帮助 5 面板 → Task 7/9；独立路由 → Task 10；服务器拉取 → Task 2/3/6；全功能 header → Task 8；状态分层 → Task 5/9；余额只读骨架 → Task 1/2/3；链接桥接 → Task 11；GET profile 补口 → Task 2。全部有对应任务。
- **占位符扫描**：Task 9 故意保留了一处 `useSessionLogout` 占位，并在 Step 2 显式给出移除与修正方法（避免读者漏改）。其余无 TODO/TBD。
- **类型一致性**：`SessionUser`（含 `balanceUsdt`）在 Context/hook/panel 间一致；`AsyncState<T>` 复用；`apiFetch<T>` 签名统一；接口字段名与已读源码一致（orderNo/amountUsdt/defaultCurrency/balanceUsdt）。

## 已知风险

1. app.js 不会因本次消失，卡顿根治仅覆盖账号页。
2. 余额仅只读骨架，动钱逻辑需另行立项。
3. SiteHeader 的货币切换/消息中心为简化版；完整功能待后续逐页迁移时补齐（不影响账号页核心）。
