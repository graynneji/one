// const tintColorLight = "#4CAF50";
// const tintColorDark = "#4CAF50";

// export const Colors = {
//   light: {
//     text: "#1f2937",
//     background: "#f7f9fc",
//     tint: tintColorLight,
//     icon: "#4b5563",
//     tabIconDefault: "#9ca3af",
//     tabIconSelected: tintColorLight,

//     // Background variations
//     surface: "#ffffff",
//     headerBackground: "#ffffff",
//     item: "#f8f9fa",

//     // Text variations
//     textSecondary: "#6b7280",
//     textTertiary: "#9ca3af",
//     placeholder: "#a1a9b8",

//     // Message colors
//     senderBubble: "#4CAF50",
//     senderText: "#ffffff",
//     receiverBubble: "#f3f4f6",
//     receiverText: "#1f2937",
//     timestamp: "rgba(255, 255, 255, 0.8)",
//     timestampReceiver: "#9ca3af",

//     // Input colors
//     inputBackground: "#ffffff",
//     inputBorder: "#e5e7eb",
//     inputText: "#1f2937",

//     // Button colors
//     primary: "#4CAF50",
//     primaryText: "#ffffff",
//     callButton: "#f9fafb",
//     danger: "#ef4444",

//     // Status colors
//     online: "#4CAF50",
//     offline: "#9ca3af",
//     sending: "#f59e0b",
//     failed: "#ef4444",

//     // Border colors
//     border: "#e5e7eb",
//     divider: "#f3f4f6",

//     // Icon variations
//     iconSecondary: "#9ca3af",

//     // Therapy-specific colors
//     calm: "#e0f2f1",
//     trust: "#e8f5e9",
//     warmth: "#fff8e1",
//   },

//   dark: {
//     text: "#e8eaf0",
//     background: "#0a0e1a",
//     tint: tintColorDark,
//     icon: "#d1d5db",
//     tabIconDefault: "#7b8794",
//     tabIconSelected: tintColorDark,

//     // Background variations
//     surface: "#141b2d",
//     headerBackground: "#1a2332",
//     item: "#1e2742",

//     // Text variations
//     textSecondary: "#a5b4c7",
//     textTertiary: "#7b8794",
//     placeholder: "#697586",

//     // Message colors
//     senderBubble: "#4CAF50",
//     senderText: "#ffffff",
//     receiverBubble: "#1f2937",
//     receiverText: "#e8eaf0",
//     timestamp: "rgba(255, 255, 255, 0.6)",
//     timestampReceiver: "#7b8794",

//     // Input colors
//     inputBackground: "#1f2937",
//     inputBorder: "#374151",
//     inputText: "#e8eaf0",

//     // Button colors
//     primary: "#4CAF50",
//     primaryText: "#ffffff",
//     callButton: "#1f2937",
//     danger: "#ef4444",

//     // Status colors
//     online: "#4CAF50",
//     offline: "#7b8794",
//     sending: "#f59e0b",
//     failed: "#ef4444",

//     // Border colors
//     border: "#374151",
//     divider: "#1f2937",

//     // Icon variations
//     iconSecondary: "#9ca3af",

//     // Therapy-specific colors
//     calm: "#1a3a3a",
//     trust: "#1a3b28",
//     warmth: "#3a2f1a",
//   },
// };

// /**
//  * Get colors based on current theme
//  * @param isDark - Whether dark mode is active
//  * @returns Color palette for the current theme
//  */
// export const getColors = (isDark: boolean) => {
//   return isDark ? Colors.dark : Colors.light;
// };

// /**
//  * Export individual theme objects for direct access
//  */
// export const LightColors = Colors.light;
// export const DarkColors = Colors.dark;

const tintColorLight = "#1D9BF0"; // Twitter blue
const tintColorDark = "#1D9BF0";

export const Colors = {
  light: {
    // text: "#0F1419",
    text: "#1f2937",
    background: "#FFFFFF",
    tint: tintColorLight,
    icon: "#536471",
    tabIconDefault: "#536471",
    tabIconSelected: tintColorLight,

    // Background variations
    surface: "#FFFFFF",
    headerBackground: "#FFFFFF",
    item: "#F7F9F9",

    // Text variations
    // textSecondary: "#536471",
    // textTertiary: "#8B98A5",
    // placeholder: "#8B98A5",
    textSecondary: "#6b7280",
    textTertiary: "#9ca3af",
    placeholder: "#a1a9b8",

    // Message colors
    senderBubble: "#1D9BF0",
    senderText: "#FFFFFF",
    receiverBubble: "#EFF3F4",
    receiverText: "#0F1419",
    timestamp: "rgba(83, 100, 113, 0.8)",
    timestampReceiver: "#536471",

    // Input colors
    inputBackground: "#FFFFFF",
    inputBorder: "#CFD9DE",
    inputText: "#0F1419",
    inputFocusBorder: "#1D9BF0",

    // Button colors
    primary: "#1D9BF0",
    primaryText: "#FFFFFF",
    primaryHover: "#1A8CD8",
    secondary: "#EFF3F4",
    secondaryText: "#0F1419",
    callButton: "#EFF3F4",
    danger: "#F4212E",
    dangerHover: "#DC1A26",

    // Status colors
    online: "#00BA7C",
    offline: "#8B98A5",
    sending: "#FFD400",
    failed: "#F4212E",

    // Border colors
    border: "#EFF3F4",
    divider: "#EFF3F4",
    separator: "#CFD9DE",

    // Icon variations
    iconSecondary: "#8B98A5",
    iconHover: "#0F1419",

    // Hover/Active states
    hover: "#F7F9F9",
    pressed: "#E7ECF0",

    // Card/Modal
    card: "#FFFFFF",
    modal: "#FFFFFF",
    modalOverlay: "rgba(91, 112, 131, 0.4)",

    // Link
    link: "#1D9BF0",
    linkHover: "#1A8CD8",

    // Success/Warning/Error
    success: "#00BA7C",
    warning: "#FFD400",
    error: "#F4212E",

    // Special backgrounds
    highlight: "rgba(29, 155, 240, 0.1)",
    mentionBackground: "rgba(29, 155, 240, 0.1)",
    hashtagBackground: "rgba(29, 155, 240, 0.1)",

    // Therapy-specific colors (adapted to Twitter style)
    calm: "rgba(29, 155, 240, 0.1)",
    trust: "rgba(0, 186, 124, 0.1)",
    warmth: "rgba(255, 212, 0, 0.1)",
  },

  dark: {
    // text: "#E7E9EA",
    text: "#e8eaf0",
    background: "#000000",
    tint: tintColorDark,
    icon: "#71767B",
    tabIconDefault: "#71767B",
    tabIconSelected: tintColorDark,

    // Background variations
    surface: "#000000",
    // surface: "#141b2d",
    headerBackground: "#000000ff",
    item: "#16181C",
    // headerBackground: "#1a2332",
    //     item: "#1e2742",

    // Text variations
    // textSecondary: "#71767B",
    // textTertiary: "#8B98A5",
    // placeholder: "#71767B",
    textSecondary: "#a5b4c7",
    textTertiary: "#7b8794",
    placeholder: "#697586",

    // Message colors
    senderBubble: "#1D9BF0",
    senderText: "#FFFFFF",
    receiverBubble: "#2F3336",
    receiverText: "#E7E9EA",
    timestamp: "#e7e9eacf",
    timestampReceiver: "#71767B",

    // Input colors
    inputBackground: "#000000",
    inputBorder: "#2F3336",
    inputText: "#E7E9EA",
    inputFocusBorder: "#1D9BF0",

    // Button colors
    primary: "#1D9BF0",
    primaryText: "#FFFFFF",
    primaryHover: "#1A8CD8",
    secondary: "#16181C",
    secondaryText: "#E7E9EA",
    callButton: "#16181C",
    danger: "#F4212E",
    dangerHover: "#DC1A26",

    // Status colors
    online: "#00BA7C",
    offline: "#71767B",
    sending: "#FFD400",
    failed: "#F4212E",

    // Border colors
    border: "#2F3336",
    divider: "#2F3336",
    separator: "#38444D",

    // Icon variations
    iconSecondary: "#71767B",
    iconHover: "#E7E9EA",

    // Hover/Active states
    hover: "#16181C",
    pressed: "#1C1F23",

    // Card/Modal
    card: "#16181C",
    modal: "#000000",
    modalOverlay: "rgba(91, 112, 131, 0.4)",

    // Link
    link: "#1D9BF0",
    linkHover: "#1A8CD8",

    // Success/Warning/Error
    success: "#00BA7C",
    warning: "#FFD400",
    error: "#F4212E",

    // Special backgrounds
    highlight: "rgba(29, 155, 240, 0.1)",
    mentionBackground: "rgba(29, 155, 240, 0.1)",
    hashtagBackground: "rgba(29, 155, 240, 0.1)",

    // Therapy-specific colors (adapted to Twitter style)
    calm: "rgba(29, 155, 240, 0.15)",
    trust: "rgba(0, 186, 124, 0.15)",
    warmth: "rgba(255, 212, 0, 0.15)",
  },
};

/**
 * Get colors based on current theme
 * @param isDark - Whether dark mode is active
 * @returns Color palette for the current theme
 */
export const getColors = (isDark: boolean) => {
  return isDark ? Colors.dark : Colors.light;
};

/**
 * Export individual theme objects for direct access
 */
export const LightColors = Colors.light;
export const DarkColors = Colors.dark;

/**
 * Twitter-style color utilities
 */
export const TwitterColors = {
  // Brand colors
  blue: "#1D9BF0",
  blueHover: "#1A8CD8",

  // Functional colors
  green: "#00BA7C",
  yellow: "#FFD400",
  red: "#F4212E",
  pink: "#F91880",
  purple: "#7856FF",
  orange: "#FF7A00",

  // Grays (Light mode)
  lightGray50: "#F7F9F9",
  lightGray100: "#EFF3F4",
  lightGray200: "#E7ECF0",
  lightGray300: "#CFD9DE",
  lightGray400: "#AAB8C2",
  lightGray500: "#8B98A5",
  lightGray600: "#536471",
  lightGray700: "#3E4D5A",
  lightGray800: "#283339",
  lightGray900: "#0F1419",

  // Grays (Dark mode)
  darkGray50: "#E7E9EA",
  darkGray100: "#CFD9DE",
  darkGray200: "#B9CAD3",
  darkGray300: "#8B98A5",
  darkGray400: "#71767B",
  darkGray500: "#5B7083",
  darkGray600: "#38444D",
  darkGray700: "#2F3336",
  darkGray800: "#1C1F23",
  darkGray900: "#16181C",
  darkGray950: "#000000",

  // Alpha colors (for overlays)
  alpha: {
    white10: "rgba(255, 255, 255, 0.1)",
    white20: "rgba(255, 255, 255, 0.2)",
    white30: "rgba(255, 255, 255, 0.3)",
    white40: "rgba(255, 255, 255, 0.4)",
    black10: "rgba(0, 0, 0, 0.1)",
    black20: "rgba(0, 0, 0, 0.2)",
    black30: "rgba(0, 0, 0, 0.3)",
    black40: "rgba(0, 0, 0, 0.4)",
    blue10: "rgba(29, 155, 240, 0.1)",
    blue20: "rgba(29, 155, 240, 0.2)",
  },
};

/**
 * Get color with opacity
 * @param color - Base color
 * @param opacity - Opacity value (0-1)
 */
export const withOpacity = (color: string, opacity: number): string => {
  // Handle hex colors
  if (color.startsWith("#")) {
    const hex = color.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  // Return as-is if already rgba or rgb
  return color;
};

/**
 * Semantic color names for better readability
 */
export const SemanticColors = {
  light: {
    // Text
    textPrimary: Colors.light.text,
    textSecondary: Colors.light.textSecondary,
    textDisabled: Colors.light.textTertiary,
    textLink: Colors.light.link,

    // Backgrounds
    bgPrimary: Colors.light.background,
    bgSecondary: Colors.light.item,
    bgTertiary: Colors.light.hover,
    bgElevated: Colors.light.card,

    // Borders
    borderPrimary: Colors.light.border,
    borderSecondary: Colors.light.separator,
    borderFocus: Colors.light.inputFocusBorder,

    // Actions
    actionPrimary: Colors.light.primary,
    actionSecondary: Colors.light.secondary,
    actionDanger: Colors.light.danger,
    actionSuccess: Colors.light.success,
  },

  dark: {
    // Text
    textPrimary: Colors.dark.text,
    textSecondary: Colors.dark.textSecondary,
    textDisabled: Colors.dark.textTertiary,
    textLink: Colors.dark.link,

    // Backgrounds
    bgPrimary: Colors.dark.background,
    bgSecondary: Colors.dark.item,
    bgTertiary: Colors.dark.hover,
    bgElevated: Colors.dark.card,

    // Borders
    borderPrimary: Colors.dark.border,
    borderSecondary: Colors.dark.separator,
    borderFocus: Colors.dark.inputFocusBorder,

    // Actions
    actionPrimary: Colors.dark.primary,
    actionSecondary: Colors.dark.secondary,
    actionDanger: Colors.dark.danger,
    actionSuccess: Colors.dark.success,
  },
};

/**
 * Get semantic colors based on theme
 */
export const getSemanticColors = (isDark: boolean) => {
  return isDark ? SemanticColors.dark : SemanticColors.light;
};
