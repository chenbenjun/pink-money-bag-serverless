import React, { useState, useMemo, useEffect } from 'react';
import { View, TouchableOpacity, ScrollView, Alert, StyleSheet, FlatList, RefreshControl, Pressable } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { Spacing, BorderRadius, Theme } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';

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
      marginBottom: Spacing.xl,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.lg,
    },
    clearButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing.md,
    },
    clearButtonText: {
      color: theme.textMuted,
    },
    historyHeader: {
      marginBottom: Spacing.lg,
    },
    emptyContainer: {
      alignItems: 'center',
      paddingVertical: Spacing['4xl'],
    },
    emptyIcon: {
      marginBottom: Spacing.lg,
    },
    feedbackListItem: {
      backgroundColor: theme.backgroundDefault,
      borderRadius: BorderRadius.lg,
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      marginBottom: Spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
    },
    feedbackIconContainer: {
      width: 44,
      height: 44,
      borderRadius: BorderRadius.lg,
      backgroundColor: theme.backgroundTertiary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    feedbackContentContainer: {
      flex: 1,
    },
    feedbackTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.xs,
    },
    feedbackStatusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
    },
    feedbackStatus: {
      paddingHorizontal: Spacing.sm,
      paddingVertical: 2,
      borderRadius: BorderRadius.xs,
    },
    feedbackStatusText: {
      color: '#FFFFFF',
      fontSize: 10,
    },
    newBadge: {
      backgroundColor: '#EF4444',
      paddingHorizontal: 4,
      paddingVertical: 2,
      borderRadius: BorderRadius.xs,
    },
    newBadgeText: {
      color: '#FFFFFF',
      fontSize: 8,
      fontWeight: 'bold',
    },
    feedbackTime: {
      color: theme.textMuted,
    },
    feedbackPreview: {
      color: theme.textSecondary,
    },
    chevronIcon: {
      marginLeft: Spacing.sm,
    },
  });
};

export default function FeedbackHistoryScreen() {
  const { theme, isDark } = useTheme();
  const router = useSafeRouter();
  const { currentUser } = useAuth();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [feedbacksLoading, setFeedbacksLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [readFeedbackIds, setReadFeedbackIds] = useState<Set<string>>(new Set());

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

  const loadReadStatus = async () => {
    try {
      const saved = await AsyncStorage.getItem('read_feedback_ids');
      if (saved) {
        setReadFeedbackIds(new Set(JSON.parse(saved)));
      }
    } catch (error) {
      console.error('加载已读状态失败:', error);
    }
  };

  const saveReadStatus = async (ids: Set<string>) => {
    try {
      await AsyncStorage.setItem('read_feedback_ids', JSON.stringify([...ids]));
      setReadFeedbackIds(ids);
    } catch (error) {
      console.error('保存已读状态失败:', error);
    }
  };

  const markAsRead = (feedbackId: string) => {
    const newReadIds = new Set(readFeedbackIds);
    newReadIds.add(feedbackId);
    saveReadStatus(newReadIds);
  };

  const hasUnreadReply = (feedback: Feedback) => {
    return feedback.reply && !readFeedbackIds.has(feedback.id);
  };

  const loadFeedbacks = async (isRefresh = false) => {
    if (!currentUser?.id) return;
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setFeedbacksLoading(true);
    }
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/feedbacks/user/${currentUser.id}`
      );
      const result = await response.json();
      if (result.success) {
        setFeedbacks(result.data || []);
      }
    } catch (error) {
      console.error('加载反馈历史失败:', error);
    } finally {
      setFeedbacksLoading(false);
      setRefreshing(false);
    }
  };

  const handleClearReadFeedbacks = () => {
    const readFeedbacks = feedbacks.filter(f => readFeedbackIds.has(f.id));
    if (readFeedbacks.length === 0) {
      Alert.alert('提示', '没有已读的反馈可清除');
      return;
    }

    Alert.alert(
      '清除已读反馈',
      `确定要清除 ${readFeedbacks.length} 条已读反馈吗？此操作不可恢复。`,
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '确定清除',
          style: 'destructive',
          onPress: async () => {
            if (readFeedbacks.length === 0) {
              return;
            }
            
            // 使用第一条反馈的 user_id
            const userId = readFeedbacks[0].user_id;
            if (!userId) {
              Alert.alert('错误', '无法获取用户信息');
              return;
            }
            
            // 逐个删除已读反馈，API 成功后才更新本地
            let successCount = 0;
            const deletedIds: string[] = [];
            
            for (const fb of readFeedbacks) {
              try {
                const response = await fetch(
                  `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/feedbacks/${fb.id}?user_id=${encodeURIComponent(userId)}`,
                  {
                    method: 'DELETE'
                  }
                );
                
                if (response.ok) {
                  successCount++;
                  deletedIds.push(fb.id);
                }
              } catch (error) {
                console.error('删除反馈失败:', error);
              }
            }
            
            // 只更新成功删除的记录
            if (deletedIds.length > 0) {
              const updatedFeedbacks = feedbacks.filter(f => !deletedIds.includes(f.id));
              setFeedbacks(updatedFeedbacks);
              
              // 更新本地已读状态
              const newReadIds = new Set(readFeedbackIds);
              deletedIds.forEach(id => newReadIds.delete(id));
              await saveReadStatus(newReadIds);
            }
            
            Alert.alert('完成', `已清除 ${successCount} 条已读反馈`);
          }
        }
      ]
    );
  };

  const handleDeleteFeedback = (item: Feedback) => {
    // 使用反馈数据中的 user_id，更可靠
    const userId = item.user_id;
    
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
              console.log('开始删除反馈，ID:', item.id);
              console.log('用户ID:', userId);
              
              // 先调用API删除，user_id 放在 query 参数中
              const response = await fetch(
                `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/feedbacks/${item.id}?user_id=${encodeURIComponent(userId)}`,
                {
                  method: 'DELETE'
                }
              );
              
              console.log('删除响应状态:', response.status);
              
              if (response.ok) {
                // API 成功后才更新本地状态
                const updatedFeedbacks = feedbacks.filter(f => f.id !== item.id);
                setFeedbacks(updatedFeedbacks);
                
                // 如果是已读的，从本地已读列表中移除
                if (readFeedbackIds.has(item.id)) {
                  const newReadIds = new Set(readFeedbackIds);
                  newReadIds.delete(item.id);
                  await saveReadStatus(newReadIds);
                }
                
                Alert.alert('成功', '反馈已删除');
              } else {
                const result = await response.json();
                console.error('删除失败响应:', result);
                Alert.alert('失败', result.error || '删除失败，请稍后重试');
              }
            } catch (error) {
              console.error('删除反馈异常:', error);
              Alert.alert('失败', '网络错误，请稍后重试');
            }
          }
        }
      ]
    );
  };

  const handleFeedbackPress = (item: Feedback) => {
    // 标记为已读
    if (item.reply && !readFeedbackIds.has(item.id)) {
      markAsRead(item.id);
    }
    // 跳转到详情页
    router.push('/feedback-detail', { feedback: JSON.stringify(item) });
  };

  useFocusEffect(
    React.useCallback(() => {
      loadReadStatus();
      loadFeedbacks();
    }, [currentUser?.id])
  );

  const renderFeedbackListItem = ({ item }: { item: Feedback }) => {
    return (
      <Pressable
        style={styles.feedbackListItem}
        onPress={() => handleFeedbackPress(item)}
        onLongPress={() => handleDeleteFeedback(item)}
      >
        <View style={styles.feedbackIconContainer}>
          <FontAwesome6 
            name={item.reply ? "message-reply" : "envelope"}
            size={18} 
            color={hasUnreadReply(item) ? theme.primary : theme.textMuted} 
          />
        </View>
        <View style={styles.feedbackContentContainer}>
          <View style={styles.feedbackTopRow}>
            <View style={styles.feedbackStatusContainer}>
              <View style={[styles.feedbackStatus, { backgroundColor: getStatusColor(item.status) }]}>
                <ThemedText style={styles.feedbackStatusText}>{getStatusText(item.status)}</ThemedText>
              </View>
              {hasUnreadReply(item) && (
                <View style={styles.newBadge}>
                  <ThemedText style={styles.newBadgeText}>NEW</ThemedText>
                </View>
              )}
            </View>
            <ThemedText variant="caption" style={styles.feedbackTime}>
              {new Date(item.created_at).toLocaleDateString('zh-CN')}
            </ThemedText>
          </View>
          <ThemedText 
            variant="small" 
            style={styles.feedbackPreview}
            numberOfLines={1}
          >
            {item.content}
          </ThemedText>
        </View>
        <FontAwesome6 
          name="chevron-right" 
          size={14} 
          color={theme.textMuted}
          style={styles.chevronIcon}
        />
      </Pressable>
    );
  };

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle={isDark ? 'light' : 'dark'}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => router.back()}>
              <FontAwesome6 name="arrow-left" size={20} color={theme.textPrimary} />
            </TouchableOpacity>
            <ThemedText variant="h3" color={theme.textPrimary}>
              历史反馈
            </ThemedText>
          </View>
          {feedbacks.length > 0 && (
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={handleClearReadFeedbacks}
            >
              <FontAwesome6 name="broom" size={16} color={theme.textMuted} />
              <ThemedText variant="small" style={styles.clearButtonText}>
                清除已读
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>

        {feedbacksLoading ? (
          <ThemedText style={styles.emptyContainer}>加载中...</ThemedText>
        ) : feedbacks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <FontAwesome6 name="inbox" size={48} color={theme.textMuted} style={styles.emptyIcon} />
            <ThemedText color={theme.textMuted}>暂无反馈记录</ThemedText>
          </View>
        ) : (
          <FlatList
            data={feedbacks}
            renderItem={renderFeedbackListItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => loadFeedbacks(true)}
                colors={[theme.primary]}
              />
            }
          />
        )}
      </ScrollView>
    </Screen>
  );
}
