#!/usr/bin/env node

/**
 * 测试意见反馈提交功能
 * 模拟前端完整的提交流程
 */

const API_BASE_URL = 'http://localhost:9091';

console.log('=== 测试意见反馈提交功能 ===\n');

// 步骤 1: 获取用户列表
console.log('1. 获取用户列表...');
fetch(`${API_BASE_URL}/api/v1/users`)
  .then(res => res.json())
  .then(result => {
    if (!result.success || !result.data || result.data.length === 0) {
      console.error('❌ 无法获取用户列表');
      process.exit(1);
    }

    const user = result.data[0];
    console.log(`✅ 找到用户: ${user.name} (ID: ${user.id})\n`);

    // 步骤 2: 提交反馈
    console.log('2. 提交反馈...');
    const feedbackData = {
      user_id: user.id,
      content: '这是一个测试反馈，提交时间为 ' + new Date().toISOString(),
      contact: 'test@example.com'
    };

    return fetch(`${API_BASE_URL}/api/v1/feedbacks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feedbackData)
    }).then(res => res.json()).then(result => ({ result, feedbackData }));
  })
  .then(({ result, feedbackData }) => {
    console.log('提交的数据:', JSON.stringify(feedbackData, null, 2));

    if (result.success && result.data) {
      console.log(`\n✅ 反馈提交成功！`);
      console.log(`反馈 ID: ${result.data.id}`);
      console.log(`状态: ${result.data.status}`);
      console.log(`创建时间: ${result.data.created_at}`);
    } else {
      console.error(`\n❌ 反馈提交失败: ${result.error}`);
      process.exit(1);
    }

    // 步骤 3: 查询反馈列表
    console.log('\n3. 查询反馈列表...');
    return fetch(`${API_BASE_URL}/api/v1/feedbacks`).then(res => res.json());
  })
  .then(result => {
    if (result.success && result.data) {
      console.log(`✅ 找到 ${result.data.length} 条反馈记录`);
      console.log('\n最近 3 条反馈:');
      result.data.slice(-3).forEach(fb => {
        console.log(`  - [${fb.id.slice(0, 8)}] ${fb.content.slice(0, 30)}... (${fb.status})`);
      });
    } else {
      console.error('❌ 无法获取反馈列表');
    }

    console.log('\n=== 测试完成 ===');
  })
  .catch(error => {
    console.error('❌ 发生错误:', error.message);
    process.exit(1);
  });
