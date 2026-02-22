import { StyleSheet, Dimensions } from 'react-native';
import { Spacing, BorderRadius, Theme } from '@/constants/theme';

const { width, height } = Dimensions.get('window');

export const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#FFF0F5',
    },
    // 顶部装饰
    topDecoration: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 200,
      overflow: 'hidden',
    },
    circle1: {
      position: 'absolute',
      top: -50,
      right: -30,
      width: 150,
      height: 150,
      borderRadius: 75,
      backgroundColor: 'rgba(255, 182, 193, 0.3)',
    },
    circle2: {
      position: 'absolute',
      top: 20,
      left: -40,
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: 'rgba(255, 105, 180, 0.2)',
    },
    circle3: {
      position: 'absolute',
      top: 80,
      right: 50,
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: 'rgba(255, 192, 203, 0.4)',
    },
    // Logo 区域 - 无白色底，缩小上移
    logoSection: {
      alignItems: 'center',
      marginTop: height * 0.08,
      marginBottom: Spacing.lg,
    },
    slogan: {
      fontSize: 14,
      color: '#FF69B4',
      letterSpacing: 1,
      marginTop: Spacing.sm,
    },
    // 表单区域
    formContainer: {
      paddingHorizontal: Spacing.xl,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      borderRadius: BorderRadius.xl,
      paddingHorizontal: Spacing.lg,
      marginBottom: Spacing.lg,
      height: 56,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    inputIcon: {
      marginRight: Spacing.md,
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: '#333',
      height: '100%',
    },
    passwordInput: {
      paddingRight: 40,
    },
    eyeButton: {
      padding: Spacing.sm,
      position: 'absolute',
      right: Spacing.md,
    },
    // 忘记密码
    forgotPasswordButton: {
      alignSelf: 'flex-end',
      marginBottom: Spacing.lg,
    },
    forgotPasswordText: {
      fontSize: 14,
      color: '#FF69B4',
    },
    // 记住密码和忘记密码容器
    rememberForgotContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.lg,
    },
    rememberMeButton: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    rememberMeText: {
      fontSize: 14,
      color: '#666',
      marginLeft: Spacing.sm,
    },
    // 登录按钮
    loginButton: {
      backgroundColor: '#FF1493',
      borderRadius: BorderRadius.xl,
      height: 56,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#FF1493',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 5,
    },
    loginButtonDisabled: {
      backgroundColor: '#FFB6C1',
    },
    loginButtonText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '700',
      letterSpacing: 4,
    },
    // 注册区域
    registerSection: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: Spacing.xl,
    },
    registerHint: {
      fontSize: 14,
      color: '#999',
    },
    registerLink: {
      fontSize: 14,
      color: '#FF1493',
      fontWeight: '600',
      marginLeft: Spacing.xs,
    },
    // 其它登录方式
    otherLoginSection: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: Spacing.xl,
      marginBottom: Spacing.lg,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: '#E0E0E0',
    },
    otherLoginText: {
      fontSize: 12,
      color: '#999',
      marginHorizontal: Spacing.md,
    },
    // 微信登录
    wechatButton: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: '#07C160',
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'center',
      shadowColor: '#07C160',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
    },
  });
};
