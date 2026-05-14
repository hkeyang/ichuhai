/**
 * Telegram Bot API 轻量客户端。
 *
 * 只封装 deeplink 登录流程需要的能力：
 *   - sendMessage：bot 主动给用户发一句反馈
 *   - setWebhook：一次性配置（如需程序化设置时使用）
 *
 * 注：Telegram Login Widget (HMAC 校验) 仍由 telegram-auth.ts 负责，两者互不干扰。
 */

const TELEGRAM_API_BASE = "https://api.telegram.org";

export interface TelegramSendMessageResult {
  ok: boolean;
  description?: string;
}

/**
 * 给指定 chat_id 发送一条文本消息。
 *
 * 失败不抛异常 —— 登录成功与否不依赖消息送达。记录日志由调用方决定。
 */
export async function tgSendMessage(
  botToken: string,
  chatId: string | number,
  text: string
): Promise<TelegramSendMessageResult> {
  if (!botToken) return { ok: false, description: "missing bot token" };
  try {
    const response = await fetch(`${TELEGRAM_API_BASE}/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });
    const data = (await response.json().catch(() => ({}))) as TelegramSendMessageResult;
    return { ok: Boolean(data.ok), description: data.description };
  } catch (error) {
    return { ok: false, description: error instanceof Error ? error.message : "network error" };
  }
}

/**
 * 生成一次性登录 token：32 字节随机，base64url（无 padding）。
 * 用 Web Crypto 保证在 Cloudflare Workers 运行时可用。
 */
export function generateLoginToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
