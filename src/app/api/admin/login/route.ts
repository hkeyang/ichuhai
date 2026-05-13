// src/app/api/admin/login/route.ts
// POST /api/admin/login — 验证 ADMIN_PASSWORD，返回 HMAC session token

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { parseBody } from "@/lib/api/body-parser";
import { jsonResponse, optionsResponse } from "@/lib/api/cors";
import { HttpError } from "@/lib/api/errors";
import { createAdminSessionToken, timingSafeEqual } from "@/lib/api/admin-session";

export async function OPTIONS(request: Request) {
  const { env } = await getCloudflareContext();
  return optionsResponse(request, env as CloudflareEnv);
}

export async function POST(request: Request) {
  const { env } = await getCloudflareContext();
  const cloudflareEnv = env as CloudflareEnv;

  try {
    const body = await parseBody<{ password?: unknown }>(request);
    const password = String(body.password ?? "").trim();

    if (!password) {
      throw new HttpError(422, "password is required");
    }

    const isValid = timingSafeEqual(password, cloudflareEnv.ADMIN_PASSWORD);
    if (!isValid) {
      return jsonResponse({ error: "invalid password" }, 401, request, cloudflareEnv);
    }

    const token = await createAdminSessionToken(cloudflareEnv);
    return jsonResponse({ token }, 200, request, cloudflareEnv);
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse({ error: error.message }, error.status, request, cloudflareEnv);
    }
    console.error("[POST /api/admin/login] unexpected error:", error);
    return jsonResponse({ error: "internal server error" }, 500, request, cloudflareEnv);
  }
}
