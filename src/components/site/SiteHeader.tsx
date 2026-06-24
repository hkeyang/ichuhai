"use client";

import { useState } from "react";
import { useSession } from "@/lib/session/SessionContext";

export function SiteHeader() {
  const { user, logout } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const name = user?.email?.split("@")[0] || user?.nickname || "member";

  return (
    <header className="topbar">
      <a className="brand" href="/" aria-label="ichuhai 首页">ichuhai</a>
      <nav className="nav">
        <a href="/products">商品</a>
        <a href="/faq">FAQ</a>
      </nav>
      <div className="account-popover-wrap">
        {user ? (
          <>
            <button className="pill account-trigger logged-in" onClick={() => setMenuOpen((v) => !v)} type="button">
              {name}
            </button>
            {menuOpen && (
              <div className="account-dropdown">
                <a href="/account?section=orders">个人中心</a>
                <a href="/account?section=orders">我的订单</a>
                <a href="/account?section=wallet">钱包充值</a>
                <a href="/account?section=profile">账户设置</a>
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
