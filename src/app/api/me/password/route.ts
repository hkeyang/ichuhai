import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ensureDatabaseReady } from "@/lib/api/bootstrap";
import { parseBody } from "@/lib/api/body-parser";
import { jsonResponse, optionsResponse } from "@/lib/api/cors";
import { HttpError } from "@/lib/api/errors";
import { hashPassword, verifyPassword } from "@/lib/api/password";
import { resolveUserId } from "@/lib/api/user-session";

const PASSWORD_RE = /^(?=.{6,}$)(?=.*[A-Za-z])(?=.*\d).+$/;

interface PasswordBody {
  currentPassword?: string;
  newPassword?: string;
}

export async function OPTIONS(request: Request) {
  const { env } = await getCloudflareContext();
  return optionsResponse(request, env as CloudflareEnv);
}

export async function PATCH(request: Request) {
  const { env } = await getCloudflareContext();
  const cloudflareEnv = env as CloudflareEnv;

  try {
    const userId = await resolveUserId(request, cloudflareEnv);
    if (!userId) throw new HttpError(401, "unauthorized");

    const body = await parseBody<PasswordBody>(request);
    const currentPassword = String(body.currentPassword ?? "");
    const newPassword = String(body.newPassword ?? "");
    if (!currentPassword) throw new HttpError(400, "请输入旧密码");
    if (!PASSWORD_RE.test(newPassword)) throw new HttpError(400, "密码至少 6 位，需包含字母和数字，可使用符号");

    const db = cloudflareEnv.DB;
    await ensureDatabaseReady(db);

    const user = await db
      .prepare("SELECT id, password_hash FROM users WHERE id = ?")
      .bind(userId)
      .first<{ id: string; password_hash: string | null }>();
    if (!user) throw new HttpError(404, "user not found");
    if (!user.password_hash) throw new HttpError(400, "当前账号未设置邮箱密码");

    const valid = await verifyPassword(currentPassword, user.password_hash);
    if (!valid) throw new HttpError(401, "旧密码错误");

    const passwordHash = await hashPassword(newPassword);
    await db
      .prepare("UPDATE users SET password_hash = ? WHERE id = ?")
      .bind(passwordHash, userId)
      .run();

    return jsonResponse({ ok: true }, 200, request, cloudflareEnv);
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse({ error: error.message }, error.status, request, cloudflareEnv);
    }
    return jsonResponse({ error: "internal server error" }, 500, request, cloudflareEnv);
  }
}
