import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { apiGet } from "../lib/apiClient";

const AuthContext = createContext(null);

function normalizeRole(role) {
  if (!role) return "customer";
  if (role === "admin" || role === "technician" || role === "customer") return role;
  return "customer";
}

// PUBLIC_INTERFACE
export function AuthProvider({ children }) {
  /** Provides Supabase session and backend-derived role for routing/authorization. */
  const [session, setSession] = useState(null);
  const [userContext, setUserContext] = useState(null);
  const [loading, setLoading] = useState(true);

  async function refreshUserContext(activeSession) {
    if (!activeSession?.access_token) {
      setUserContext(null);
      return;
    }
    try {
      const me = await apiGet("/auth/me", activeSession.access_token);
      setUserContext({ ...me, role: normalizeRole(me.role) });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("Failed to load /auth/me; falling back to Supabase user only.", e);
      setUserContext({
        user_id: activeSession.user?.id,
        email: activeSession.user?.email ?? null,
        role: "customer",
        access_token: activeSession.access_token
      });
    }
  }

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(data.session || null);
      await refreshUserContext(data.session || null);
      setLoading(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!mounted) return;
      setSession(newSession || null);
      await refreshUserContext(newSession || null);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(() => {
    const role = normalizeRole(userContext?.role);
    return {
      loading,
      session,
      user: session?.user || null,
      accessToken: session?.access_token || null,
      role,
      userContext,
      // PUBLIC_INTERFACE
      signOut: async () => {
        /** Signs the user out of Supabase. */
        await supabase.auth.signOut();
      }
    };
  }, [loading, session, userContext]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// PUBLIC_INTERFACE
export function useAuth() {
  /** Hook for accessing auth/session/role info. */
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
