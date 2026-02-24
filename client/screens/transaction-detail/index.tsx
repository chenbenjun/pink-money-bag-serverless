import React, { useState, useEffect, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Modal, TextInput } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { createStyles } from './styles';
import { useAuth } from '@/contexts/AuthContext';

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
  created_at: string;
}

interface CategoryStat {
  month: string;
  total: number;
  count: number;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: string;
}

export default function TransactionDetailScreen() {
  const { theme, isDark } = useTheme();
  const router = useSafeRouter();
  const { currentUser } = useAuth();
  const params = useSafeSearchParams<{ id: string }>();
  const styles = useMemo(() => createStyles(theme), [theme]);

  console.log('=== TransactionDetailScreen 渲染 ===');
  console.log('params:', params);
  console.log('params.id:', params.id);
  console.log('currentUser:', currentUser ? `${currentUser.name} (${currentUser.id})` : 'null');
  console.log('API_BASE_URL:', API_BASE_URL);

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryStatsModalVisible, setCategoryStatsModalVisible] = useState(false);
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [categoryTotal, setCategoryTotal] = useState(0);
  
  // 编辑状态
  const [isEditing, setIsEditing] = useState(false);
  const [editAmount, setEditAmount] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDate, setEditDate] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [editCategoryId, setEditCategoryId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTransactionDetail();
  }, [params.id]);

  // 初始化编辑状态
  useEffect(() => {
    if (transaction) {
      setEditAmount(transaction.amount);
      setEditDescription(transaction.description || '');
      setEditDate(transaction.transaction_date);
      setEditCategoryId(transaction.category_id);
      if (transaction.type) {
        fetchCategories(transaction.type);
      }
    }
  }, [transaction]);

  const fetchCategories = async (type: string) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/categories?type=${type}`
      );
      const result = await response.json();
      if (result.data) {
        setCategories(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchTransactionDetail = async () => {
    if (!params.id || !currentUser?.id) {
      console.log('=== 交易详情加载失败 ===');
      console.log('params.id:', params.id);
      console.log('currentUser?.id:', currentUser?.id);
      return;
    }

    console.log('=== 开始加载交易详情 ===');
    console.log('API_BASE_URL:', API_BASE_URL);
    console.log('交易ID:', params.id);
    console.log('用户ID:', currentUser.id);

    setLoading(true);
    setError(null);

    try {
      // 获取交易详情
      const url = `${API_BASE_URL}/api/v1/transactions/${params.id}?user_id=${currentUser.id}`;
      console.log('请求URL:', url);

      const response = await fetch(url);
      const result = await response.json();

      console.log('响应状态:', response.status);
      console.log('响应数据:', result);

      if (result.data) {
        // 获取分类信息
        const categoryRes = await fetch(`${API_BASE_URL}/api/v1/categories`);
        const categoryResult = await categoryRes.json();
        const category = categoryResult.data?.find((c: any) => c.id === result.data.category_id);

        setTransaction({
          ...result.data,
          category_name: category?.name || (result.data.type === 'income' ? '收入' : '支出'),
          category_icon: category?.icon || 'circle',
        });
        console.log('=== 交易详情加载成功 ===');
      } else {
        console.error('未找到交易记录');
        setError('未找到交易记录');
      }
    } catch (error: any) {
      console.error('Failed to fetch transaction detail:', error);
      setError(`加载失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 获取该分类的统计数据
  const fetchCategoryStats = async () => {
    if (!transaction?.category_id || !currentUser?.id) return;

    try {
      // 获取该分类的所有交易
      const response = await fetch(
        `${API_BASE_URL}/api/v1/transactions?user_id=${currentUser.id}&category_id=${transaction.category_id}`
      );
      const result = await response.json();

      if (result.data) {
        // 按月份统计
        const monthlyStats: { [key: string]: { total: number; count: number } } = {};
        let total = 0;

        result.data.forEach((t: any) => {
          const date = new Date(t.transaction_date);
          const monthKey = `${date.getFullYear()}年${date.getMonth() + 1}月`;
          
          if (!monthlyStats[monthKey]) {
            monthlyStats[monthKey] = { total: 0, count: 0 };
          }
          
          monthlyStats[monthKey].total += parseFloat(t.amount);
          monthlyStats[monthKey].count += 1;
          total += parseFloat(t.amount);
        });

        const stats = Object.entries(monthlyStats)
          .map(([month, data]) => ({
            month,
            total: data.total,
            count: data.count,
          }))
          .sort((a, b) => {
            // 按时间倒序
            const aDate = new Date(a.month.replace('年', '-').replace('月', ''));
            const bDate = new Date(b.month.replace('年', '-').replace('月', ''));
            return bDate.getTime() - aDate.getTime();
          });

        setCategoryStats(stats);
        setCategoryTotal(total);
        setCategoryStatsModalVisible(true);
      }
    } catch (error) {
      console.error('Failed to fetch category stats:', error);
      Alert.alert('错误', '获取分类统计失败');
    }
  };

  const handleDelete = async () => {
    if (!transaction || !currentUser?.id) return;

    Alert.alert(
      '确认删除',
      '确定要删除这条记录吗？',
      [
        {
          text: '取消',
          style: 'cancel',
        },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(
                `${API_BASE_URL}/api/v1/transactions/${transaction.id}?user_id=${currentUser.id}`,
                {
                  method: 'DELETE',
                }
              );

              if (response.ok) {
                Alert.alert('成功', '记录已删除', [
                  {
                    text: '确定',
                    onPress: () => router.back(),
                  },
                ]);
              } else {
                Alert.alert('错误', '删除失败，请重试');
              }
            } catch (error) {
              Alert.alert('错误', '网络错误，请重试');
            }
          },
        },
      ]
    );
  };

  // 保存编辑
  const handleSaveEdit = async () => {
    if (!transaction || !currentUser?.id) return;

    if (!editAmount || parseFloat(editAmount) <= 0) {
      Alert.alert('提示', '请输入有效的金额');
      return;
    }

    if (!editCategoryId) {
      Alert.alert('提示', '请选择分类');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/transactions/${transaction.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: currentUser.id,
            amount: editAmount,
            description: editDescription || null,
            transaction_date: editDate,
            category_id: editCategoryId,
            type: transaction.type,
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        // 更新本地状态
        const category = categories.find(c => c.id === editCategoryId);
        setTransaction({
          ...transaction,
          ...result.data,
          category_name: category?.name || result.data.category_name,
          category_icon: category?.icon || result.data.category_icon,
        });
        setIsEditing(false);
        Alert.alert('成功', '记录已更新');
      } else {
        const error = await response.json();
        Alert.alert('错误', error.error || '更新失败，请重试');
      }
    } catch (error) {
      Alert.alert('错误', '网络错误，请重试');
    } finally {
      setSaving(false);
    }
  };

  // 取消编辑
  const handleCancelEdit = () => {
    if (transaction) {
      setEditAmount(transaction.amount);
      setEditDescription(transaction.description || '');
      setEditDate(transaction.transaction_date);
      setEditCategoryId(transaction.category_id);
    }
    setIsEditing(false);
  };

  const formatAmount = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `¥${num.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
    };
    const name = iconMap[iconName] || 'circle';
    return <FontAwesome6 name={name} size={20} color={color || theme.textPrimary} />;
  };

  if (loading) {
    return (
      <Screen
        backgroundColor={theme.backgroundRoot}
        statusBarStyle={isDark ? 'light' : 'dark'}
      >
        <View style={styles.headerContainer}>
          <ThemedText style={styles.headerTitle}>交易详情</ThemedText>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </Screen>
    );
  }

  if (error || !transaction) {
    return (
      <Screen
        backgroundColor={theme.backgroundRoot}
        statusBarStyle={isDark ? 'light' : 'dark'}
      >
        <View style={styles.headerContainer}>
          <ThemedText style={styles.headerTitle}>交易详情</ThemedText>
        </View>
        <View style={styles.errorContainer}>
          <FontAwesome6 name="circle-exclamation" size={64} color={theme.textMuted} />
          <ThemedText style={styles.errorText}>{error || '加载失败'}</ThemedText>
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      backgroundColor={theme.backgroundRoot}
      statusBarStyle={isDark ? 'light' : 'dark'}
    >
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <FontAwesome6 name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>
          {isEditing ? '编辑记录' : '交易详情'}
        </ThemedText>
        {!isEditing && (
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => setIsEditing(true)}
          >
            <FontAwesome6 name="pen-to-square" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.scrollContent}>
        <View style={styles.contentContainer}>
          {/* 金额卡片 */}
          <View style={styles.card}>
            <View style={styles.amountContainer}>
              {isEditing ? (
                <View style={styles.editAmountContainer}>
                  <ThemedText style={[styles.amountPrefix, transaction.type === 'income' ? styles.amountIncome : styles.amountExpense]}>
                    {transaction.type === 'income' ? '+' : '-'}
                  </ThemedText>
                  <TextInput
                    style={[styles.editAmountInput, transaction.type === 'income' ? styles.amountIncome : styles.amountExpense]}
                    value={editAmount}
                    onChangeText={setEditAmount}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    placeholderTextColor={theme.textMuted}
                    autoFocus
                  />
                </View>
              ) : (
                <ThemedText
                  style={[
                    styles.amount,
                    transaction.type === 'income' ? styles.amountIncome : styles.amountExpense,
                  ]}
                >
                  {transaction.type === 'income' ? '+' : '-'}{formatAmount(transaction.amount)}
                </ThemedText>
              )}
            </View>
          </View>

          {/* 信息卡片 */}
          <View style={styles.card}>
            {/* 分类 */}
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>分类</ThemedText>
              {isEditing ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                  <View style={styles.categoryList}>
                    {categories.map((cat) => (
                      <TouchableOpacity
                        key={cat.id}
                        style={[
                          styles.categoryOption,
                          editCategoryId === cat.id && styles.categoryOptionSelected,
                        ]}
                        onPress={() => setEditCategoryId(cat.id)}
                      >
                        <FontAwesome6
                          name={cat.icon || 'circle'}
                          size={16}
                          color={editCategoryId === cat.id ? '#FFFFFF' : theme.textMuted}
                        />
                        <ThemedText
                          style={[
                            styles.categoryOptionText,
                            editCategoryId === cat.id && styles.categoryOptionTextSelected,
                          ]}
                        >
                          {cat.name}
                        </ThemedText>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              ) : (
                <TouchableOpacity 
                  style={styles.infoValueContainer}
                  onPress={fetchCategoryStats}
                  activeOpacity={0.7}
                >
                  <View style={styles.categoryIconSmall}>
                    {renderCategoryIcon(
                      transaction.category_icon || 'circle',
                      transaction.type === 'income' ? '#34D399' : '#FB7185'
                    )}
                  </View>
                  <ThemedText style={styles.infoValue}>
                    {transaction.category_name}
                  </ThemedText>
                  <FontAwesome6 name="chevron-right" size={16} color={theme.textMuted} style={{ marginLeft: 8 }} />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>类型</ThemedText>
              <ThemedText style={styles.infoValue}>
                {transaction.type === 'income' ? '收入' : '支出'}
              </ThemedText>
            </View>

            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>日期</ThemedText>
              {isEditing ? (
                <TextInput
                  style={styles.editInput}
                  value={editDate}
                  onChangeText={setEditDate}
                  placeholder="YYYY-MM-DD HH:MM"
                  placeholderTextColor={theme.textMuted}
                />
              ) : (
                <ThemedText style={styles.infoValue}>
                  {formatDate(transaction.transaction_date)}
                </ThemedText>
              )}
            </View>

            <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
              <ThemedText style={styles.infoLabel}>描述</ThemedText>
              {isEditing ? (
                <TextInput
                  style={[styles.editInput, { flex: 1, textAlign: 'right' }]}
                  value={editDescription}
                  onChangeText={setEditDescription}
                  placeholder="添加描述..."
                  placeholderTextColor={theme.textMuted}
                  multiline
                />
              ) : (
                <ThemedText style={[styles.infoValue, { flex: 1, textAlign: 'right' }]}>
                  {transaction.description || '-'}
                </ThemedText>
              )}
            </View>
          </View>

          {/* 提示 - 仅在非编辑模式显示 */}
          {!isEditing && (
            <View style={styles.tipContainer}>
              <FontAwesome6 name="lightbulb" size={16} color={theme.textMuted} />
              <ThemedText style={styles.tipText}>点击分类可查看该分类的汇总报表</ThemedText>
            </View>
          )}
        </View>
      </ScrollView>

      {/* 底部按钮 */}
      {isEditing ? (
        <View style={styles.editButtonContainer}>
          <TouchableOpacity style={styles.buttonCancel} onPress={handleCancelEdit}>
            <ThemedText style={styles.buttonCancelText}>取消</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.buttonSave, saving && styles.buttonDisabled]} 
            onPress={handleSaveEdit}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <ThemedText style={styles.buttonText}>保存</ThemedText>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.buttonDelete} onPress={handleDelete}>
            <FontAwesome6 name="trash-can" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            <ThemedText style={styles.buttonText}>删除</ThemedText>
          </TouchableOpacity>
        </View>
      )}

      {/* 分类统计弹窗 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={categoryStatsModalVisible}
        onRequestClose={() => setCategoryStatsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <View style={styles.modalCategoryIcon}>
                  {renderCategoryIcon(
                    transaction.category_icon || 'circle',
                    transaction.type === 'income' ? '#34D399' : '#FB7185'
                  )}
                </View>
                <View>
                  <ThemedText style={styles.modalTitle}>{transaction.category_name}</ThemedText>
                  <ThemedText style={styles.modalSubtitle}>
                    总计: {formatAmount(categoryTotal)} · {categoryStats.reduce((sum, s) => sum + s.count, 0)} 笔
                  </ThemedText>
                </View>
              </View>
              <TouchableOpacity onPress={() => setCategoryStatsModalVisible(false)}>
                <FontAwesome6 name="xmark" size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {categoryStats.length === 0 ? (
                <View style={styles.emptyStatsContainer}>
                  <FontAwesome6 name="chart-simple" size={48} color={theme.textMuted} />
                  <ThemedText style={styles.emptyStatsText}>暂无统计数据</ThemedText>
                </View>
              ) : (
                categoryStats.map((stat, index) => (
                  <View key={stat.month} style={styles.statItem}>
                    <View style={styles.statItemLeft}>
                      <ThemedText style={styles.statMonth}>{stat.month}</ThemedText>
                      <ThemedText style={styles.statCount}>{stat.count} 笔</ThemedText>
                    </View>
                    <ThemedText
                      style={[
                        styles.statAmount,
                        transaction.type === 'income' ? styles.statAmountIncome : styles.statAmountExpense,
                      ]}
                    >
                      {transaction.type === 'income' ? '+' : '-'}{formatAmount(stat.total)}
                    </ThemedText>
                  </View>
                ))
              )}
            </ScrollView>

            {/* 跳转到分类筛选按钮 */}
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => {
                setCategoryStatsModalVisible(false);
                // 跳转到交易列表页，并传递分类ID参数
                router.push('/transaction-list', { 
                  categoryId: transaction?.category_id,
                  categoryName: transaction?.category_name 
                });
              }}
            >
              <ThemedText style={styles.viewAllButtonText}>查看该分类所有记录</ThemedText>
              <FontAwesome6 name="arrow-right" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
