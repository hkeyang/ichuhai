"use client";

const SUPPORT_TELEGRAM_URL = "https://t.me/ichuhaikefu";

export function SupportPanel() {
  return (
    <section className="member-panel">
      <div className="section-toolbar"><b>售后服务</b></div>
      <p>如需对订单或充值相关问题发起售后申请，欢迎随时与我们联系。</p>
      <a className="primary small link-button" href={SUPPORT_TELEGRAM_URL} target="_blank" rel="noopener">联系客服</a>
    </section>
  );
}
