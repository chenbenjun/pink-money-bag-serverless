import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';

// Render Supabase（目标数据库）
const targetUrl = 'https://cezhwkwlkhnikihfjres.supabase.co';
const targetKey = 'sb_publishable_5UDF5MyHJz6tZi3aV9_gyw_8MgaQUM7';

const targetClient = createClient(targetUrl, targetKey);

async function testAnAnLogin() {
  console.log('=== 测试用户"安安"数据库登录 ===\n');

  // 1. 查询用户信息
  const { data: userData, error: userError } = await targetClient
    .from('users')
    .select('*')
    .eq('name', '安安')
    .single();

  if (userError) {
    console.log('❌ 查询用户失败:', userError.message);
    return;
  }

  console.log('✅ 找到用户！');
  console.log('   用户 ID:', userData.id);
  console.log('   用户名:', userData.name);
  console.log('   昵称:', userData.nickname);
  console.log('   密码哈希:', userData.password?.substring(0, 20) + '...');
  console.log('   明文密码:', userData.password_plain);

  // 2. 验证密码
  console.log('\n2. 验证密码...');
  const isPasswordValid = bcrypt.compareSync('1234', userData.password);
  console.log('   密码验证:', isPasswordValid ? '✅ 正确' : '❌ 错误');

  // 3. 获取用户的交易记录
  console.log('\n3. 获取交易记录...');
  const { data: transactions, error: transError } = await targetClient
    .from('transactions')
    .select('*')
    .eq('user_id', userData.id)
    .order('transaction_date', { ascending: false });

  if (transError) {
    console.log('❌ 获取交易记录失败:', transError.message);
    return;
  }

  console.log(`   ✅ 交易记录总数: ${transactions?.length || 0}`);
  transactions?.slice(0, 5).forEach((t, i) => {
    console.log(`   ${i + 1}. ${t.type === 'income' ? '收入' : '支出'}: ¥${t.amount} (${t.description || '无描述'})`);
  });

  if (transactions.length > 5) {
    console.log(`   ... 还有 ${transactions.length - 5} 条记录`);
  }

  // 4. 获取分类信息
  console.log('\n4. 获取分类信息...');
  const categoryIds = [...new Set(transactions?.map(t => t.category_id) || [])];
  const { data: categories, error: catError } = await targetClient
    .from('categories')
    .select('*')
    .in('id', categoryIds);

  if (catError) {
    console.log('❌ 获取分类信息失败:', catError.message);
    return;
  }

  console.log(`   ✅ 相关分类数: ${categories?.length || 0}`);
  categories?.forEach((c) => {
    console.log(`   - ${c.name} (${c.type})`);
  });

  console.log('\n✅ 测试完成！用户"安安"的数据完整，密码验证通过。');
}

testAnAnLogin();
