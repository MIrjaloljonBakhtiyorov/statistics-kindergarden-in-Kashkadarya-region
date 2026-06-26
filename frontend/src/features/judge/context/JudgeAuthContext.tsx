import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { Judge } from "../types";

const API = "/api/judge";

interface JudgeAuthCtx {
  judge: Judge | null;
  loading: boolean;
  login: (login: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const JudgeAuthContext = createContext<JudgeAuthCtx | null>(null);

export function JudgeAuthProvider({ children }: { children: ReactNode }) {
  const [judge, setJudge] = useState<Judge | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const r = await fetch(`${API}/auth/me`, { credentials: "include" });
      if (r.ok) {
        const { data } = await r.json();
        setJudge(data);
      } else {
        setJudge(null);
      }
    } catch {
      setJudge(null);
    }
  };

  useEffect(() => {
    // Also check localStorage for quick restore
    const stored = localStorage.getItem("judgeUser");
    if (stored) {
      try { setJudge(JSON.parse(stored)); } catch { /* ignore */ }
    }
    refresh().finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (judge) localStorage.setItem("judgeUser", JSON.stringify(judge));
    else localStorage.removeItem("judgeUser");
  }, [judge]);

  const login = async (loginVal: string, password: string) => {
    const r = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ login: loginVal, password }),
    });
    const payload = await r.json();
    if (!r.ok) throw new Error(payload?.error?.message ?? "Login yoki parol noto'g'ri");
    setJudge(payload.data);
  };

  const logout = async () => {
    await fetch(`${API}/auth/logout`, { method: "POST", credentials: "include" });
    setJudge(null);
  };

  return (
    <JudgeAuthContext.Provider value={{ judge, loading, login, logout, refresh }}>
      {children}
    </JudgeAuthContext.Provider>
  );
}

export function useJudgeAuth() {
  const ctx = useContext(JudgeAuthContext);
  if (!ctx) throw new Error("useJudgeAuth must be used within JudgeAuthProvider");
  return ctx;
}
