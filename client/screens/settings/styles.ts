import { StyleSheet } from 'react-native';
import { Theme, Spacing } from '@/constants/theme';

export const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      flexGrow: 1,
      paddingHorizontal: Spacing.md,
      paddingTop: Spacing.lg,
      paddingBottom: Spacing['6xl'],
      backgroundColor: '#FFF0F5', // 浅粉色背景
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: Spacing.xl,
      paddingTop: Spacing.md,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.textPrimary,
    },
    // 账号管理入口行
    accountManagementRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#FFF5F8',
      borderRadius: 16,
      paddingVertical: Spacing.lg,
      paddingHorizontal: Spacing.lg,
      marginBottom: Spacing.lg,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    accountManagementLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
    },
    accountManagementText: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.textPrimary,
    },
    accountManagementRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
    },
    // 圆角卡片区域
    section: {
      backgroundColor: '#FFF5F8',
      borderRadius: 16,
      marginBottom: Spacing.lg,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.md,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    sectionTitle: {
      fontSize: 14,
      color: '#999',
      marginBottom: Spacing.md,
      paddingHorizontal: Spacing.sm,
    },
    // 菜单项
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.sm,
      borderBottomWidth: 0.5,
      borderBottomColor: '#F0F0F0',
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
      marginRight: Spacing.xs,
    },
    menuItemTitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
    },
    menuItemNewBadge: {
      backgroundColor: '#FF4444',
      paddingHorizontal: Spacing.xs,
      paddingVertical: 2,
      borderRadius: 4,
    },
    menuItemNewBadgeText: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: '700',
    },
    // 版本容器
    versionContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
    },
    // NEW 标记
    newBadge: {
      backgroundColor: '#FF4444',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    newBadgeText: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: '700',
    },
    // 头像预览
    avatarPreview: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: '#FFF0F5',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },
    avatarPreviewImage: {
      width: 36,
      height: 36,
      borderRadius: 18,
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
    // 头像弹窗特殊样式 - 更宽以适应3x4网格
    avatarModalContent: {
      maxWidth: 340,
      padding: Spacing.lg,
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
    // 自定义上传按钮
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
    // 协议弹窗样式
    agreementModalContent: {
      maxWidth: 360,
      maxHeight: '80%',
      padding: Spacing.lg,
    },
    agreementScroll: {
      maxHeight: 400,
      marginBottom: Spacing.md,
    },
    agreementText: {
      fontSize: 13,
      lineHeight: 20,
      color: '#333',
    },
    agreementCloseButton: {
      paddingVertical: Spacing.md,
      borderRadius: 12,
      backgroundColor: '#FF69B4',
      alignItems: 'center',
    },
    agreementCloseText: {
      fontSize: 15,
      color: 'white',
      fontWeight: '600',
    },
    // 退出登录按钮
    logoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FF69B4',
      paddingVertical: Spacing.lg,
      borderRadius: 12,
      gap: Spacing.sm,
    },
    logoutButtonText: {
      fontSize: 16,
      color: '#FFFFFF',
      fontWeight: '600',
    },
    // 主题预览相关样式
    themePreviewDot: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
    },
    // 主题弹窗样式
    themeModalContent: {
      maxWidth: 380,
      maxHeight: '85%',
      padding: Spacing.lg,
    },
    themeModalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: Spacing.lg,
    },
    themePreviewContainer: {
      marginBottom: Spacing.xl,
    },
    themePreviewTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.textPrimary,
      marginBottom: Spacing.md,
    },
    themePreviewGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.md,
      justifyContent: 'space-between',
    },
    themePreviewCard: {
      width: '48%',
      aspectRatio: 0.8,
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      borderWidth: 2,
      borderColor: '#E0E0E0',
      overflow: 'hidden',
    },
    themePreviewCardSelected: {
      borderColor: theme.primary,
      borderWidth: 3,
    },
    themePreviewHeader: {
      height: '30%',
    },
    themePreviewBody: {
      flex: 1,
      padding: Spacing.sm,
    },
    themePreviewContent: {
      flex: 1,
      borderRadius: 6,
      padding: Spacing.sm,
      gap: Spacing.sm,
    },
    themePreviewCardTitle: {
      height: 12,
      borderRadius: 4,
      width: '60%',
      marginBottom: Spacing.xs,
    },
    themePreviewText: {
      height: 8,
      borderRadius: 4,
      width: '80%',
    },
    themeSelectedBadge: {
      position: 'absolute',
      top: 8,
      right: 8,
      width: 24,
      height: 24,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    // 颜色方案选择样式
    colorSchemeSection: {
      paddingBottom: Spacing.md,
    },
    colorSchemeOptions: {
      flexDirection: 'row',
      gap: Spacing.md,
    },
    colorSchemeOption: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.sm,
      paddingVertical: Spacing.md,
      borderRadius: 10,
      backgroundColor: '#F5F5F5',
      borderWidth: 2,
      borderColor: 'transparent',
    },
    colorSchemeOptionSelected: {
      borderColor: theme.primary,
      backgroundColor: `${theme.primary}15`,
    },
    colorSchemeText: {
      fontSize: 13,
      color: theme.textSecondary,
      fontWeight: '500',
    },
    colorSchemeTextSelected: {
      color: theme.primary,
      fontWeight: '600',
    },
    // 更新弹窗样式
    updateModalContent: {
      maxWidth: 360,
      maxHeight: '85%',
      padding: Spacing.lg,
    },
    updateModalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
      marginBottom: Spacing.lg,
    },
    updateScroll: {
      maxHeight: 350,
      marginBottom: Spacing.md,
    },
    updateInfoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Spacing.sm,
      paddingBottom: Spacing.sm,
      borderBottomWidth: 0.5,
      borderBottomColor: '#F0F0F0',
    },
    updateInfoLabel: {
      fontSize: 14,
      color: theme.textSecondary,
      flex: 1,
    },
    updateInfoValue: {
      fontSize: 14,
      color: theme.textPrimary,
      fontWeight: '500',
    },
    updateInfoValueNew: {
      color: theme.primary,
      fontWeight: '600',
    },
    updateLogContainer: {
      backgroundColor: '#F8F8F8',
      borderRadius: 12,
      padding: Spacing.md,
      marginTop: Spacing.md,
    },
    updateLogTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.textPrimary,
      marginBottom: Spacing.sm,
    },
    updateLogText: {
      fontSize: 13,
      lineHeight: 20,
      color: '#666',
    },
    updateButtons: {
      flexDirection: 'row',
      gap: Spacing.md,
      marginTop: Spacing.md,
    },
    updateButtonSecondary: {
      flex: 1,
      paddingVertical: Spacing.md,
      borderRadius: 12,
      backgroundColor: '#F5F5F5',
      alignItems: 'center',
      justifyContent: 'center',
    },
    updateButtonTextSecondary: {
      fontSize: 15,
      color: '#666',
      fontWeight: '500',
    },
    updateButtonPrimary: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.sm,
      paddingVertical: Spacing.md,
      borderRadius: 12,
      backgroundColor: theme.primary,
    },
    updateButtonTextPrimary: {
      fontSize: 15,
      color: '#FFFFFF',
      fontWeight: '600',
    },
    downloadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    // 头像弹窗相关样式
    avatarGridScroll: {
      maxHeight: 320,
      marginBottom: Spacing.md,
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
    avatarOptionSelected: {
      borderColor: '#FF69B4',
      backgroundColor: '#FF69B4',
    },
    avatarOptionLabel: {
      fontSize: 10,
      color: '#666',
      marginTop: 2,
    },
    avatarOptionLabelSelected: {
      color: '#FFFFFF',
      fontWeight: '500',
    },
    avatarUploadButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.sm,
      paddingVertical: Spacing.md,
      borderRadius: 12,
      backgroundColor: '#FF69B4',
      marginBottom: Spacing.sm,
    },
    avatarUploadButtonText: {
      fontSize: 15,
      color: '#FFFFFF',
      fontWeight: '600',
    },
    avatarCancelButton: {
      paddingVertical: Spacing.md,
      borderRadius: 12,
      backgroundColor: '#F5F5F5',
      alignItems: 'center',
    },
    avatarCancelButtonText: {
      fontSize: 15,
      color: '#666',
      fontWeight: '500',
    },
    // 密码弹窗样式
    passwordModalContent: {
      maxWidth: 320,
      padding: Spacing.xl,
    },
    passwordInput: {
      borderWidth: 1,
      borderColor: '#E0E0E0',
      borderRadius: 12,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.md,
      fontSize: 15,
      color: theme.textPrimary,
      marginBottom: Spacing.md,
    },
    passwordButtons: {
      flexDirection: 'row',
      gap: Spacing.md,
      marginTop: Spacing.md,
    },
    passwordButtonSecondary: {
      flex: 1,
      paddingVertical: Spacing.md,
      borderRadius: 12,
      backgroundColor: '#F5F5F5',
      alignItems: 'center',
    },
    passwordButtonTextSecondary: {
      fontSize: 15,
      color: '#666',
      fontWeight: '500',
    },
    passwordButtonPrimary: {
      flex: 1,
      paddingVertical: Spacing.md,
      borderRadius: 12,
      backgroundColor: '#FF69B4',
      alignItems: 'center',
    },
    passwordButtonTextPrimary: {
      fontSize: 15,
      color: '#FFFFFF',
      fontWeight: '600',
    },
  });
};
