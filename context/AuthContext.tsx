// context/AuthContext.tsx
import { AuthAdapter } from "@/adapter/authAdapter";
import { AuthService } from "@/services/authService";
import { Client } from "@/utils/client";
import { Session } from "@supabase/supabase-js";
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const client = new Client();
const authAdapter = new AuthAdapter(client);
const authService = new AuthService(authAdapter);

type AuthContextType = {
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: <T>(email: string, password: string, others: Partial<T>) => Promise<{ data: { user: any | null; session: Session | null; } | { user: null; session: null; }; error: any | null; }>;
  verifyOtp: (email: string, otp: string) => Promise<any>;
  resendOtp: (email: string) => Promise<void>;
  logout: () => Promise<void>;
};

interface DataUser {
  data: {
    session: Session | null
  }
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  loading: true,
  login: async () => Promise.resolve({}),
  register: async () => Promise.resolve({
    data: { user: null, session: null },
    error: null
  }),
  verifyOtp: async () => Promise.resolve(),
  resendOtp: async () => Promise.resolve(),
  logout: async () => Promise.resolve()
});



export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const callRefresh = async () => {
    const { success } = await authService.refreshSession()
    if (!success) return
  }

  useEffect(() => {
    // get initial session
    const init = async () => {
      try {
        callRefresh()
        const { data } = await authService
          .checkUser()
          .catch(() => ({ data: { session: null } }));
        const { access_token, refresh_token, ...safeSession } = data.session;
        setSession(safeSession as Session);
        // setSession(data?.session ?? null);
      } catch (err) {
        setSession(null)
      } finally {
        setLoading(false);
      }
    }
    init()

    // subscribe to changes
    const subscription = authService.onAuthChange((session: Session | null) => {
      setSession(session);
    });

    return () => {
      subscription?.unsubscribe?.();
    };
  }, []);

  useEffect(() => { }, [session]);

  async function login(email: string, password: string) {
    await SecureStore.setItemAsync('email', email);
    await SecureStore.setItemAsync('password', password);
    setLoading(true);
    try {
      const loginResult = await authService.login(email, password);
      const data = loginResult?.data ?? { session: null };
      const error = loginResult?.error ?? null
      setSession(data?.session);
      return { data, error };
    } finally {
      setLoading(false);
    }
  };

  async function register<T>(email: string, password: string, others: Partial<T>) {
    setLoading(true);
    try {
      const result = await authService.register(email, password, others);
      const data = result?.data ?? { user: null, session: null };
      const error = result?.error ?? null;
      return { data, error }
    } finally {
      setLoading(false);
    }
  };

  async function verifyOtp<T>(email: string, otp: string) {
    setLoading(true);
    try {
      await authService.verifyOtp(email, otp);
    } finally {
      setLoading(false);
    }
  };

  async function resendOtp<T>(email: string) {
    setLoading(true);
    try {
      await authService.resendOtp(email);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={useMemo(() => ({ session, loading, login, register, verifyOtp, resendOtp, logout }), [session, loading])}>
      {children}
    </AuthContext.Provider>
  );
};

export const useCheckAuth = () => useContext(AuthContext);
