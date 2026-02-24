import React, { useState, useMemo } from 'react';
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
import { useAuth } from '@/contexts/AuthContext';
import { createFormDataFile } from '@/utils';
import { Spacing, BorderRadius } from '@/constants/theme';
import { StyleSheet } from 'react-native';

// 3x4 = 12个预设头像
const AVATAR_OPTIONS = [
  { name: 'cat', label: '猫咪' },
  { name: 'dog', label: '小狗' },
  { name: 'rabbit', label: '兔子' },
  { name: 'dragon', label: '小龙' },
  { name: 'frog', label: '青蛙' },
  { name: 'fish', label: '小鱼' },
  { name: 'dove', label: '小鸟' },
  { name: 'horse', label: '小马' },
  { name: 'apple-whole', label: '苹果' },
  { name: 'carrot', label: '胡萝卜' },
  { name: 'sun', label: '太阳' },
  { name: 'star', label: '星星' },
];

export default function AccountScreen() {
  const { theme, isDark } = useTheme();
  const router = useSafeRouter();
  const { currentUser, updateUser, deleteUser, logout } = useAuth();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [loading, setLoading] = useState(false);

  // 编辑状态
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  // 密码修改
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // 头像选择
  const [showAvatarModal, setShowAvatarModal] = useState(false);

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
      case 'bio':
        updates.bio = editValue.trim() || undefined;
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

  // 拍照
  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('提示', '需要相机权限才能拍照');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      // 直接使用系统编辑后的图片上传
      await uploadAvatar(result.assets[0].uri);
    }
  };

  // 从相册选择
  const handlePickFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('提示', '需要相册权限才能选择图片');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      // 直接使用系统编辑后的图片上传
      await uploadAvatar(result.assets[0].uri);
    }
  };

  // 上传头像
  const uploadAvatar = async (imageUri: string) => {
    if (!currentUser) return;
    
    setLoading(true);
    setShowAvatarModal(false);
    
    try {
      const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';
      const formData = new FormData();
      
      const file = await createFormDataFile(imageUri, 'avatar.jpg', 'image/jpeg');
      formData.append('file', file as any);
      formData.append('userId', currentUser.id);

      const response = await fetch(`${API_BASE_URL}/api/v1/users/upload-avatar`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const success = await updateUser(currentUser.id, {
          avatar_url: data.url,
          avatar_type: 'custom'
        });
        if (success) {
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

  // 编辑弹窗
  const renderEditModal = () => {
    if (!editingField) return null;

    const titles: Record<string, string> = {
      nickname: '修改昵称',
      age: '修改年龄',
      gender: '修改性别',
      bio: '修改个性签名',
    };

    const placeholders: Record<string, string> = {
      nickname: '请输入昵称',
      age: '请输入年龄',
      gender: '',
      bio: '写下你的个性签名（最多140字）',
    };

    const maxLengths: Record<string, number> = {
      nickname: 20,
      age: 3,
      gender: 0,
      bio: 140,
    };

    const isBio = editingField === 'bio';

    return (
      <Modal
        visible={!!editingField}
        transparent
        animationType="fade"
        onRequestClose={() => setEditingField(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setEditingField(null)}>
          <View style={[styles.modalContent, isBio && styles.bioModalContent]}>
            <ThemedText style={styles.modalTitle}>{titles[editingField]}</ThemedText>
            
            {editingField === 'gender' ? (
              <View style={styles.genderOptions}>
                <TouchableOpacity
                  style={[styles.genderOption, editValue === 'male' && styles.genderOptionActive]}
                  onPress={() => setEditValue('male')}
                >
                  <FontAwesome6 name="mars" size={20} color={editValue === 'male' ? '#FF69B4' : '#666'} />
                  <ThemedText style={[styles.genderText, editValue === 'male' && styles.genderTextActive]}>男</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.genderOption, editValue === 'female' && styles.genderOptionActive]}
                  onPress={() => setEditValue('female')}
                >
                  <FontAwesome6 name="venus" size={20} color={editValue === 'female' ? '#FF69B4' : '#666'} />
                  <ThemedText style={[styles.genderText, editValue === 'female' && styles.genderTextActive]}>女</ThemedText>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <TextInput
                  style={[styles.modalInput, isBio && styles.bioInput]}
                  placeholder={placeholders[editingField]}
                  placeholderTextColor="#999"
                  value={editValue}
                  onChangeText={setEditValue}
                  keyboardType={editingField === 'age' ? 'number-pad' : 'default'}
                  maxLength={maxLengths[editingField]}
                  multiline={isBio}
                  numberOfLines={isBio ? 4 : 1}
                  textAlignVertical={isBio ? 'top' : 'center'}
                />
                {isBio && (
                  <ThemedText style={styles.charCount}>
                    {editValue.length}/140
                  </ThemedText>
                )}
              </>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButtonCancel} onPress={() => setEditingField(null)}>
                <ThemedText style={styles.modalButtonCancelText}>取消</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButtonConfirm} onPress={() => handleSaveField(editingField)}>
                <ThemedText style={styles.modalButtonConfirmText}>保存</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>
    );
  };

  // 头像选择弹窗 - 底部弹出式
  const renderAvatarModal = () => (
    <Modal
      visible={showAvatarModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowAvatarModal(false)}
    >
      <Pressable style={avatarPickerStyles.overlay} onPress={() => setShowAvatarModal(false)}>
        <View style={avatarPickerStyles.container}>
          {/* 保存按钮 */}
          <TouchableOpacity 
            style={avatarPickerStyles.saveButton}
            onPress={() => setShowAvatarModal(false)}
          >
            <ThemedText style={avatarPickerStyles.saveButtonText}>保存</ThemedText>
          </TouchableOpacity>
          
          {/* 选项区域 */}
          <View style={avatarPickerStyles.optionsContainer}>
            <ThemedText style={avatarPickerStyles.sectionTitle}>设置头像</ThemedText>
            
            <TouchableOpacity style={avatarPickerStyles.option} onPress={handleTakePhoto}>
              <ThemedText style={avatarPickerStyles.optionText}>拍照</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity style={avatarPickerStyles.option} onPress={handlePickFromLibrary}>
              <ThemedText style={avatarPickerStyles.optionText}>从相册选择</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={avatarPickerStyles.option}
              onPress={() => {
                setShowAvatarModal(false);
                // 打开预设头像选择
                setTimeout(() => setShowPresetAvatarModal(true), 300);
              }}
            >
              <ThemedText style={avatarPickerStyles.optionText}>选择预设头像</ThemedText>
            </TouchableOpacity>
          </View>
          
          {/* 取消按钮 */}
          <TouchableOpacity 
            style={avatarPickerStyles.cancelButton}
            onPress={() => setShowAvatarModal(false)}
          >
            <ThemedText style={avatarPickerStyles.cancelButtonText}>取消</ThemedText>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );

  // 预设头像选择弹窗
  const [showPresetAvatarModal, setShowPresetAvatarModal] = useState(false);
  
  const renderPresetAvatarModal = () => (
    <Modal
      visible={showPresetAvatarModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowPresetAvatarModal(false)}
    >
      <Pressable style={styles.modalOverlay} onPress={() => setShowPresetAvatarModal(false)}>
        <View style={styles.avatarModalContent}>
          <ThemedText style={styles.modalTitle}>选择头像</ThemedText>
          
          {/* 3x4 预设头像网格 */}
          <View style={styles.avatarGrid}>
            {AVATAR_OPTIONS.map((avatar) => (
              <TouchableOpacity
                key={avatar.name}
                style={[
                  styles.avatarOption,
                  currentUser?.avatar === avatar.name && styles.avatarOptionActive,
                ]}
                onPress={() => handleSaveAvatar(avatar.name)}
              >
                <FontAwesome6
                  name={avatar.name as any}
                  size={24}
                  color={currentUser?.avatar === avatar.name ? '#FF69B4' : '#666'}
                />
                <ThemedText style={styles.avatarLabel}>{avatar.label}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>

          {/* 关闭按钮 */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowPresetAvatarModal(false)}
          >
            <ThemedText style={styles.closeButtonText}>关闭</ThemedText>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );

  // 密码修改弹窗
  const renderPasswordModal = () => (
    <Modal
      visible={showPasswordModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowPasswordModal(false)}
    >
      <Pressable style={styles.modalOverlay} onPress={() => setShowPasswordModal(false)}>
        <View style={styles.modalContent}>
          <ThemedText style={styles.modalTitle}>修改密码</ThemedText>
          <TextInput
            style={styles.modalInput}
            placeholder="当前密码"
            placeholderTextColor="#999"
            secureTextEntry
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />
          <TextInput
            style={styles.modalInput}
            placeholder="新密码"
            placeholderTextColor="#999"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <TextInput
            style={styles.modalInput}
            placeholder="确认新密码"
            placeholderTextColor="#999"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.modalButtonCancel} onPress={() => setShowPasswordModal(false)}>
              <ThemedText style={styles.modalButtonCancelText}>取消</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButtonConfirm} onPress={handleChangePassword}>
              <ThemedText style={styles.modalButtonConfirmText}>保存</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </Modal>
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
        size={32} 
        color="#FF69B4" 
      />
    );
  };

  // 菜单项组件
  const MenuItem = ({
    icon,
    title,
    value,
    onPress,
    danger = false,
  }: {
    icon: string;
    title: string;
    value?: string;
    onPress: () => void;
    danger?: boolean;
  }) => (
    <TouchableOpacity
      style={[styles.menuItem, danger && styles.menuItemDanger]}
      onPress={onPress}
    >
      <View style={styles.menuItemLeft}>
        <FontAwesome6 name={icon as any} size={18} color={danger ? '#FF6B6B' : '#666'} />
        <ThemedText style={[styles.menuItemText, danger && styles.menuItemTextDanger]}>
          {title}
        </ThemedText>
      </View>
      <View style={styles.menuItemRight}>
        {value && (
          <ThemedText style={styles.menuItemValue} numberOfLines={1}>
            {value}
          </ThemedText>
        )}
        <FontAwesome6 name="chevron-right" size={14} color="#999" />
      </View>
    </TouchableOpacity>
  );

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle={isDark ? 'light' : 'dark'}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* 头部 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <FontAwesome6 name="arrow-left" size={24} color={theme.textPrimary} />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>账号管理</ThemedText>
          <View style={{ width: 24 }} />
        </View>

        {/* 头像区域 - 居中显示 */}
        <TouchableOpacity 
          style={styles.avatarSection}
          onPress={() => setShowAvatarModal(true)}
        >
          <View style={styles.avatarContainer}>
            {renderAvatarPreview()}
          </View>
          <ThemedText style={styles.avatarHint}>点击更换头像</ThemedText>
        </TouchableOpacity>

        {/* 账号信息列表 */}
        <View style={styles.listContainer}>
          {/* 账号名称 - 不可更改 */}
          <View style={[styles.menuItem, styles.menuItemDisabled]}>
            <View style={styles.menuItemLeft}>
              <FontAwesome6 name="user" size={18} color="#999" />
              <ThemedText style={[styles.menuItemText, styles.menuItemTextDisabled]}>
                账号名称
              </ThemedText>
            </View>
            <View style={styles.menuItemRight}>
              <ThemedText style={[styles.menuItemValue, styles.menuItemValueDisabled]} numberOfLines={1}>
                {currentUser?.name || '未设置'}
              </ThemedText>
              <ThemedText style={styles.notEditableTag}>不可更改</ThemedText>
            </View>
          </View>

          <MenuItem
            icon="signature"
            title="昵称"
            value={currentUser?.nickname || '未设置'}
            onPress={() => {
              setEditValue(currentUser?.nickname || '');
              setEditingField('nickname');
            }}
          />
          <MenuItem
            icon="pen-nib"
            title="个性签名"
            value={currentUser?.bio || '未设置'}
            onPress={() => {
              setEditValue(currentUser?.bio || '');
              setEditingField('bio');
            }}
          />
          <MenuItem
            icon="cake-candles"
            title="年龄"
            value={currentUser?.age ? `${currentUser.age}岁` : '未设置'}
            onPress={() => {
              setEditValue(currentUser?.age?.toString() || '');
              setEditingField('age');
            }}
          />
          <MenuItem
            icon="venus-mars"
            title="性别"
            value={currentUser?.gender === 'male' ? '男' : currentUser?.gender === 'female' ? '女' : '未设置'}
            onPress={() => {
              setEditValue(currentUser?.gender || '');
              setEditingField('gender');
            }}
          />
          <MenuItem
            icon="lock"
            title="修改密码"
            onPress={() => setShowPasswordModal(true)}
          />
          <MenuItem
            icon="trash-can"
            title="清除数据"
            danger
            onPress={handleClearAllData}
          />
          <MenuItem
            icon="user-xmark"
            title="注销账号"
            danger
            onPress={handleDeleteAccount}
          />
        </View>
      </ScrollView>

      {/* 弹窗 */}
      {renderEditModal()}
      {renderAvatarModal()}
      {renderPresetAvatarModal()}
      {renderPasswordModal()}
    </Screen>
  );
}

const avatarPickerStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  container: {
    paddingHorizontal: 16,
    paddingBottom: 34,
  },
  saveButton: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 8,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
  optionsContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 13,
    color: '#999',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5E5',
  },
  option: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5E5',
  },
  optionText: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '500',
  },
});

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#FFF0F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: '#FFF0F5',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.textPrimary,
  },
  // 头像区域
  avatarSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    backgroundColor: '#FFF5F8',
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
    borderRadius: 16,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF0F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FF69B4',
    overflow: 'hidden',
  },
  avatarPreviewImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarHint: {
    marginTop: Spacing.sm,
    fontSize: 13,
    color: '#999',
  },
  // 列表区域
  listContainer: {
    backgroundColor: '#FFF5F8',
    borderRadius: 16,
    marginHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F0E0E5',
  },
  menuItemDanger: {
    borderBottomColor: '#FFE5E5',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
    justifyContent: 'flex-end',
  },
  menuItemText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  menuItemTextDanger: {
    color: '#FF6B6B',
  },
  menuItemValue: {
    fontSize: 14,
    color: '#999',
    maxWidth: 120,
    textAlign: 'right',
  },
  // 不可编辑项样式
  menuItemDisabled: {
    backgroundColor: '#FAFAFA',
  },
  menuItemTextDisabled: {
    color: '#999',
  },
  menuItemValueDisabled: {
    color: '#666',
  },
  notEditableTag: {
    fontSize: 11,
    color: '#999',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  // 弹窗样式
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: Spacing.xl,
    width: '100%',
    maxWidth: 320,
  },
  bioModalContent: {
    maxWidth: 340,
  },
  avatarModalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: Spacing.lg,
    width: '90%',
    maxWidth: 340,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    fontSize: 15,
    color: theme.textPrimary,
    marginBottom: Spacing.md,
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: Spacing.md,
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginBottom: Spacing.md,
    marginTop: -Spacing.sm,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  modalButtonCancel: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  modalButtonCancelText: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  modalButtonConfirm: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    backgroundColor: '#FF69B4',
    alignItems: 'center',
  },
  modalButtonConfirmText: {
    fontSize: 15,
    color: 'white',
    fontWeight: '500',
  },
  // 性别选项
  genderOptions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  genderOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  genderOptionActive: {
    borderColor: '#FF69B4',
    backgroundColor: '#FFF0F5',
  },
  genderText: {
    fontSize: 15,
    color: '#666',
  },
  genderTextActive: {
    color: '#FF69B4',
    fontWeight: '500',
  },
  // 头像网格 - 3x4布局
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  avatarOption: {
    width: '23%',
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  avatarOptionActive: {
    borderColor: '#FF69B4',
    backgroundColor: '#FFF0F5',
  },
  avatarLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
  },
  customAvatarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FF69B4',
    borderStyle: 'dashed',
    backgroundColor: '#FFF0F5',
  },
  customAvatarText: {
    fontSize: 14,
    color: '#FF69B4',
    fontWeight: '500',
  },
  closeButton: {
    paddingVertical: Spacing.md,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  closeButtonText: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
});
