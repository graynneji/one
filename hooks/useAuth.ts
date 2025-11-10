import { AuthAdapter } from "@/adapter/authAdapter";
import { Client } from "@/utils/client";
import { useState } from "react";
import { AuthService } from "../services/authService";

const client = new Client();
const adapter = new AuthAdapter(client);
const authService = new AuthService(adapter);

export const useAuth = () => {
  const [loading, setLoading] = useState<boolean>(false);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const loginResult = await authService.login(email, password);
      const data = loginResult?.data ?? { session: null };
      return { data };
    } finally {
      setLoading(false);
    }
  };

  async function register<T>(
    email: string,
    password: string,
    others: Partial<T>
  ) {
    setLoading(true);
    try {
      await authService.register(email, password, others);
    } finally {
      setLoading(false);
    }
  }

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
    } finally {
      setLoading(false);
    }
  };

  return { login, register, logout, loading };
};
