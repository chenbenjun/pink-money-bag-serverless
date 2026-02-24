import { createClient } from '@supabase/supabase-js';

// Render Supabase（目标数据库）
const targetUrl = 'https://cezhwkwlkhnikihfjres.supabase.co';
const targetKey = 'sb_publishable_5UDF5MyHJz6tZi3aV9_gyw_8MgaQUM7';

const targetClient = createClient(targetUrl, targetKey);

async function testAnAnLogin() {
  console.log('=== 测试用户"安安"登录 ===\n');

  // 使用 Supabase Auth 登录
  const { data, error } = await targetClient.auth.signInWithPassword({
    email: '安安',
    password: '1234',
  });

  if (error) {
    console.log('❌ 登录失败:', error.message);
    return;
  }

  console.log('✅ 登录成功！');
  console.log('   用户 ID:', data.user?.id);
  console.log('   用户邮箱:', data.user?.email);

  // 获取用户详细信息
  const { data: userData, error: userError } = await targetClient
    .from('users')
    .select('*')
    .eq('id', data.user?.id)
    .single();

  if (userError) {
    console.log('❌ 获取用户信息失败:', userError.message);
    return;
  }

  console.log('\n   用户详细信息:');
  console.log('   - 用户名:', userData.name);
  console.log('   - 昵称:', userData.nickname);
  console.log('   - 年龄:', userData.age);
  console.log('   - 性别:', userData.gender);
  console.log('   - 是否管理员:', userData.is_admin);

  // 获取用户的交易记录
  const { data: transactions, error: transError } = await targetClient
    .from('transactions')
    .select('*')
    .eq('user_id', data.user?.id);

  if (transError) {
    console.log('\n❌ 获取交易记录失败:', transError.message);
    return;
  }

  console.log('\n   交易记录总数:', transactions?.length || 0);
  transactions?.forEach((t, i) => {
    console.log(`   ${i + 1}. ${t.type}: ¥${t.amount} (${t.description || '无描述'})`);
  });
}

testAnAnLogin();
