import { StyleSheet } from 'react-native';
import { Spacing, BorderRadius, Theme } from '@/constants/theme';

export const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      flexGrow: 1,
      paddingHorizontal: Spacing.xl,
      paddingVertical: Spacing.lg,
      paddingBottom: Spacing['3xl'],
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      marginBottom: Spacing.lg,
      marginTop: Spacing.md,
      color: theme.textPrimary,
      textAlign: 'center',
    },
    label: {
      fontSize: 16,
      color: theme.textSecondary,
      marginBottom: Spacing.sm,
      marginTop: Spacing.md,
    },
    avatarSection: {
      marginBottom: Spacing.md,
      gap: Spacing.sm,
    },
    avatarRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: Spacing.sm,
    },
    avatarItem: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: theme.backgroundTertiary,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: 'transparent',
    },
    avatarItemSelected: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    inputContainer: {
      width: '100%',
      marginBottom: Spacing.md,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.backgroundTertiary,
      borderRadius: BorderRadius.lg,
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
    },
    inputIcon: {
      marginRight: Spacing.md,
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: theme.textPrimary,
    },
    button: {
      width: '100%',
      backgroundColor: theme.primary,
      paddingVertical: Spacing.md,
      borderRadius: BorderRadius.lg,
      alignItems: 'center',
      marginBottom: Spacing.sm,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    cancelButton: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: theme.border,
    },
    cancelButtonText: {
      color: theme.textSecondary,
      fontSize: 16,
      fontWeight: '600',
    },
    genderContainer: {
      flexDirection: 'row',
      gap: Spacing.md,
    },
    genderButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: Spacing.md,
      borderRadius: BorderRadius.lg,
      backgroundColor: theme.backgroundTertiary,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    genderButtonSelected: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    genderText: {
      marginLeft: Spacing.sm,
      fontSize: 16,
      color: theme.textSecondary,
    },
    genderTextSelected: {
      color: '#FFFFFF',
    },
  });
};
