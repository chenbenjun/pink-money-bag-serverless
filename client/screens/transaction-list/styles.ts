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
    },
    headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.lg,
    },
    headerTitle: {
      color: '#FFFFFF',
      fontSize: 24,
      fontWeight: '700',
    },
    statsButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.2)',
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderRadius: BorderRadius.lg,
    },
    statsButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
      marginLeft: Spacing.xs,
    },
    // 汇总卡片
    summaryCard: {
      flexDirection: 'row',
      backgroundColor: 'rgba(255,255,255,0.15)',
      borderRadius: BorderRadius.lg,
      padding: Spacing.md,
    },
    summaryItem: {
      flex: 1,
      alignItems: 'center',
    },
    summaryDivider: {
      width: 1,
      backgroundColor: 'rgba(255,255,255,0.2)',
    },
    summaryLabel: {
      color: 'rgba(255,255,255,0.8)',
      fontSize: 12,
      marginBottom: Spacing.xs,
    },
    summaryIncome: {
      color: '#86EFAC',
      fontSize: 16,
      fontWeight: '700',
    },
    summaryExpense: {
      color: '#FCA5A5',
      fontSize: 16,
      fontWeight: '700',
    },
    summaryBalance: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '700',
    },
    // 分类筛选
    categoryFilterContainer: {
      backgroundColor: '#FFFFFF',
      paddingVertical: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderLight,
    },
    categoryFilterContent: {
      paddingHorizontal: Spacing.lg,
      gap: Spacing.sm,
    },
    categoryFilterItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderRadius: BorderRadius.lg,
      backgroundColor: theme.backgroundTertiary,
      marginRight: Spacing.sm,
    },
    categoryFilterItemActive: {
      backgroundColor: theme.primary,
    },
    categoryFilterIcon: {
      marginRight: Spacing.xs,
    },
    categoryFilterText: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    categoryFilterTextActive: {
      color: '#FFFFFF',
      fontWeight: '600',
    },
    // 类型筛选
    typeFilterContainer: {
      flexDirection: 'row',
      padding: Spacing.md,
      backgroundColor: '#FFFFFF',
      borderBottomWidth: 1,
      borderBottomColor: theme.borderLight,
    },
    typeFilterBtn: {
      flex: 1,
      paddingVertical: Spacing.sm,
      alignItems: 'center',
      borderRadius: BorderRadius.md,
      marginHorizontal: Spacing.xs,
    },
    typeFilterBtnActive: {
      backgroundColor: theme.primary,
    },
    typeFilterText: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    typeFilterTextActive: {
      color: '#FFFFFF',
      fontWeight: '600',
    },
    // 交易列表
    transactionList: {
      paddingHorizontal: Spacing.lg,
      paddingBottom: Spacing['5xl'],
    },
    dateHeader: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.textMuted,
      marginTop: Spacing.lg,
      marginBottom: Spacing.md,
      paddingHorizontal: Spacing.lg,
    },
    transactionCard: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: Spacing.lg,
      paddingHorizontal: Spacing.lg,
      marginBottom: Spacing.md,
      borderRadius: BorderRadius.lg,
      backgroundColor: '#FFFFFF',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    transactionIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: Spacing.md,
    },
    transactionIconIncome: {
      backgroundColor: 'rgba(52, 211, 153, 0.1)',
    },
    transactionIconExpense: {
      backgroundColor: 'rgba(251, 113, 133, 0.1)',
    },
    transactionInfo: {
      flex: 1,
    },
    transactionTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: Spacing.xs,
      color: theme.textPrimary,
    },
    transactionDesc: {
      fontSize: 12,
      color: theme.textMuted,
    },
    transactionAmount: {
      fontSize: 18,
      fontWeight: '700',
    },
    transactionAmountIncome: {
      color: '#34D399',
    },
    transactionAmountExpense: {
      color: '#FB7185',
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: Spacing['5xl'],
    },
    emptyText: {
      fontSize: 16,
      color: theme.textMuted,
      marginTop: Spacing.md,
    },
    loadingContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: Spacing['5xl'],
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
    modalTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.textPrimary,
    },
    statsList: {
      padding: Spacing.lg,
    },
    statsSection: {
      marginBottom: Spacing.xl,
    },
    statsSectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.textPrimary,
      marginBottom: Spacing.md,
    },
    statsRow: {
      flexDirection: 'row',
      backgroundColor: theme.backgroundTertiary,
      borderRadius: BorderRadius.lg,
      padding: Spacing.md,
    },
    statsItem: {
      flex: 1,
      alignItems: 'center',
    },
    statsLabel: {
      fontSize: 12,
      color: theme.textMuted,
      marginBottom: Spacing.xs,
    },
    statsIncome: {
      fontSize: 16,
      fontWeight: '700',
      color: '#34D399',
    },
    statsExpense: {
      fontSize: 16,
      fontWeight: '700',
      color: '#FB7185',
    },
    statsBalance: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.textPrimary,
    },
    emptyStatsText: {
      fontSize: 14,
      color: theme.textMuted,
      textAlign: 'center',
      paddingVertical: Spacing.lg,
    },
    statsCategoryItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderLight,
    },
    statsCategoryLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    statsCategoryIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: Spacing.md,
    },
    statsCategoryIconIncome: {
      backgroundColor: 'rgba(52, 211, 153, 0.1)',
    },
    statsCategoryIconExpense: {
      backgroundColor: 'rgba(251, 113, 133, 0.1)',
    },
    statsCategoryName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.textPrimary,
    },
    statsCategoryCount: {
      fontSize: 12,
      color: theme.textMuted,
      marginTop: 2,
    },
    statsCategoryAmount: {
      fontSize: 16,
      fontWeight: '700',
    },
    statsCategoryAmountIncome: {
      color: '#34D399',
    },
    statsCategoryAmountExpense: {
      color: '#FB7185',
    },
  });
};
