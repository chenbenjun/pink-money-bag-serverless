import { StyleSheet } from 'react-native';
import { Spacing, BorderRadius, Theme } from '@/constants/theme';

export const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: Spacing.xl,
      paddingTop: Spacing.xl,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: Spacing.xl,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.textPrimary,
    },
    label: {
      fontSize: 16,
      color: theme.textSecondary,
      marginBottom: Spacing.md,
    },
    userList: {
      flex: 1,
      marginBottom: Spacing.lg,
    },
    userItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: Spacing.lg,
      paddingHorizontal: Spacing.lg,
      marginBottom: Spacing.md,
      borderRadius: BorderRadius.lg,
      backgroundColor: '#FFFFFF',
      borderWidth: 2,
      borderColor: 'transparent',
    },
    userItemSelected: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    userAvatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.primary + '15',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: Spacing.md,
    },
    userInfo: {
      flex: 1,
    },
    userName: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.textPrimary,
    },
    userNickname: {
      fontSize: 14,
      color: theme.textSecondary,
      marginTop: 2,
    },
    userBadge: {
      fontSize: 12,
      color: theme.primary,
      marginTop: 4,
    },
    textWhite: {
      color: '#FFFFFF',
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.backgroundTertiary,
      borderRadius: BorderRadius.lg,
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      marginBottom: Spacing.md,
    },
    inputIcon: {
      marginRight: Spacing.md,
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: theme.textPrimary,
    },
    passwordContainer: {
      marginBottom: Spacing.md,
    },
    button: {
      width: '100%',
      backgroundColor: theme.primary,
      paddingVertical: Spacing.lg,
      borderRadius: BorderRadius.lg,
      alignItems: 'center',
      marginBottom: Spacing.md,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    registerButton: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: theme.primary,
    },
    registerButtonText: {
      color: theme.primary,
      fontSize: 16,
      fontWeight: '600',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingBottom: Spacing['5xl'],
    },
    emptyText: {
      fontSize: 16,
      color: theme.textMuted,
      marginTop: Spacing.md,
    },
  });
};
