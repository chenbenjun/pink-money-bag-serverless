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
    // 头像网格 - 3x4布局
    avatarGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: Spacing.sm,
      marginBottom: Spacing.md,
    },
    avatarOption: {
      width: '23%', // 4列布局，每列约23%宽度，留间隙
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
  });
};
