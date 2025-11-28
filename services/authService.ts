import { AuthAdapter } from "@/adapter/authAdapter";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Session } from "@supabase/supabase-js";
import { router } from "expo-router";
import Toast from "react-native-toast-message";

export class AuthService {
  constructor(private authAdapter: AuthAdapter) {}

  async register<T>(email: string, password: string, others: Partial<T>) {
    const { data, error } = await this.authAdapter.signUp(
      email,
      password,
      others
    );
    if (error) {
      Toast.show({
        type: "error",
        text1: "Registration Failed",
        text2: error.message,
      });
      return;
    }
    if (data?.session)
      Toast.show({
        type: "info",
        text1: "Check your email",
        text2: "Please verify your email to continue.",
      });
    return { data, error };
  }

  async verifyOtp(email: string, otp: string) {
    const { error } = await this.authAdapter.verifyOtp(email, otp);
    if (error) {
      Toast.show({
        type: "error",
        text1: "Email Verification Failed",
        text2: error.message,
      });
    }
    return { error };
  }

  async resendOtp(email: string) {
    const { error } = await this.authAdapter.resendOtp(email);
    if (error) {
      Toast.show({
        type: "error",
        text1: "Resend otp failed",
        text2: error.message,
      });
      return;
    }
    // return { data };
  }

  async login(email: string, password: string) {
    const { data, error } = await this.authAdapter.signIn(email, password);
    if (error) {
      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: error.message,
      });
      if (error.message === "Email not confirmed") {
        router.push({
          pathname: "/auth/verify-email-screen",
          params: {
            email: email,
          },
        });
        this.resendOtp(email);
      }
    }
    return { data, error };
  }

  async forgetPassword(email: string) {
    const { error } = await this.authAdapter.forgetPassword(email);
    if (error) {
      Toast.show({
        type: "error",
        text1: "Resend otp failed",
        text2: error.message,
      });
      return;
    }
    // return { data };
  }

  async logout() {
    const { error } = await this.authAdapter.signOut();
    if (error) {
      Toast.show({
        type: "error",
        text1: "Logout Failed",
        text2: error.message,
      });
      return;
    }
    // return { error };
  }

  async checkUser(): Promise<any> {
    const { data, error } = await this.authAdapter.getUser();
    // if (error) {
    //   Toast.show({
    //     type: "error",
    //     text1: "Login Failed",
    //     text2: error.message,
    //   });
    //   return;
    // }
    if (error) {
      // Silent fail — no Toast
      return { data: { session: null }, error };
    }
    return { data, error };
  }

  async refreshSession(): Promise<{ success: boolean }> {
    try {
      const { data, error } = await this.authAdapter.refreshOrClearSession();
      const errMsg = (error as any)?.message;

      if (errMsg?.includes("Invalid Refresh Token")) {
        await AsyncStorage.removeItem("supabase.auth.token");
        return { success: false };
      }
      if (errMsg?.includes("Auth session missing!")) {
        await AsyncStorage.removeItem("supabase.auth.token");
        return { success: false };
      }
      if (error) throw new Error(errMsg || "Session refresh failed");
      return { success: true };
    } catch (err: unknown) {
      await AsyncStorage.removeItem("supabase.auth.token");
      return { success: false };
    }
  }

  onAuthChange(callback: (session: Session | null) => void) {
    return this.authAdapter.onAuthStateChange(callback);
  }
}
