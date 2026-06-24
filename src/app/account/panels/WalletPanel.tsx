"use client";

import { useMemo, useState } from "react";
import { apiFetch } from "@/lib/session/api";
import { useMeBalance, type LedgerEntry } from "../hooks/useMeBalance";
import { LineIcon } from "../components/LineIcon";

const TYPE_LABEL: Record<string, string> = {
  recharge: "充值",
  consume: "订单支付",
  refund: "退款",
  adjust: "后台调整",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "待确认",
  completed: "成功",
  failed: "失败",
};

function ledgerType(entry: LedgerEntry) {
  return TYPE_LABEL[entry.type] || entry.type || "余额变动";
}

function ledgerStatus(entry: LedgerEntry) {
  return STATUS_LABEL[entry.status] || entry.status || "成功";
}

function statusTone(entry: LedgerEntry) {
  if (entry.status === "pending") return "warning";
  if (entry.status === "failed") return "warning";
  return "success";
}

function methodLabel(method?: string | null) {
  if (method === "alipay") return "支付宝";
  if (method === "usdt_trc20") return "USDT-TRC20";
  if (method === "manual") return "人工处理";
  return method || "余额";
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString().slice(0, 19).replace("T", " ");
}

function iconFor(entry: LedgerEntry) {
  if (entry.type === "consume") return "cart";
  if (entry.type === "refund") return "refund";
  return "card";
}

function exportLedger(rows: LedgerEntry[]) {
  if (!rows.length) return;
  const header = ["类型", "金额 USDT", "方式", "详情", "时间", "状态"];
  const csvRows = rows.map((entry) => [
    ledgerType(entry),
    entry.amountUsdt,
    methodLabel(entry.method),
    entry.note || entry.referenceId || "",
    formatDate(entry.createdAt),
    ledgerStatus(entry),
  ]);
  const csv = [header, ...csvRows]
    .map((row) => row.map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `ichuhai-ledger-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function WalletMethod({
  value,
  title,
  desc,
  active,
  onClick,
}: {
  value: string;
  title: string;
  desc: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button className={active ? "active" : ""} onClick={onClick} type="button">
      <i>{value === "usdt_trc20" ? <LineIcon name="usdt" label="USDT" className="wallet-method-icon" /> : "支"}</i>
      <span><b>{title}</b><small>{desc}</small></span>
    </button>
  );
}

function LedgerTable({ rows, compact = false }: { rows: LedgerEntry[]; compact?: boolean }) {
  if (!rows.length) {
    return <div className="account-empty"><b>暂无流水</b><span>充值或消费记录会显示在这里。</span></div>;
  }
  return (
    <div className={`wallet-ledger-table ${compact ? "compact" : ""}`}>
      <div className="wallet-ledger-head"><span>类型</span><span>金额</span><span>方式 / 详情</span><span>时间</span><span>状态</span></div>
      {rows.map((entry) => {
        const amount = Number(entry.amountUsdt || 0);
        return (
          <div className="wallet-ledger-row" key={entry.id}>
            <div className="wallet-ledger-type">
              <i><LineIcon name={iconFor(entry)} label={ledgerType(entry)} className="wallet-row-icon" /></i>
              <b>{ledgerType(entry)}</b>
            </div>
            <strong className={amount >= 0 ? "positive" : "negative"}>{amount >= 0 ? "+" : "-"}{Math.abs(amount).toFixed(2)} USDT</strong>
            <p><b>{methodLabel(entry.method)}</b><small>{entry.note || entry.referenceId || "余额流水"}</small></p>
            <time>{formatDate(entry.createdAt)}</time>
            <em className={statusTone(entry)}>{ledgerStatus(entry)}</em>
          </div>
        );
      })}
    </div>
  );
}

export function WalletPanel({
  token,
  view,
  onOpenLedger,
  onToast,
  onBalanceChange,
}: {
  token: string;
  view: "dashboard" | "ledger";
  onOpenLedger: () => void;
  onToast: (msg: string) => void;
  onBalanceChange: () => void;
}) {
  const { data, loading, error, reload } = useMeBalance(token);
  const [amount, setAmount] = useState("10");
  const [method, setMethod] = useState("usdt_trc20");
  const [submitting, setSubmitting] = useState(false);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("newest");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  async function createRecharge() {
    const normalizedAmount = Math.max(1, Math.floor(Number(amount) || 0));
    if (normalizedAmount < 1) {
      onToast("充值金额最低 1 USDT");
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiFetch<{
        ledger: { id: string };
        payment?: { paymentUrl?: string };
      }>("/api/me/balance", {
        method: "POST",
        body: JSON.stringify({ amountUsdt: String(normalizedAmount), method }),
      });
      onToast("充值单已创建，正在打开支付页面");
      await reload();
      onBalanceChange();
      window.location.href = res.payment?.paymentUrl || `/pay/wallet-${res.ledger.id}`;
    } catch (e) {
      onToast(e instanceof Error ? e.message : "充值申请创建失败");
    } finally {
      setSubmitting(false);
    }
  }

  function changeAmount(delta: number) {
    setAmount((current) => String(Math.max(1, Math.floor(Number(current) || 1) + delta)));
  }

  const balance = Number(data?.balanceUsdt ?? "0");
  const ledger = data?.ledger ?? [];
  const filteredLedger = useMemo(() => {
    const q = query.trim().toLowerCase();
    const from = dateFrom ? new Date(`${dateFrom}T00:00:00`).getTime() : 0;
    const to = dateTo ? new Date(`${dateTo}T23:59:59`).getTime() : 0;
    return ledger
      .filter((entry) => {
        if (type && entry.type !== type) return false;
        if (status && entry.status !== status) return false;
        if (q) {
          const haystack = [ledgerType(entry), methodLabel(entry.method), entry.note, entry.referenceId, entry.referenceType]
            .join(" ")
            .toLowerCase();
          if (!haystack.includes(q)) return false;
        }
        const created = new Date(entry.createdAt || 0).getTime();
        if (from && created < from) return false;
        if (to && created > to) return false;
        return true;
      })
      .sort((a, b) => {
        if (sort === "amount_desc") return Number(b.amountUsdt || 0) - Number(a.amountUsdt || 0);
        if (sort === "amount_asc") return Number(a.amountUsdt || 0) - Number(b.amountUsdt || 0);
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
  }, [dateFrom, dateTo, ledger, query, sort, status, type]);

  if (loading) return <section className="member-panel"><p>加载中...</p></section>;
  if (error)
    return (
      <section className="member-panel">
        <p>{error}</p>
        <button className="primary small" onClick={reload} type="button">重试</button>
      </section>
    );

  if (view === "ledger") {
    return (
      <section className="wallet-all-page">
        <section className="wallet-ledger-filter">
          <label><LineIcon name="search" label="搜索" className="filter-icon" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="订单号 / TxID / 备注" /></label>
          <label className="date-range">
            <LineIcon name="calendar" label="日期" className="filter-icon" />
            <input aria-label="开始日期" type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
            <span>-</span>
            <input aria-label="结束日期" type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
            <LineIcon name="calendar" label="日期" className="filter-icon" />
          </label>
          <span className="select-shell member-select">
            <select value={type} onChange={(event) => setType(event.target.value)}>
              <option value="">全部类型</option>
              <option value="recharge">充值</option>
              <option value="consume">订单支付</option>
              <option value="refund">退款</option>
              <option value="adjust">后台调整</option>
            </select>
            <LineIcon name="chevron" label="展开类型" className="select-chevron" />
          </span>
          <span className="select-shell member-select">
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="">全部状态</option>
              <option value="completed">成功</option>
              <option value="pending">待确认</option>
              <option value="failed">失败</option>
            </select>
            <LineIcon name="chevron" label="展开状态" className="select-chevron" />
          </span>
          <span className="select-shell member-select">
            <select value={sort} onChange={(event) => setSort(event.target.value)}>
              <option value="newest">最新记录</option>
              <option value="amount_desc">金额从高到低</option>
              <option value="amount_asc">金额从低到高</option>
            </select>
            <LineIcon name="chevron" label="展开排序" className="select-chevron" />
          </span>
          <button onClick={() => exportLedger(filteredLedger)} type="button"><LineIcon name="download" label="导出记录" className="wallet-export-icon" /> 导出记录</button>
        </section>
        <section className="wallet-ledger-card all">
          <div className="wallet-section-head"><h2>余额流水</h2><span>共 {filteredLedger.length} 条记录</span></div>
          <LedgerTable rows={filteredLedger} />
          <section className="member-pagination wallet-pagination">
            <span />
            <div>
              <button disabled type="button"><LineIcon name="chevron-left" label="上一页" className="pager-icon" /></button>
              <button className="active" disabled type="button">1</button>
              <button disabled type="button"><LineIcon name="chevron-right" label="下一页" className="pager-icon" /></button>
            </div>
            <span className="select-shell member-select pagination-size">
              <select disabled><option>10 条/页</option></select>
              <LineIcon name="chevron" label="每页数量" className="select-chevron" />
            </span>
          </section>
        </section>
      </section>
    );
  }

  return (
    <section className="wallet-dashboard">
      <section className="wallet-hero-card">
        <div>
          <span>当前余额</span>
          <strong>{balance.toFixed(2)} <small>USDT</small></strong>
          <p>≈ ¥{(balance * 7.16).toFixed(2)} CNY <LineIcon name="eye-off" label="隐藏折算金额" className="wallet-eye-icon" /></p>
        </div>
      </section>
      <form className="wallet-recharge-card">
        <h3>充值</h3>
        <label>充值金额
          <div className="wallet-amount-field">
            <input
              min="1"
              step="1"
              type="number"
              value={amount}
              onBlur={() => setAmount((current) => String(Math.max(1, Math.floor(Number(current) || 1))))}
              onChange={(event) => setAmount(event.target.value)}
            />
            <b>USDT</b>
            <div className="wallet-amount-stepper" aria-label="调整充值金额">
              <button onClick={() => changeAmount(1)} type="button"><LineIcon name="plus" label="增加 1 USDT" className="amount-step-icon" /></button>
              <button onClick={() => changeAmount(-1)} type="button"><LineIcon name="minus" label="减少 1 USDT" className="amount-step-icon" /></button>
            </div>
          </div>
        </label>
        <div className="wallet-method-block">
          <span>充值方式</span>
          <div className="wallet-methods">
            <WalletMethod value="usdt_trc20" title="USDT-TRC20" desc="扫码转账，链上确认后自动入账" active={method === "usdt_trc20"} onClick={() => setMethod("usdt_trc20")} />
          </div>
        </div>
        <button className="wallet-submit" disabled={submitting} onClick={createRecharge} type="button">{submitting ? "提交中..." : "立即充值"}</button>
        <small><LineIcon name="warning" label="提示" className="wallet-note-icon" /> 最低 1 USDT 起充，金额按 1 USDT 递增；支付页会显示 TRC20 收款二维码。</small>
      </form>
      <section className="wallet-ledger-card">
        <div className="wallet-section-head">
          <h2>余额流水</h2>
          <button onClick={onOpenLedger} type="button">查看全部 <LineIcon name="chevron" label="查看全部" className="wallet-link-icon" /></button>
        </div>
        <LedgerTable rows={ledger.slice(0, 5)} compact />
      </section>
    </section>
  );
}
