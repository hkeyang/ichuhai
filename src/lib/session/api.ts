"use client";

import { readAuthToken, clearAuthToken } from "./token";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = readAuthToken();
  const headers = new Headers(options.headers);
  if (token) headers.set("authorization", `Bearer ${token}`);
  if (options.body && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  const response = await fetch(path, { ...options, headers });
  const data = await response.json().catch(() => ({}));

  if (response.status === 401) {
    clearAuthToken();
    // 令牌失效：清除后直接回登录页，避免「重试 → 无 token → 又 401」的死循环
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new ApiError(401, (data as { error?: string }).error || "未登录或登录已过期");
  }
  if (!response.ok) {
    throw new ApiError(response.status, (data as { error?: string }).error || "请求失败");
  }
  return data as T;
}
