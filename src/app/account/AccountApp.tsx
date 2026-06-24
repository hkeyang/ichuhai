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

function readInitialSection(): SectionKey {
  if (typeof window === "undefined") return "orders";
  const raw = new URLSearchParams(window.location.search).get("section");
  return SECTIONS.some((s) => s.key === raw) ? (raw as SectionKey) : "orders";
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
              <button onClick={() => openSection("wallet")} type="button">充值</button>
            </div>
            <nav className="member-nav">
              {SECTIONS.map((s) => (
                <button
                  key={s.key}
                  className={s.key === section ? "active" : ""}
                  onClick={() => openSection(s.key)}
                  type="button"
                >
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
            {section === "wallet" && <WalletPanel token={token} onToast={showToast} onBalanceChange={profile.reload} />}
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

export function AccountApp() {
  return (
    <SessionProvider>
      <AccountInner />
    </SessionProvider>
  );
}
