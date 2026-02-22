import React, { useMemo } from 'react';
import { View, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { Spacing, BorderRadius, Theme } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Feedback {
  id: string;
  user_id: string;
  content: string;
  contact: string;
  status: 'pending' | 'processing' | 'resolved';
  reply?: string;
  created_at: string;
  updated_at: string;
}

const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      flexGrow: 1,
      padding: Spacing.lg,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.xl,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.lg,
    },
    deleteButton: {
      padding: Spacing.sm,
    },
    statusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
      marginBottom: Spacing.lg,
    },
    statusBadge: {
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderRadius: BorderRadius.md,
    },
    statusText: {
      color: '#FFFFFF',
    },
    timeText: {
      color: theme.textMuted,
    },
    contentCard: {
      backgroundColor: theme.backgroundDefault,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      marginBottom: Spacing.xl,
    },
    contentTitle: {
      marginBottom: Spacing.md,
    },
    contentText: {
      lineHeight: 24,
    },
    contactInfo: {
      marginTop: Spacing.lg,
      paddingTop: Spacing.lg,
      borderTopWidth: 1,
      borderTopColor: theme.borderLight,
    },
    contactLabel: {
      marginBottom: Spacing.xs,
    },
    replyCard: {
      backgroundColor: theme.backgroundDefault,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      marginBottom: Spacing.xl,
    },
    replyHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      marginBottom: Spacing.md,
    },
    replyTitle: {
      color: theme.primary,
    },
    replyText: {
      lineHeight: 24,
    },
    noReplyCard: {
      backgroundColor: theme.backgroundDefault,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      alignItems: 'center',
    },
    noReplyIcon: {
      marginBottom: Spacing.md,
    },
  });
};

export default function FeedbackDetailScreen() {
  const { theme, isDark } = useTheme();
  const router = useSafeRouter();
  const { feedback: feedbackJson } = useSafeSearchParams<{ feedback: string }>();
  const { currentUser } = useAuth();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const feedback: Feedback = feedbackJson ? JSON.parse(feedbackJson) : null;

  const getStatusText = (status: string) => {
    const map: Record<string, string> = {
      pending: '待处理',
      processing: '处理中',
      resolved: '已解决'
    };
    return map[status] || status;
  };

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      pending: '#FFA500',
      processing: '#4F46E5',
      resolved: '#10B981'
    };
    return map[status] || '#999';
  };

  const handleDelete = () => {
    if (!feedback) {
      return;
    }
    
    // 使用反馈数据中的 user_id，更可靠
    const userId = feedback.user_id;
    if (!userId) {
      Alert.alert('错误', '无法获取用户信息');
      return;
    }

    Alert.alert(
      '删除反馈',
      '确定要删除这条反馈吗？此操作不可恢复。',
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              // 先调用API删除，user_id 放在 query 参数中
              const response = await fetch(
                `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/feedbacks/${feedback.id}?user_id=${encodeURIComponent(userId)}`,
                {
                  method: 'DELETE'
                }
              );
              
              if (response.ok) {
                // API 成功后才更新本地状态
                try {
                  const saved = await AsyncStorage.getItem('read_feedback_ids');
                  if (saved) {
                    const readIds = new Set(JSON.parse(saved));
                    readIds.delete(feedback.id);
                    await AsyncStorage.setItem('read_feedback_ids', JSON.stringify([...readIds]));
                  }
                } catch (error) {
                  console.error('更新已读状态失败:', error);
                }
                
                Alert.alert('成功', '反馈已删除', [
                  { text: '确定', onPress: () => router.back() }
                ]);
              } else {
                const result = await response.json();
                Alert.alert('失败', result.error || '删除失败，请稍后重试');
              }
            } catch (error) {
              console.error('删除反馈失败:', error);
              Alert.alert('失败', '网络错误，请稍后重试');
            }
          }
        }
      ]
    );
  };

  if (!feedback) {
    return (
      <Screen backgroundColor={theme.backgroundRoot} statusBarStyle={isDark ? 'light' : 'dark'}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <FontAwesome6 name="arrow-left" size={20} color={theme.textPrimary} />
            </TouchableOpacity>
          </View>
          <ThemedText>反馈不存在</ThemedText>
        </View>
      </Screen>
    );
  }

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle={isDark ? 'light' : 'dark'}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => router.back()}>
              <FontAwesome6 name="arrow-left" size={20} color={theme.textPrimary} />
            </TouchableOpacity>
            <ThemedText variant="h3" color={theme.textPrimary}>
              反馈详情
            </ThemedText>
          </View>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
          >
            <FontAwesome6 name="trash-can" size={20} color={theme.error} />
          </TouchableOpacity>
        </View>

        {/* 状态和时间 */}
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(feedback.status) }]}>
            <ThemedText variant="smallMedium" style={styles.statusText}>
              {getStatusText(feedback.status)}
            </ThemedText>
          </View>
          <ThemedText variant="caption" style={styles.timeText}>
            {new Date(feedback.created_at).toLocaleString('zh-CN')}
          </ThemedText>
        </View>

        {/* 反馈内容 */}
        <View style={styles.contentCard}>
          <ThemedText variant="smallMedium" color={theme.textSecondary} style={styles.contentTitle}>
            您的反馈
          </ThemedText>
          <ThemedText variant="body" style={styles.contentText}>
            {feedback.content}
          </ThemedText>
          <View style={styles.contactInfo}>
            <ThemedText variant="caption" color={theme.textMuted} style={styles.contactLabel}>
              联系方式
            </ThemedText>
            <ThemedText variant="body">
              {feedback.contact}
            </ThemedText>
          </View>
        </View>

        {/* 管理员回复 */}
        {feedback.reply ? (
          <View style={styles.replyCard}>
            <View style={styles.replyHeader}>
              <FontAwesome6 name="reply" size={16} color={theme.primary} />
              <ThemedText variant="smallMedium" style={styles.replyTitle}>
                管理员回复
              </ThemedText>
            </View>
            <ThemedText variant="body" style={styles.replyText}>
              {feedback.reply}
            </ThemedText>
            <ThemedText variant="caption" color={theme.textMuted} style={{ marginTop: Spacing.md }}>
              {new Date(feedback.updated_at).toLocaleString('zh-CN')}
            </ThemedText>
          </View>
        ) : (
          <View style={styles.noReplyCard}>
            <FontAwesome6 name="clock" size={32} color={theme.textMuted} style={styles.noReplyIcon} />
            <ThemedText color={theme.textMuted}>
              暂无回复，我们会尽快处理您的反馈
            </ThemedText>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}
