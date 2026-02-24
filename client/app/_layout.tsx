import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack, useSegments, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LogBox } from 'react-native';
import Toast from 'react-native-toast-message';
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ColorSchemeProvider } from '@/hooks/useColorScheme';
import { useSafeRouter } from '@/hooks/useSafeRouter';

LogBox.ignoreLogs([
  "TurboModuleRegistry.getEnforcing(...): 'RNMapsAirModule' could not be found",
  // 添加其它想暂时忽略的错误或警告信息
]);

function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useSafeRouter();
  const segments = useSegments();
  const rootState = useRootNavigationState();
  const { currentUser, isLoading } = useAuth();

  useEffect(() => {
    // 待机检测：导航未挂载 或 鉴权正在加载中，直接返回
    if (!rootState?.key || isLoading) return;

    // 路径检测：确认当前是否在公开路由（启动页/登录/注册/切换用户）
    const inPublicRoute = segments.includes('splash') || segments.includes('login') || segments.includes('register') || segments.includes('user-switch');
    
    // 特殊处理：注册页面允许已登录用户访问（用于创建新用户）
    const isRegisterRoute = segments.includes('register');

    // 未登录保护：未登录且不在公开路由 → 跳转启动页
    if (!currentUser && !inPublicRoute) {
      router.replace('/splash');
    }

    // 已登录保护：已登录但在公开路由 → 跳转首页（注册页面除外，允许已登录用户创建新用户）
    if (currentUser && inPublicRoute && !isRegisterRoute) {
      router.replace('/');
    }
  }, [rootState?.key, currentUser, isLoading, segments]);

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ColorSchemeProvider>
        <AuthGuard>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <StatusBar style="dark"></StatusBar>
            <Stack screenOptions={{
              // 设置所有页面的切换动画为从右侧滑入，适用于iOS 和 Android
              animation: 'slide_from_right',
              gestureEnabled: true,
              gestureDirection: 'horizontal',
              // 隐藏自带的头部
              headerShown: false
            }}>
              <Stack.Screen name="splash" options={{ title: "启动页" }} />
              <Stack.Screen name="login" options={{ title: "登录" }} />
              <Stack.Screen name="register" options={{ title: "注册" }} />
              <Stack.Screen name="user-switch" options={{ title: "切换用户" }} />
              <Stack.Screen name="admin" options={{ title: "管理后台" }} />
              <Stack.Screen name="index" options={{ title: "首页" }} />
              <Stack.Screen name="add-transaction" options={{ title: "记一笔" }} />
              <Stack.Screen name="transaction-list" options={{ title: "账单记录" }} />
              <Stack.Screen name="transaction-detail" options={{ title: "详情" }} />
              <Stack.Screen name="settings" options={{ title: "设置" }} />
              <Stack.Screen name="feedback" options={{ title: "意见反馈" }} />
              <Stack.Screen name="feedback-history" options={{ title: "历史反馈" }} />
              <Stack.Screen name="feedback-detail" options={{ title: "反馈详情" }} />
              <Stack.Screen name="debug" options={{ title: "调试信息" }} />
              <Stack.Screen name="test-feedback" options={{ title: "测试反馈" }} />
              <Stack.Screen name="test-detail" options={{ title: "测试详情" }} />
            </Stack>
            <Toast />
          </GestureHandlerRootView>
        </AuthGuard>
      </ColorSchemeProvider>
    </AuthProvider>
  );
}
