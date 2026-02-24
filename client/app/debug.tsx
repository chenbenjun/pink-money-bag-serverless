import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/contexts/AuthContext';

export default function DebugScreen() {
  const { currentUser, allUsers, isLoading } = useAuth();
  const [testResult, setTestResult] = useState<string | null>(null);

  const testApiConnection = async () => {
    const apiUrl = process.env.EXPO_PUBLIC_BACKEND_BASE_URL;
    setTestResult('正在测试 API 连接...');

    try {
      const response = await fetch(`${apiUrl}/api/v1/health`);
      const data = await response.json();

      if (response.ok) {
        setTestResult(`✅ API 连接成功\n状态码: ${response.status}\n返回: ${JSON.stringify(data)}`);
      } else {
        setTestResult(`❌ API 返回错误\n状态码: ${response.status}`);
      }
    } catch (error: any) {
      setTestResult(`❌ API 连接失败\n错误: ${error.message}`);
    }
  };

  return (
    <Screen backgroundColor="#ffffff">
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.title}>调试信息</Text>

        {/* 环境变量 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>环境变量</Text>
          <Text style={styles.label}>EXPO_PUBLIC_BACKEND_BASE_URL:</Text>
          <Text style={styles.value}>
            {process.env.EXPO_PUBLIC_BACKEND_BASE_URL || '⚠️ 未设置'}
          </Text>
          <Text style={styles.label}>完整反馈 API URL:</Text>
          <Text style={styles.value}>
            {process.env.EXPO_PUBLIC_BACKEND_BASE_URL ? `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/feedbacks` : 'N/A'}
          </Text>
        </View>

        {/* 用户信息 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>用户认证</Text>
          <Text style={styles.label}>is_loading:</Text>
          <Text style={styles.value}>{isLoading ? 'true' : 'false'}</Text>
          <Text style={styles.label}>当前用户:</Text>
          {currentUser ? (
            <View>
              <Text style={styles.value}>ID: {currentUser.id}</Text>
              <Text style={styles.value}>姓名: {currentUser.name}</Text>
              <Text style={styles.value}>昵称: {currentUser.nickname}</Text>
            </View>
          ) : (
            <Text style={styles.errorValue}>❌ 未登录</Text>
          )}
          <Text style={styles.label}>用户列表:</Text>
          <Text style={styles.value}>{allUsers.length} 个用户</Text>
        </View>

        {/* API 测试 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>API 连接测试</Text>
          <TouchableOpacity style={styles.button} onPress={testApiConnection}>
            <Text style={styles.buttonText}>测试 API 连接</Text>
          </TouchableOpacity>
          {testResult && (
            <Text style={styles.result}>{testResult}</Text>
          )}
        </View>

        {/* 说明 */}
        <View style={[styles.section, styles.infoBox]}>
          <Text style={styles.infoTitle}>检查清单:</Text>
          <Text style={styles.infoText}>1. EXPO_PUBLIC_BACKEND_BASE_URL 应该显示 http://localhost:9091</Text>
          <Text style={styles.infoText}>2. 当前用户应该已登录（显示用户信息）</Text>
          <Text style={styles.infoText}>3. API 连接测试应该成功</Text>
          <Text style={styles.infoText}>4. 如果用户未登录，请先登录再提交反馈</Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
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
  value: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  errorValue: {
    fontSize: 14,
    color: '#ff3b30',
    marginTop: 4,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  result: {
    marginTop: 12,
    fontSize: 14,
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  infoBox: {
    backgroundColor: '#fff3cd',
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#856404',
  },
  infoText: {
    fontSize: 14,
    color: '#856404',
    marginTop: 4,
    lineHeight: 20,
  },
});
