import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Screen } from '@/components/Screen';
import { useSafeSearchParams, useSafeRouter } from '@/hooks/useSafeRouter';
import { useAuth } from '@/contexts/AuthContext';

export default function TestDetailPage() {
  const params = useSafeSearchParams<{ id: string }>();
  const router = useSafeRouter();
  const { currentUser } = useAuth();

  return (
    <Screen backgroundColor="#ffffff">
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>交易详情测试页面</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>路由参数</Text>
          <Text style={styles.label}>params:</Text>
          <Text style={styles.code}>{JSON.stringify(params, null, 2)}</Text>

          <Text style={styles.label}>params.id:</Text>
          <Text style={styles.code}>{params.id || '❌ undefined'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>用户信息</Text>
          <Text style={styles.label}>currentUser:</Text>
          <Text style={styles.code}>
            {currentUser
              ? `${currentUser.name} (${currentUser.nickname})\nID: ${currentUser.id}`
              : '❌ 未登录'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>测试操作</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/transaction-detail', {
              id: '62bf4d94-629e-413b-87dd-f844424f86ed'
            })}
          >
            <Text style={styles.buttonText}>跳转到真实交易详情</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/transaction-detail', {
              id: 'test-id-12345'
            })}
          >
            <Text style={styles.buttonText}>跳转到测试交易详情</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>说明</Text>
          <Text style={styles.infoText}>
            如果 params.id 显示 undefined，说明路由参数没有正确传递。
          </Text>
          <Text style={styles.infoText}>
            点击上方按钮可以测试不同 ID 的交易详情。
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    color: '#333',
  },
  code: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 4,
    marginTop: 4,
    color: '#007AFF',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    lineHeight: 20,
  },
});
