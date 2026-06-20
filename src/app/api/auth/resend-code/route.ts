import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ensureDatabaseReady } from "@/lib/api/bootstrap";
import { jsonResponse, optionsResponse } from "@/lib/api/cors";
import { HttpError } from "@/lib/api/errors";
import { parseBody } from "@/lib/api/body-parser";
import { issueVerificationCode } from "@/lib/api/email-verification";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function OPTIONS(request: Request) {
  const { env } = await getCloudflareContext();
  return optionsResponse(request, env as CloudflareEnv);
}

export async function POST(request: Request) {
  const { env } = await getCloudflareContext();
  const cloudflareEnv = env as CloudflareEnv;

  try {
    const body = await parseBody<{ email?: string }>(request);
    const email = String(body.email ?? "").trim().toLowerCase();
    if (!EMAIL_RE.test(email)) throw new HttpError(400, "请输入有效邮箱");

    const db = cloudflareEnv.DB;
    await ensureDatabaseReady(db);

    // 仅对存在且未验证的账号重发，避免邮箱探测
    const user = await db
      .prepare("SELECT id, email_verified FROM users WHERE email = ?")
      .bind(email)
      .first<{ id: string; email_verified: number }>();

    if (user && user.email_verified === 0) {
      const result = await issueVerificationCode(db, email, cloudflareEnv);
      if (!result.ok) {
        throw new HttpError(429, `请求过于频繁，请 ${result.throttledSeconds ?? 60} 秒后重试`);
      }
    }

    // 统一返回 ok，不泄露邮箱是否存在
    return jsonResponse({ ok: true, email }, 200, request, cloudflareEnv);
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse({ error: error.message }, error.status, request, cloudflareEnv);
    }
    return jsonResponse({ error: "internal server error" }, 500, request, cloudflareEnv);
  }
}
