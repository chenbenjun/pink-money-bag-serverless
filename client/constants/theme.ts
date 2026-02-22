export const Colors = {
  light: {
    textPrimary: "#4A3F35",
    textSecondary: "#8B7E74",
    textMuted: "#C7BDB3",
    primary: "#EC4899", // Pink-500 - 粉红主色，适合小女孩
    accent: "#F472B6", // Pink-400 - 浅粉色辅助色
    success: "#34D399", // 柔和的绿色
    error: "#FB7185", // 柔和的红色
    backgroundRoot: "#FFF5F7", // 浅粉色背景
    backgroundDefault: "#FFF0F3", // 淡粉色卡片背景
    backgroundTertiary: "#FEF2F4", // 更浅的背景色，用于去线留白
    buttonPrimaryText: "#FFFFFF",
    tabIconSelected: "#EC4899",
    border: "#FCE7F3",
    borderLight: "#FDF2F8",
  },
  dark: {
    textPrimary: "#FDF2F8",
    textSecondary: "#F9A8D4",
    textMuted: "#D9778A",
    primary: "#F472B6", // Pink-400 - 暗色模式粉红主色
    accent: "#F9A8D4", // Pink-300
    success: "#6EE7B7",
    error: "#FDA4AF",
    backgroundRoot: "#831843", // 深粉紫背景
    backgroundDefault: "#9D174D",
    backgroundTertiary: "#BE185D", // 暗色模式去线留白背景
    buttonPrimaryText: "#FFF0F7",
    tabIconSelected: "#F472B6",
    border: "#FBCFE8",
    borderLight: "#F9A8D4",
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  "6xl": 64,
};

export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 28,
  "4xl": 32,
  full: 9999,
};

export const Typography = {
  display: {
    fontSize: 112,
    lineHeight: 112,
    fontWeight: "200" as const,
    letterSpacing: -4,
  },
  displayLarge: {
    fontSize: 112,
    lineHeight: 112,
    fontWeight: "200" as const,
    letterSpacing: -2,
  },
  displayMedium: {
    fontSize: 48,
    lineHeight: 56,
    fontWeight: "200" as const,
  },
  h1: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: "700" as const,
  },
  h2: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "700" as const,
  },
  h3: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "300" as const,
  },
  h4: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "600" as const,
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "700" as const,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400" as const,
  },
  bodyMedium: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500" as const,
  },
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400" as const,
  },
  smallMedium: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500" as const,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "400" as const,
  },
  captionMedium: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500" as const,
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500" as const,
    letterSpacing: 2,
    textTransform: "uppercase" as const,
  },
  labelSmall: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500" as const,
    letterSpacing: 1,
    textTransform: "uppercase" as const,
  },
  labelTitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700" as const,
    letterSpacing: 2,
    textTransform: "uppercase" as const,
  },
  link: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400" as const,
  },
  stat: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "300" as const,
  },
  tiny: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "400" as const,
  },
  navLabel: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "500" as const,
  },
};

export type Theme = typeof Colors.light;
