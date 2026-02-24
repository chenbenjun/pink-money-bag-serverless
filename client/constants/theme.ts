export const Colors = {
  // ========== 粉色系（默认）==========
  pink: {
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
      backgroundRoot: "#1F2937", // 深灰色背景 - 优雅不刺眼
      backgroundDefault: "#374151", // 中灰色卡片背景
      backgroundTertiary: "#4B5563", // 浅灰色输入框背景
      buttonPrimaryText: "#FFF0F7",
      tabIconSelected: "#F472B6",
      border: "#4B5563",
      borderLight: "#6B7280",
    },
  },

  // ========== 蓝色系 ==========
  blue: {
    light: {
      textPrimary: "#1E3A5F",
      textSecondary: "#5B7A99",
      textMuted: "#8B9DB3",
      primary: "#3B82F6", // Blue-500 - 蓝色主色
      accent: "#60A5FA", // Blue-400 - 浅蓝色辅助色
      success: "#34D399", // 柔和的绿色
      error: "#FB7185", // 柔和的红色
      backgroundRoot: "#F0F9FF", // 浅蓝色背景
      backgroundDefault: "#E0F2FE", // 淡蓝色卡片背景
      backgroundTertiary: "#F0F9FF", // 更浅的背景色
      buttonPrimaryText: "#FFFFFF",
      tabIconSelected: "#3B82F6",
      border: "#BAE6FD",
      borderLight: "#DBEAFE",
    },
    dark: {
      textPrimary: "#F0F9FF",
      textSecondary: "#93C5FD",
      textMuted: "#60A5FA",
      primary: "#60A5FA", // Blue-400 - 暗色模式蓝色主色
      accent: "#93C5FD", // Blue-300
      success: "#6EE7B7",
      error: "#FDA4AF",
      backgroundRoot: "#1F2937", // 深灰色背景
      backgroundDefault: "#374151", // 中灰色卡片背景
      backgroundTertiary: "#4B5563", // 浅灰色输入框背景
      buttonPrimaryText: "#FFFFFF",
      tabIconSelected: "#60A5FA",
      border: "#4B5563",
      borderLight: "#6B7280",
    },
  },

  // ========== 绿色系 ==========
  green: {
    light: {
      textPrimary: "#1B4D3E",
      textSecondary: "#4D8066",
      textMuted: "#7FB393",
      primary: "#10B981", // Emerald-500 - 绿色主色
      accent: "#34D399", // Emerald-400 - 浅绿色辅助色
      success: "#34D399", // 柔和的绿色
      error: "#FB7185", // 柔和的红色
      backgroundRoot: "#ECFDF5", // 浅绿色背景
      backgroundDefault: "#D1FAE5", // 淡绿色卡片背景
      backgroundTertiary: "#ECFDF5", // 更浅的背景色
      buttonPrimaryText: "#FFFFFF",
      tabIconSelected: "#10B981",
      border: "#A7F3D0",
      borderLight: "#D1FAE5",
    },
    dark: {
      textPrimary: "#ECFDF5",
      textSecondary: "#6EE7B7",
      textMuted: "#34D399",
      primary: "#34D399", // Emerald-400 - 暗色模式绿色主色
      accent: "#6EE7B7", // Emerald-300
      success: "#6EE7B7",
      error: "#FDA4AF",
      backgroundRoot: "#1F2937", // 深灰色背景
      backgroundDefault: "#374151", // 中灰色卡片背景
      backgroundTertiary: "#4B5563", // 浅灰色输入框背景
      buttonPrimaryText: "#FFFFFF",
      tabIconSelected: "#34D399",
      border: "#4B5563",
      borderLight: "#6B7280",
    },
  },

  // ========== 灰色系（经典）==========
  gray: {
    light: {
      textPrimary: "#1F2937",
      textSecondary: "#6B7280",
      textMuted: "#9CA3AF",
      primary: "#6B7280", // Gray-500 - 灰色主色
      accent: "#9CA3AF", // Gray-400 - 浅灰色辅助色
      success: "#34D399", // 柔和的绿色
      error: "#FB7185", // 柔和的红色
      backgroundRoot: "#F9FAFB", // 浅灰色背景
      backgroundDefault: "#F3F4F6", // 淡灰色卡片背景
      backgroundTertiary: "#F9FAFB", // 更浅的背景色
      buttonPrimaryText: "#FFFFFF",
      tabIconSelected: "#6B7280",
      border: "#E5E7EB",
      borderLight: "#F3F4F6",
    },
    dark: {
      textPrimary: "#F9FAFB",
      textSecondary: "#9CA3AF",
      textMuted: "#6B7280",
      primary: "#9CA3AF", // Gray-400 - 暗色模式灰色主色
      accent: "#D1D5DB", // Gray-300
      success: "#6EE7B7",
      error: "#FDA4AF",
      backgroundRoot: "#1F2937", // 深灰色背景
      backgroundDefault: "#374151", // 中灰色卡片背景
      backgroundTertiary: "#4B5563", // 浅灰色输入框背景
      buttonPrimaryText: "#FFFFFF",
      tabIconSelected: "#9CA3AF",
      border: "#4B5563",
      borderLight: "#6B7280",
    },
  },
};

// 向后兼容：保持原有导出
export const ColorsLegacy = {
  light: Colors.pink.light,
  dark: Colors.pink.dark,
};

export type ColorScheme = 'light' | 'dark';
export type ThemeStyle = 'pink' | 'blue' | 'green' | 'gray';
export type Theme = typeof Colors.pink.light;

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
