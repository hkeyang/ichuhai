"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/session/api";
import type { AsyncState } from "./useMeProfile";

export interface SupportMessage {
  id: string;
  ticketId: string;
  authorType: "user" | "admin" | string;
  content: string;
  internal: boolean;
  createdAt: string;
}

export interface MeSupportTicket {
  id: string;
  ticketNo: string;
  orderId: string;
  orderNo: string;
  type: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  messages: SupportMessage[];
}

export function useMeSupportTickets(token: string): AsyncState<MeSupportTicket[]> {
  const [data, setData] = useState<MeSupportTicket[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch<{ tickets: MeSupportTicket[] }>("/api/me/support-tickets");
      setData(res.tickets);
    } catch (e) {
      setError(e instanceof Error ? e.message : "售后记录加载失败");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, reload: load };
}
