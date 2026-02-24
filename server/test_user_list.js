import { createClient } from '@supabase/supabase-js';

// Render Supabase（目标数据库）
const targetUrl = 'https://cezhwkwlkhnikihfjres.supabase.co';
const targetKey = 'sb_publishable_5UDF5MyHJz6tZi3aV9_gyw_8MgaQUM7';

const targetClient = createClient(targetUrl, targetKey);

async function testUserListAPI() {
  console.log('=== 测试用户列表 API ===\n');

  // 测试直接从 Supabase 获取用户列表
  const { data, error } = await targetClient
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.log('❌ 获取用户列表失败:', error.message);
    return;
  }

  console.log(`✅ 成功获取用户列表，共 ${data.length} 个用户\n`);

  data.forEach((user, i) => {
    console.log(`${i + 1}. 用户名: ${user.name}`);
    console.log(`   昵称: ${user.nickname || '无'}`);
    console.log(`   ID: ${user.id}`);
    console.log(`   是否管理员: ${user.is_admin}`);
    console.log(`   创建时间: ${user.created_at}`);
    console.log('');
  });

  console.log('✅ 数据库层面用户列表正常');
}

testUserListAPI();
