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

  const checks: [string, number][] = [
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

  if (env.ADMIN_PASSWORD === "admin") {
    throw new Error(
      "ADMIN_PASSWORD must not use the default value in production"
    );
  }
}
