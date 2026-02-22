import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, Modal, Pressable, Animated, Image } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { FontAwesome6 } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { RollingNumber } from '@/components/RollingNumber';
import { createStyles } from './styles';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { useAuth } from '@/contexts/AuthContext';
import { dataChangedEmitter } from '@/utils/eventEmitter';
import { Spacing } from '@/constants/theme';
import { useFocusEffect } from 'expo-router';
import { playCoinSound, startTickingSound, stopTickingSound, preloadCoinSound } from '@/utils/sound';

interface Stats {
  totalIncome: string;
  totalExpense: string;
  balance: string;
}

interface Transaction {
  id: string;
  amount: string;
  type: string;
  description: string | null;
  transaction_date: string;
  category_id: string | null;
}

const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';

export default function HomeScreen() {
  const { theme, isDark } = useTheme();
  const router = useSafeRouter();
  const { currentUser, logout } = useAuth();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [stats, setStats] = useState<Stats | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchStats = async () => {
    if (!currentUser?.id) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/transactions/stats?user_id=${currentUser.id}`);
      const result = await response.json();
      if (result.data) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchRecentTransactions = async () => {
    if (!currentUser?.id) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/transactions?limit=5&user_id=${currentUser.id}`);
      const result = await response.json();
      if (result.data) {
        setRecentTransactions(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    // 开始播放数字滚动音效
    startTickingSound(800);
    await Promise.all([fetchStats(), fetchRecentTransactions()]);
    setLoading(false);
    // 数据加载完成后停止音效
    setTimeout(() => stopTickingSound(), 200);
  };

  useEffect(() => {
    // 预加载银子音效
    preloadCoinSound();
    
    const loadData = async () => {
      setLoading(true);
      // 开始播放数字滚动音效
      startTickingSound(800);
      await Promise.all([fetchStats(), fetchRecentTransactions()]);
      setLoading(false);
      // 数据加载完成后停止音效
      setTimeout(() => stopTickingSound(), 200);
    };

    loadData();

    // 监听数据清除事件
    const unsubscribe = dataChangedEmitter.on('transactionsCleared', () => {
      // 数据被清除后，重置为0或空数组
      setStats({ totalIncome: '0', totalExpense: '0', balance: '0' });
      setRecentTransactions([]);
    });

    // 监听交易添加事件
    const unsubscribeTransactionAdded = dataChangedEmitter.on('transactionAdded', (data: { type: string }) => {
      // 重新加载数据并播放动画
      loadData();
      // 如果是收入，播放支付宝到账音效
      if (data.type === 'income') {
        // 这里不再播放音效，已经在添加页面播放了
      }
    });

    return () => {
      unsubscribe();
      unsubscribeTransactionAdded();
    };
  }, []);

  // 进入页面时自动刷新数据
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [currentUser?.id])
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return '今天';
    if (diffDays === 1) return '昨天';
    if (diffDays === 2) return '前天';
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  const formatAmount = (amount: string) => {
    const num = parseFloat(amount);
    return `¥${num.toFixed(2)}`;
  };

  const formatBalanceAmount = (amount: string) => {
    const num = parseFloat(amount);
    return num.toFixed(2);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setRefreshKey(prev => prev + 1); // 更新 key 触发重新渲染
    // 开始播放银子音效（刷新时播放更长一些）
    startTickingSound(3000);
    await Promise.all([fetchStats(), fetchRecentTransactions()]);
    setRefreshing(false);
    // 刷新完成后停止音效
    setTimeout(() => stopTickingSound(), 200);
  };

  const handleLogout = async () => {
    Alert.alert('确认退出', '确定要退出当前账号吗？', [
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

  const handleDeleteTransaction = (transaction: Transaction) => {
    Alert.alert(
      '确认删除',
      `确定要删除这条${transaction.type === 'income' ? '收入' : '支出'}记录吗？此操作不可恢复。`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            if (!currentUser?.id) return;
            try {
              const response = await fetch(
                `${API_BASE_URL}/api/v1/transactions/${transaction.id}?user_id=${currentUser.id}`,
                { method: 'DELETE' }
              );
              if (response.ok) {
                // 删除成功后刷新数据
                await Promise.all([fetchStats(), fetchRecentTransactions()]);
              } else {
                Alert.alert('失败', '删除记录失败，请重试');
              }
            } catch (error) {
              console.error('Failed to delete transaction:', error);
              Alert.alert('失败', '删除记录失败，请重试');
            }
          },
        },
      ]
    );
  };

  // 渲染左滑删除按钮
  const renderRightActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>, transaction: Transaction) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    return (
      <TouchableOpacity
        style={[styles.deleteButton, { backgroundColor: theme.error || '#FF4444' }]}
        onPress={() => handleDeleteTransaction(transaction)}
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          <FontAwesome6 name="trash-can" size={24} color="#FFFFFF" />
          <ThemedText style={styles.deleteButtonText}>删除</ThemedText>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  // 渲染单个交易记录
  const renderTransaction = (transaction: Transaction) => {
    const TransactionItem = (
      <TouchableOpacity
        style={styles.transactionCard}
        onPress={() => router.push('/transaction-detail', { id: transaction.id })}
      >
        <View
          style={[
            styles.transactionIcon,
            transaction.type === 'income' ? styles.transactionIconIncome : styles.transactionIconExpense,
          ]}
        >
          <FontAwesome6
            name={transaction.type === 'income' ? 'arrow-trend-up' : 'arrow-trend-down'}
            size={20}
            color={transaction.type === 'income' ? '#34D399' : '#FB7185'}
          />
        </View>
        <View style={styles.transactionInfo}>
          <ThemedText style={styles.transactionTitle}>
            {transaction.description || (transaction.type === 'income' ? '收入' : '支出')}
          </ThemedText>
          <ThemedText style={styles.transactionDate}>
            {formatDate(transaction.transaction_date)}
          </ThemedText>
        </View>
        <ThemedText
          style={[
            styles.transactionAmount,
            transaction.type === 'income' ? styles.transactionAmountIncome : styles.transactionAmountExpense,
          ]}
        >
          {transaction.type === 'income' ? '+' : '-'}{formatAmount(transaction.amount)}
        </ThemedText>
      </TouchableOpacity>
    );

    return (
      <Swipeable
        renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, transaction)}
        friction={2}
        rightThreshold={40}
      >
        {TransactionItem}
      </Swipeable>
    );
  };

  const menuItems = [
    { icon: 'gear', label: '设置', onPress: () => { setMenuVisible(false); router.push('/settings'); } },
    { icon: 'users', label: '切换用户', onPress: () => { setMenuVisible(false); router.push('/user-switch'); } },
    ...(currentUser?.is_admin ? [{ icon: 'user-shield', label: '管理后台', onPress: () => { setMenuVisible(false); router.push('/admin'); } }] : []),
    { icon: 'right-from-bracket', label: '退出登录', danger: true, onPress: () => { setMenuVisible(false); handleLogout(); } },
  ];

  return (
    <Screen
      backgroundColor={theme.backgroundRoot}
      statusBarStyle={isDark ? 'light' : 'dark'}
    >
      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={{ paddingBottom: 0 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
      >
        {/* 用户信息栏 */}
        <TouchableOpacity style={styles.userBar} onPress={() => router.push('/settings')}>
          <View style={styles.userInfo}>
            <View style={styles.userAvatar}>
              {currentUser?.avatar_type === 'custom' && currentUser?.avatar_url ? (
                <Image source={{ uri: currentUser.avatar_url }} style={styles.avatarImage} />
              ) : (
                <FontAwesome6 name={currentUser?.avatar || 'user'} size={24} color="#FFFFFF" />
              )}
            </View>
            <View style={styles.userTextContainer}>
              <ThemedText style={styles.userName}>
                {currentUser?.nickname || currentUser?.name || '未登录'}
              </ThemedText>
              {currentUser?.bio ? (
                <ThemedText style={styles.userBio} numberOfLines={1}>
                  {currentUser.bio}
                </ThemedText>
              ) : null}
            </View>
          </View>
          <FontAwesome6 name="chevron-right" size={16} color="rgba(255, 255, 255, 0.8)" />
        </TouchableOpacity>

        {/* 顶部卡片 */}
        <View style={styles.headerContainer}>
          <View style={styles.balanceCard}>
            <ThemedText style={styles.balanceLabel}>我的余额</ThemedText>
            <TouchableOpacity 
              style={styles.eyeButton}
              onPress={() => setBalanceVisible(!balanceVisible)}
            >
              <FontAwesome6 
                name={balanceVisible ? 'eye' : 'eye-slash'} 
                size={20} 
                color="rgba(255, 255, 255, 0.8)" 
              />
            </TouchableOpacity>
            <View style={styles.balanceAmountContainer}>
              <ThemedText style={styles.balanceCurrency}>¥</ThemedText>
              {loading ? (
                <ThemedText style={styles.balanceAmount}>...</ThemedText>
              ) : (
                <RollingNumber
                  key={refreshKey}
                  value={stats ? stats.balance : '0.00'}
                  style={styles.balanceAmount}
                  visible={balanceVisible}
                  rollingHeight={56}
                  duration={1500}
                  digitWidth={28}
                  dotWidth={10}
                />
              )}
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <ThemedText style={styles.statLabel}>总收入</ThemedText>
              <ThemedText style={styles.statValue}>
                {loading ? '...' : (stats ? formatAmount(stats.totalIncome) : '¥0.00')}
              </ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={styles.statLabel}>总支出</ThemedText>
              <ThemedText style={styles.statValue}>
                {loading ? '...' : (stats ? formatAmount(stats.totalExpense) : '¥0.00')}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* 快速操作 */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonIncome]}
            onPress={async () => {
              await playCoinSound();
              router.push('/add-transaction', { type: 'income' });
            }}
          >
            <FontAwesome6 name="circle-plus" size={20} color="#34D399" style={styles.actionIcon} />
            <ThemedText style={[styles.actionText, styles.actionTextIncome]}>记收入</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonExpense]}
            onPress={async () => {
              await playCoinSound();
              router.push('/add-transaction', { type: 'expense' });
            }}
          >
            <FontAwesome6 name="circle-minus" size={20} color="#FB7185" style={styles.actionIcon} />
            <ThemedText style={[styles.actionText, styles.actionTextExpense]}>记支出</ThemedText>
          </TouchableOpacity>
        </View>

        {/* 最近交易 */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.lg }}>
          <ThemedText style={styles.sectionTitle}>最近记录（左滑删除）</ThemedText>
          <TouchableOpacity onPress={() => router.push('/transaction-list')}>
            <ThemedText style={{ fontSize: 14, color: theme.primary }}>查看全部</ThemedText>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : recentTransactions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <FontAwesome6 name="piggy-bank" size={64} color={theme.textMuted} />
            <ThemedText style={styles.emptyText}>还没有记录哦~</ThemedText>
          </View>
        ) : (
          <View style={styles.transactionList}>
            {recentTransactions.map((transaction) => (
              <View key={transaction.id}>
                {renderTransaction(transaction)}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* 用户菜单弹窗 */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable style={styles.menuOverlay} onPress={() => setMenuVisible(false)}>
          <View style={styles.menuContainer}>
            <View style={styles.menuHeader}>
              <View style={styles.menuUserAvatar}>
                <FontAwesome6 name={currentUser?.avatar || 'user'} size={32} color={theme.primary} />
              </View>
              <View style={styles.menuUserInfo}>
                <ThemedText style={styles.menuUserName}>
                  {currentUser?.nickname || currentUser?.name || '未登录'}
                </ThemedText>
                <ThemedText style={styles.menuUserSubtitle}>当前用户</ThemedText>
              </View>
            </View>
            <View style={styles.menuDivider} />
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.menuItem, item.danger && styles.menuItemDanger]}
                onPress={item.onPress}
              >
                <FontAwesome6
                  name={item.icon}
                  size={20}
                  color={item.danger ? '#FB7185' : theme.textPrimary}
                  style={styles.menuItemIcon}
                />
                <ThemedText style={[styles.menuItemText, item.danger && styles.menuItemTextDanger]}>
                  {item.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </Screen>
  );
}
