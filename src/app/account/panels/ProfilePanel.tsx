"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/session/api";
import type { SessionUser } from "@/lib/session/SessionContext";

export function ProfilePanel({
  user,
  onToast,
}: {
  user: SessionUser;
  onUserChange: (u: SessionUser) => void;
  onToast: (msg: string) => void;
}) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);

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
        <div className="section-toolbar"><b>修改密码</b></div>
        <label>邮箱账号<input value={user.email ?? ""} disabled /></label>
        <label>旧密码<input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="请输入旧密码" /></label>
        <label>新密码<input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="请输入新密码" /></label>
        <button className="primary small" onClick={changePassword} disabled={saving} type="button">修改密码</button>
      </section>
    </>
  );
}
