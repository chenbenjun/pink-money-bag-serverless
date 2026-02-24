import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/contexts/AuthContext';

export default function TestFeedbackScreen() {
  const { currentUser } = useAuth();
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const testSubmit = async () => {
    setIsLoading(true);
    setLogs([]);

    const apiBaseUrl = process.env.EXPO_PUBLIC_BACKEND_BASE_URL;
    addLog(`开始测试...`);
    addLog(`API_BASE_URL: ${apiBaseUrl || '未设置'}`);

    if (!apiBaseUrl) {
      addLog(`❌ 错误：API_BASE_URL 未设置`);
      Alert.alert('错误', '环境变量未加载，请刷新页面重试');
      setIsLoading(false);
      return;
    }

    if (!currentUser?.id) {
      addLog(`❌ 错误：用户未登录`);
      Alert.alert('错误', '请先登录');
      setIsLoading(false);
      return;
    }

    addLog(`当前用户: ${currentUser.name} (ID: ${currentUser.id})`);

    const testFeedback = {
      user_id: currentUser.id,
      content: '测试反馈 - ' + new Date().toISOString(),
      contact: 'test@example.com'
    };

    addLog(`提交数据: ${JSON.stringify(testFeedback)}`);

    try {
      addLog(`发送请求到: ${apiBaseUrl}/api/v1/feedbacks`);

      const response = await fetch(`${apiBaseUrl}/api/v1/feedbacks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testFeedback),
      });

      addLog(`响应状态码: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        addLog(`❌ 请求失败: ${errorText}`);
        Alert.alert('失败', `请求失败: ${response.status}`);
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      addLog(`响应数据: ${JSON.stringify(data)}`);

      if (data.success && data.data) {
        addLog(`✅ 成功！反馈ID: ${data.data.id}`);
        Alert.alert('成功', '反馈提交成功！');
      } else {
        addLog(`❌ 响应格式错误: ${JSON.stringify(data)}`);
        Alert.alert('失败', '响应格式错误');
      }
    } catch (error: any) {
      addLog(`❌ 网络错误: ${error.message}`);
      addLog(`错误详情: ${error.stack || '无堆栈信息'}`);
      Alert.alert('错误', `网络错误: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Screen backgroundColor="#ffffff">
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>意见反馈测试页面</Text>

        {/* 环境信息 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>环境信息</Text>
          <Text style={styles.label}>API_BASE_URL:</Text>
          <Text style={styles.code}>
            {process.env.EXPO_PUBLIC_BACKEND_BASE_URL || '❌ 未设置'}
          </Text>

          <Text style={styles.label}>完整URL:</Text>
          <Text style={styles.code}>
            {process.env.EXPO_PUBLIC_BACKEND_BASE_URL
              ? `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/feedbacks`
              : 'N/A'}
          </Text>

          <Text style={styles.label}>当前用户:</Text>
          <Text style={styles.value}>
            {currentUser
              ? `${currentUser.name} (${currentUser.nickname}) - ID: ${currentUser.id}`
              : '❌ 未登录'}
          </Text>
        </View>

        {/* 测试按钮 */}
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={testSubmit}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? '测试中...' : '测试提交反馈'}
          </Text>
        </TouchableOpacity>

        {/* 日志 */}
        {logs.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>执行日志</Text>
            <ScrollView style={styles.logContainer}>
              {logs.map((log, index) => (
                <Text key={index} style={styles.logText}>{log}</Text>
              ))}
            </ScrollView>
          </View>
        )}

        {/* 说明 */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>测试说明：</Text>
          <Text style={styles.infoText}>
            1. 检查 API_BASE_URL 是否显示 http://localhost:9091
          </Text>
          <Text style={styles.infoText}>
            2. 确认用户已登录
          </Text>
          <Text style={styles.infoText}>
            3. 点击"测试提交反馈"按钮
          </Text>
          <Text style={styles.infoText}>
            4. 查看日志了解详细执行过程
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
  value: {
    fontSize: 14,
    marginTop: 4,
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  logContainer: {
    maxHeight: 300,
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 4,
  },
  logText: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: 4,
    color: '#333',
  },
  infoSection: {
    padding: 16,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1976D2',
  },
  infoText: {
    fontSize: 14,
    color: '#1976D2',
    marginTop: 4,
    lineHeight: 20,
  },
});
