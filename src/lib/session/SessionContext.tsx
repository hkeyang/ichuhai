"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { readAuthToken, clearAuthToken } from "./token";

export interface SessionUser {
  id: string;
  email: string | null;
  nickname: string | null;
  defaultCurrency: string;
  balanceUsdt: string;
}

interface SessionValue {
  token: string;
  user: SessionUser | null;
  initializing: boolean;
  setUser: (user: SessionUser | null) => void;
  logout: () => void;
}

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState("");
  const [user, setUser] = useState<SessionUser | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    setToken(readAuthToken());
    setInitializing(false);
  }, []);

  const logout = useCallback(() => {
    clearAuthToken();
    setToken("");
    setUser(null);
    window.location.href = "/login";
  }, []);

  return (
    <SessionContext.Provider value={{ token, user, initializing, setUser, logout }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
