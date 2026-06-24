"use client";

import { useMemo, useState } from "react";
import { useMeOrders, type MeOrder } from "../hooks/useMeOrders";
import { LineIcon } from "../components/LineIcon";

const ORDER_FILTERS = [
  ["all", "全部订单"],
  ["paying", "待支付"],
  ["processing", "处理中"],
  ["done", "已完成"],
  ["issue", "售后/异常"],
] as const;

const STATUS_GROUPS: Record<string, string[]> = {
  paying: ["created", "pending_payment", "payment_confirming"],
  processing: ["paid", "delivering", "processing"],
  done: ["completed", "done"],
  issue: ["expired", "failed", "refunding", "refunded", "issue"],
};

const STATUS_LABELS: Record<string, string> = {
  created: "待支付",
  pending_payment: "待支付",
  payment_confirming: "确认中",
  paid: "已支付",
  delivering: "发货中",
  processing: "处理中",
  completed: "已完成",
  done: "已完成",
  expired: "已过期",
  failed: "失败",
  refunding: "退款中",
  refunded: "已退款",
};

function productName(order: MeOrder) {
  return String(order.productSnapshot.name || order.productSnapshot.title || "商品");
}

function skuText(order: MeOrder) {
  const sku = order.skuSnapshot as { skuName?: string; optionValues?: Record<string, unknown> };
  if (sku.skuName) return sku.skuName;
  if (sku.optionValues && typeof sku.optionValues === "object") {
    return Object.values(sku.optionValues).filter(Boolean).join(" / ");
  }
  return "标准规格";
}

function statusLabel(status: string) {
  return STATUS_LABELS[status] || status || "处理中";
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString().slice(0, 19).replace("T", " ");
}

function exportOrders(rows: MeOrder[]) {
  if (!rows.length) return;
  const header = ["订单号", "商品", "规格", "状态", "金额 USDT", "邮箱", "Telegram", "创建时间"];
  const csvRows = rows.map((order) => [
    order.orderNo,
    productName(order),
    skuText(order),
    statusLabel(order.status),
    Number(order.amountUsdt || 0).toFixed(2),
    order.email || "",
    order.telegramUsername || "",
    formatDate(order.createdAt),
  ]);
  const csv = [header, ...csvRows]
    .map((row) => row.map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `ichuhai-orders-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function OrdersPanel({ token }: { token: string }) {
  const { data, loading, error, reload } = useMeOrders(token);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("newest");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [expanded, setExpanded] = useState("");

  const orders = data ?? [];
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const from = dateFrom ? new Date(`${dateFrom}T00:00:00`).getTime() : 0;
    const to = dateTo ? new Date(`${dateTo}T23:59:59`).getTime() : 0;
    const group = status || filter;
    return orders
      .filter((order) => {
        if (group && group !== "all") {
          const allowed = STATUS_GROUPS[group] || [group];
          if (!allowed.includes(order.status)) return false;
        }
        if (q) {
          const haystack = [
            order.orderNo,
            productName(order),
            skuText(order),
            order.email,
            order.telegramUsername,
            order.txHash,
          ].join(" ").toLowerCase();
          if (!haystack.includes(q)) return false;
        }
        const created = new Date(order.createdAt || 0).getTime();
        if (from && created < from) return false;
        if (to && created > to) return false;
        return true;
      })
      .sort((a, b) => {
        if (sort === "amount_desc") return Number(b.amountUsdt || 0) - Number(a.amountUsdt || 0);
        if (sort === "amount_asc") return Number(a.amountUsdt || 0) - Number(b.amountUsdt || 0);
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
  }, [dateFrom, dateTo, filter, orders, query, sort, status]);

  if (loading) return <section className="member-panel"><p>加载中...</p></section>;
  if (error)
    return (
      <section className="member-panel">
        <p>{error}</p>
        <button className="primary small" onClick={reload} type="button">重试</button>
      </section>
    );

  return (
    <>
      <nav className="order-tabs">
        {ORDER_FILTERS.map(([value, label]) => (
          <button
            key={value}
            className={filter === value ? "active" : ""}
            onClick={() => {
              setFilter(value);
              setStatus("");
            }}
            type="button"
          >
            {label}
          </button>
        ))}
      </nav>
      <section className="order-filter-bar">
        <label>
          <LineIcon name="search" label="搜索" className="filter-icon" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索订单号或商品名称" />
        </label>
        <label className="date-range">
          <input aria-label="开始日期" type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
          <span>至</span>
          <input aria-label="结束日期" type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
        </label>
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">全部状态</option>
          <option value="paying">待支付</option>
          <option value="processing">处理中</option>
          <option value="done">已完成</option>
          <option value="issue">异常/售后</option>
        </select>
        <select value={sort} onChange={(event) => setSort(event.target.value)}>
          <option value="newest">最新下单</option>
          <option value="amount_desc">金额从高到低</option>
          <option value="amount_asc">金额从低到高</option>
        </select>
        <button onClick={() => exportOrders(rows)} type="button">导出订单</button>
        <button onClick={reload} type="button">同步订单</button>
      </section>
      <section className="member-order-list">
        {!rows.length ? (
          <div className="account-empty"><b>暂无订单</b><span>下单后订单会显示在这里。</span></div>
        ) : (
          rows.map((order) => {
            const isOpen = expanded === order.orderId;
            const isIssue = (STATUS_GROUPS.issue || []).includes(order.status);
            return (
              <article className={`member-order-row ${isOpen ? "is-expanded" : ""}`} key={order.orderId}>
                <div className="member-order-cells">
                  <span className="order-number">
                    <LineIcon name="receipt" label="订单" className="product-icon" />
                    <span><b>{order.orderNo}</b><small>{formatDate(order.createdAt)}</small></span>
                  </span>
                  <span><b>{productName(order)}</b><small>{skuText(order)}</small></span>
                  <i className={isIssue ? "warning" : "success"}>{statusLabel(order.status)}</i>
                  <strong>{Number(order.amountUsdt || 0).toFixed(2)} USDT<small>{order.paymentCurrency || "USDT"}</small></strong>
                  <button className="detail-button" onClick={() => setExpanded(isOpen ? "" : order.orderId)} type="button">查看详情</button>
                  <button className="order-chevron" onClick={() => setExpanded(isOpen ? "" : order.orderId)} type="button">⌄</button>
                </div>
                {isOpen && (
                  <section className="expanded-detail">
                    <div className="detail-column">
                      <h3>订单信息</h3>
                      <p><span>订单号</span><b>{order.orderNo}</b></p>
                      <p><span>下单时间</span><b>{formatDate(order.createdAt)}</b></p>
                      <p><span>支付方式</span><b>{order.paymentNetwork || order.paymentCurrency || "余额/USDT"}</b></p>
                      <p><span>支付金额</span><b>{Number(order.amountUsdt || 0).toFixed(2)} USDT</b></p>
                      <p><span>订单状态</span><b>{statusLabel(order.status)}</b></p>
                    </div>
                    <div className="detail-column">
                      <h3>商品信息</h3>
                      <div className="detail-product">
                        <LineIcon name="card" label="商品" className="product-icon" />
                        <span><b>{productName(order)}</b><small>{skuText(order)}</small></span>
                      </div>
                      <p><span>数量</span><b>x 1</b></p>
                      <p><span>价格</span><b>{Number(order.amountUsdt || 0).toFixed(2)} USDT</b></p>
                    </div>
                    <div className="detail-column delivery-content">
                      <h3>交付内容</h3>
                      <div className="masked-delivery">
                        {(order.delivery?.maskedContent || "**************************************\n**************************************\n**************************************")
                          .split("\n")
                          .slice(0, 4)
                          .map((line, index) => <p key={`${order.orderId}-${index}`}>{line || "**************************************"}</p>)}
                        <button className="icon-only" type="button"><LineIcon name="eye" label="显示内容" className="field-icon" /></button>
                        <button className="icon-only" type="button"><LineIcon name="copy" label="复制内容" className="field-icon" /></button>
                      </div>
                      <div className="delivery-actions">
                        <button className="primary small" type="button">显示内容</button>
                        <button className="secondary small" type="button">下载凭证</button>
                        <a className="secondary small link-button" href="/account?section=support">联系客服</a>
                      </div>
                    </div>
                  </section>
                )}
              </article>
            );
          })
        )}
      </section>
      <section className="member-pagination">
        <span>共 {rows.length} 条订单</span>
        <div><button disabled type="button">‹</button><button className="active" disabled type="button">1</button><button disabled type="button">›</button></div>
        <select disabled><option>当前全部显示</option></select>
      </section>
    </>
  );
}
