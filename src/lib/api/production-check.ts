// src/lib/api/production-check.ts
// 生产环境启动校验：确保所有必要的 secrets 已配置且满足最低长度要求

/**
 * 校验生产环境配置。
 * 仅在 NODE_ENV === 'production' 时执行检查。
 * 若有缺失或过短的 secret，或使用了默认密码，则抛出错误。
 *
 * @param env - Cloudflare Workers 环境变量
 * @throws 若生产环境配置不满足要求
 */
export function requireProductionConfig(env: CloudflareEnv): void {
  if (env.NODE_ENV !== "production") return;

  const tronEnv = env as CloudflareEnv & { TRON_GRID_API_KEY?: string; Trongrid?: string };
  const tronGridApiKey = tronEnv.TRON_GRID_API_KEY || tronEnv.Trongrid || "";
  const checks: [string, number][] = [
    ["ADMIN_USERNAME", 3],
    ["ADMIN_PASSWORD", 12],
    ["ADMIN_SESSION_SECRET", 32],
    ["INTERNAL_API_SECRET", 32],
    ["INVENTORY_ENCRYPTION_KEY", 32],
  ];

  const missing = checks
    .filter(
      ([key, min]) =>
        String(env[key as keyof CloudflareEnv] || "").length < min
    )
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      `Missing or weak production secrets: ${missing.join(", ")}`
    );
  }

  if (tronGridApiKey.length < 16) {
    throw new Error("Missing or weak production secrets: TRON_GRID_API_KEY");
  }

  if (env.ADMIN_PASSWORD === "admin") {
    throw new Error(
      "ADMIN_PASSWORD must not use the default value in production"
    );
  }

  if (env.ADMIN_USERNAME === "admin") {
    throw new Error(
      "ADMIN_USERNAME must not use the default value in production"
    );
  }
}
