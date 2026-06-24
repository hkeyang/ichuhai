"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/session/api";
import type { AsyncState } from "./useMeProfile";

export interface LedgerEntry {
  id: string;
  type: string;
  amountUsdt: string;
  balanceAfter: string;
  status: string;
  method: string | null;
  note: string | null;
  referenceType: string | null;
  referenceId: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface BalanceData {
  balanceUsdt: string;
  ledger: LedgerEntry[];
}

export function useMeBalance(token: string): AsyncState<BalanceData> {
  const [data, setData] = useState<BalanceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch<BalanceData>("/api/me/balance");
      setData(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "余额加载失败");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, reload: load };
}
