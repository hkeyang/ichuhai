"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/session/api";
import { useMeBalance } from "../hooks/useMeBalance";

const TYPE_LABEL: Record<string, string> = {
  recharge: "余额充值",
  consume: "订单扣款",
  refund: "订单退款",
  adjust: "后台调整",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "待确认",
  completed: "成功",
  failed: "失败",
};

export function WalletPanel({
  token,
  onToast,
  onBalanceChange,
}: {
  token: string;
  onToast: (msg: string) => void;
  onBalanceChange: () => void;
}) {
  const { data, loading, error, reload } = useMeBalance(token);
  const [amount, setAmount] = useState("20");
  const [method, setMethod] = useState("usdt_trc20");
  const [submitting, setSubmitting] = useState(false);

  async function createRecharge() {
    setSubmitting(true);
    try {
      await apiFetch("/api/me/balance", {
        method: "POST",
        body: JSON.stringify({ amountUsdt: amount, method }),
      });
      onToast("充值申请已创建，等待后台确认入账");
      await reload();
      onBalanceChange();
    } catch (e) {
      onToast(e instanceof Error ? e.message : "充值申请创建失败");
    } finally {
      setSubmitting(false);
    }
  }

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
        <p className="muted">余额可用于下单扣款，充值申请需后台确认后入账。</p>
        <div className="member-wallet-form">
          <label>
            <span>充值金额</span>
            <input min="1" step="0.01" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </label>
          <label>
            <span>充值方式</span>
            <select value={method} onChange={(e) => setMethod(e.target.value)}>
              <option value="usdt_trc20">USDT TRC20</option>
              <option value="alipay">支付宝</option>
            </select>
          </label>
          <button className="primary small" type="button" disabled={submitting} onClick={createRecharge}>
            {submitting ? "提交中…" : "提交充值申请"}
          </button>
        </div>
      </section>
      <section className="member-panel">
        <div className="section-toolbar"><b>余额流水</b></div>
        {ledger.length ? (
          <div className="ledger-list">
            {ledger.map((l) => (
              <div key={l.id}>
                <span>{TYPE_LABEL[l.type] || l.type}</span>
                <b className={Number(l.amountUsdt) >= 0 ? "positive" : "negative"}>{Number(l.amountUsdt) >= 0 ? "+" : ""}{l.amountUsdt} USDT</b>
                <small>{STATUS_LABEL[l.status] || l.status} · {l.method || l.note || "余额流水"} · {l.createdAt}</small>
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
