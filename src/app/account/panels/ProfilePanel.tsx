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
