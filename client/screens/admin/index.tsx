import React, { useMemo, useState, useEffect } from 'react';
import { View, TouchableOpacity, FlatList, Alert, Animated, Modal, TextInput, ScrollView } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { FontAwesome6 } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { createStyles } from './styles';
import { useAuth, User } from '@/contexts/AuthContext';

// 反馈数据类型
interface Feedback {
  id: string;
  user_id: string;
  content: string;
  contact: string;
  status: 'pending' | 'processing' | 'resolved';
  reply?: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    name: string;
    nickname?: string;
  };
}

export default function AdminScreen() {
  const { theme, isDark } = useTheme();
  const router = useSafeRouter();
  const { currentUser, allUsers, logout, deleteUser } = useAuth();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // 检查是否是管理员 - 使用 effect 处理重定向，避免条件 return 导致 hooks 问题
  useEffect(() => {
    if (currentUser && !currentUser.is_admin && currentUser.name !== 'admin') {
      // 不是管理员且不是 admin 用户，返回上一页
      router.back();
    }
  }, [currentUser, router]);

  // 如果未登录或不是管理员，显示空状态（但仍然渲染完整组件树）
  const isAuthorized = currentUser?.is_admin === true || currentUser?.name === 'admin';

  // 重置密码相关状态
  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [userToReset, setUserToReset] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  // 选项卡和反馈相关状态
  const [activeTab, setActiveTab] = useState<'users' | 'feedbacks'>('users');
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [feedbacksLoading, setFeedbacksLoading] = useState(false);
  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [feedbackToReply, setFeedbackToReply] = useState<Feedback | null>(null);
  const [replyText, setReplyText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'pending' | 'processing' | 'resolved'>('pending');
  const [isReplying, setIsReplying] = useState(false);

  const handleLogout = () => {
    Alert.alert('确认退出', '确定要退出管理员账号吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '退出',
        onPress: async () => {
          await logout();
          router.replace('/login');
        },
      },
    ]);
  };

  const handleDeleteUser = (user: User) => {
    // 不能删除自己
    if (user.id === currentUser?.id) {
      Alert.alert('提示', '不能删除当前登录的管理员账号');
      return;
    }

    Alert.alert(
      '确认删除',
      `确定要删除用户 "${user.nickname || user.name}" 吗？此操作不可恢复。`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteUser(user.id);
            if (success) {
              Alert.alert('成功', '用户已删除');
            } else {
              Alert.alert('失败', '删除用户失败，请重试');
            }
          },
        },
      ]
    );
  };

  const handleResetPassword = (user: User) => {
    setUserToReset(user);
    setNewPassword(user.is_admin ? 'admin123' : '1234'); // 预设默认密码
    setResetModalVisible(true);
  };

  const confirmResetPassword = async () => {
    if (!newPassword.trim()) {
      Alert.alert('提示', '新密码不能为空');
      return;
    }

    setIsResetting(true);
    try {
      /**
       * 服务端文件：server/src/routes/users.ts
       * 接口：PUT /api/v1/users/:id/reset-password
       * Body 参数：newPassword: string
       */
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/users/${userToReset?.id}/reset-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newPassword }),
      });

      const result = await response.json();
      
      if (result.success) {
        Alert.alert('成功', `密码已重置为: ${newPassword}`);
        setResetModalVisible(false);
        // 刷新用户列表
        await logout(); // 临时使用logout刷新，实际应该有刷新用户列表的方法
      } else {
        Alert.alert('失败', result.error || '重置密码失败');
      }
    } catch (error) {
      console.error('重置密码失败:', error);
      Alert.alert('错误', '网络错误，请重试');
    } finally {
      setIsResetting(false);
    }
  };

  // 加载反馈列表
  const loadFeedbacks = async () => {
    setFeedbacksLoading(true);
    try {
      /**
       * 服务端文件：server/src/routes/feedbacks.ts
       * 接口：GET /api/v1/feedbacks
       */
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/feedbacks`);
      const result = await response.json();
      
      if (result.success) {
        setFeedbacks(result.data);
      }
    } catch (error) {
      console.error('加载反馈失败:', error);
    } finally {
      setFeedbacksLoading(false);
    }
  };

  // 切换选项卡时加载数据
  useEffect(() => {
    if (activeTab === 'feedbacks') {
      loadFeedbacks();
    }
  }, [activeTab]);

  // 处理反馈
  const handleReplyFeedback = (feedback: Feedback) => {
    setFeedbackToReply(feedback);
    setReplyText(feedback.reply || '');
    setSelectedStatus(feedback.status as any);
    setReplyModalVisible(true);
  };

  // 删除反馈
  const handleDeleteFeedback = (feedback: Feedback) => {
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
              // 管理员删除不需要 user_id 验证，使用特殊标记
              const response = await fetch(
                `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/feedbacks/${feedback.id}?admin=true`,
                {
                  method: 'DELETE'
                }
              );
              
              if (response.ok) {
                // API 成功后才更新本地状态
                setFeedbacks(prev => prev.filter(f => f.id !== feedback.id));
                Alert.alert('成功', '反馈已删除');
              } else {
                const result = await response.json();
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

  // 提交回复
  const submitReply = async () => {
    setIsReplying(true);
    try {
      /**
       * 服务端文件：server/src/routes/feedbacks.ts
       * 接口：PUT /api/v1/feedbacks/:id
       * Body 参数：status?: string, reply?: string
       */
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/feedbacks/${feedbackToReply?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: selectedStatus,
          reply: replyText,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        Alert.alert('成功', '反馈已处理');
        setReplyModalVisible(false);
        loadFeedbacks(); // 刷新列表
      } else {
        Alert.alert('失败', result.error || '处理反馈失败');
      }
    } catch (error) {
      console.error('处理反馈失败:', error);
      Alert.alert('错误', '网络错误，请重试');
    } finally {
      setIsReplying(false);
    }
  };

  // 获取状态文本
  const getStatusText = (status: string) => {
    const map: Record<string, string> = {
      pending: '待处理',
      processing: '处理中',
      resolved: '已解决',
    };
    return map[status] || status;
  };

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      pending: '#FFA500',
      processing: '#4F46E5',
      resolved: '#10B981',
    };
    return map[status] || '#999';
  };

  // 渲染反馈项 - 简洁样式
  const renderFeedbackItem = ({ item }: { item: Feedback }) => {
    const hasReply = !!item.reply;
    const isNew = !hasReply && item.status === 'pending';
    
    return (
      <TouchableOpacity 
        style={{
          backgroundColor: theme.backgroundDefault,
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 12,
          marginBottom: 8,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}
        onPress={() => handleReplyFeedback(item)}
        onLongPress={() => handleDeleteFeedback(item)}
        delayLongPress={500}
      >
        {/* 图标 */}
        <View style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          backgroundColor: theme.backgroundTertiary,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <FontAwesome6 
            name={hasReply ? "check-circle" : "clock"} 
            size={20} 
            color={hasReply ? '#10B981' : '#FFA500'} 
          />
        </View>
        
        {/* 内容 */}
        <View style={{ flex: 1 }}>
          {/* 顶部行：状态和新标记 */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 4,
          }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
            }}>
              <View style={{
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 4,
                backgroundColor: getStatusColor(item.status),
              }}>
                <ThemedText style={{
                  color: '#FFFFFF',
                  fontSize: 10,
                }}>
                  {getStatusText(item.status)}
                </ThemedText>
              </View>
              {isNew && (
                <View style={{
                  backgroundColor: '#EF4444',
                  paddingHorizontal: 4,
                  paddingVertical: 2,
                  borderRadius: 4,
                }}>
                  <ThemedText style={{
                    color: '#FFFFFF',
                    fontSize: 8,
                    fontWeight: 'bold',
                  }}>
                    NEW
                  </ThemedText>
                </View>
              )}
            </View>
            <ThemedText style={{
              color: theme.textMuted,
              fontSize: 12,
            }}>
              {new Date(item.created_at).toLocaleDateString('zh-CN')}
            </ThemedText>
          </View>
          
          {/* 预览内容 */}
          <ThemedText 
            style={{
              color: theme.textSecondary,
              fontSize: 14,
            }} 
            numberOfLines={1}
          >
            {item.content}
          </ThemedText>
          
          {/* 用户信息 */}
          <ThemedText style={{
            color: theme.textMuted,
            fontSize: 12,
            marginTop: 2,
          }}>
            {item.user?.nickname || item.user?.name || '匿名用户'} · {item.contact}
          </ThemedText>
        </View>
        
        {/* 箭头 */}
        <FontAwesome6 name="chevron-right" size={16} color={theme.textMuted} />
      </TouchableOpacity>
    );
  };

  // 渲染左滑删除按钮
  const renderRightActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>, user: User) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    return (
      <TouchableOpacity
        style={[styles.deleteButton, { backgroundColor: theme.error || '#FF4444' }]}
        onPress={() => handleDeleteUser(user)}
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          <FontAwesome6 name="trash-can" size={24} color="#FFFFFF" />
          <ThemedText style={styles.deleteButtonText}>删除</ThemedText>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const renderUser = ({ item }: { item: User }) => {
    // 不能删除当前登录的管理员
    const canDelete = item.id !== currentUser?.id;

    const UserItem = (
      <View style={styles.userItem}>
        <View style={styles.userAvatar}>
          <FontAwesome6 name={item.avatar || 'user'} size={24} color={theme.primary} />
        </View>
        <View style={styles.userInfo}>
          <ThemedText style={styles.userName}>{item.name}</ThemedText>
          <View style={styles.userMetaRow}>
            {item.nickname && (
              <ThemedText style={styles.userNickname}>昵称: {item.nickname}</ThemedText>
            )}
            <ThemedText style={styles.userDetail}>
              密码: {item.password_plain || (item.is_admin ? 'admin123' : '1234')} {item.is_admin && '(管理员)'}
            </ThemedText>
          </View>
        </View>
        <View style={styles.userActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.primary }]}
            onPress={() => handleResetPassword(item)}
          >
            <FontAwesome6 name="key" size={14} color="#FFFFFF" />
          </TouchableOpacity>
          {item.is_admin && (
            <View style={styles.adminBadge}>
              <ThemedText style={styles.adminBadgeText}>管理员</ThemedText>
            </View>
          )}
        </View>
      </View>
    );

    // 如果不能删除，直接返回普通视图
    if (!canDelete) {
      return UserItem;
    }

    // 可以删除的，使用 Swipeable 包裹
    return (
      <Swipeable
        renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, item)}
        friction={2}
        rightThreshold={40}
      >
        {UserItem}
      </Swipeable>
    );
  };

  return (
    <Screen
      backgroundColor={theme.backgroundRoot}
      statusBarStyle={isDark ? 'light' : 'dark'}
    >
      <View style={styles.container}>
        {/* 头部 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <FontAwesome6 name="arrow-left" size={24} color={theme.textPrimary} />
          </TouchableOpacity>
          <ThemedText style={styles.title}>管理后台</ThemedText>
          <View style={{ width: 24 }} />
        </View>

        {/* 权限检查 - 无权限时显示提示 */}
        {!isAuthorized ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <View style={styles.emptyContainer}>
              <FontAwesome6 name="lock" size={64} color={theme.textMuted} />
              <ThemedText style={styles.emptyText}>无权访问</ThemedText>
              <ThemedText style={styles.emptySubText}>只有管理员可以访问此页面</ThemedText>
            </View>
          </View>
        ) : (
          <>
            {/* 管理员信息 */}
            <View style={styles.adminInfo}>
              <FontAwesome6 name="shield-halved" size={32} color={theme.primary} />
              <ThemedText style={styles.adminName}>{currentUser?.nickname || currentUser?.name}</ThemedText>
            </View>

            {/* 选项卡 */}
            <View style={styles.tabs}>
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'users' && styles.activeTab]}
                onPress={() => setActiveTab('users')}
              >
                <FontAwesome6 
                  name="users" 
                  size={18} 
                  color={activeTab === 'users' ? theme.primary : theme.textMuted} 
                />
                <ThemedText 
                  style={[
                    styles.tabText, 
                    activeTab === 'users' && { color: theme.primary }
                  ]}
                >
                  用户管理
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'feedbacks' && styles.activeTab]}
                onPress={() => setActiveTab('feedbacks')}
              >
                <FontAwesome6 
                  name="comments" 
                  size={18} 
                  color={activeTab === 'feedbacks' ? theme.primary : theme.textMuted} 
                />
                <ThemedText 
                  style={[
                    styles.tabText, 
                    activeTab === 'feedbacks' && { color: theme.primary }
                  ]}
                >
                  意见反馈
                </ThemedText>
                {feedbacks.length > 0 && (
                  <View style={styles.badge}>
                    <ThemedText style={styles.badgeText}>{feedbacks.length}</ThemedText>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* 用户管理选项卡内容 */}
            {activeTab === 'users' && (
              <>
                <View style={styles.listHeader}>
                  <ThemedText style={styles.listTitle}>用户列表（左滑删除）</ThemedText>
                  <ThemedText style={styles.listCount}>共 {allUsers.filter(u => u.name !== 'admin').length} 个用户</ThemedText>
                </View>
                <FlatList
                  data={allUsers.filter(u => u.name !== 'admin')}
                  renderItem={renderUser}
                  keyExtractor={(item) => item.id}
                  style={styles.userList}
                  showsVerticalScrollIndicator={false}
                />
              </>
            )}

            {/* 意见反馈选项卡内容 */}
            {activeTab === 'feedbacks' && (
              <>
                <View style={styles.listHeader}>
                  <ThemedText style={styles.listTitle}>反馈列表</ThemedText>
                  <TouchableOpacity onPress={loadFeedbacks}>
                    <FontAwesome6 name="rotate-right" size={18} color={theme.primary} />
                  </TouchableOpacity>
                </View>
                {feedbacksLoading ? (
                  <View style={styles.loadingContainer}>
                    <ThemedText style={styles.loadingText}>加载中...</ThemedText>
                  </View>
                ) : (
                  <FlatList
                    data={feedbacks}
                    renderItem={renderFeedbackItem}
                    keyExtractor={(item) => item.id}
                    style={styles.userList}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                      <View style={styles.emptyContainer}>
                        <FontAwesome6 name="inbox" size={48} color={theme.textMuted} />
                        <ThemedText style={styles.emptyText}>暂无反馈</ThemedText>
                      </View>
                    }
                  />
                )}
              </>
            )}

            {/* 退出按钮 */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <ThemedText style={styles.logoutButtonText}>退出管理员账号</ThemedText>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* 重置密码Modal */}
      <Modal
        visible={resetModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setResetModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>
                重置密码 - {userToReset?.nickname || userToReset?.name}
              </ThemedText>
              <TouchableOpacity onPress={() => setResetModalVisible(false)}>
                <FontAwesome6 name="xmark" size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <ThemedText style={styles.modalLabel}>新密码</ThemedText>
              <TextInput
                style={[styles.modalInput, { 
                  backgroundColor: theme.backgroundTertiary,
                  color: theme.textPrimary,
                  borderColor: theme.border
                }]}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="请输入新密码"
                placeholderTextColor={theme.textMuted}
                autoFocus
              />
            </View>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setResetModalVisible(false)}
              >
                <ThemedText style={styles.modalCancelButtonText}>取消</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalConfirmButton, { 
                  backgroundColor: theme.primary,
                  opacity: isResetting ? 0.5 : 1
                }]}
                onPress={confirmResetPassword}
                disabled={isResetting}
              >
                <ThemedText style={styles.modalConfirmButtonText}>
                  {isResetting ? '重置中...' : '重置密码'}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 回复反馈Modal */}
      <Modal
        visible={replyModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setReplyModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '80%' }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>
                处理反馈 - {feedbackToReply?.user?.nickname || feedbackToReply?.user?.name || '用户'}
              </ThemedText>
              <TouchableOpacity onPress={() => setReplyModalVisible(false)}>
                <FontAwesome6 name="xmark" size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              {/* 反馈内容 */}
              <View style={styles.feedbackDetail}>
                <ThemedText style={styles.feedbackDetailLabel}>反馈内容</ThemedText>
                <ThemedText style={styles.feedbackDetailText}>{feedbackToReply?.content}</ThemedText>
              </View>

              {/* 联系方式 */}
              <View style={styles.feedbackDetail}>
                <ThemedText style={styles.feedbackDetailLabel}>联系方式</ThemedText>
                <ThemedText style={styles.feedbackDetailText}>{feedbackToReply?.contact}</ThemedText>
              </View>

              {/* 状态选择 */}
              <View style={styles.feedbackDetail}>
                <ThemedText style={styles.feedbackDetailLabel}>处理状态</ThemedText>
                <View style={styles.statusOptions}>
                  {(['pending', 'processing', 'resolved'] as const).map((status) => (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.statusOption,
                        selectedStatus === status && { 
                          backgroundColor: getStatusColor(status),
                          borderColor: 'transparent'
                        }
                      ]}
                      onPress={() => setSelectedStatus(status)}
                    >
                      <ThemedText 
                        style={[
                          styles.statusOptionText,
                          selectedStatus === status && { color: '#FFFFFF' }
                        ]}
                      >
                        {getStatusText(status)}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* 回复输入 */}
              <View style={styles.feedbackDetail}>
                <ThemedText style={styles.feedbackDetailLabel}>管理员回复</ThemedText>
                <TextInput
                  style={[styles.textArea, { 
                    backgroundColor: theme.backgroundTertiary,
                    color: theme.textPrimary,
                    borderColor: theme.border
                  }]}
                  value={replyText}
                  onChangeText={setReplyText}
                  placeholder="输入回复内容（可选）"
                  placeholderTextColor={theme.textMuted}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setReplyModalVisible(false)}
              >
                <ThemedText style={styles.modalCancelButtonText}>取消</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalConfirmButton, { 
                  backgroundColor: theme.primary,
                  opacity: isReplying ? 0.5 : 1
                }]}
                onPress={submitReply}
                disabled={isReplying}
              >
                <ThemedText style={styles.modalConfirmButtonText}>
                  {isReplying ? '提交中...' : '提交'}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
