"use client";

import { useMemo, useState } from "react";
import { apiFetch } from "@/lib/session/api";
import { useMeOrders, type MeOrder } from "../hooks/useMeOrders";
import { useMeSupportTickets, type MeSupportTicket } from "../hooks/useMeSupportTickets";
import { LineIcon } from "../components/LineIcon";

const ISSUE_TYPES = ["充值未到账", "商品未到账", "支付成功未到账", "充值金额错误", "其他问题"];

const STATUS_LABEL: Record<string, string> = {
  open: "待处理",
  in_progress: "处理中",
  resolved: "已解决",
  closed: "已关闭",
};

function statusLabel(status: string) {
  return STATUS_LABEL[status] || status || "待处理";
}

function statusTone(status: string) {
  if (status === "resolved" || status === "closed") return "resolved";
  if (status === "in_progress") return "processing";
  return "pending";
}

function productName(order?: MeOrder) {
  if (!order) return "关联订单";
  return String(order.productSnapshot.name || order.productSnapshot.title || "商品");
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString().slice(0, 19).replace("T", " ");
}

export function SupportPanel({
  token,
  userName,
  view,
  onOpenDetail,
  onBack,
  onToast,
}: {
  token: string;
  userName: string;
  view: "list" | "detail";
  onOpenDetail: () => void;
  onBack: () => void;
  onToast: (msg: string) => void;
}) {
  const ordersState = useMeOrders(token);
  const ticketsState = useMeSupportTickets(token);
  const orders = ordersState.data ?? [];
  const tickets = ticketsState.data ?? [];
  const orderById = useMemo(() => new Map(orders.map((order) => [order.orderId, order])), [orders]);
  const orderByNo = useMemo(() => new Map(orders.map((order) => [order.orderNo, order])), [orders]);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [issueType, setIssueType] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selectedTicketNo, setSelectedTicketNo] = useState("");
  const [supplement, setSupplement] = useState("");
  const [supplementing, setSupplementing] = useState(false);

  const selectedTicket = useMemo<MeSupportTicket | null>(() => {
    if (!tickets.length) return null;
    return tickets.find((ticket) => ticket.ticketNo === selectedTicketNo || ticket.id === selectedTicketNo) || tickets[0];
  }, [selectedTicketNo, tickets]);

  async function createTicket() {
    if (!selectedOrderId) {
      onToast("请选择关联订单");
      return;
    }
    if (!issueType) {
      onToast("请选择问题类型");
      return;
    }
    if (!description.trim()) {
      onToast("请填写问题描述");
      return;
    }
    setSubmitting(true);
    try {
      const ticket = await apiFetch<MeSupportTicket | null>(`/api/orders/${encodeURIComponent(selectedOrderId)}/tickets`, {
        method: "POST",
        body: JSON.stringify({ type: issueType, description: description.trim() }),
      });
      await ticketsState.reload();
      setSelectedTicketNo(ticket?.ticketNo || "");
      setDescription("");
      setIssueType("");
      onToast(ticket?.ticketNo ? `售后工单已创建：${ticket.ticketNo}` : "售后工单已创建");
      onOpenDetail();
    } catch (e) {
      onToast(e instanceof Error ? e.message : "售后工单创建失败");
    } finally {
      setSubmitting(false);
    }
  }

  async function appendSupplement(ticket: MeSupportTicket) {
    if (!supplement.trim()) {
      onToast("请填写补充说明");
      return;
    }
    setSupplementing(true);
    try {
      await apiFetch(`/api/me/support-tickets/${encodeURIComponent(ticket.id)}/messages`, {
        method: "POST",
        body: JSON.stringify({ content: supplement.trim() }),
      });
      setSupplement("");
      await ticketsState.reload();
      onToast("补充说明已提交");
    } catch (e) {
      onToast(e instanceof Error ? e.message : "补充说明提交失败");
    } finally {
      setSupplementing(false);
    }
  }

  if ((ordersState.loading && !orders.length) || (ticketsState.loading && !tickets.length)) {
    return <section className="member-panel"><p>加载中...</p></section>;
  }
  if (ordersState.error || ticketsState.error) {
    return (
      <section className="member-panel">
        <p>{ordersState.error || ticketsState.error}</p>
        <button className="primary small" onClick={() => { ordersState.reload(); ticketsState.reload(); }} type="button">重试</button>
      </section>
    );
  }

  if (view === "detail") {
    if (!selectedTicket) {
      return (
        <section className="member-panel">
          <div className="account-empty">
            <b>暂无售后详情</b>
            <span>请先提交售后申请。</span>
            <div><button className="primary small" onClick={onBack} type="button">返回售后服务</button></div>
          </div>
        </section>
      );
    }
    const order = orderById.get(selectedTicket.orderId) || orderByNo.get(selectedTicket.orderNo);
    const resolved = ["resolved", "closed"].includes(selectedTicket.status);
    return (
      <section className="support-detail-page">
        <section className="support-detail-summary">
          <div className="support-detail-kv">
            <p><span>工单号</span><b>{selectedTicket.ticketNo}</b></p>
            <p><span>关联订单</span><b>{selectedTicket.orderNo}</b></p>
            <p><span>提交时间</span><b>{formatDate(selectedTicket.createdAt)}</b></p>
            <p><span>问题类型</span><b>{selectedTicket.type}</b></p>
            <p><span>当前状态</span><b><em className={statusTone(selectedTicket.status)}>{statusLabel(selectedTicket.status)}</em></b></p>
          </div>
          <div className="support-progress">
            <div className="support-progress-line" />
            <div className="support-step done"><i>✓</i><b>已提交</b><span>{formatDate(selectedTicket.createdAt)}</span></div>
            <div className="support-step active"><i>2</i><b>{resolved ? "已解决" : "处理中"}</b><span>{formatDate(selectedTicket.updatedAt)}</span></div>
            <div className={`support-step ${resolved ? "done" : ""}`}><i>3</i><b>已解决</b><span>{resolved ? formatDate(selectedTicket.updatedAt) : "待完成"}</span></div>
          </div>
        </section>
        <section className="support-detail-grid">
          <article className="support-info-card problem">
            <h3>问题详情</h3>
            <p>{selectedTicket.description}</p>
            <div><span>提交人</span><b>{userName}</b></div>
          </article>
          <article className="support-info-card order">
            <h3>关联订单信息</h3>
            <p><span>订单号</span><b>{selectedTicket.orderNo}</b></p>
            <p><span>类型</span><b>{productName(order)}</b></p>
            <p><span>支付方式</span><b>{order?.paymentNetwork || order?.paymentCurrency || "余额/USDT"}</b></p>
            <p><span>充值金额</span><b>{Number(order?.amountUsdt || 0).toFixed(2)} USDT</b></p>
            <p><span>预计到账</span><b>{order?.fiatAmountSnapshot ? `${order.fiatAmountSnapshot} ${order.fiatCurrency || ""}` : "以订单状态为准"}</b></p>
          </article>
        </section>
        <section className="support-process-card">
          <h3>处理记录</h3>
          <div className="support-process-row submit">
            <i><LineIcon name="check" label="提交" className="support-process-icon" /></i>
            <time>{formatDate(selectedTicket.createdAt)}</time>
            <b>用户提交售后申请</b>
          </div>
          <div className="support-process-row system">
            <i><LineIcon name="clock" label="受理" className="support-process-icon" /></i>
            <time>{formatDate(selectedTicket.updatedAt)}</time>
            <b>{resolved ? "工单已处理完成" : "系统已受理，等待客服处理"}</b>
          </div>
          {selectedTicket.messages.map((message) => (
            <div className="support-process-row reply" key={message.id}>
              <i><LineIcon name="headset" label="回复" className="support-process-icon" /></i>
              <time>{formatDate(message.createdAt)}</time>
              <b>{message.authorType === "user" ? `用户补充：${message.content}` : `客服回复：${message.content}`}</b>
            </div>
          ))}
        </section>
        <section className="support-supplement-card">
          <h3>补充说明</h3>
          <textarea maxLength={500} value={supplement} onChange={(event) => setSupplement(event.target.value)} placeholder="请补充更多信息，以便我们更快为您处理（最多 500 字）" />
          <em>{supplement.length}/500</em>
          <button disabled={supplementing} onClick={() => appendSupplement(selectedTicket)} type="button">{supplementing ? "提交中..." : "提交补充说明"}</button>
        </section>
      </section>
    );
  }

  return (
    <section className="support-service-page">
      <form className="support-apply-card">
        <h3>发起售后申请</h3>
        <label>
          <span><i>*</i> 关联订单</span>
          <span className="select-shell member-select">
            <select value={selectedOrderId} onChange={(event) => setSelectedOrderId(event.target.value)}>
              <option value="">请选择关联订单</option>
              {orders.map((order) => <option value={order.orderId} key={order.orderId}>{order.orderNo} · {productName(order)}</option>)}
            </select>
            <LineIcon name="chevron" label="展开订单" className="select-chevron" />
          </span>
        </label>
        <label>
          <span><i>*</i> 问题类型</span>
          <span className="select-shell member-select">
            <select value={issueType} onChange={(event) => setIssueType(event.target.value)}>
              <option value="">请选择问题类型</option>
              {ISSUE_TYPES.map((item) => <option value={item} key={item}>{item}</option>)}
            </select>
            <LineIcon name="chevron" label="展开问题类型" className="select-chevron" />
          </span>
        </label>
        <label className="support-desc">
          <span><i>*</i> 问题描述</span>
          <textarea maxLength={500} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="请详细描述您遇到的问题，以便我们更好地为您提供帮助（最多 500 字）" />
          <em>{description.length} / 500</em>
        </label>
        <button className="support-submit" disabled={submitting} onClick={createTicket} type="button">{submitting ? "提交中..." : "提交申请"}</button>
        <small><LineIcon name="warning" label="提示" className="support-note-icon" /> 提交后我们将在 24 小时内处理，请耐心等待。</small>
      </form>
      <section className="support-record-card">
        <h3>售后记录</h3>
        <div className="support-record-table">
          <div className="support-record-head"><span>工单号</span><span>关联订单</span><span>问题类型</span><span>提交时间</span><span>状态</span><span>操作</span></div>
          {tickets.length ? tickets.map((ticket) => (
            <div className="support-record-row" key={ticket.id}>
              <b>{ticket.ticketNo}</b>
              <span>{ticket.orderNo}</span>
              <span>{ticket.type}</span>
              <time>{formatDate(ticket.createdAt)}</time>
              <em className={statusTone(ticket.status)}>{statusLabel(ticket.status)}</em>
              <button
                onClick={() => {
                  setSelectedTicketNo(ticket.ticketNo);
                  onOpenDetail();
                }}
                type="button"
              >
                查看详情
              </button>
            </div>
          )) : <div className="account-empty"><b>暂无售后记录</b><span>提交后会在这里跟进处理进度。</span></div>}
        </div>
        <section className="support-table-foot">
          <span>共 {tickets.length} 条</span>
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
