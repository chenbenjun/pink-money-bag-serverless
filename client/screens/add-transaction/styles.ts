import { StyleSheet } from 'react-native';
import { Spacing, BorderRadius, Theme } from '@/constants/theme';

export const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    scrollContent: {
      flexGrow: 1,
      padding: Spacing.lg,
    },
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Spacing.lg,
    },
    backButton: {
      padding: Spacing.sm,
      marginRight: Spacing.sm,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.textPrimary,
    },
    typeSelector: {
      flexDirection: 'row',
      marginBottom: Spacing.xl,
      borderRadius: BorderRadius.lg,
      overflow: 'hidden',
      backgroundColor: theme.backgroundDefault,
      padding: 4,
    },
    typeButton: {
      flex: 1,
      paddingVertical: Spacing.md,
      alignItems: 'center',
      borderRadius: BorderRadius.md,
    },
    typeButtonActive: {
      backgroundColor: theme.primary,
    },
    typeButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    typeButtonTextActive: {
      color: '#FFFFFF',
    },
    typeButtonTextInactive: {
      color: theme.textSecondary,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: Spacing.md,
      color: theme.textPrimary,
    },
    inputContainer: {
      marginBottom: Spacing.xl,
    },
    inputWrapper: {
      backgroundColor: theme.backgroundTertiary,
      borderRadius: BorderRadius.lg,
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      marginBottom: Spacing.md,
    },
    input: {
      fontSize: 16,
      color: theme.textPrimary,
    },
    amountInput: {
      fontSize: 32,
      fontWeight: '700',
      textAlign: 'center',
    },
    categorySection: {
      marginBottom: Spacing.xl,
    },
    categoryHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.md,
    },
    addCategoryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.primary + '20',
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderRadius: BorderRadius.md,
    },
    addCategoryText: {
      fontSize: 14,
      color: theme.primary,
      marginLeft: Spacing.xs,
      fontWeight: '600',
    },
    categoryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    categoryItem: {
      width: '23%',
      aspectRatio: 1,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: BorderRadius.lg,
      marginBottom: Spacing.md,
      marginRight: '2%',
      backgroundColor: theme.backgroundTertiary,
    },
    categoryItemActive: {
      backgroundColor: theme.primary,
      borderWidth: 2,
      borderColor: theme.primary,
    },
    categoryIcon: {
      marginBottom: Spacing.xs,
    },
    categoryText: {
      fontSize: 12,
      textAlign: 'center',
    },
    categoryTextActive: {
      color: '#FFFFFF',
    },
    categoryTextInactive: {
      color: theme.textSecondary,
    },
    button: {
      paddingVertical: Spacing.lg,
      borderRadius: BorderRadius.lg,
      alignItems: 'center',
      backgroundColor: theme.primary,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    buttonDisabled: {
      backgroundColor: theme.textMuted,
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '700',
    },
    // 保存成功卡片样式 - 适配手机屏幕
    savedCardContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: Spacing.lg,
      zIndex: 100,
    },
    savedCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      width: '100%',
      maxHeight: '80%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 8,
    },
    savedCardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.md,
    },
    savedCardTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.textPrimary,
    },
    savedCardActions: {
      flexDirection: 'row',
    },
    savedCardActionBtn: {
      padding: Spacing.sm,
      marginLeft: Spacing.sm,
    },
    savedCardItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: Spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderLight,
    },
    savedCardLabel: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    savedCardValue: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.textPrimary,
    },
    savedCardAmount: {
      fontSize: 28,
      fontWeight: '700',
      textAlign: 'center',
      marginTop: Spacing.md,
      paddingVertical: Spacing.md,
    },
    savedCardAmountIncome: {
      color: '#34D399',
    },
    savedCardAmountExpense: {
      color: '#FB7185',
    },
    // 按钮行样式
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: Spacing.lg,
      gap: Spacing.md,
    },
    buttonHalf: {
      flex: 1,
      paddingVertical: Spacing.lg,
      borderRadius: BorderRadius.lg,
      alignItems: 'center',
      backgroundColor: theme.primary,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    // 分类管理弹窗样式
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: '#FFFFFF',
      borderTopLeftRadius: BorderRadius.xl,
      borderTopRightRadius: BorderRadius.xl,
      padding: Spacing.lg,
      maxHeight: '85%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.md,
      paddingBottom: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderLight,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.textPrimary,
    },
    closeButton: {
      padding: Spacing.sm,
    },
    categoryList: {
      maxHeight: 200,
    },
    categoryListItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderLight,
    },
    categoryListItemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    categoryListItemText: {
      fontSize: 16,
      color: theme.textPrimary,
      marginLeft: Spacing.md,
    },
    categoryListItemActions: {
      flexDirection: 'row',
    },
    categoryActionBtn: {
      padding: Spacing.sm,
      marginLeft: Spacing.sm,
    },
    addCategoryForm: {
      marginTop: Spacing.lg,
      paddingTop: Spacing.lg,
      borderTopWidth: 1,
      borderTopColor: theme.borderLight,
    },
    formLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.textPrimary,
      marginBottom: Spacing.sm,
    },
    formInput: {
      backgroundColor: theme.backgroundTertiary,
      borderRadius: BorderRadius.lg,
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      fontSize: 16,
      color: theme.textPrimary,
      marginBottom: Spacing.md,
    },
    iconSelector: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: Spacing.md,
    },
    iconOption: {
      width: 48,
      height: 48,
      borderRadius: BorderRadius.md,
      backgroundColor: theme.backgroundTertiary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: Spacing.sm,
      marginBottom: Spacing.sm,
    },
    iconOptionSelected: {
      backgroundColor: theme.primary,
    },
    submitButton: {
      paddingVertical: Spacing.md,
      borderRadius: BorderRadius.lg,
      alignItems: 'center',
      backgroundColor: theme.primary,
      marginTop: Spacing.md,
    },
    submitButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
  });
};
