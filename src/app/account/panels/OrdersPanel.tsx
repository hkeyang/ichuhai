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
