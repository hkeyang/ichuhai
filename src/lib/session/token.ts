"use client";

const TOKEN_KEY = "gfAuthToken";
const EXPIRES_KEY = "gfAuthExpiresAt";

export function readAuthToken(): string {
  if (typeof window === "undefined") return "";
  const token = window.localStorage.getItem(TOKEN_KEY) || "";
  const expiresAt = Number(window.localStorage.getItem(EXPIRES_KEY) || 0);
  if (token && expiresAt && expiresAt <= Date.now()) {
    clearAuthToken();
    return "";
  }
  return token;
}

export function clearAuthToken(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(EXPIRES_KEY);
  window.localStorage.removeItem("gfUser");
}
