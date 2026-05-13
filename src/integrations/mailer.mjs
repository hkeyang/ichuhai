/**
 * Local Node fallback mailer used by server.mjs.
 * Production Cloudflare routes use src/lib/api/mailer.ts with MailChannels.
 */
import nodemailer from 'nodemailer';

function smtpConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function orderEmail(order) {
  return order.email || order.to || '';
}

async function sendSmtp({ to, subject, text, html }) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_PORT || '') === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.MAIL_FROM || 'noreply@ichuhai.shop',
    to,
    subject,
    text,
    html
  });
  return { ok: true, provider: 'smtp', messageId: info.messageId || null };
}

async function sendMail(message) {
  if (!message.to) {
    return { ok: false, provider: 'local-mailer', messageId: null, error: 'recipient missing' };
  }
  if (!smtpConfigured()) {
    return {
      ok: true,
      provider: 'local-mailer',
      messageId: `local_${Date.now()}`,
      note: 'SMTP not configured; notification recorded without external delivery.'
    };
  }
  return sendSmtp(message);
}

export async function sendOrderCreatedEmail(order) {
  return sendMail({
    to: orderEmail(order),
    subject: `订单已创建：${order.orderNo}`,
    text: `您的订单 ${order.orderNo} 已创建，请在 15 分钟内完成 ${order.amountUsdt} USDT 支付。`,
    html: `<p>您的订单 <b>${order.orderNo}</b> 已创建，请在 15 分钟内完成 <b>${order.amountUsdt} USDT</b> 支付。</p>`
  });
}

export async function sendDeliveryEmail(order, deliveryOrMaskedContent) {
  const maskedContent = typeof deliveryOrMaskedContent === 'string'
    ? deliveryOrMaskedContent
    : deliveryOrMaskedContent?.maskedContent || deliveryOrMaskedContent?.masked_content || '********';
  return sendMail({
    to: orderEmail(order),
    subject: `订单已发货：${order.orderNo}`,
    text: `您的订单 ${order.orderNo} 已完成发货。交付内容：${maskedContent}`,
    html: `<p>您的订单 <b>${order.orderNo}</b> 已完成发货。</p><p>交付内容：${maskedContent}</p>`
  });
}
