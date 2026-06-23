import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ensureDatabaseReady } from "@/lib/api/bootstrap";
import { parseBody } from "@/lib/api/body-parser";
import { jsonResponse, optionsResponse } from "@/lib/api/cors";
import { HttpError } from "@/lib/api/errors";
import { resolveUserId } from "@/lib/api/user-session";

interface ProfileBody {
  nickname?: string;
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

    const body = await parseBody<ProfileBody>(request);
    const nickname = String(body.nickname ?? "").trim();
    if (!nickname || nickname.length > 20) throw new HttpError(400, "昵称需为 1-20 个字符");

    const db = cloudflareEnv.DB;
    await ensureDatabaseReady(db);

    const user = await db
      .prepare("SELECT id, email, nickname, default_currency FROM users WHERE id = ?")
      .bind(userId)
      .first<{ id: string; email: string | null; nickname: string | null; default_currency: string }>();
    if (!user) throw new HttpError(404, "user not found");

    await db
      .prepare("UPDATE users SET nickname = ? WHERE id = ?")
      .bind(nickname, userId)
      .run();

    return jsonResponse(
      {
        user: {
          id: user.id,
          email: user.email,
          nickname,
          defaultCurrency: user.default_currency,
        },
      },
      200,
      request,
      cloudflareEnv
    );
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse({ error: error.message }, error.status, request, cloudflareEnv);
    }
    return jsonResponse({ error: "internal server error" }, 500, request, cloudflareEnv);
  }
}
