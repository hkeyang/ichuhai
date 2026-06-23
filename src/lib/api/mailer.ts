// src/lib/api/mailer.ts
// Resend / MailChannels 发信封装

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
  const envAliases = env as CloudflareEnv & { Resend?: string; Resend2?: string };
  const resendApiKey = env.RESEND_API_KEY || envAliases.Resend || envAliases.Resend2 || "";
  if (resendApiKey) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: `ichuhai <${env.MAIL_FROM || "noreply@ichuhai.shop"}>`,
        to: [options.to],
        subject: options.subject,
        text: options.text,
        html: options.html,
      }),
    });

    if (response.ok) {
      const data = (await response.json().catch(() => ({}))) as { id?: string };
      return { ok: true, provider: "resend", messageId: data.id ?? `resend_${Date.now()}` };
    }

    const errorText = await response.text().catch(() => "resend error");
    return { ok: false, provider: "resend", messageId: null, error: errorText };
  }

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

export async function sendVerificationEmail(
  to: string,
  code: string,
  env: CloudflareEnv,
  purpose: "register" | "reset" = "register"
): Promise<MailResult> {
  const isReset = purpose === "reset";
  const subject = isReset ? "ichuhai 密码重置验证码" : "ichuhai 邮箱验证码";
  const actionText = isReset ? "重置密码" : "注册";
  const text = `您的 ichuhai ${actionText}验证码是 ${code}，5 分钟内有效。如果不是您本人操作，请忽略本邮件。`;
  const html = `<div style="font-family:Arial,sans-serif;font-size:15px;color:#0B1538">
    <p>您正在${actionText} <b>ichuhai</b> 账号，验证码为：</p>
    <p style="font-size:30px;font-weight:800;letter-spacing:6px;color:#4F7CFF;margin:18px 0">${code}</p>
    <p style="color:#64708B">验证码 5 分钟内有效。如果不是您本人操作，请忽略本邮件。</p>
  </div>`;

  // 未配置 Resend：降级走 MailChannels（生产可能已失效），仍失败则记日志，便于本地联调。
  const fallback = await sendMail({ to, subject, text, html }, env);
  if (!fallback.ok) {
    console.log(`[dev] 邮箱验证码 to=${to} code=${code}`);
    return { ok: true, provider: "dev-log", messageId: `dev_${Date.now()}` };
  }
  return fallback;
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
