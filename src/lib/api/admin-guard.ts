// src/lib/api/admin-guard.ts
// 后台路由共享工具：管理员鉴权、分页解析、脱敏。

import { HttpError } from "./errors";
import { verifyAdminSessionToken } from "./admin-session";

export interface AdminActor {
  actorId: string;
  role: string;
}

/**
 * 校验管理员 token。生产环境强制校验，非生产环境放行（与既有路由一致）。
 * 返回操作者信息用于审计。actorId 取 x-admin-username 头（前端登录时下发），兜底 "admin"。
 */
export async function requireAdmin(request: Request, env: CloudflareEnv): Promise<AdminActor> {
  const token = request.headers.get("x-admin-token") || "";
  if (env.NODE_ENV === "production") {
    const valid = await verifyAdminSessionToken(token, env);
    if (!valid) throw new HttpError(401, "admin auth required");
  }
  const actorId = (request.headers.get("x-admin-username") || "admin").trim() || "admin";
  return { actorId, role: "admin" };
}

export interface Pagination {
  page: number;
  pageSize: number;
  offset: number;
}

export function parsePagination(url: URL, defaultPageSize = 20, maxPageSize = 100): Pagination {
  const page = Math.max(1, Number(url.searchParams.get("page") || "1") || 1);
  const rawSize = Number(url.searchParams.get("pageSize") || String(defaultPageSize)) || defaultPageSize;
  const pageSize = Math.min(maxPageSize, Math.max(1, rawSize));
  return { page, pageSize, offset: (page - 1) * pageSize };
}

export function param(url: URL, key: string): string {
  return (url.searchParams.get(key) || "").trim();
}

/** 列表分页响应统一格式 */
export function pageEnvelope<T>(items: T[], total: number, pagination: Pagination) {
  return { items, total, page: pagination.page, pageSize: pagination.pageSize };
}

/** 与 ops/import 一致的脱敏规则（保留首尾 4 位）。 */
export function maskInventoryValue(value: string): string {
  const v = value.trim();
  if (v.length <= 8) return "***";
  return `${v.slice(0, 4)}***${v.slice(-4)}`;
}
