import React, { useState, useEffect, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { createStyles } from './styles';
import { useAuth } from '@/contexts/AuthContext';
import { dataChangedEmitter } from '@/utils/eventEmitter';
import { playWechatSound, preloadWechatSound } from '@/utils/sound';

const API_BASE_URL: string = (process.env.EXPO_PUBLIC_BACKEND_BASE_URL as string) || 'http://localhost:9091';

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: string;
  user_id?: string;
}

interface SavedTransaction {
  id: string;
  amount: string;
  type: string;
  description: string | null;
  transaction_date: string;
  category_id: string;
  category_name?: string;
}

const ICON_OPTIONS = [
  { name: 'wallet', label: '钱包' },
  { name: 'gift', label: '礼物' },
  { name: 'star', label: '星星' },
  { name: 'cookie', label: '零食' },
  { name: 'gamepad', label: '游戏' },
  { name: 'pencil', label: '文具' },
  { name: 'book', label: '书籍' },
  { name: 'heart', label: '爱心' },
  { name: 'house', label: '家' },
  { name: 'car', label: '交通' },
  { name: 'shirt', label: '衣服' },
  { name: 'utensils', label: '餐饮' },
];

export default function AddTransactionScreen() {
  const { theme, isDark } = useTheme();
  const router = useSafeRouter();
  const params = useSafeSearchParams<{ type?: 'income' | 'expense' }>();
  const { currentUser } = useAuth();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [type, setType] = useState<'income' | 'expense'>(params.type || 'expense');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [savedTransaction, setSavedTransaction] = useState<SavedTransaction | null>(null);
  
  // 分类管理弹窗状态
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('wallet');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  useEffect(() => {
    fetchCategories();
    // 预加载微信音效（如果是收入类型）
    if (type === 'income') {
      preloadWechatSound();
    }
  }, [type]);

  const fetchCategories = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/categories?type=${type}`
      );
      const result = await response.json();
      if (result.data) {
        setCategories(result.data);
        if (result.data.length > 0 && !selectedCategory) {
          setSelectedCategory(result.data[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleSave = async () => {
    if (!currentUser?.id) {
      Alert.alert('错误', '用户未登录');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('提示', '请输入有效的金额');
      return;
    }

    if (!selectedCategory) {
      Alert.alert('提示', '请选择分类');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser.id,
          amount: parseFloat(amount).toFixed(2),
          type,
          category_id: selectedCategory,
          description: description || null,
          transaction_date: new Date().toISOString(),
        }),
      });

      const result = await response.json();

      if (result.data) {
        const category = categories.find(c => c.id === selectedCategory);
        const savedData: SavedTransaction = {
          ...result.data,
          category_name: category?.name || '未知分类',
        };
        setSavedTransaction(savedData);
        // 如果是收入，播放微信收钱音效
        if (type === 'income') {
          playWechatSound();
        }
        // 触发交易添加事件
        dataChangedEmitter.emit('transactionAdded', { type });
      } else {
        Alert.alert('错误', result.error || '保存失败');
      }
    } catch (error) {
      Alert.alert('错误', '网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTransaction = async () => {
    if (!savedTransaction) return;
    
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('提示', '请输入有效的金额');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/transactions/${savedTransaction.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: parseFloat(amount).toFixed(2),
            type,
            category_id: selectedCategory,
            description: description || null,
            transaction_date: savedTransaction.transaction_date,
          }),
        }
      );

      const result = await response.json();

      if (result.data) {
        const category = categories.find(c => c.id === selectedCategory);
        setSavedTransaction({
          ...result.data,
          category_name: category?.name || '未知分类',
        });
        Alert.alert('成功', '修改成功！');
      } else {
        Alert.alert('错误', result.error || '修改失败');
      }
    } catch (error) {
      Alert.alert('错误', '网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTransaction = () => {
    if (!savedTransaction) return;
    
    Alert.alert(
      '确认删除',
      '确定要删除这条记录吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(
                `${API_BASE_URL}/api/v1/transactions/${savedTransaction.id}`,
                { method: 'DELETE' }
              );
              
              if (response.ok) {
                setSavedTransaction(null);
                handleReset();
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

  const handleBackToHome = () => {
    router.replace('/');
  };

  const handleReset = () => {
    setAmount('');
    setDescription('');
    setSavedTransaction(null);
    if (categories.length > 0) {
      setSelectedCategory(categories[0].id);
    }
  };

  // 分类管理功能
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      Alert.alert('提示', '请输入分类名称');
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/categories`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newCategoryName.trim(),
            icon: newCategoryIcon,
            color: '#FF69B4',
            type,
          }),
        }
      );

      const result = await response.json();

      if (result.data) {
        await fetchCategories();
        setNewCategoryName('');
        setEditingCategory(null);
        Alert.alert('成功', '分类添加成功！');
      } else {
        Alert.alert('错误', result.error || '添加失败');
      }
    } catch (error) {
      Alert.alert('错误', '网络错误，请重试');
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !newCategoryName.trim()) {
      Alert.alert('提示', '请输入分类名称');
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/categories/${editingCategory.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newCategoryName.trim(),
            icon: newCategoryIcon,
            color: '#FF69B4',
            type,
          }),
        }
      );

      const result = await response.json();

      if (result.data) {
        await fetchCategories();
        setNewCategoryName('');
        setEditingCategory(null);
        Alert.alert('成功', '分类修改成功！');
      } else {
        Alert.alert('错误', result.error || '修改失败');
      }
    } catch (error) {
      Alert.alert('错误', '网络错误，请重试');
    }
  };

  const handleDeleteCategory = (category: Category) => {
    Alert.alert(
      '确认删除',
      `确定要删除分类"${category.name}"吗？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(
                `${API_BASE_URL}/api/v1/categories/${category.id}`,
                { method: 'DELETE' }
              );
              
              if (response.ok) {
                await fetchCategories();
                if (selectedCategory === category.id && categories.length > 1) {
                  const remaining = categories.filter(c => c.id !== category.id);
                  setSelectedCategory(remaining[0]?.id || null);
                }
                Alert.alert('成功', '分类删除成功！');
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

  const startEditCategory = (category: Category) => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setNewCategoryIcon(category.icon || 'wallet');
  };

  const cancelEditCategory = () => {
    setEditingCategory(null);
    setNewCategoryName('');
    setNewCategoryIcon('wallet');
  };

  const renderCategoryIcon = (iconName: string, color?: string) => {
    const iconMap: { [key: string]: any } = {
      wallet: 'wallet',
      gift: 'gift',
      star: 'star',
      cookie: 'cookie',
      'game-controller': 'gamepad',
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
    return <FontAwesome6 name={name} size={24} color={color || theme.textPrimary} />;
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

  const formatAmount = (amount: string) => {
    const num = parseFloat(amount);
    return `¥${num.toFixed(2)}`;
  };

  return (
    <Screen
      backgroundColor={theme.backgroundRoot}
      statusBarStyle={isDark ? 'light' : 'dark'}
    >
      <ScrollView style={styles.scrollContent}>
        {/* 头部：返回按钮和标题 */}
        <View style={styles.headerContainer}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackToHome}>
            <FontAwesome6 name="house" size={24} color={theme.primary} />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>
            {type === 'income' ? '记收入' : '记支出'}
          </ThemedText>
        </View>

        {/* 类型选择 */}
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[styles.typeButton, type === 'expense' && styles.typeButtonActive]}
            onPress={() => {
              setType('expense');
              setSavedTransaction(null);
            }}
          >
            <ThemedText
              style={[
                styles.typeButtonText,
                type === 'expense' ? styles.typeButtonTextActive : styles.typeButtonTextInactive,
              ]}
            >
              支出
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeButton, type === 'income' && styles.typeButtonActive]}
            onPress={() => {
              setType('income');
              setSavedTransaction(null);
            }}
          >
            <ThemedText
              style={[
                styles.typeButtonText,
                type === 'income' ? styles.typeButtonTextActive : styles.typeButtonTextInactive,
              ]}
            >
              收入
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* 金额输入 */}
        <View style={styles.inputContainer}>
          <ThemedText style={styles.sectionTitle}>金额</ThemedText>
          <View style={styles.inputWrapper}>
            <TextInput
              style={[styles.input, styles.amountInput]}
              placeholder="0.00"
              placeholderTextColor={theme.textMuted}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        {/* 分类选择 */}
        <View style={styles.categorySection}>
          <View style={styles.categoryHeader}>
            <ThemedText style={styles.sectionTitle}>分类</ThemedText>
            <TouchableOpacity 
              style={styles.addCategoryButton}
              onPress={() => setCategoryModalVisible(true)}
            >
              <FontAwesome6 name="plus" size={14} color={theme.primary} />
              <ThemedText style={styles.addCategoryText}>管理分类</ThemedText>
            </TouchableOpacity>
          </View>
          <View style={styles.categoryGrid}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryItem,
                  selectedCategory === category.id && styles.categoryItemActive,
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <View style={styles.categoryIcon}>
                  {renderCategoryIcon(category.icon, selectedCategory === category.id ? '#FFFFFF' : theme.textPrimary)}
                </View>
                <ThemedText
                  style={[
                    styles.categoryText,
                    selectedCategory === category.id ? styles.categoryTextActive : styles.categoryTextInactive,
                  ]}
                >
                  {category.name}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 描述输入 */}
        <View style={styles.inputContainer}>
          <ThemedText style={styles.sectionTitle}>备注（可选）</ThemedText>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="写点什么..."
              placeholderTextColor={theme.textMuted}
              value={description}
              onChangeText={setDescription}
            />
          </View>
        </View>

        {/* 保存按钮 */}
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          <ThemedText style={styles.buttonText}>
            {loading ? '保存中...' : '保存'}
          </ThemedText>
        </TouchableOpacity>
      </ScrollView>

      {/* 保存成功弹窗 */}
      {savedTransaction && (
        <View style={styles.savedCardContainer}>
          <View style={styles.savedCard}>
            {/* 头部：标题和操作按钮 */}
            <View style={styles.savedCardHeader}>
              <ThemedText style={styles.savedCardTitle}>✓ 保存成功</ThemedText>
              <View style={styles.savedCardActions}>
                <TouchableOpacity 
                  style={styles.savedCardActionBtn}
                  onPress={() => {
                    setAmount(savedTransaction.amount);
                    setType(savedTransaction.type as 'income' | 'expense');
                    setSelectedCategory(savedTransaction.category_id);
                    setDescription(savedTransaction.description || '');
                    setSavedTransaction(null);
                  }}
                >
                  <FontAwesome6 name="pen-to-square" size={20} color={theme.primary} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.savedCardActionBtn}
                  onPress={handleDeleteTransaction}
                >
                  <FontAwesome6 name="trash-can" size={20} color="#FB7185" />
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.savedCardItem}>
              <ThemedText style={styles.savedCardLabel}>类型</ThemedText>
              <ThemedText style={styles.savedCardValue}>
                {savedTransaction.type === 'income' ? '收入' : '支出'}
              </ThemedText>
            </View>
            
            <View style={styles.savedCardItem}>
              <ThemedText style={styles.savedCardLabel}>分类</ThemedText>
              <ThemedText style={styles.savedCardValue}>
                {savedTransaction.category_name || '未知'}
              </ThemedText>
            </View>
            
            <View style={styles.savedCardItem}>
              <ThemedText style={styles.savedCardLabel}>时间</ThemedText>
              <ThemedText style={styles.savedCardValue}>
                {formatDate(savedTransaction.transaction_date)}
              </ThemedText>
            </View>
            
            {savedTransaction.description && (
              <View style={styles.savedCardItem}>
                <ThemedText style={styles.savedCardLabel}>备注</ThemedText>
                <ThemedText style={styles.savedCardValue}>
                  {savedTransaction.description}
                </ThemedText>
              </View>
            )}
            
            <ThemedText
              style={[
                styles.savedCardAmount,
                savedTransaction.type === 'income' ? styles.savedCardAmountIncome : styles.savedCardAmountExpense,
              ]}
            >
              {savedTransaction.type === 'income' ? '+' : '-'}{formatAmount(savedTransaction.amount)}
            </ThemedText>

            {/* 按钮行：再记一笔 和 返回首页 并列 */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.buttonHalf}
                onPress={handleReset}
              >
                <ThemedText style={styles.buttonText}>再记一笔</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.buttonHalf}
                onPress={handleBackToHome}
              >
                <ThemedText style={styles.buttonText}>返回首页</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* 分类管理弹窗 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={categoryModalVisible}
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>管理{type === 'income' ? '收入' : '支出'}分类</ThemedText>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => {
                  setCategoryModalVisible(false);
                  cancelEditCategory();
                }}
              >
                <FontAwesome6 name="xmark" size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.categoryList}>
              {categories.map((category) => (
                <View key={category.id} style={styles.categoryListItem}>
                  <View style={styles.categoryListItemLeft}>
                    {renderCategoryIcon(category.icon)}
                    <ThemedText style={styles.categoryListItemText}>{category.name}</ThemedText>
                  </View>
                  <View style={styles.categoryListItemActions}>
                    <TouchableOpacity 
                      style={styles.categoryActionBtn}
                      onPress={() => startEditCategory(category)}
                    >
                      <FontAwesome6 name="pen" size={18} color={theme.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.categoryActionBtn}
                      onPress={() => handleDeleteCategory(category)}
                    >
                      <FontAwesome6 name="trash" size={18} color="#FB7185" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>

            {/* 添加/编辑分类表单 */}
            <View style={styles.addCategoryForm}>
              <ThemedText style={styles.formLabel}>
                {editingCategory ? '修改分类' : '添加新分类'}
              </ThemedText>
              <TextInput
                style={styles.formInput}
                placeholder="输入分类名称"
                placeholderTextColor={theme.textMuted}
                value={newCategoryName}
                onChangeText={setNewCategoryName}
              />
              <ThemedText style={styles.formLabel}>选择图标</ThemedText>
              <View style={styles.iconSelector}>
                {ICON_OPTIONS.map((icon) => (
                  <TouchableOpacity
                    key={icon.name}
                    style={[
                      styles.iconOption,
                      newCategoryIcon === icon.name && styles.iconOptionSelected,
                    ]}
                    onPress={() => setNewCategoryIcon(icon.name)}
                  >
                    <FontAwesome6 
                      name={icon.name as any} 
                      size={20} 
                      color={newCategoryIcon === icon.name ? '#FFFFFF' : theme.textSecondary} 
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.buttonRow}>
                {editingCategory && (
                  <TouchableOpacity
                    style={[styles.buttonHalf, { backgroundColor: theme.textMuted }]}
                    onPress={cancelEditCategory}
                  >
                    <ThemedText style={styles.buttonText}>取消</ThemedText>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.buttonHalf, editingCategory ? {} : { flex: 1 }]}
                  onPress={editingCategory ? handleUpdateCategory : handleAddCategory}
                >
                  <ThemedText style={styles.buttonText}>
                    {editingCategory ? '保存修改' : '添加分类'}
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
