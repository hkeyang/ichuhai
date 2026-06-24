"use client";

const FAQS: Array<[string, string]> = [
  ["购买说明", "选择商品和规格后进入结算，订单会绑定当前邮箱账号。"],
  ["充值说明", "余额单位为 USDT，支付宝通过第三方聚合支付折算入账。"],
  ["USDT TRC20 支付说明", "仅支持 TRC20，转账金额和网络必须与订单一致，到账后进入确认。"],
  ["发货说明", "自动发货会展示卡密、账号密码、兑换码、链接或文字说明；人工商品由后台处理。"],
  ["售后规则", "用户提交工单后，后台人工处理补发、退款、驳回或继续沟通。"],
];

export function HelpPanel() {
  return (
    <section className="member-panel help-list">
      {FAQS.map(([title, text]) => (
        <article key={title}><b>{title}</b><p>{text}</p></article>
      ))}
    </section>
  );
}
