import { Client } from "@/utils/client";
import Constants from "expo-constants";
import {
  addNotificationReceivedListener,
  addNotificationResponseReceivedListener,
  AndroidImportance,
  getExpoPushTokenAsync,
  getPermissionsAsync,
  requestPermissionsAsync,
  setNotificationChannelAsync,
  setNotificationHandler,
} from "expo-notifications";
import { Platform } from "react-native";

setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

class NotificationService {
  private static instance: NotificationService;
  private pushToken: string | null = null;
  private client: Client;
  private userId: string | null = null;

  private constructor() {
    this.client = new Client();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async initialize(userId?: string) {
    try {
      if (userId) {
        this.userId = userId;
      }
      await this.setupNotificationChannel();
      const token = await this.requestPermissions();

      if (token && this.userId) {
        await this.storePushTokenInUserTable(token);
      }

      this.setupNotificationListeners();
      return token;
    } catch (error) {
      console.error("Failed to initialize notifications:", error);
      return null;
    }
  }

  private async setupNotificationChannel() {
    if (Platform.OS === "android") {
      await setNotificationChannelAsync("messages", {
        name: "Messages",
        importance: AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        sound: "message.wav",
        lightColor: "#FF231F7C",
      });

      await setNotificationChannelAsync("calls", {
        name: "Incoming Calls",
        importance: AndroidImportance.MAX,
        vibrationPattern: [0, 500, 200, 500],
        sound: "ringtone.wav",
        lightColor: "#00FF00",
      });
    }
  }

  async requestPermissions(): Promise<string | null> {
    const { status: existingStatus } = await getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.warn("Notification permission not granted");
      return null;
    }

    const tokenData = await getExpoPushTokenAsync({
      projectId:
        process.env.EXPO_PUBLIC_PROJECT_ID ??
        Constants.expoConfig?.extra?.expoProjectId,
    });
    this.pushToken = tokenData.data;

    return this.pushToken;
  }

  // Store push token directly in user table using JSONB
  private async storePushTokenInUserTable(token: string) {
    try {
      if (!this.userId) {
        console.warn("No userId available to store push token");
        return;
      }

      // Call the database function to update push tokens
      const { error } = await this.client.supabase.rpc("upsert_push_token", {
        p_user_id: this.userId,
        p_token: token,
        p_platform: Platform.OS,
      });

      if (error) {
        console.error("Error storing push token:", error);
      } else {
        console.log("Push token stored successfully in user table");
      }
    } catch (error) {
      console.error("Failed to store push token:", error);
    }
  }

  // Remove push token (on logout)
  async removePushToken() {
    try {
      if (!this.userId || !this.pushToken) return;

      // Get current tokens
      const { data: userData } = await this.client.supabase
        .from("user")
        .select("push_tokens")
        .eq("user_id", this.userId)
        .single();

      if (userData?.push_tokens) {
        // Filter out current device's token
        const updatedTokens = (userData.push_tokens as any[]).filter(
          (t: any) => t.platform !== Platform.OS
        );

        // Update user table
        await this.client.supabase
          .from("user")
          .update({ push_tokens: updatedTokens })
          .eq("user_id", this.userId);
      }
    } catch (error) {
      console.error("Failed to remove push token:", error);
    }
  }

  getPushToken(): string | null {
    return this.pushToken;
  }

  private setupNotificationListeners() {
    addNotificationReceivedListener((notification) => {
      console.log("Notification received:", notification);
    });

    addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      console.log("Notification tapped:", data);

      // Handle navigation based on notification type
      if (data.type === "message") {
        // Navigate to chat
      } else if (data.type === "incoming_call") {
        // Navigate to call screen
      }
    });
  }
}

export const notificationService = NotificationService.getInstance();
