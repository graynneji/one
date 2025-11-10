// app.config.js
export default ({ config }: { config: any }) => ({
  ...config,
  platforms: ["ios", "android"],
  assetBundlePatterns: ["**/*"],
  plugins: [
    "expo-audio",
    [
      "expo-build-properties",
      {
        android: {
          minSdkVersion: 24,
          compileSdkVersion: 35,
          targetSdkVersion: 34,
          buildToolsVersion: "34.0.0",
        },
        ios: {
          deploymentTarget: "15.1",
          useFrameworks: "static",
        },
      },
    ],
  ],
  extra: {
    ...config.expo?.extra, // Preserve existing properties
    apiUrl: process.env.EXPO_PUBLIC_API_URL,
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    turnServer: process.env.TURN_SERVER,
    eas: {
      projectId: "0e3ccfe9-a97e-48f7-a46c-fe779c162c0d",
    },
  },
  name: "TherapyPlus",
  slug: "TherapyPlus",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./assets/images/splashIcon.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  android: {
    package: "com.graynneji.TherapyPlus",
    adaptiveIcon: {
      foregroundImage: "./assets/images/logo.png",
      backgroundColor: "#4e7560",
    },
  },
  ios: {
    bundleIdentifier: "com.graynneji.TherapyPlus",
    splash: {
      image: "./assets/images/splashIcon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    infoPlist: {
      NSCameraUsageDescription:
        "This app uses the camera to make video calls and take photos",
      NSMicrophoneUsageDescription:
        "This app uses the microphone to make audio calls and record videos",
      NSPhotoLibraryUsageDescription:
        "This app needs access to your photo library to save and share images",
      ITSAppUsesNonExemptEncryption: false,
    },
  },
});
