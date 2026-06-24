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
import { LineIcon } from "./components/LineIcon";

type SectionKey = "orders" | "wallet" | "walletLedger" | "support" | "supportDetail" | "profile" | "help";

const NAV_SECTIONS: Array<{ key: SectionKey; label: string; desc: string; icon: string }> = [
  { key: "orders", label: "我的订单", desc: "查看和管理您的订单，追踪订单状态与售后进度。", icon: "receipt" },
  { key: "wallet", label: "余额中心", desc: "管理 USDT 余额、充值记录、消费流水和组合支付。", icon: "card" },
  { key: "support", label: "售后服务", desc: "如需对订单或充值相关问题发起售后申请，欢迎随时与我们联系。", icon: "headset" },
  { key: "profile", label: "账号设置", desc: "管理您的账号与安全设置，保障账号安全与使用体验。", icon: "shield" },
  { key: "help", label: "帮助中心", desc: "查看购买、充值、TRC20 支付、发货和售后规则。", icon: "more" },
];

const SECTION_META: Record<SectionKey, { label: string; desc: string }> = {
  orders: NAV_SECTIONS[0],
  wallet: NAV_SECTIONS[1],
  walletLedger: { label: "全部流水", desc: "查看账户全部余额流水、充值记录与消费记录。" },
  support: NAV_SECTIONS[2],
  supportDetail: { label: "售后详情", desc: "查看售后工单进度、问题描述与处理记录。" },
  profile: NAV_SECTIONS[3],
  help: NAV_SECTIONS[4],
};

function emailPrefix(email?: string | null) {
  return String(email || "").split("@")[0] || "member";
}

function sixDigitUserId(seed?: string | null) {
  const source = String(seed || "ichuhai-member");
  let hash = 0;
  for (let i = 0; i < source.length; i += 1) {
    hash = (hash * 31 + source.charCodeAt(i)) >>> 0;
  }
  return String(100000 + (hash % 900000));
}

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

function readInitialSection(): SectionKey {
  if (typeof window === "undefined") return "orders";
  const raw = new URLSearchParams(window.location.search).get("section");
  return raw && raw in SECTION_META ? (raw as SectionKey) : "orders";
}

function AccountInner() {
  const { token, user, setUser, logout, initializing } = useSession();
  const profile = useMeProfile(token);
  const [section, setSection] = useState<SectionKey>(readInitialSection);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (profile.data) setUser(profile.data);
  }, [profile.data, setUser]);

  function showToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(""), 2400);
  }

  function openSection(next: SectionKey) {
    setSection(next);
    const url = new URL(window.location.href);
    url.searchParams.set("section", next);
    window.history.replaceState(null, "", `${url.pathname}?${url.searchParams.toString()}`);
  }

  if (initializing) {
    return (
      <>
        <SiteHeader />
        <main className="member-page"><section className="member-panel"><p>加载中…</p></section></main>
      </>
    );
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
  const meta = SECTION_META[section];
  const activeNav = section === "walletLedger" ? "wallet" : section === "supportDetail" ? "support" : section;
  const displayName = emailPrefix(activeUser.email);
  const memberNo = sixDigitUserId(activeUser.id || activeUser.email);

  return (
    <>
      <SiteHeader />
      <main className="member-page">
        <section className="member-center">
          <aside className="member-sidebar">
            <div className="member-user">
              <h2>{displayName}</h2>
              <p className="member-email">{activeUser.email}</p>
              <p className="member-id">用户ID {memberNo}</p>
              <div className="member-balance">
                <span>账户余额</span>
                <div>
                  <b>{Number(activeUser.balanceUsdt || "0").toFixed(2)} USDT</b>
                  <button onClick={() => openSection("wallet")} type="button">充值</button>
                </div>
              </div>
            </div>
            <nav className="member-nav">
              {NAV_SECTIONS.map((s) => (
                <button
                  key={s.key}
                  className={s.key === activeNav ? "active" : ""}
                  onClick={() => openSection(s.key)}
                  type="button"
                >
                  <LineIcon name={s.icon} label={s.label} className="member-nav-icon" />
                  {s.label}
                </button>
              ))}
            </nav>
            <button className="member-logout" onClick={logout} type="button">退出登录</button>
          </aside>
          <section className="member-main">
            <header className="member-title">
              <h1>个人中心 / {meta.label}</h1>
              <p>{meta.desc}</p>
            </header>
            {section === "orders" && <OrdersPanel token={token} />}
            {(section === "wallet" || section === "walletLedger") && (
              <WalletPanel
                token={token}
                view={section === "walletLedger" ? "ledger" : "dashboard"}
                onOpenLedger={() => openSection("walletLedger")}
                onToast={showToast}
                onBalanceChange={profile.reload}
              />
            )}
            {(section === "support" || section === "supportDetail") && (
              <SupportPanel
                token={token}
                userName={displayName}
                view={section === "supportDetail" ? "detail" : "list"}
                onOpenDetail={() => openSection("supportDetail")}
                onBack={() => openSection("support")}
                onToast={showToast}
              />
            )}
            {section === "profile" && <ProfilePanel user={activeUser} onUserChange={setUser} onToast={showToast} />}
            {section === "help" && <HelpPanel />}
          </section>
        </section>
      </main>
      <Toast msg={toast} />
    </>
  );
}

export function AccountApp() {
  return (
    <SessionProvider>
      <AccountInner />
    </SessionProvider>
  );
}
