function smtpConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

export async function sendMail({ to, subject, text, html }) {
  if (!smtpConfigured()) {
    return {
      ok: true,
      provider: 'mock-mailer',
      messageId: `mock_${Date.now()}`,
      note: '未配置 SMTP_HOST/SMTP_USER/SMTP_PASS，邮件仅记录为模拟发送。'
    };
  }

  const nodemailer = await import('nodemailer');
  const transporter = nodemailer.default.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT || 587) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
  const result = await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    html
  });
  return { ok: true, provider: 'smtp', messageId: result.messageId };
}

export async function sendOrderCreatedEmail(order) {
  return sendMail({
    to: order.email,
    subject: `订单已创建：${order.orderNo}`,
    text: `您的订单 ${order.orderNo} 已创建，请在 15 分钟内完成 ${order.amountUsdt} USDT 支付。`,
    html: `<p>您的订单 <b>${order.orderNo}</b> 已创建，请在 15 分钟内完成 <b>${order.amountUsdt} USDT</b> 支付。</p>`
  });
}

export async function sendDeliveryEmail(order, delivery) {
  return sendMail({
    to: order.email,
    subject: `订单已发货：${order.orderNo}`,
    text: `您的订单 ${order.orderNo} 已完成发货。交付内容：${delivery.maskedContent}`,
    html: `<p>您的订单 <b>${order.orderNo}</b> 已完成发货。</p><p>交付内容：${delivery.maskedContent}</p>`
  });
}
