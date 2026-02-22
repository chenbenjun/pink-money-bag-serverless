import React, { useState, useMemo } from 'react';
import { View, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { createStyles } from './styles';
import { useAuth } from '@/contexts/AuthContext';

export default function UserSwitchScreen() {
  const { theme, isDark } = useTheme();
  const router = useSafeRouter();
  const { currentUser, allUsers } = useAuth();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const handleUserPress = (user: any) => {
    // 点击用户跳转到登录页面，传递用户名
    router.push('/login', { username: user.name });
  };

  const renderUser = ({ item }: { item: any }) => {
    const isCurrentUser = currentUser?.id === item.id;

    return (
      <TouchableOpacity
        style={styles.userItem}
        onPress={() => handleUserPress(item)}
      >
        <View style={styles.userAvatar}>
          <FontAwesome6 name={item.avatar || 'user'} size={32} color={theme.primary} />
        </View>
        <View style={styles.userInfo}>
          <ThemedText style={styles.userName}>
            {item.name}
          </ThemedText>
          {item.nickname && (
            <ThemedText style={styles.userNickname}>
              {item.nickname}
            </ThemedText>
          )}
          {isCurrentUser && (
            <ThemedText style={styles.userBadge}>
              当前用户
            </ThemedText>
          )}
        </View>
        <FontAwesome6 name="chevron-right" size={20} color={theme.textMuted} />
      </TouchableOpacity>
    );
  };

  return (
    <Screen
      backgroundColor={theme.backgroundRoot}
      statusBarStyle={isDark ? 'light' : 'dark'}
    >
      <View style={styles.container}>
        {/* 头部 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <FontAwesome6 name="arrow-left" size={24} color={theme.textPrimary} />
          </TouchableOpacity>
          <ThemedText style={styles.title}>切换用户</ThemedText>
          <View style={{ width: 24 }} />
        </View>

        {/* 用户列表 */}
        <ThemedText style={styles.label}>选择要登录的用户</ThemedText>
        {allUsers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <FontAwesome6 name="users" size={64} color={theme.textMuted} />
            <ThemedText style={styles.emptyText}>还没有用户</ThemedText>
          </View>
        ) : (
          <FlatList
            data={allUsers}
            renderItem={renderUser}
            keyExtractor={(item) => item.id}
            style={styles.userList}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* 新建用户按钮 */}
        <TouchableOpacity
          style={[styles.button, styles.registerButton]}
          onPress={() => {
            console.log('点击新建用户按钮，跳转到注册页面');
            router.push('/register');
          }}
        >
          <ThemedText style={styles.registerButtonText}>+ 新建用户</ThemedText>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}
