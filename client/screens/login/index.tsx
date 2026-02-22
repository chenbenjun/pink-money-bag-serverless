import React, { useState, useMemo, useEffect } from 'react';
import { View, TouchableOpacity, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { TextInput } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/hooks/useTheme';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { createStyles } from './styles';
import { useAuth } from '@/contexts/AuthContext';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';
import { Logo } from '@/components/Logo';

const { width, height } = Dimensions.get('window');

// 记住密码的存储键
const REMEMBERED_USERNAME_KEY = 'remembered_username';
const REMEMBERED_PASSWORD_KEY = 'remembered_password';
const REMEMBER_ME_KEY = 'remember_me';

export default function LoginScreen() {
  const { theme, isDark } = useTheme();
  const router = useSafeRouter();
  const params = useSafeSearchParams<{ username?: string }>();
  const { login, isLoading } = useAuth();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [username, setUsername] = useState(params.username || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // 页面加载时读取记住的账号密码
  useEffect(() => {
    const loadRememberedCredentials = async () => {
      try {
        const savedRememberMe = await AsyncStorage.getItem(REMEMBER_ME_KEY);
        if (savedRememberMe === 'true') {
          const savedUsername = await AsyncStorage.getItem(REMEMBERED_USERNAME_KEY);
          const savedPassword = await AsyncStorage.getItem(REMEMBERED_PASSWORD_KEY);
          if (savedUsername) {
            setUsername(savedUsername);
          }
          if (savedPassword) {
            setPassword(savedPassword);
          }
          setRememberMe(true);
        }
      } catch (error) {
        console.error('读取记住的密码失败:', error);
      }
    };

    // 如果路由参数中没有用户名，才加载记住的账号
    if (!params.username) {
      loadRememberedCredentials();
    }
  }, [params.username]);

  const handleLogin = async () => {
    if (!username.trim()) {
      Alert.alert('提示', '请输入用户名');
      return;
    }
    if (!password) {
      Alert.alert('提示', '请输入密码');
      return;
    }

    setLoading(true);
    try {
      const success = await login(username.trim(), password);
      if (success) {
        // 处理记住密码
        if (rememberMe) {
          await AsyncStorage.setItem(REMEMBER_ME_KEY, 'true');
          await AsyncStorage.setItem(REMEMBERED_USERNAME_KEY, username.trim());
          await AsyncStorage.setItem(REMEMBERED_PASSWORD_KEY, password);
        } else {
          await AsyncStorage.removeItem(REMEMBER_ME_KEY);
          await AsyncStorage.removeItem(REMEMBERED_USERNAME_KEY);
          await AsyncStorage.removeItem(REMEMBERED_PASSWORD_KEY);
        }
        router.replace('/');
      } else {
        Alert.alert('登录失败', '用户名或密码错误');
      }
    } catch (error) {
      Alert.alert('错误', '登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert('提示', '请联系管理员重置密码');
  };

  const handleWeChatLogin = () => {
    Alert.alert('提示', '微信登录功能开发中');
  };

  return (
    <Screen
      backgroundColor="#FFF0F5"
      statusBarStyle={isDark ? 'light' : 'dark'}
    >
      <View style={styles.container}>
        {/* 顶部装饰 */}
        <View style={styles.topDecoration}>
          <View style={styles.circle1} />
          <View style={styles.circle2} />
          <View style={styles.circle3} />
        </View>

        {/* Logo 区域 - 无白色底，缩小上移 */}
        <View style={styles.logoSection}>
          <Logo size={100} showText={true} />
          <ThemedText style={styles.slogan}>记录每一笔，攒下小幸福</ThemedText>
        </View>

        {/* 登录表单 */}
        <View style={styles.formContainer}>
          {/* 用户名输入 */}
          <View style={styles.inputWrapper}>
            <FontAwesome6 name="user" size={20} color="#FF69B4" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="请输入用户名"
              placeholderTextColor="#999"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* 密码输入 */}
          <View style={styles.inputWrapper}>
            <FontAwesome6 name="lock" size={20} color="#FF69B4" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, styles.passwordInput]}
              placeholder="请输入密码"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <FontAwesome6
                name={showPassword ? 'eye' : 'eye-slash'}
                size={18}
                color="#FF69B4"
              />
            </TouchableOpacity>
          </View>

          {/* 记住密码和忘记密码 */}
          <View style={styles.rememberForgotContainer}>
            <TouchableOpacity
              style={styles.rememberMeButton}
              onPress={() => setRememberMe(!rememberMe)}
            >
              <FontAwesome6
                name={rememberMe ? 'square-check' : 'square'}
                size={18}
                color={rememberMe ? '#FF69B4' : '#999'}
              />
              <ThemedText style={styles.rememberMeText}>记住密码</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleForgotPassword}>
              <ThemedText style={styles.forgotPasswordText}>忘记密码？</ThemedText>
            </TouchableOpacity>
          </View>

          {/* 登录按钮 */}
          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <ThemedText style={styles.loginButtonText}>登 录</ThemedText>
            )}
          </TouchableOpacity>

          {/* 注册链接 */}
          <View style={styles.registerSection}>
            <ThemedText style={styles.registerHint}>还没有账号？</ThemedText>
            <TouchableOpacity onPress={() => router.push('/register')}>
              <ThemedText style={styles.registerLink}>立即注册</ThemedText>
            </TouchableOpacity>
          </View>

          {/* 其它登录方式 */}
          <View style={styles.otherLoginSection}>
            <View style={styles.dividerLine} />
            <ThemedText style={styles.otherLoginText}>其它登录方式</ThemedText>
            <View style={styles.dividerLine} />
          </View>

          {/* 微信登录 */}
          <TouchableOpacity style={styles.wechatButton} onPress={handleWeChatLogin}>
            <FontAwesome6 name="weixin" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </Screen>
  );
}
