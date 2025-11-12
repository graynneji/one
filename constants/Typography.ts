// // constants/Typography.ts
// export const Typography = {
//   // Body Text - Inter (clean, professional, highly readable)
//   body: {
//     regular: "Inter-Regular",
//     medium: "Inter-Medium",
//     semiBold: "Inter-SemiBold",
//   },

//   // Headers - Poppins (warm, friendly, approachable)
//   heading: {
//     regular: "Poppins-Regular",
//     medium: "Poppins-Medium",
//     semiBold: "Poppins-SemiBold",
//     bold: "Poppins-Bold",
//   },

//   // Logo - Dancing Script (elegant, calming, therapeutic feel)
//   logo: {
//     regular: "DancingScript-Regular",
//     medium: "DancingScript-Medium",
//     semiBold: "DancingScript-SemiBold",
//     bold: "DancingScript-Bold",
//   },

//   // Font Sizes
//   size: {
//     xs: 10,
//     sm: 12,
//     base: 14,
//     md: 16,
//     lg: 18,
//     xl: 20,
//     "2xl": 24,
//     "3xl": 30,
//     "4xl": 36,
//     "5xl": 48,
//   },

//   // Line Heights
//   lineHeight: {
//     tight: 1.2,
//     normal: 1.5,
//     relaxed: 1.75,
//     loose: 2,
//   },

//   // Letter Spacing
//   letterSpacing: {
//     tighter: -0.5,
//     tight: -0.25,
//     normal: 0,
//     wide: 0.5,
//     wider: 1,
//   },
// };
// constants/Typography.ts
import { Platform } from "react-native";

export const Typography = {
  // Body Text - Inter
  body: {
    regular: Platform.select({
      ios: "Inter-Regular",
      android: "Inter18pt-Regular", // Use the actual font name
    }),
    medium: Platform.select({
      ios: "Inter-Medium",
      android: "Inter18pt-Medium",
    }),
    semiBold: Platform.select({
      ios: "Inter-SemiBold",
      android: "Inter18pt-SemiBold",
    }),
  },
  // Headers - Poppins
  heading: {
    regular: Platform.select({
      ios: "Poppins-Regular",
      android: "Poppins-Regular", // Use the actual font name
    }),
    medium: Platform.select({
      ios: "Poppins-Medium",
      android: "Poppins-Medium",
    }),
    semiBold: Platform.select({
      ios: "Poppins-SemiBold",
      android: "Poppins-SemiBold",
    }),
    bold: Platform.select({
      ios: "Poppins-Bold",
      android: "Poppins-Bold",
    }),
  },
  // Logo - Dancing Script
  logo: {
    regular: Platform.select({
      ios: "DancingScript-Regular",
      android: "DancingScript-Regular",
    }),
    medium: Platform.select({
      ios: "DancingScript-Medium",
      android: "DancingScript-Medium",
    }),
    semiBold: Platform.select({
      ios: "DancingScript-SemiBold",
      android: "DancingScript-SemiBold",
    }),
    bold: Platform.select({
      ios: "DancingScript-Bold",
      android: "DancingScript-Bold",
    }),
  },
  // Font Sizes
  size: {
    xs: 10,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    "2xl": 24,
    "3xl": 30,
    "4xl": 36,
    "5xl": 48,
  },
  // Line Heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },
  // Letter Spacing
  letterSpacing: {
    tighter: -0.5,
    tight: -0.25,
    normal: 0,
    wide: 0.5,
    wider: 1,
  },
};
