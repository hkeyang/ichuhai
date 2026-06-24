"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/session/api";
import type { SessionUser } from "@/lib/session/SessionContext";

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string;
  reload: () => void;
}

export function useMeProfile(token: string): AsyncState<SessionUser> {
  const [data, setData] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch<{ user: SessionUser }>("/api/me/profile");
      setData(res.user);
    } catch (e) {
      setError(e instanceof Error ? e.message : "资料加载失败");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, reload: load };
}
