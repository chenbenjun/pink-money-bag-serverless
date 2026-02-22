import { StyleSheet } from 'react-native';
import { Spacing, BorderRadius, Theme } from '@/constants/theme';

export const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    scrollContent: {
      flexGrow: 1,
    },
    headerContainer: {
      padding: Spacing.lg,
      backgroundColor: theme.primary,
      paddingTop: Spacing.xl,
      flexDirection: 'row',
      alignItems: 'center',
    },
    backButton: {
      marginRight: Spacing.md,
      padding: Spacing.sm,
    },
    headerTitle: {
      color: '#FFFFFF',
      fontSize: 24,
      fontWeight: '700',
    },
    contentContainer: {
      padding: Spacing.lg,
    },
    card: {
      backgroundColor: '#FFFFFF',
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      marginBottom: Spacing.lg,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 3,
    },
    amountContainer: {
      alignItems: 'center',
      paddingVertical: Spacing.xl,
    },
    amount: {
      fontSize: 36,
      fontWeight: '700',
    },
    amountIncome: {
      color: '#34D399',
    },
    amountExpense: {
      color: '#FB7185',
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderLight,
    },
    infoLabel: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    infoValueContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    infoValue: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.textPrimary,
    },
    categoryIconSmall: {
      width: 28,
      height: 28,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.backgroundTertiary,
      marginRight: 8,
    },
    tipContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: Spacing.md,
    },
    tipText: {
      fontSize: 12,
      color: theme.textMuted,
      marginLeft: Spacing.xs,
    },
    buttonContainer: {
      padding: Spacing.lg,
    },
    buttonDelete: {
      backgroundColor: '#FB7185',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: Spacing.lg,
      borderRadius: BorderRadius.lg,
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    // 编辑样式
    editButton: {
      marginLeft: 'auto',
      padding: Spacing.sm,
    },
    editAmountContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    amountPrefix: {
      fontSize: 36,
      fontWeight: '700',
      marginRight: Spacing.sm,
    },
    editAmountInput: {
      fontSize: 36,
      fontWeight: '700',
      minWidth: 150,
      textAlign: 'center',
    },
    editInput: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.textPrimary,
      minWidth: 100,
      textAlign: 'right',
    },
    categoryScroll: {
      flexGrow: 0,
      maxWidth: 200,
    },
    categoryList: {
      flexDirection: 'row',
      gap: Spacing.sm,
    },
    categoryOption: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderRadius: BorderRadius.md,
      backgroundColor: theme.backgroundTertiary,
    },
    categoryOptionSelected: {
      backgroundColor: theme.primary,
    },
    categoryOptionText: {
      fontSize: 12,
      color: theme.textMuted,
    },
    categoryOptionTextSelected: {
      color: '#FFFFFF',
    },
    editButtonContainer: {
      padding: Spacing.lg,
      flexDirection: 'row',
      gap: Spacing.md,
    },
    buttonCancel: {
      flex: 1,
      backgroundColor: theme.backgroundTertiary,
      paddingVertical: Spacing.lg,
      borderRadius: BorderRadius.lg,
      alignItems: 'center',
    },
    buttonCancelText: {
      color: theme.textPrimary,
      fontSize: 16,
      fontWeight: '600',
    },
    buttonSave: {
      flex: 1,
      backgroundColor: theme.primary,
      paddingVertical: Spacing.lg,
      borderRadius: BorderRadius.lg,
      alignItems: 'center',
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    loadingContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: Spacing['5xl'],
    },
    errorContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: Spacing['5xl'],
    },
    errorText: {
      fontSize: 16,
      color: theme.textMuted,
      marginTop: Spacing.md,
    },
    // 弹窗样式
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: '#FFFFFF',
      borderTopLeftRadius: BorderRadius.xl,
      borderTopRightRadius: BorderRadius.xl,
      maxHeight: '80%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: Spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderLight,
    },
    modalHeaderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    modalCategoryIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.backgroundTertiary,
      marginRight: Spacing.md,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.textPrimary,
    },
    modalSubtitle: {
      fontSize: 14,
      color: theme.textMuted,
      marginTop: 2,
    },
    modalBody: {
      padding: Spacing.lg,
    },
    statItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderLight,
    },
    statItemLeft: {
      flex: 1,
    },
    statMonth: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.textPrimary,
    },
    statCount: {
      fontSize: 12,
      color: theme.textMuted,
      marginTop: 2,
    },
    statAmount: {
      fontSize: 16,
      fontWeight: '700',
    },
    statAmountIncome: {
      color: '#34D399',
    },
    statAmountExpense: {
      color: '#FB7185',
    },
    emptyStatsContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: Spacing['3xl'],
    },
    emptyStatsText: {
      fontSize: 14,
      color: theme.textMuted,
      marginTop: Spacing.md,
    },
    viewAllButton: {
      backgroundColor: theme.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: Spacing.lg,
      margin: Spacing.lg,
      borderRadius: BorderRadius.lg,
    },
    viewAllButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
      marginRight: Spacing.sm,
    },
  });
};
