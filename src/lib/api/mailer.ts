// src/lib/api/mailer.ts
// MailChannels 发信封装

import type { OrderRow } from "./types";

export interface MailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export interface MailResult {
  ok: boolean;
  provider: string;
  messageId: string | null;
  error?: string;
}

export async function sendMail(
  options: MailOptions,
  env: CloudflareEnv
): Promise<MailResult> {
  const response = await fetch("https://api.mailchannels.net/tx/v1/send", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      personalizations: [
        {
          to: [{ email: options.to }],
          dkim_domain: env.DKIM_DOMAIN || "ichuhai.shop",
          dkim_selector: env.DKIM_SELECTOR || "mailchannels",
          dkim_private_key: env.DKIM_PRIVATE_KEY || "",
        },
      ],
      from: {
        email: env.MAIL_FROM || "noreply@ichuhai.shop",
        name: "ichuhai",
      },
      subject: options.subject,
      content: [
        { type: "text/plain", value: options.text },
        { type: "text/html", value: options.html },
      ],
    }),
  });

  if (response.status === 202) {
    return {
      ok: true,
      provider: "mailchannels",
      messageId: `mc_${Date.now()}`,
    };
  }

  const errorText = await response.text();
  return {
    ok: false,
    provider: "mailchannels",
    messageId: null,
    error: errorText,
  };
}

export async function sendOrderCreatedEmail(
  order: OrderRow,
  env: CloudflareEnv
): Promise<MailResult> {
  return sendMail(
    {
      to: order.email,
      subject: `订单已创建：${order.order_no}`,
      text: `您的订单 ${order.order_no} 已创建，请在 15 分钟内完成 ${order.amount_usdt} USDT 支付。`,
      html: `<p>您的订单 <b>${order.order_no}</b> 已创建，请在 15 分钟内完成 <b>${order.amount_usdt} USDT</b> 支付。</p>`,
    },
    env
  );
}

export async function sendDeliveryEmail(
  order: OrderRow,
  deliveryContent: string,
  env: CloudflareEnv
): Promise<MailResult> {
  return sendMail(
    {
      to: order.email,
      subject: `订单已发货：${order.order_no}`,
      text: `您的订单 ${order.order_no} 已完成发货。\n\n交付内容：\n${deliveryContent}`,
      html: `<p>您的订单 <b>${order.order_no}</b> 已完成发货。</p><pre style="white-space:pre-wrap;background:#f6f7f9;padding:12px;border-radius:8px">${deliveryContent.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char] ?? char))}</pre>`,
    },
    env
  );
}
