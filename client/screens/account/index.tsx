import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  Pressable,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '@/hooks/useTheme';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/contexts/AuthContext';
import { createFormDataFile } from '@/utils';
import { Spacing, BorderRadius } from '@/constants/theme';
import { StyleSheet } from 'react-native';

// 12个预设头像
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
  const [hasChanges, setHasChanges] = useState(false);

  // 编辑状态 - 存储所有字段的编辑值
  const [editForm, setEditForm] = useState({
    nickname: currentUser?.nickname || '',
    bio: currentUser?.bio || '',
    age: currentUser?.age?.toString() || '',
    gender: currentUser?.gender || '',
  });

  // 头像相关
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');
  const [avatarType, setAvatarType] = useState(currentUser?.avatar_type || 'preset');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatar_url || '');
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showPresetAvatarModal, setShowPresetAvatarModal] = useState(false);

  // 密码修改
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // 检查是否有修改
  const checkHasChanges = useCallback((newForm: typeof editForm, newAvatar?: string, newAvatarType?: string) => {
    const formChanged = 
      newForm.nickname !== (currentUser?.nickname || '') ||
      newForm.bio !== (currentUser?.bio || '') ||
      newForm.age !== (currentUser?.age?.toString() || '') ||
      newForm.gender !== (currentUser?.gender || '');
    
    const avatarChanged = newAvatar !== undefined 
      ? newAvatar !== currentUser?.avatar || newAvatarType !== currentUser?.avatar_type
      : avatar !== currentUser?.avatar || avatarType !== currentUser?.avatar_type;
    
    setHasChanges(formChanged || avatarChanged);
  }, [currentUser, avatar, avatarType]);

  // 更新表单字段
  const updateField = (field: keyof typeof editForm, value: string) => {
    const newForm = { ...editForm, [field]: value };
    setEditForm(newForm);
    checkHasChanges(newForm);
  };

  // 选择预设头像
  const handleSelectPresetAvatar = (avatarName: string) => {
    setAvatar(avatarName);
    setAvatarType('preset');
    setAvatarUrl('');
    setShowPresetAvatarModal(false);
    checkHasChanges(editForm, avatarName, 'preset');
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
        setAvatarUrl(data.url);
        setAvatarType('custom');
        setAvatar('');
        checkHasChanges(editForm, '', 'custom');
        Alert.alert('成功', '头像已更新，记得点击保存按钮保存更改');
      } else {
        Alert.alert('失败', '头像上传失败');
      }
    } catch (error) {
      Alert.alert('失败', '头像上传失败，请检查网络');
    } finally {
      setLoading(false);
    }
  };

  // 批量保存所有更改
  const handleSaveAll = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    
    const updates: any = {};
    
    // 只提交有变化的字段
    if (editForm.nickname !== (currentUser.nickname || '')) {
      updates.nickname = editForm.nickname.trim() || undefined;
    }
    if (editForm.bio !== (currentUser.bio || '')) {
      updates.bio = editForm.bio.trim() || undefined;
    }
    if (editForm.age !== (currentUser.age?.toString() || '')) {
      updates.age = editForm.age ? parseInt(editForm.age, 10) : undefined;
    }
    if (editForm.gender !== (currentUser.gender || '')) {
      updates.gender = editForm.gender as 'male' | 'female' || undefined;
    }
    if (avatar !== currentUser.avatar) {
      updates.avatar = avatar;
    }
    if (avatarType !== currentUser.avatar_type) {
      updates.avatar_type = avatarType;
    }
    if (avatarUrl !== currentUser.avatar_url) {
      updates.avatar_url = avatarUrl;
    }

    const success = await updateUser(currentUser.id, updates);
    setLoading(false);
    
    if (success) {
      setHasChanges(false);
      Alert.alert('成功', '资料已保存');
    } else {
      Alert.alert('失败', '保存失败，请重试');
    }
  };

  // 取消所有更改
  const handleCancel = () => {
    setEditForm({
      nickname: currentUser?.nickname || '',
      bio: currentUser?.bio || '',
      age: currentUser?.age?.toString() || '',
      gender: currentUser?.gender || '',
    });
    setAvatar(currentUser?.avatar || '');
    setAvatarType(currentUser?.avatar_type || 'preset');
    setAvatarUrl(currentUser?.avatar_url || '');
    setHasChanges(false);
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

  // 渲染头像预览
  const renderAvatarPreview = () => {
    if (avatarType === 'custom' && avatarUrl) {
      return <Image source={{ uri: avatarUrl }} style={styles.avatarPreviewImage} />;
    }
    return <FontAwesome6 name={(avatar as any) || 'user'} size={32} color="#FF69B4" />;
  };

  // 头像选择弹窗
  const renderAvatarModal = () => (
    <Modal visible={showAvatarModal} transparent animationType="slide" onRequestClose={() => setShowAvatarModal(false)}>
      <Pressable style={avatarPickerStyles.overlay} onPress={() => setShowAvatarModal(false)}>
        <View style={avatarPickerStyles.container}>
          <TouchableOpacity style={avatarPickerStyles.saveButton} onPress={() => setShowAvatarModal(false)}>
            <ThemedText style={avatarPickerStyles.saveButtonText}>保存</ThemedText>
          </TouchableOpacity>
          
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
                setTimeout(() => setShowPresetAvatarModal(true), 300);
              }}
            >
              <ThemedText style={avatarPickerStyles.optionText}>选择预设头像</ThemedText>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={avatarPickerStyles.cancelButton} onPress={() => setShowAvatarModal(false)}>
            <ThemedText style={avatarPickerStyles.cancelButtonText}>取消</ThemedText>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );

  // 预设头像选择弹窗
  const renderPresetAvatarModal = () => (
    <Modal visible={showPresetAvatarModal} transparent animationType="fade" onRequestClose={() => setShowPresetAvatarModal(false)}>
      <Pressable style={styles.modalOverlay} onPress={() => setShowPresetAvatarModal(false)}>
        <View style={styles.avatarModalContent}>
          <ThemedText style={styles.modalTitle}>选择头像</ThemedText>
          <View style={styles.avatarGrid}>
            {AVATAR_OPTIONS.map((item) => (
              <TouchableOpacity
                key={item.name}
                style={[styles.avatarOption, avatar === item.name && styles.avatarOptionActive]}
                onPress={() => handleSelectPresetAvatar(item.name)}
              >
                <FontAwesome6 name={item.name as any} size={24} color={avatar === item.name ? '#FF69B4' : '#666'} />
                <ThemedText style={styles.avatarLabel}>{item.label}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={() => setShowPresetAvatarModal(false)}>
            <ThemedText style={styles.closeButtonText}>关闭</ThemedText>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );

  // 密码修改弹窗
  const renderPasswordModal = () => (
    <Modal visible={showPasswordModal} transparent animationType="fade" onRequestClose={() => setShowPasswordModal(false)}>
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

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle={isDark ? 'light' : 'dark'}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* 头部 */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <FontAwesome6 name="arrow-left" size={24} color={theme.textPrimary} />
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle}>账号管理</ThemedText>
            <View style={{ width: 24 }} />
          </View>

          {/* 头像区域 */}
          <TouchableOpacity style={styles.avatarSection} onPress={() => setShowAvatarModal(true)}>
            <View style={styles.avatarContainer}>
              {renderAvatarPreview()}
            </View>
            <ThemedText style={styles.avatarHint}>点击更换头像</ThemedText>
          </TouchableOpacity>

          {/* 编辑表单 */}
          <View style={styles.formContainer}>
            {/* 账号名称 - 不可更改 */}
            <View style={styles.formItem}>
              <View style={styles.formLabelRow}>
                <FontAwesome6 name="user" size={16} color="#999" />
                <ThemedText style={styles.formLabelDisabled}>账号名称</ThemedText>
              </View>
              <View style={styles.formInputDisabled}>
                <ThemedText style={styles.formValueDisabled}>{currentUser?.name || '未设置'}</ThemedText>
                <ThemedText style={styles.notEditableTag}>不可更改</ThemedText>
              </View>
            </View>

            {/* 昵称 */}
            <View style={styles.formItem}>
              <View style={styles.formLabelRow}>
                <FontAwesome6 name="signature" size={16} color="#FF69B4" />
                <ThemedText style={styles.formLabel}>昵称</ThemedText>
              </View>
              <TextInput
                style={styles.formInput}
                placeholder="请输入昵称"
                placeholderTextColor="#999"
                value={editForm.nickname}
                onChangeText={(value) => updateField('nickname', value)}
                maxLength={20}
              />
            </View>

            {/* 个性签名 */}
            <View style={styles.formItem}>
              <View style={styles.formLabelRow}>
                <FontAwesome6 name="pen-nib" size={16} color="#FF69B4" />
                <ThemedText style={styles.formLabel}>个性签名</ThemedText>
              </View>
              <TextInput
                style={[styles.formInput, styles.bioInput]}
                placeholder="写下你的个性签名（最多140字）"
                placeholderTextColor="#999"
                value={editForm.bio}
                onChangeText={(value) => updateField('bio', value)}
                maxLength={140}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
              <ThemedText style={styles.charCount}>{editForm.bio.length}/140</ThemedText>
            </View>

            {/* 年龄 */}
            <View style={styles.formItem}>
              <View style={styles.formLabelRow}>
                <FontAwesome6 name="cake-candles" size={16} color="#FF69B4" />
                <ThemedText style={styles.formLabel}>年龄</ThemedText>
              </View>
              <TextInput
                style={styles.formInput}
                placeholder="请输入年龄"
                placeholderTextColor="#999"
                value={editForm.age}
                onChangeText={(value) => updateField('age', value.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
                maxLength={3}
              />
            </View>

            {/* 性别 */}
            <View style={styles.formItem}>
              <View style={styles.formLabelRow}>
                <FontAwesome6 name="venus-mars" size={16} color="#FF69B4" />
                <ThemedText style={styles.formLabel}>性别</ThemedText>
              </View>
              <View style={styles.genderRow}>
                <TouchableOpacity
                  style={[styles.genderBtn, editForm.gender === 'male' && styles.genderBtnActive]}
                  onPress={() => updateField('gender', 'male')}
                >
                  <FontAwesome6 name="mars" size={18} color={editForm.gender === 'male' ? '#FFF' : '#666'} />
                  <ThemedText style={[styles.genderBtnText, editForm.gender === 'male' && styles.genderBtnTextActive]}>男</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.genderBtn, editForm.gender === 'female' && styles.genderBtnActive]}
                  onPress={() => updateField('gender', 'female')}
                >
                  <FontAwesome6 name="venus" size={18} color={editForm.gender === 'female' ? '#FFF' : '#666'} />
                  <ThemedText style={[styles.genderBtnText, editForm.gender === 'female' && styles.genderBtnTextActive]}>女</ThemedText>
                </TouchableOpacity>
                {editForm.gender !== '' && (
                  <TouchableOpacity
                    style={styles.clearGenderBtn}
                    onPress={() => updateField('gender', '')}
                  >
                    <FontAwesome6 name="xmark" size={14} color="#999" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* 修改密码 */}
            <TouchableOpacity style={styles.menuItem} onPress={() => setShowPasswordModal(true)}>
              <View style={styles.menuItemLeft}>
                <FontAwesome6 name="lock" size={18} color="#666" />
                <ThemedText style={styles.menuItemText}>修改密码</ThemedText>
              </View>
              <FontAwesome6 name="chevron-right" size={14} color="#999" />
            </TouchableOpacity>

            {/* 危险操作区域 */}
            <View style={styles.dangerZone}>
              <TouchableOpacity style={[styles.menuItem, styles.menuItemDanger]} onPress={handleClearAllData}>
                <View style={styles.menuItemLeft}>
                  <FontAwesome6 name="trash-can" size={18} color="#FF6B6B" />
                  <ThemedText style={[styles.menuItemText, styles.menuItemTextDanger]}>清除数据</ThemedText>
                </View>
                <FontAwesome6 name="chevron-right" size={14} color="#FF6B6B" />
              </TouchableOpacity>

              <TouchableOpacity style={[styles.menuItem, styles.menuItemDanger]} onPress={handleDeleteAccount}>
                <View style={styles.menuItemLeft}>
                  <FontAwesome6 name="user-xmark" size={18} color="#FF6B6B" />
                  <ThemedText style={[styles.menuItemText, styles.menuItemTextDanger]}>注销账号</ThemedText>
                </View>
                <FontAwesome6 name="chevron-right" size={14} color="#FF6B6B" />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* 底部保存/取消按钮 */}
        {hasChanges && (
          <View style={styles.bottomBar}>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
              <ThemedText style={styles.cancelBtnText}>取消</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.saveBtn, loading && styles.saveBtnDisabled]} 
              onPress={handleSaveAll}
              disabled={loading}
            >
              <ThemedText style={styles.saveBtnText}>
                {loading ? '保存中...' : '保存更改'}
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>

      {/* 弹窗 */}
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#FFF0F5',
    paddingBottom: 100,
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
  // 表单区域
  formContainer: {
    backgroundColor: '#FFF5F8',
    borderRadius: 16,
    marginHorizontal: Spacing.md,
    padding: Spacing.md,
  },
  formItem: {
    marginBottom: Spacing.lg,
  },
  formLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  formLabelDisabled: {
    fontSize: 14,
    fontWeight: '500',
    color: '#999',
  },
  formInput: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    fontSize: 15,
    color: '#333',
    borderWidth: 1,
    borderColor: '#FFE0EC',
  },
  formInputDisabled: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  formValueDisabled: {
    fontSize: 15,
    color: '#666',
  },
  bioInput: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: Spacing.md,
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  notEditableTag: {
    fontSize: 11,
    color: '#999',
    backgroundColor: '#E8E8E8',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  // 性别选择
  genderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  genderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: '#FFF',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFE0EC',
  },
  genderBtnActive: {
    backgroundColor: '#FF69B4',
    borderColor: '#FF69B4',
  },
  genderBtnText: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  genderBtnTextActive: {
    color: '#FFF',
  },
  clearGenderBtn: {
    padding: Spacing.sm,
  },
  // 菜单项
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F0E0E5',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  menuItemText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  menuItemDanger: {
    borderBottomColor: '#FFE5E5',
  },
  menuItemTextDanger: {
    color: '#FF6B6B',
  },
  // 危险区域
  dangerZone: {
    marginTop: Spacing.xl,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#F0E0E5',
  },
  // 底部保存栏
  bottomBar: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    paddingBottom: Spacing.xl + (Platform.OS === 'ios' ? 20 : 0),
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#FFE0EC',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  saveBtn: {
    flex: 2,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    backgroundColor: '#FF69B4',
    alignItems: 'center',
  },
  saveBtnDisabled: {
    backgroundColor: '#FFB6C1',
  },
  saveBtnText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
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
  // 头像弹窗
  avatarModalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: Spacing.lg,
    width: '90%',
    maxWidth: 340,
  },
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
  closeButton: {
    paddingVertical: Spacing.md,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
});
