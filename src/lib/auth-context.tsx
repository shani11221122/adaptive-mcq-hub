import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

interface User {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  isPremium: boolean;
}

interface AuthContextType {
  user: User | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; isAdmin: boolean; error?: string }>;
  signup: (username: string, email: string, password: string) => Promise<{ ok: boolean; needsConfirmation: boolean; error?: string }>;
  logout: () => Promise<void>;
  unlockPremium: (code: string) => Promise<boolean>;
  activatePremium: (plan?: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ ok: boolean; error?: string }>;
  // legacy no-op kept so existing admin UI compiles
  changeAdminCredentials: (currentPassword: string, newUsername: string, newPassword: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const PREMIUM_CODE_KEY = "mdcat_premium_code";
const DEFAULT_PREMIUM_CODE = "MDCAT2024";

export function setPremiumCode(code: string) {
  localStorage.setItem(PREMIUM_CODE_KEY, code);
}
export function getPremiumCode(): string {
  return localStorage.getItem(PREMIUM_CODE_KEY) || DEFAULT_PREMIUM_CODE;
}

async function loadProfile(userId: string, fallbackEmail: string): Promise<User | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("user_id, username, email, is_admin, is_premium")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) {
    console.error("loadProfile error", error);
  }
  if (!data) {
    return {
      id: userId,
      username: fallbackEmail.split("@")[0],
      email: fallbackEmail,
      isAdmin: false,
      isPremium: false,
    };
  }
  return {
    id: userId,
    username: data.username || fallbackEmail.split("@")[0],
    email: data.email || fallbackEmail,
    isAdmin: !!data.is_admin,
    isPremium: !!data.is_premium,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Set up listener FIRST
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const s = session as Session | null;
      if (!s?.user) {
        setUser(null);
        return;
      }
      // defer DB call to avoid deadlock
      setTimeout(() => {
        loadProfile(s.user.id, s.user.email || "").then((u) => setUser(u));
      }, 0);
    });

    // Then check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadProfile(session.user.id, session.user.email || "").then((u) => {
          setUser(u);
          setReady(true);
        });
      } else {
        setReady(true);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const login: AuthContextType["login"] = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error || !data.user) {
      return { ok: false, isAdmin: false, error: error?.message || "Invalid credentials" };
    }
    const profile = await loadProfile(data.user.id, data.user.email || email);
    setUser(profile);
    return { ok: true, isAdmin: !!profile?.isAdmin };
  };

  const signup: AuthContextType["signup"] = async (username, email, password) => {
    const redirectUrl = `${window.location.origin}/login`;
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { username: username.trim() },
      },
    });
    if (error) {
      return { ok: false, needsConfirmation: false, error: error.message };
    }
    // If session is null, email confirmation is required
    const needsConfirmation = !data.session;
    return { ok: true, needsConfirmation };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const unlockPremium = async (code: string): Promise<boolean> => {
    const valid = (localStorage.getItem(PREMIUM_CODE_KEY) || DEFAULT_PREMIUM_CODE).toUpperCase();
    if (code.trim().toUpperCase() !== valid) return false;
    if (!user) return false;
    const { error } = await supabase
      .from("profiles")
      .update({ is_premium: true })
      .eq("user_id", user.id);
    if (error) {
      console.error("unlockPremium update failed", error);
      return false;
    }
    setUser({ ...user, isPremium: true });
    return true;
  };

  const activatePremium = async (_plan: string = "Premium Monthly") => {
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .update({ is_premium: true })
      .eq("user_id", user.id);
    if (error) {
      console.error("activatePremium failed", error);
      return;
    }
    setUser({ ...user, isPremium: true });
  };

  const changePassword: AuthContextType["changePassword"] = async (_currentPassword, newPassword) => {
    if (!user) return { ok: false, error: "Not signed in" };
    if (!newPassword || newPassword.length < 8) return { ok: false, error: "New password must be at least 8 characters" };
    if (!/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) return { ok: false, error: "Use letters and numbers" };
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  };

  const changeAdminCredentials = (_c: string, _u: string, _p: string) => {
    // Legacy stub — admin role is now controlled via profiles.is_admin in DB.
    return false;
  };

  return (
    <AuthContext.Provider value={{ user, ready, login, signup, logout, unlockPremium, activatePremium, changePassword, changeAdminCredentials }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
