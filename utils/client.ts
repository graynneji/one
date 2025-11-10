import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import Constants from "expo-constants";

export class Client {
  supabase: SupabaseClient;
  constructor() {
    const supabaseUrl =
      process.env.SUPABASE_URL ?? Constants.expoConfig?.extra?.supabaseUrl;
    const supabaseAnonKey =
      process.env.SUPABASE_ANON_KEY ??
      Constants.expoConfig?.extra?.supabaseAnonKey;
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        "SUPABASE_URL and SUPABASE_ANON_KEY must be defined in environment variables."
      );
    }

    this.supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }
}
