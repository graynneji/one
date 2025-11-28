// app.config.ts
export default ({ config }: { config: any }) => ({
  ...config,
  name: "TherapyPlus",
  slug: "TherapyPlus",
  owner: "graynneji",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/P.png",
  scheme: "therapyPlus",
  userInterfaceStyle: "automatic",
  platforms: ["ios", "android"],
  newArchEnabled: true,

  updates: {
    fallbackToCacheTimeout: 0,
  },

  assetBundlePatterns: ["**/*"],

  splash: {
    image: "./assets/images/therapluslogo.png",
    resizeMode: "contain",
    backgroundColor: "#1D9BF0",
  },

  ios: {
    icon: "./assets/images/P.png",
    bundleIdentifier: "com.graynneji.TherapyPlus",
    supportsTablet: true,
    deploymentTarget: "15.1",
    useFrameworks: "static",
    infoPlist: {
      NSCameraUsageDescription:
        "This app uses the camera to make video calls and take photos",
      NSMicrophoneUsageDescription:
        "This app uses the microphone to make audio calls and record videos",
      NSPhotoLibraryUsageDescription:
        "This app needs access to your photo library to save and share images",
      ITSAppUsesNonExemptEncryption: false,
      NSUserTrackingUsageDescription: "Allow notifications for updates.",
      UIBackgroundModes: ["remote-notification"],
    },
  },

  android: {
    softwareKeyboardLayoutMode: "resize",
    icon: "./assets/images/P.png",
    package: "com.graynneji.TherapyPlus",
    adaptiveIcon: {
      foregroundImage: "./assets/images/P.png",
      backgroundColor: "#1D9BF0",
    },
    permissions: [
      "CAMERA",
      "RECORD_AUDIO",
      "MODIFY_AUDIO_SETTINGS",
      "ACCESS_NETWORK_STATE",
      "WAKE_LOCK",
      "SYSTEM_ALERT_WINDOW",
      "POST_NOTIFICATIONS",
    ],
    edgeToEdgeEnabled: true,
  },

  web: {
    favicon: "./assets/images/favicon.png",
    bundler: "metro",
  },

  plugins: [
    [
      "expo-splash-screen",
      {
        backgroundColor: "#1D9BF0",
        image: "./assets/images/therapluslogo.png",
        imageWidth: 200,
        resizeMode: "contain",
        dark: {
          backgroundColor: "#1D9BF0",
          image: "./assets/images/therapluslogo.png",
        },
      },
    ],
    "expo-router",
    [
      "expo-audio",
      {
        microphonePermission: "Allow TherapyPlus to access your microphone.",
      },
    ],
    [
      "expo-camera",
      {
        cameraPermission:
          "Allow TherapyPlus to access your camera for video calls and photos",
        microphonePermission:
          "Allow TherapyPlus to access your microphone for audio calls",
      },
    ],
    [
      "@config-plugins/react-native-webrtc",
      {
        cameraPermission: "Allow TherapyPlus to access your camera",
        microphonePermission: "Allow TherapyPlus to access your microphone",
      },
    ],
    [
      "expo-media-library",
      {
        photosPermission: "Allow TherapyPlus to save photos.",
        savePhotosPermission: "Allow TherapyPlus to save photos.",
      },
    ],
    [
      "expo-image-picker",
      {
        photosPermission:
          "TherapyPlus accesses your photos for you to post on community and set profile pictures.",
      },
    ],
    [
      "expo-build-properties",
      {
        android: {
          minSdkVersion: 24,
          compileSdkVersion: 35,
          targetSdkVersion: 34,
          buildToolsVersion: "34.0.0",
          kotlinVersion: "2.0.0",
        },
        ios: {
          deploymentTarget: "15.1",
          useFrameworks: "static",
        },
      },
    ],
    [
      "expo-notifications",
      {
        icon: "./assets/images/P.png",
        color: "#ffffff",
        sounds: ["./assets/sounds/message.wav"],
      },
    ],
  ],

  notification: {
    icon: "./assets/images/P.png",
    color: "#ffffff",
    androidMode: "default",
    androidCollapsedTitle: "{{unread_count}} new notifications",
  },

  extra: {
    ...config.expo?.extra,
    router: {
      origin: false,
    },
    apiUrl: process.env.EXPO_PUBLIC_API_URL,
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    turnServer: process.env.TURN_SERVER,
    expoProjectId: process.env.EXPO_PUBLIC_PROJECT_ID,
    eas: {
      projectId: "0e3ccfe9-a97e-48f7-a46c-fe779c162c0d",
    },
  },
});
