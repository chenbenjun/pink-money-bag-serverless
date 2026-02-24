import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  Pressable,
  Image,
} from 'react-native';
import { TextInput } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '@/hooks/useTheme';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { createStyles } from './styles';
import { useAuth } from '@/contexts/AuthContext';
import { getSoundEnabled, setSoundEnabled } from '@/utils/sound';
import { createFormDataFile } from '@/utils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Spacing } from '@/constants/theme';
import { useFocusEffect } from 'expo-router';

// 3x4 = 12个预设头像
const AVATAR_OPTIONS = [
  // 第一行：动物
  { name: 'cat', label: '猫咪' },
  { name: 'dog', label: '小狗' },
  { name: 'rabbit', label: '兔子' },
  { name: 'dragon', label: '小龙' },
  // 第二行：动物/昆虫
  { name: 'frog', label: '青蛙' },
  { name: 'fish', label: '小鱼' },
  { name: 'dove', label: '小鸟' },
  { name: 'horse', label: '小马' },
  // 第三行：水果/自然
  { name: 'apple-whole', label: '苹果' },
  { name: 'carrot', label: '胡萝卜' },
  { name: 'sun', label: '太阳' },
  { name: 'star', label: '星星' },
];

// 隐私政策内容
const PRIVACY_POLICY = `隐私政策

最后更新日期：2025年2月

粉红小钱袋（以下简称"本应用"）非常重视您的隐私保护。本隐私政策说明我们如何收集、使用和保护您的个人信息。

1. 信息收集
本应用可能收集以下信息：
• 账号信息：用户名、昵称、头像
• 交易数据：您记录的收支信息
• 设备信息：用于改进应用性能

2. 信息使用
我们使用您的信息用于：
• 提供记账服务
• 生成收支统计报表
• 改进应用功能和体验

3. 信息保护
• 您的数据仅存储在本地或您授权的服务器
• 我们不会将您的数据出售给第三方
• 采用加密技术保护敏感信息

4. 您的权利
• 随时查看、修改或删除您的数据
• 注销账号后所有数据将被清除
• 导出您的数据

5. 联系我们
如有隐私相关问题，请通过意见反馈与我们联系。`;

// 用户协议内容
const USER_AGREEMENT = `用户协议

最后更新日期：2025年2月

欢迎使用粉红小钱袋！在使用本应用前，请仔细阅读以下协议。

1. 服务说明
粉红小钱袋是一款个人记账应用，帮助用户记录和管理日常收支。

2. 账号注册
• 您需要提供真实有效的信息进行注册
• 您有责任保护账号密码安全
• 禁止分享或转让账号

3. 使用规范
您同意不：
• 使用本应用进行违法活动
• 干扰或破坏应用正常运行
• 未经授权访问其他用户数据

4. 免责声明
• 本应用仅供个人记账使用，不提供投资建议
• 用户自行承担记账数据的准确性责任
• 因不可抗力导致的服务中断，我们不承担责任

5. 协议修改
我们可能不时修改本协议，修改后会在应用内通知。

6. 终止
违反本协议可能导致账号被暂停或终止。

继续使用本应用即表示您同意以上条款。`;

export default function SettingsScreen() {
  const { theme, isDark } = useTheme();
  const router = useSafeRouter();
  const { currentUser, updateUser, deleteUser, logout, refreshCurrentUser } = useAuth();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [loading, setLoading] = useState(false);
  const [soundEnabled, setSoundEnabledState] = useState(getSoundEnabled());
  
  // 未读反馈状态
  const [hasUnreadFeedback, setHasUnreadFeedback] = useState(false);

  // 账号管理编辑状态
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  // 密码修改
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // 头像选择
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  // 协议弹窗
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const [agreementType, setAgreementType] = useState<'privacy' | 'user'>('privacy');

  // 缓存大小
  const [cacheSize, setCacheSize] = useState<string>('0 KB');

  // 检查未读反馈
  const checkUnreadFeedback = async () => {
    if (!currentUser?.id) return;

    try {
      // 获取已读反馈ID
      const savedReadIds = await AsyncStorage.getItem('read_feedback_ids');
      const readIds = savedReadIds ? new Set(JSON.parse(savedReadIds)) : new Set();

      // 获取用户的反馈列表
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/feedbacks/user/${currentUser.id}`
      );
      const result = await response.json();

      if (result.success && result.data) {
        // 检查是否有未读回复
        const hasUnread = result.data.some((feedback: any) => 
          feedback.reply && !readIds.has(feedback.id)
        );
        setHasUnreadFeedback(hasUnread);
      }
    } catch (error) {
      console.error('检查未读反馈失败:', error);
    }
  };

  // 页面加载时读取音效设置
  useEffect(() => {
    const loadSoundSetting = async () => {
      const saved = await AsyncStorage.getItem('sound_enabled');
      if (saved !== null) {
        const enabled = saved === 'true';
        setSoundEnabledState(enabled);
        setSoundEnabled(enabled);
      }
    };
    loadSoundSetting();
    calculateCacheSize();
  }, []);

  // 进入页面时检查未读反馈和刷新用户信息
  useFocusEffect(
    React.useCallback(() => {
      checkUnreadFeedback();
      // 刷新用户信息以获取最新的 is_admin 状态
      refreshCurrentUser();
    }, [currentUser?.id])
  );

  // 切换音效开关
  const handleToggleSound = async () => {
    const newValue = !soundEnabled;
    setSoundEnabledState(newValue);
    setSoundEnabled(newValue);
    await AsyncStorage.setItem('sound_enabled', newValue ? 'true' : 'false');
  };

  // 计算缓存大小
  const calculateCacheSize = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      let totalSize = 0;
      
      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalSize += new Blob([value]).size;
        }
      }
      
      // 转换为可读格式
      if (totalSize < 1024) {
        setCacheSize(`${totalSize} B`);
      } else if (totalSize < 1024 * 1024) {
        setCacheSize(`${(totalSize / 1024).toFixed(1)} KB`);
      } else {
        setCacheSize(`${(totalSize / (1024 * 1024)).toFixed(1)} MB`);
      }
    } catch (error) {
      setCacheSize('0 KB');
    }
  };

  // 清除缓存
  const handleClearCache = () => {
    Alert.alert(
      '清除缓存',
      '确定要清除所有缓存数据吗？这不会删除您的交易记录和账号信息。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '清除',
          style: 'destructive',
          onPress: async () => {
            try {
              // 保留用户相关数据，只清除缓存
              const keysToKeep = ['user_credentials'];
              const allKeys = await AsyncStorage.getAllKeys();
              const keysToRemove = allKeys.filter(key => !keysToKeep.includes(key));
              
              if (keysToRemove.length > 0) {
                await AsyncStorage.multiRemove(keysToRemove);
              }
              
              setCacheSize('0 KB');
              Alert.alert('成功', '缓存已清除');
            } catch (error) {
              Alert.alert('失败', '清除缓存失败，请重试');
            }
          },
        },
      ]
    );
  };

  // 页面加载时计算缓存大小
  useEffect(() => {
    calculateCacheSize();
  }, []);

  // 保存字段
  const handleSaveField = async (field: string) => {
    if (!currentUser) return;
    setLoading(true);

    const updates: any = {};
    switch (field) {
      case 'nickname':
        updates.nickname = editValue.trim() || undefined;
        break;
      case 'age':
        updates.age = editValue ? parseInt(editValue, 10) : undefined;
        break;
      case 'gender':
        updates.gender = editValue as 'male' | 'female';
        break;
    }

    const success = await updateUser(currentUser.id, updates);
    setLoading(false);
    if (success) {
      setEditingField(null);
      Alert.alert('成功', '已保存');
    } else {
      Alert.alert('失败', '保存失败，请重试');
    }
  };

  // 保存头像（预设）
  const handleSaveAvatar = async (avatar: string) => {
    if (!currentUser) return;
    setLoading(true);
    const success = await updateUser(currentUser.id, { 
      avatar,
      avatar_type: 'preset'
    });
    setLoading(false);
    if (success) {
      setShowAvatarModal(false);
      Alert.alert('成功', '头像已更新');
    } else {
      Alert.alert('失败', '更新失败，请重试');
    }
  };

  // 从相册选择图片
  const handlePickImage = async () => {
    if (!currentUser) return;
    
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('提示', '需要相册权限才能上传头像');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      setLoading(true);
      const imageUri = result.assets[0].uri;
      
      // 上传图片到后端
      try {
        const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';
        const formData = new FormData();
        
        // 使用工具函数创建跨平台兼容的文件对象
        const file = await createFormDataFile(imageUri, 'avatar.jpg', 'image/jpeg');
        formData.append('file', file as any);
        formData.append('userId', currentUser.id);

        const response = await fetch(`${API_BASE_URL}/api/v1/users/upload-avatar`, {
          method: 'POST',
          body: formData,
          // 不设置Content-Type，让浏览器自动处理
        });

        if (response.ok) {
          const data = await response.json();
          const success = await updateUser(currentUser.id, {
            avatar_url: data.url,
            avatar_type: 'custom'
          });
          if (success) {
            setShowAvatarModal(false);
            Alert.alert('成功', '头像已更新');
          }
        } else {
          Alert.alert('失败', '头像上传失败');
        }
      } catch (error) {
        Alert.alert('失败', '头像上传失败，请检查网络');
      } finally {
        setLoading(false);
      }
    }
  };

  // 修改密码
  const handleChangePassword = async () => {
    if (!currentUser) return;
    if (!currentPassword.trim()) {
      Alert.alert('提示', '请输入当前密码');
      return;
    }
    if (!newPassword.trim()) {
      Alert.alert('提示', '请输入新密码');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('提示', '两次输入的新密码不一致');
      return;
    }

    setLoading(true);
    const success = await updateUser(
      currentUser.id,
      {},
      newPassword.trim(),
      currentPassword.trim()
    );
    setLoading(false);

    if (success) {
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert('成功', '密码已修改，请使用新密码重新登录');
    } else {
      Alert.alert('失败', '密码修改失败，请检查当前密码是否正确');
    }
  };

  // 关于页面
  const handleAbout = () => {
    Alert.alert('关于粉红小钱袋', '版本：V1.0\n\n一款简洁可爱的个人记账应用，帮助您轻松管理日常收支。');
  };

  // 检查更新
  const handleCheckUpdate = () => {
    Alert.alert('检查更新', '当前已是最新版本 V1.0');
  };

  // 意见反馈
  const handleFeedback = () => {
    router.push('/feedback');
  };

  // 隐私政策
  const handlePrivacyPolicy = () => {
    setAgreementType('privacy');
    setShowAgreementModal(true);
  };

  // 用户协议
  const handleUserAgreement = () => {
    setAgreementType('user');
    setShowAgreementModal(true);
  };

  // 管理后台
  const handleAdmin = () => {
    router.push('/admin');
  };

  // 退出登录
  const handleLogout = () => {
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

  // 清除所有数据
  const handleClearAllData = () => {
    if (!currentUser) return;
    Alert.alert(
      '确认清除数据',
      '这将删除您所有的交易记录，此操作不可恢复，确定要继续吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定清除',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';
              const response = await fetch(
                `${API_BASE_URL}/api/v1/transactions/clear-all?user_id=${currentUser.id}`,
                { method: 'DELETE' }
              );
              if (response.ok) {
                Alert.alert('成功', '所有交易记录已清除');
              } else {
                Alert.alert('失败', '清除数据失败，请重试');
              }
            } catch (error) {
              Alert.alert('失败', '清除数据失败，请重试');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // 注销账号
  const handleDeleteAccount = () => {
    if (!currentUser) return;
    Alert.alert(
      '确认注销账号',
      '注销账号将删除您的所有数据，此操作不可恢复，确定要继续吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定注销',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteUser(currentUser.id);
            if (success) {
              await logout();
              router.replace('/login');
            } else {
              Alert.alert('失败', '注销账号失败，请重试');
            }
          },
        },
      ]
    );
  };

  // 协议弹窗
  const renderAgreementModal = () => (
    <Modal
      visible={showAgreementModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowAgreementModal(false)}
    >
      <Pressable style={styles.modalOverlay} onPress={() => setShowAgreementModal(false)}>
        <View style={[styles.modalContent, styles.agreementModalContent]}>
          <ThemedText style={styles.modalTitle}>
            {agreementType === 'privacy' ? '隐私政策' : '用户协议'}
          </ThemedText>
          <ScrollView style={styles.agreementScroll} showsVerticalScrollIndicator={false}>
            <ThemedText style={styles.agreementText}>
              {agreementType === 'privacy' ? PRIVACY_POLICY : USER_AGREEMENT}
            </ThemedText>
          </ScrollView>
          <TouchableOpacity
            style={styles.agreementCloseButton}
            onPress={() => setShowAgreementModal(false)}
          >
            <ThemedText style={styles.agreementCloseText}>我知道了</ThemedText>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );

  // 菜单项组件
  const MenuItem = ({
    icon,
    title,
    onPress,
    rightContent,
    danger = false,
    showNewBadge = false,
  }: {
    icon: string;
    title: string;
    onPress: () => void;
    rightContent?: React.ReactNode;
    danger?: boolean;
    showNewBadge?: boolean;
  }) => (
    <TouchableOpacity
      style={[styles.menuItem, danger && styles.menuItemDanger]}
      onPress={onPress}
    >
      <View style={styles.menuItemLeft}>
        <FontAwesome6 name={icon as any} size={18} color={danger ? '#666' : '#666'} />
        <View style={styles.menuItemTitleContainer}>
          <ThemedText style={[styles.menuItemText, danger && styles.menuItemTextDanger]}>
            {title}
          </ThemedText>
          {showNewBadge && (
            <View style={styles.menuItemNewBadge}>
              <ThemedText style={styles.menuItemNewBadgeText}>NEW</ThemedText>
            </View>
          )}
        </View>
      </View>
      <View style={styles.menuItemRight}>
        {rightContent}
        <FontAwesome6 name="chevron-right" size={14} color="#999" />
      </View>
    </TouchableOpacity>
  );

  // 渲染头像预览
  const renderAvatarPreview = () => {
    if (currentUser?.avatar_type === 'custom' && currentUser?.avatar_url) {
      return (
        <Image 
          source={{ uri: currentUser.avatar_url }} 
          style={styles.avatarPreviewImage}
        />
      );
    }
    return (
      <FontAwesome6 
        name={(currentUser?.avatar as any) || 'user'} 
        size={24} 
        color="#FF69B4" 
      />
    );
  };

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle={isDark ? 'light' : 'dark'}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* 头部 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <FontAwesome6 name="arrow-left" size={24} color={theme.textPrimary} />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>设置</ThemedText>
          <View style={{ width: 24 }} />
        </View>

        {/* 账号管理入口 */}
        <TouchableOpacity 
          style={styles.accountManagementRow}
          onPress={() => router.push('/account')}
        >
          <View style={styles.accountManagementLeft}>
            <FontAwesome6 name="circle-user" size={20} color="#FF69B4" />
            <ThemedText style={styles.accountManagementText}>账号管理</ThemedText>
          </View>
          <View style={styles.accountManagementRight}>
            {renderAvatarPreview()}
            <FontAwesome6 name="chevron-right" size={14} color="#999" />
          </View>
        </TouchableOpacity>

        {/* 音效开关 */}
        <View style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <FontAwesome6 name={soundEnabled ? 'volume-high' : 'volume-xmark'} size={18} color="#666" />
            <ThemedText style={styles.menuItemText}>音效</ThemedText>
          </View>
          <TouchableOpacity style={styles.menuItemRight} onPress={handleToggleSound}>
            <ThemedText style={[styles.menuItemValue, { color: soundEnabled ? '#FF69B4' : '#999' }]}>
              {soundEnabled ? '开启' : '关闭'}
            </ThemedText>
            <FontAwesome6
              name={soundEnabled ? 'toggle-on' : 'toggle-off'}
              size={28}
              color={soundEnabled ? '#FF69B4' : '#999'}
            />
          </TouchableOpacity>
        </View>


        {/* 其他设置 */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>其他</ThemedText>
          
          <MenuItem
            icon="file-contract"
            title="用户协议"
            onPress={handleUserAgreement}
          />
          <MenuItem
            icon="shield-halved"
            title="隐私政策"
            onPress={handlePrivacyPolicy}
          />
          <MenuItem
            icon="circle-info"
            title="关于粉红小钱袋"
            onPress={handleAbout}
          />
          <MenuItem
            icon="file-lines"
            title="意见反馈"
            onPress={handleFeedback}
            showNewBadge={hasUnreadFeedback}
          />
          <MenuItem
            icon="trash-can"
            title="清除缓存"
            onPress={handleClearCache}
            rightContent={<ThemedText style={styles.menuItemValue}>{cacheSize}</ThemedText>}
          />
          <MenuItem
            icon="rotate"
            title="检查更新"
            onPress={handleCheckUpdate}
            rightContent={<ThemedText style={styles.menuItemValue}>V1.0</ThemedText>}
          />
        </View>

        {/* 管理后台 - 仅管理员可见 */}
        {currentUser?.is_admin && (
          <View style={styles.section}>
            <MenuItem
              icon="user-shield"
              title="管理后台"
              onPress={handleAdmin}
            />
          </View>
        )}

        {/* 调试信息 - 显示当前用户状态 */}
        <View style={styles.section}>
          <ThemedText style={{ fontSize: 12, color: '#999', padding: 10 }}>
            当前用户: {currentUser?.name || '未登录'}
            {'\n'}is_admin: {currentUser?.is_admin ? '是' : '否'}
          </ThemedText>
        </View>

        {/* 退出登录 - 粉红底高亮 */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <FontAwesome6 name="right-from-bracket" size={20} color="#FFFFFF" />
            <ThemedText style={styles.logoutButtonText}>退出登录</ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 弹窗 */}
      {renderAgreementModal()}
    </Screen>
  );
}
