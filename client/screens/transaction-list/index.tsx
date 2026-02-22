import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { View, TouchableOpacity, ActivityIndicator, Modal, Alert, Animated, FlatList } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { createStyles } from './styles';
import { useAuth } from '@/contexts/AuthContext';
import { Swipeable } from 'react-native-gesture-handler';
// 注意：FlatList 从 react-native 导入，不要使用 react-native-gesture-handler 的 FlatList

const API_BASE_URL: string = (process.env.EXPO_PUBLIC_BACKEND_BASE_URL as string) || 'http://localhost:9091';

interface Transaction {
  id: string;
  amount: string;
  type: string;
  description: string | null;
  transaction_date: string;
  category_id: string | null;
  category_name?: string;
  category_icon?: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: string;
}

interface CategoryStats {
  category_id: string;
  category_name: string;
  category_icon: string;
  type: string;
  total_amount: number;
  transaction_count: number;
}

// 删除按钮组件
const DeleteButton = ({
  onPress,
  progress,
  dragX,
}: {
  onPress: () => void;
  progress: Animated.AnimatedInterpolation<number>;
  dragX: Animated.AnimatedInterpolation<number>;
}) => {
  const scale = dragX.interpolate({
    inputRange: [-100, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <TouchableOpacity
      style={{
        backgroundColor: '#FB7185',
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        marginBottom: 12,
        borderRadius: 12,
        marginLeft: 8,
      }}
      onPress={onPress}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <FontAwesome6 name="trash-can" size={24} color="#FFFFFF" />
        <ThemedText style={{ color: '#FFFFFF', fontSize: 12, marginTop: 4, fontWeight: '600' }}>删除</ThemedText>
      </Animated.View>
    </TouchableOpacity>
  );
};

// 可滑动的交易项组件
const SwipeableTransactionItem = ({
  transaction,
  theme,
  onPress,
  onDelete,
  renderCategoryIcon,
  formatAmount,
}: {
  transaction: Transaction;
  theme: any;
  onPress: () => void;
  onDelete: () => void;
  renderCategoryIcon: (iconName: string, color?: string) => React.ReactNode;
  formatAmount: (amount: number) => string;
}) => {
  const swipeableRef = useRef<Swipeable>(null);

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    return (
      <DeleteButton
        onPress={() => {
          closeSwipe();
          onDelete();
        }}
        progress={progress}
        dragX={dragX}
      />
    );
  };

  const closeSwipe = () => {
    swipeableRef.current?.close();
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      rightThreshold={40}
      friction={1}
      overshootRight={false}
      onSwipeableOpen={() => {
        // 可以在这里添加震动反馈
      }}
    >
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 16,
          paddingHorizontal: 16,
          backgroundColor: '#FFFFFF',
          marginBottom: 12,
          borderRadius: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
        }}
        onPress={() => {
          closeSwipe();
          onPress();
        }}
        activeOpacity={0.7}
      >
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12,
            backgroundColor: transaction.type === 'income' ? 'rgba(52, 211, 153, 0.1)' : 'rgba(251, 113, 133, 0.1)',
          }}
        >
          {renderCategoryIcon(
            transaction.category_icon || 'circle',
            transaction.type === 'income' ? '#34D399' : '#FB7185'
          )}
        </View>
        <View style={{ flex: 1 }}>
          <ThemedText style={{ fontSize: 16, fontWeight: '600', marginBottom: 4, color: theme.textPrimary }}>
            {transaction.category_name}
          </ThemedText>
          <ThemedText style={{ fontSize: 12, color: theme.textMuted }} numberOfLines={1}>
            {new Date(transaction.transaction_date).getMonth() + 1}月{new Date(transaction.transaction_date).getDate()}日 {new Date(transaction.transaction_date).getHours().toString().padStart(2, '0')}:{new Date(transaction.transaction_date).getMinutes().toString().padStart(2, '0')}
            {transaction.description ? ` · ${transaction.description}` : ''}
          </ThemedText>
        </View>
        <ThemedText
          style={{
            fontSize: 18,
            fontWeight: '700',
            color: transaction.type === 'income' ? '#34D399' : '#FB7185',
          }}
        >
          {transaction.type === 'income' ? '+' : '-'}{formatAmount(parseFloat(transaction.amount))}
        </ThemedText>
      </TouchableOpacity>
    </Swipeable>
  );
};

export default function TransactionListScreen() {
  const { theme, isDark } = useTheme();
  const router = useSafeRouter();
  const { currentUser } = useAuth();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // 获取路由参数（从交易详情页传递的分类ID）
  const params = useSafeSearchParams<{ categoryId?: string }>();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [statsModalVisible, setStatsModalVisible] = useState(false);
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [currentFilter, setCurrentFilter] = useState<'all' | 'income' | 'expense'>('all');

  // 监听路由参数变化，设置分类筛选
  useEffect(() => {
    if (params.categoryId) {
      setSelectedCategory(params.categoryId);
    }
  }, [params.categoryId]);

  // 获取分类列表
  const fetchCategories = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/categories`
      );
      const result = await response.json();
      if (result.data) {
        setCategories(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  // 获取交易记录
  const fetchTransactions = async () => {
    if (!currentUser?.id) return;
    setLoading(true);
    try {
      let url = `${API_BASE_URL}/api/v1/transactions?user_id=${currentUser.id}`;
      if (selectedCategory) {
        url += `&category_id=${selectedCategory}`;
      }
      const response = await fetch(url);
      const result = await response.json();
      if (result.data) {
        // 关联分类名称
        const transactionsWithCategory = result.data.map((t: Transaction) => {
          const category = categories.find(c => c.id === t.category_id);
          return {
            ...t,
            category_name: category?.name || (t.type === 'income' ? '收入' : '支出'),
            category_icon: category?.icon || 'circle',
          };
        });
        setTransactions(transactionsWithCategory);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  // 删除交易
  const handleDeleteTransaction = (transaction: Transaction) => {
    Alert.alert(
      '确认删除',
      `确定要删除这条${transaction.type === 'income' ? '收入' : '支出'}记录吗？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(
                `${API_BASE_URL}/api/v1/transactions/${transaction.id}?user_id=${currentUser?.id}`,
                { method: 'DELETE' }
              );
              
              if (response.ok) {
                // 从本地状态中移除
                setTransactions(prev => prev.filter(t => t.id !== transaction.id));
                Alert.alert('成功', '删除成功！');
              } else {
                Alert.alert('错误', '删除失败');
              }
            } catch (error) {
              Alert.alert('错误', '网络错误，请重试');
            }
          },
        },
      ]
    );
  };

  // 计算分类统计
  const calculateCategoryStats = () => {
    const stats: { [key: string]: CategoryStats } = {};
    
    transactions.forEach(t => {
      const key = t.category_id || t.type;
      if (!stats[key]) {
        const category = categories.find(c => c.id === t.category_id);
        stats[key] = {
          category_id: t.category_id || t.type,
          category_name: category?.name || (t.type === 'income' ? '收入' : '支出'),
          category_icon: category?.icon || (t.type === 'income' ? 'arrow-trend-up' : 'arrow-trend-down'),
          type: t.type,
          total_amount: 0,
          transaction_count: 0,
        };
      }
      stats[key].total_amount += parseFloat(t.amount);
      stats[key].transaction_count += 1;
    });

    return Object.values(stats).sort((a, b) => b.total_amount - a.total_amount);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (categories.length > 0) {
      fetchTransactions();
    }
  }, [categories, selectedCategory, currentUser?.id]);

  useFocusEffect(
    useCallback(() => {
      if (currentUser?.id) {
        fetchTransactions();
      }
    }, [currentUser?.id, selectedCategory])
  );

  // 过滤交易
  const filteredTransactions = useMemo(() => {
    return currentFilter === 'all' 
      ? transactions 
      : transactions.filter(t => t.type === currentFilter);
  }, [transactions, currentFilter]);

  // 计算汇总数据
  const summary = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let monthIncome = 0;
    let monthExpense = 0;
    let yearIncome = 0;
    let yearExpense = 0;

    transactions.forEach(t => {
      const date = new Date(t.transaction_date);
      const amount = parseFloat(t.amount);

      if (date.getFullYear() === currentYear) {
        if (t.type === 'income') {
          yearIncome += amount;
        } else {
          yearExpense += amount;
        }

        if (date.getMonth() === currentMonth) {
          if (t.type === 'income') {
            monthIncome += amount;
          } else {
            monthExpense += amount;
          }
        }
      }
    });

    return { monthIncome, monthExpense, yearIncome, yearExpense };
  }, [transactions]);

  const formatAmount = (amount: number) => {
    return `¥${amount.toFixed(2)}`;
  };

  const renderCategoryIcon = (iconName: string, color?: string) => {
    const iconMap: { [key: string]: any } = {
      wallet: 'wallet',
      gift: 'gift',
      star: 'star',
      cookie: 'cookie',
      gamepad: 'gamepad',
      pencil: 'pencil',
      book: 'book',
      circle: 'circle',
      heart: 'heart',
      house: 'house',
      car: 'car',
      shirt: 'shirt',
      utensils: 'utensils',
      'arrow-trend-up': 'arrow-trend-up',
      'arrow-trend-down': 'arrow-trend-down',
    };
    const name = iconMap[iconName] || 'circle';
    return <FontAwesome6 name={name} size={20} color={color || theme.textPrimary} />;
  };

  const handleShowStats = () => {
    const stats = calculateCategoryStats();
    setCategoryStats(stats);
    setStatsModalVisible(true);
  };

  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
  };

  // 渲染交易项
  const renderTransactionItem = useCallback(({ item }: { item: Transaction }) => (
    <SwipeableTransactionItem
      transaction={item}
      theme={theme}
      onPress={() => router.push('/transaction-detail', { id: item.id })}
      onDelete={() => handleDeleteTransaction(item)}
      renderCategoryIcon={renderCategoryIcon}
      formatAmount={formatAmount}
    />
  ), [theme, router, currentUser?.id]);

  return (
    <Screen
      backgroundColor={theme.backgroundRoot}
      statusBarStyle={isDark ? 'light' : 'dark'}
    >
      {/* 头部 */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTop}>
          <ThemedText style={styles.headerTitle}>账单记录</ThemedText>
          <TouchableOpacity style={styles.statsButton} onPress={handleShowStats}>
            <FontAwesome6 name="chart-pie" size={20} color="#FFFFFF" />
            <ThemedText style={styles.statsButtonText}>汇总</ThemedText>
          </TouchableOpacity>
        </View>

        {/* 月度汇总卡片 */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <ThemedText style={styles.summaryLabel}>本月收入</ThemedText>
            <ThemedText style={styles.summaryIncome}>{formatAmount(summary.monthIncome)}</ThemedText>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <ThemedText style={styles.summaryLabel}>本月支出</ThemedText>
            <ThemedText style={styles.summaryExpense}>{formatAmount(summary.monthExpense)}</ThemedText>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <ThemedText style={styles.summaryLabel}>本月结余</ThemedText>
            <ThemedText style={styles.summaryBalance}>
              {formatAmount(summary.monthIncome - summary.monthExpense)}
            </ThemedText>
          </View>
        </View>
      </View>

      {/* 分类筛选区域 */}
      <View style={styles.categoryFilterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ id: 'all', name: '全部', icon: 'list', type: 'all', color: '' }, ...categories]}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryFilterItem,
                (selectedCategory === null && item.id === 'all') || selectedCategory === item.id
                  ? styles.categoryFilterItemActive
                  : null,
              ]}
              onPress={() => handleCategorySelect(item.id === 'all' ? null : item.id)}
            >
              {item.id !== 'all' && (
                <View style={styles.categoryFilterIcon}>
                  {renderCategoryIcon(
                    item.icon,
                    selectedCategory === item.id ? '#FFFFFF' : theme.textSecondary
                  )}
                </View>
              )}
              <ThemedText
                style={[
                  styles.categoryFilterText,
                  ((selectedCategory === null && item.id === 'all') || selectedCategory === item.id) &&
                    styles.categoryFilterTextActive,
                ]}
              >
                {item.name}
              </ThemedText>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.categoryFilterContent}
        />
      </View>

      {/* 收支类型筛选 */}
      <View style={styles.typeFilterContainer}>
        <TouchableOpacity
          style={[styles.typeFilterBtn, currentFilter === 'all' && styles.typeFilterBtnActive]}
          onPress={() => setCurrentFilter('all')}
        >
          <ThemedText style={[styles.typeFilterText, currentFilter === 'all' && styles.typeFilterTextActive]}>
            全部
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeFilterBtn, currentFilter === 'income' && styles.typeFilterBtnActive]}
          onPress={() => setCurrentFilter('income')}
        >
          <ThemedText style={[styles.typeFilterText, currentFilter === 'income' && styles.typeFilterTextActive]}>
            收入
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeFilterBtn, currentFilter === 'expense' && styles.typeFilterBtnActive]}
          onPress={() => setCurrentFilter('expense')}
        >
          <ThemedText style={[styles.typeFilterText, currentFilter === 'expense' && styles.typeFilterTextActive]}>
            支出
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* 交易列表 */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : filteredTransactions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <FontAwesome6 name="piggy-bank" size={64} color={theme.textMuted} />
          <ThemedText style={styles.emptyText}>
            {selectedCategory ? '该分类下还没有记录~' : '还没有记录哦~'}
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={filteredTransactions}
          keyExtractor={(item) => item.id}
          renderItem={renderTransactionItem}
          contentContainerStyle={styles.transactionList}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={<View style={{ height: 100 }} />}
        />
      )}

      {/* 汇总统计弹窗 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={statsModalVisible}
        onRequestClose={() => setStatsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>分类汇总</ThemedText>
              <TouchableOpacity onPress={() => setStatsModalVisible(false)}>
                <FontAwesome6 name="xmark" size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={categoryStats}
              keyExtractor={(item) => item.category_id}
              renderItem={({ item: stat }) => (
                <TouchableOpacity
                  style={styles.statsCategoryItem}
                  onPress={() => {
                    setStatsModalVisible(false);
                    handleCategorySelect(stat.category_id);
                  }}
                >
                  <View style={styles.statsCategoryLeft}>
                    <View
                      style={[
                        styles.statsCategoryIcon,
                        stat.type === 'income' ? styles.statsCategoryIconIncome : styles.statsCategoryIconExpense,
                      ]}
                    >
                      {renderCategoryIcon(
                        stat.category_icon,
                        stat.type === 'income' ? '#34D399' : '#FB7185'
                      )}
                    </View>
                    <View>
                      <ThemedText style={styles.statsCategoryName}>{stat.category_name}</ThemedText>
                      <ThemedText style={styles.statsCategoryCount}>{stat.transaction_count} 笔</ThemedText>
                    </View>
                  </View>
                  <ThemedText
                    style={[
                      styles.statsCategoryAmount,
                      stat.type === 'income' ? styles.statsCategoryAmountIncome : styles.statsCategoryAmountExpense,
                    ]}
                  >
                    {stat.type === 'income' ? '+' : '-'}{formatAmount(stat.total_amount)}
                  </ThemedText>
                </TouchableOpacity>
              )}
              ListHeaderComponent={(
                <View style={styles.statsSection}>
                  <ThemedText style={styles.statsSectionTitle}>本年汇总</ThemedText>
                  <View style={styles.statsRow}>
                    <View style={styles.statsItem}>
                      <ThemedText style={styles.statsLabel}>收入</ThemedText>
                      <ThemedText style={styles.statsIncome}>{formatAmount(summary.yearIncome)}</ThemedText>
                    </View>
                    <View style={styles.statsItem}>
                      <ThemedText style={styles.statsLabel}>支出</ThemedText>
                      <ThemedText style={styles.statsExpense}>{formatAmount(summary.yearExpense)}</ThemedText>
                    </View>
                    <View style={styles.statsItem}>
                      <ThemedText style={styles.statsLabel}>结余</ThemedText>
                      <ThemedText style={styles.statsBalance}>
                        {formatAmount(summary.yearIncome - summary.yearExpense)}
                      </ThemedText>
                    </View>
                  </View>
                </View>
              )}
              ListEmptyComponent={
                <ThemedText style={styles.emptyStatsText}>暂无数据</ThemedText>
              }
            />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
