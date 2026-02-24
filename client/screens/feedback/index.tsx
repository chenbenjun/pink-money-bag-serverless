import React, { useState, useMemo } from 'react';
import { View, TouchableOpacity, ScrollView, Alert, TextInput, StyleSheet } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { Spacing, BorderRadius, Theme } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';

const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      flexGrow: 1,
      padding: Spacing.lg,
      paddingTop: Spacing['3xl'],
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Spacing.xl,
    },
    backButton: {
      marginRight: Spacing.md,
    },
    pageTitle: {
      marginBottom: Spacing.xl,
    },
    inputSection: {
      marginBottom: Spacing.lg,
    },
    inputLabel: {
      marginBottom: Spacing.sm,
    },
    textInput: {
      backgroundColor: theme.backgroundDefault,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      fontSize: 16,
      color: theme.textPrimary,
    },
    contentInput: {
      height: 150,
      textAlignVertical: 'top',
    },
    buttonsSection: {
      marginTop: Spacing.xl,
      gap: Spacing.lg,
    },
    bigButton: {
      backgroundColor: theme.primary,
      borderRadius: BorderRadius.lg,
      paddingVertical: Spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    bigButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
  });
};

export default function FeedbackScreen() {
  const { theme, isDark } = useTheme();
  const router = useSafeRouter();
  const { currentUser } = useAuth();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [feedback, setFeedback] = useState('');
  const [contact, setContact] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (feedback.trim().length < 10) {
      Alert.alert('提示', '请输入10字以上的内容描述');
      return;
    }
    if (!contact.trim()) {
      Alert.alert('提示', '请输入联系方式');
      return;
    }

    if (!currentUser?.id) {
      Alert.alert('提示', '请先登录');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/feedbacks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser?.id,
          content: feedback,
          contact: contact
        })
      });

      const result = await response.json();
      // 检查 HTTP 状态码和 success 字段
      if (response.ok && (result.success || result.data)) {
        Alert.alert('提交成功', '感谢您的反馈，我们会尽快处理！', [
          { text: '确定', onPress: () => {
            setFeedback('');
            setContact('');
          }}
        ]);
      } else {
        Alert.alert('提交失败', result.error || '请稍后重试');
      }
    } catch (error) {
      console.error('提交反馈失败:', error);
      Alert.alert('错误', '网络错误，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle={isDark ? 'light' : 'dark'}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <FontAwesome6 name="arrow-left" size={20} color={theme.textPrimary} />
          </TouchableOpacity>
        </View>

        <ThemedText variant="h2" color={theme.textPrimary} style={styles.pageTitle}>
          提交新反馈
        </ThemedText>

        {/* 反馈内容输入 */}
        <View style={styles.inputSection}>
          <ThemedText variant="smallMedium" color={theme.textSecondary} style={styles.inputLabel}>
            反馈内容
          </ThemedText>
          <TextInput
            style={[styles.textInput, styles.contentInput]}
            placeholder="请详细描述您的问题或建议..."
            placeholderTextColor={theme.textMuted}
            value={feedback}
            onChangeText={setFeedback}
            multiline
            numberOfLines={6}
          />
        </View>

        {/* 联系方式输入 */}
        <View style={styles.inputSection}>
          <ThemedText variant="smallMedium" color={theme.textSecondary} style={styles.inputLabel}>
            联系方式
          </ThemedText>
          <TextInput
            style={styles.textInput}
            placeholder="请留下您的联系方式（手机号或邮箱）"
            placeholderTextColor={theme.textMuted}
            value={contact}
            onChangeText={setContact}
          />
        </View>

        {/* 按钮区域 */}
        <View style={styles.buttonsSection}>
          <TouchableOpacity
            style={styles.bigButton}
            onPress={handleSubmit}
            disabled={submitting}
          >
            <ThemedText style={styles.bigButtonText}>
              {submitting ? '提交中...' : '提交反馈'}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bigButton}
            onPress={() => {
              router.push('/feedback-history');
            }}
          >
            <ThemedText style={styles.bigButtonText}>
              历史反馈
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Screen>
  );
}
