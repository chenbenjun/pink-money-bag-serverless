import { StyleSheet } from 'react-native';
import { Spacing, BorderRadius, Theme } from '@/constants/theme';

export const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    scrollContent: {
      flexGrow: 1,
    },
    userBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      backgroundColor: theme.primary,
    },
    userInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    userAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: Spacing.md,
      overflow: 'hidden',
    },
    avatarImage: {
      width: 40,
      height: 40,
      borderRadius: 20,
    },
    userName: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    userTextContainer: {
      justifyContent: 'center',
    },
    userBio: {
      color: 'rgba(255, 255, 255, 0.7)',
      fontSize: 12,
      marginTop: 2,
      maxWidth: 200,
    },
    headerContainer: {
      backgroundColor: theme.primary,
      paddingTop: Spacing.md,
      paddingBottom: Spacing['5xl'],
      paddingHorizontal: Spacing.lg,
      borderBottomLeftRadius: 32,
      borderBottomRightRadius: 32,
    },
    balanceCard: {
      alignItems: 'center',
      paddingTop: Spacing.xl,
    },
    balanceLabel: {
      color: 'rgba(255, 255, 255, 0.8)',
      fontSize: 16,
      marginBottom: 4,
    },
    balanceAmountContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    balanceCurrency: {
      color: '#FFFFFF',
      fontSize: 32,
      fontWeight: '700',
      marginRight: 4,
      marginTop: 6,
    },
    balanceAmount: {
      color: '#FFFFFF',
      fontSize: 64,
      fontWeight: '700',
      lineHeight: 64,
    },
    eyeButton: {
      marginBottom: Spacing.xs,
      padding: Spacing.sm,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: Spacing.xl,
      width: '100%',
    },
    statItem: {
      alignItems: 'center',
    },
    statLabel: {
      color: 'rgba(255, 255, 255, 0.7)',
      fontSize: 14,
      marginBottom: Spacing.xs,
    },
    statValue: {
      color: '#FFFFFF',
      fontSize: 20,
      fontWeight: '600',
    },
    quickActions: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      padding: Spacing.lg,
      marginTop: -Spacing['3xl'],
      marginHorizontal: Spacing.lg,
    },
    actionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: Spacing.lg,
      marginHorizontal: Spacing.sm,
      borderRadius: BorderRadius.lg,
      backgroundColor: '#FFFFFF',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    actionButtonIncome: {
      borderWidth: 2,
      borderColor: '#34D399',
    },
    actionButtonExpense: {
      borderWidth: 2,
      borderColor: '#FB7185',
    },
    actionIcon: {
      marginRight: Spacing.sm,
    },
    actionText: {
      fontSize: 16,
      fontWeight: '600',
    },
    actionTextIncome: {
      color: '#34D399',
    },
    actionTextExpense: {
      color: '#FB7185',
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.lg,
      color: '#4A3F35',
    },
    transactionList: {
      paddingHorizontal: Spacing.lg,
      paddingBottom: Spacing['5xl'],
    },
    transactionCard: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
      marginBottom: 4,
      borderRadius: BorderRadius.lg,
      backgroundColor: '#FFFFFF',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    transactionIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
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
      fontSize: 15,
      fontWeight: '600',
      marginBottom: 2,
    },
    transactionDate: {
      fontSize: 11,
      color: theme.textMuted,
    },
    transactionAmount: {
      fontSize: 16,
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
    // 菜单样式
    menuOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: Spacing.xl,
    },
    menuContainer: {
      width: '100%',
      maxWidth: 320,
      backgroundColor: '#FFFFFF',
      borderRadius: BorderRadius.xl,
      paddingVertical: Spacing.lg,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
    },
    menuHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing.lg,
      paddingBottom: Spacing.md,
    },
    menuUserAvatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.backgroundTertiary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: Spacing.md,
    },
    menuUserInfo: {
      flex: 1,
    },
    menuUserName: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.textPrimary,
      marginBottom: 4,
    },
    menuUserSubtitle: {
      fontSize: 12,
      color: theme.textMuted,
    },
    menuDivider: {
      height: 1,
      backgroundColor: theme.borderLight,
      marginHorizontal: Spacing.lg,
      marginBottom: Spacing.sm,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
    },
    menuItemDanger: {
      backgroundColor: 'rgba(251, 113, 133, 0.05)',
    },
    menuItemIcon: {
      marginRight: Spacing.md,
      width: 24,
    },
    menuItemText: {
      fontSize: 16,
      color: theme.textPrimary,
      fontWeight: '500',
    },
    menuItemTextDanger: {
      color: '#FB7185',
    },
    deleteButton: {
      justifyContent: 'center',
      alignItems: 'center',
      width: 80,
      marginVertical: Spacing.xs,
      borderRadius: BorderRadius.lg,
      marginLeft: Spacing.sm,
    },
    deleteButtonText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '600',
      marginTop: Spacing.xs,
    },
  });
};
