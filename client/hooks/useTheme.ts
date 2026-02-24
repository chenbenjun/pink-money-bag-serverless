import React from 'react';
import { Colors, ColorScheme, ThemeStyle } from '@/constants/theme';
import { useColorScheme } from '@/hooks/useColorScheme';
import AsyncStorage from '@react-native-async-storage/async-storage';

const COLOR_SCHEME_STORAGE_KEY = 'user_color_scheme';
const THEME_STYLE_STORAGE_KEY = 'user_theme_style';

export type ColorSchemeChoice = 'follow-system' | 'light' | 'dark';

const DEFAULT_COLOR_SCHEME: ColorSchemeChoice = 'follow-system';
const DEFAULT_THEME_STYLE: ThemeStyle = 'pink';

// 获取用户偏好的颜色方案
async function getColorScheme(): Promise<ColorSchemeChoice> {
  try {
    const saved = await AsyncStorage.getItem(COLOR_SCHEME_STORAGE_KEY);
    return (saved as ColorSchemeChoice) || DEFAULT_COLOR_SCHEME;
  } catch {
    return DEFAULT_COLOR_SCHEME;
  }
}

// 设置用户偏好的颜色方案
async function setColorScheme(scheme: ColorSchemeChoice): Promise<void> {
  try {
    await AsyncStorage.setItem(COLOR_SCHEME_STORAGE_KEY, scheme);
  } catch (error) {
    console.error('Failed to save color scheme:', error);
  }
}

// 获取用户偏好的主题风格
async function getThemeStyle(): Promise<ThemeStyle> {
  try {
    const saved = await AsyncStorage.getItem(THEME_STYLE_STORAGE_KEY);
    return (saved as ThemeStyle) || DEFAULT_THEME_STYLE;
  } catch {
    return DEFAULT_THEME_STYLE;
  }
}

// 设置用户偏好的主题风格
async function setThemeStyle(style: ThemeStyle): Promise<void> {
  try {
    await AsyncStorage.setItem(THEME_STYLE_STORAGE_KEY, style);
  } catch (error) {
    console.error('Failed to save theme style:', error);
  }
}

// 获取主题配置
function getTheme(colorScheme: ColorScheme | null | undefined, themeStyle: ThemeStyle = 'pink') {
  const isDark = colorScheme === 'dark';
  const themeColors = Colors[themeStyle] || Colors.pink;
  const theme = isDark ? themeColors.dark : themeColors.light;

  return {
    theme,
    isDark,
    themeStyle,
  };
}

// 主 Hook
function useTheme() {
  const systemColorScheme = useColorScheme();
  const [colorScheme, setColorSchemeState] = React.useState<ColorSchemeChoice>(DEFAULT_COLOR_SCHEME);
  const [themeStyle, setThemeStyleState] = React.useState<ThemeStyle>(DEFAULT_THEME_STYLE);
  const [loaded, setLoaded] = React.useState(false);

  // 加载用户设置
  React.useEffect(() => {
    const loadSettings = async () => {
      const [savedScheme, savedStyle] = await Promise.all([
        getColorScheme(),
        getThemeStyle(),
      ]);
      setColorSchemeState(savedScheme);
      setThemeStyleState(savedStyle);
      setLoaded(true);
    };
    loadSettings();
  }, []);

  // 计算实际使用的颜色方案
  const actualColorScheme: ColorScheme | null | undefined =
    colorScheme === 'follow-system' ? systemColorScheme : (colorScheme || null);

  return getTheme(actualColorScheme, themeStyle);
}

// 导出辅助函数
export {
  useTheme,
  getColorScheme,
  setColorScheme,
  getThemeStyle,
  setThemeStyle,
};
