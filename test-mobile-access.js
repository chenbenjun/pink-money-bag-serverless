#!/usr/bin/env node

/**
 * 手机访问测试脚本
 * 验证前端和后端服务是否可以从外部访问
 */

const FRONTEND_URL = 'http://9.129.115.216:5000';
const BACKEND_URL = 'http://9.129.115.216:9091';

console.log('=== 手机访问测试 ===\n');
console.log(`电脑 IP: 9.129.115.216`);
console.log(`前端地址: ${FRONTEND_URL}`);
console.log(`后端地址: ${BACKEND_URL}\n`);

async function testEndpoint(url, name) {
  try {
    const response = await fetch(url);
    console.log(`✅ ${name}: ${response.status}`);
    return response.ok;
  } catch (error) {
    console.log(`❌ ${name}: ${error.message}`);
    return false;
  }
}

async function testAPI(url, name) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log(`✅ ${name}: ${response.status}`);
    console.log(`   数据: ${JSON.stringify(data).slice(0, 100)}...`);
    return response.ok;
  } catch (error) {
    console.log(`❌ ${name}: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('1. 测试前端服务...');
  await testEndpoint(FRONTEND_URL, '前端首页');
  await testEndpoint(`${FRONTEND_URL}/test-transaction-detail.html`, '交易详情测试页');
  await testEndpoint(`${FRONTEND_URL}/test-api.html`, '意见反馈测试页');

  console.log('\n2. 测试后端服务...');
  await testAPI(`${BACKEND_URL}/api/v1/health`, '健康检查');
  await testAPI(`${BACKEND_URL}/api/v1/users`, '用户列表');
  await testAPI(`${BACKEND_URL}/api/v1/transactions?limit=1&user_id=aaf035dc-e717-4ae3-b1a5-9560dca3ea88`, '交易列表');

  console.log('\n3. 测试交易详情 API...');
  await testAPI(
    `${BACKEND_URL}/api/v1/transactions/62bf4d94-629e-413b-87dd-f844424f86ed?user_id=aaf035dc-e717-4ae3-b1a5-9560dca3ea88`,
    '交易详情'
  );

  console.log('\n=== 测试完成 ===');
  console.log('\n手机访问地址：');
  console.log(`- 前端: ${FRONTEND_URL}`);
  console.log(`- 交易详情测试: ${FRONTEND_URL}/test-transaction-detail.html`);
  console.log(`- 意见反馈测试: ${FRONTEND_URL}/test-api.html`);
  console.log('\n注意事项：');
  console.log('1. 确保手机和电脑在同一局域网');
  console.log('2. 确保电脑防火墙允许 5000 和 9091 端口访问');
  console.log('3. 如果 IP 变化，需要更新 .env 文件中的 IP 地址');
}

main();
