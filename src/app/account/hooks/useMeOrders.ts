"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/session/api";
import type { AsyncState } from "./useMeProfile";

export interface MeOrder {
  orderId: string;
  orderNo: string;
  status: string;
  email: string | null;
  amountUsdt: string;
  createdAt: string;
  productSnapshot: Record<string, unknown>;
  skuSnapshot: Record<string, unknown>;
}

export function useMeOrders(token: string): AsyncState<MeOrder[]> {
  const [data, setData] = useState<MeOrder[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch<{ orders: MeOrder[] }>("/api/me/orders");
      setData(res.orders);
    } catch (e) {
      setError(e instanceof Error ? e.message : "订单加载失败");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, reload: load };
}
