import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
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

  private constructor() {}

  // Singleton pattern - only one instance exists
  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Initialize notifications (call once in App.tsx)
  async initialize() {
    try {
      await this.setupNotificationChannel();
      await this.requestPermissions();
      this.setupNotificationListeners();
    } catch (error) {
      console.error("Failed to initialize notifications:", error);
    }
  }

  // Setup Android notification channel
  private async setupNotificationChannel() {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("messages", {
        name: "Messages",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        sound: "message.wav", // Optional: custom sound
        lightColor: "#FF231F7C",
      });
    }
  }

  // Request notification permissions
  async requestPermissions(): Promise<string | null> {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.warn("Notification permission not granted");
      return null;
    }

    // Get push token for remote notifications
    const tokenData = await Notifications.getExpoPushTokenAsync();
    this.pushToken = tokenData.data;

    return this.pushToken;
  }

  // Get the current push token
  getPushToken(): string | null {
    return this.pushToken;
  }

  // Send a local notification
  async sendLocalNotification(
    title: string,
    body: string,
    data?: Record<string, any>
  ) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: "default",
          data: data || {},
        },
        trigger: null, // Show immediately
      });
    } catch (error) {
      console.error("Failed to send notification:", error);
    }
  }

  // Send a message notification
  async sendMessageNotification(
    senderName: string,
    messageContent: string,
    messageId: string,
    senderId: string
  ) {
    await this.sendLocalNotification(senderName, messageContent, {
      type: "message",
      messageId,
      senderId,
    });
  }

  // Setup notification listeners
  private setupNotificationListeners() {
    // When notification is received while app is in foreground
    Notifications.addNotificationReceivedListener((notification) => {
      console.log("Notification received:", notification);
    });

    // When user taps on notification
    Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      console.log("Notification tapped:", data);

      // Handle navigation based on notification data
      // You can use navigation service here
      if (data.type === "message") {
        // Navigate to chat screen with senderId
        // NavigationService.navigate('Chat', { userId: data.senderId });
      }
    });
  }

  // Cancel all notifications
  async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  // Get notification badge count
  async getBadgeCount(): Promise<number> {
    return await Notifications.getBadgeCountAsync();
  }

  // Set notification badge count
  async setBadgeCount(count: number) {
    await Notifications.setBadgeCountAsync(count);
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();
