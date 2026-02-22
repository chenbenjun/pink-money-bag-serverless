import React, { useState, useMemo } from 'react';
import { View, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { TextInput } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { createStyles } from './styles';
import { useAuth } from '@/contexts/AuthContext';

// 与设置页面保持一致：5个动物 + 5个水果/植物
const AVATAR_OPTIONS = [
  // 动物 5个
  { name: 'cat', label: '猫咪' },
  { name: 'dog', label: '小狗' },
  { name: 'dragon', label: '小龙' },
  { name: 'rabbit', label: '兔子' },
  { name: 'frog', label: '青蛙' },
  // 水果/植物 5个
  { name: 'apple-whole', label: '苹果' },
  { name: 'lemon', label: '柠檬' },
  { name: 'carrot', label: '胡萝卜' },
  { name: 'pepper-hot', label: '辣椒' },
  { name: 'cloud', label: '云朵' },
];

export default function RegisterScreen() {
  const { theme, isDark } = useTheme();
  const router = useSafeRouter();
  const { register } = useAuth();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [username, setUsername] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<string>('cat');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    console.log('=== 点击注册按钮 ===');
    console.log('用户名:', username);
    console.log('昵称:', nickname);
    console.log('密码:', password);
    console.log('确认密码:', confirmPassword);
    console.log('年龄:', age);
    console.log('性别:', gender);

    // 表单验证
    if (!username.trim()) {
      Alert.alert('提示', '请输入用户名');
      return;
    }

    if (username.trim().length < 2) {
      Alert.alert('提示', '用户名至少需要2个字符');
      return;
    }

    if (!password) {
      Alert.alert('提示', '请输入密码');
      return;
    }

    if (password.length < 4) {
      Alert.alert('提示', '密码至少需要4个字符');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('提示', '两次输入的密码不一致');
      return;
    }

    if (!age) {
      Alert.alert('提示', '请输入年龄');
      return;
    }

    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
      Alert.alert('提示', '请输入有效的年龄（1-120）');
      return;
    }

    if (!gender) {
      Alert.alert('提示', '请选择性别');
      return;
    }

    setLoading(true);
    try {
      const success = await register(
        username.trim(),
        password,
        nickname.trim() || undefined,
        selectedAvatar,
        ageNum,
        gender
      );

      console.log('注册结果:', success);

      if (success) {
        Alert.alert(
          '注册成功',
          `欢迎，${username.trim()}！你的账号已创建成功。`,
          [
            {
              text: '进入记账本',
              onPress: () => {
                console.log('跳转到首页');
                router.replace('/');
              },
            },
          ]
        );
      } else {
        Alert.alert('注册失败', '用户名已存在，请使用其他用户名');
      }
    } catch (error) {
      console.error('注册异常:', error);
      Alert.alert('错误', '注册失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 将头像分为两行
  const firstRow = AVATAR_OPTIONS.slice(0, 5);
  const secondRow = AVATAR_OPTIONS.slice(5, 10);

  return (
    <Screen
      backgroundColor={theme.backgroundRoot}
      statusBarStyle={isDark ? 'light' : 'dark'}
    >
      <ScrollView 
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText style={styles.title}>创建新用户</ThemedText>

        {/* 头像选择 */}
        <ThemedText style={styles.label}>选择头像</ThemedText>
        <View style={styles.avatarSection}>
          {/* 第一行：动物 */}
          <View style={styles.avatarRow}>
            {firstRow.map((icon) => (
              <TouchableOpacity
                key={icon.name}
                style={[
                  styles.avatarItem,
                  selectedAvatar === icon.name && styles.avatarItemSelected,
                ]}
                onPress={() => setSelectedAvatar(icon.name)}
              >
                <FontAwesome6
                  name={icon.name as any}
                  size={28}
                  color={selectedAvatar === icon.name ? '#FFFFFF' : theme.textMuted}
                />
              </TouchableOpacity>
            ))}
          </View>
          {/* 第二行：水果 */}
          <View style={styles.avatarRow}>
            {secondRow.map((icon) => (
              <TouchableOpacity
                key={icon.name}
                style={[
                  styles.avatarItem,
                  selectedAvatar === icon.name && styles.avatarItemSelected,
                ]}
                onPress={() => setSelectedAvatar(icon.name)}
              >
                <FontAwesome6
                  name={icon.name as any}
                  size={28}
                  color={selectedAvatar === icon.name ? '#FFFFFF' : theme.textMuted}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 用户名输入 */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <FontAwesome6 name="user" size={20} color={theme.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="用户名（不可更改）"
              placeholderTextColor={theme.textMuted}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        {/* 昵称输入 */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <FontAwesome6 name="face-smile" size={20} color={theme.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="昵称（可随时更改）"
              placeholderTextColor={theme.textMuted}
              value={nickname}
              onChangeText={setNickname}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        {/* 密码输入 */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <FontAwesome6 name="lock" size={20} color={theme.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="密码（至少4个字符）"
              placeholderTextColor={theme.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        {/* 确认密码输入 */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <FontAwesome6 name="lock" size={20} color={theme.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="确认密码"
              placeholderTextColor={theme.textMuted}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        {/* 年龄输入 */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <FontAwesome6 name="cake-candles" size={20} color={theme.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="年龄"
              placeholderTextColor={theme.textMuted}
              value={age}
              onChangeText={setAge}
              keyboardType="number-pad"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        {/* 性别选择 */}
        <View style={styles.inputContainer}>
          <ThemedText style={styles.label}>性别</ThemedText>
          <View style={styles.genderContainer}>
            <TouchableOpacity
              style={[
                styles.genderButton,
                gender === 'male' && styles.genderButtonSelected,
              ]}
              onPress={() => setGender('male')}
            >
              <FontAwesome6
                name="mars"
                size={24}
                color={gender === 'male' ? '#FFFFFF' : theme.textMuted}
              />
              <ThemedText
                style={[
                  styles.genderText,
                  gender === 'male' && styles.genderTextSelected,
                ]}
              >
                男
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.genderButton,
                gender === 'female' && styles.genderButtonSelected,
              ]}
              onPress={() => setGender('female')}
            >
              <FontAwesome6
                name="venus"
                size={24}
                color={gender === 'female' ? '#FFFFFF' : theme.textMuted}
              />
              <ThemedText
                style={[
                  styles.genderText,
                  gender === 'female' && styles.genderTextSelected,
                ]}
              >
                女
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* 创建按钮 */}
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <ThemedText style={styles.buttonText}>注册</ThemedText>
          )}
        </TouchableOpacity>

        {/* 返回按钮 */}
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => router.back()}
        >
          <ThemedText style={styles.cancelButtonText}>返回</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </Screen>
  );
}
