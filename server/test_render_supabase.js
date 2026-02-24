import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cezhwkwlkhnikihfjres.supabase.co';
const supabaseKey = 'sb_publishable_5UDF5MyHJz6tZi3aV9_gyw_8MgaQUM7';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('=== 测试连接 Render 的 Supabase ===\n');
  
  // 测试1：获取所有用户
  console.log('1. 获取所有用户...');
  const { data: users, error: error1 } = await supabase
    .from('users')
    .select('id, name, nickname')
    .order('created_at', { ascending: false });
  
  if (error1) {
    console.log('❌ 错误:', error1);
  } else {
    console.log(`✅ 找到 ${users.length} 个用户:`);
    users.forEach((u) => {
      console.log(`   - ${u.name} (${u.nickname}) - ID: ${u.id}`);
    });
  }
  
  // 测试2：查询"安安"用户
  console.log('\n2. 查询"安安"用户...');
  const { data: userAnAn, error: error2 } = await supabase
    .from('users')
    .select('*')
    .eq('name', '安安')
    .single();
  
  if (error2 && error2.code === 'PGRST116') {
    console.log('❌ 未找到"安安"用户');
  } else if (error2) {
    console.log('❌ 错误:', error2);
  } else {
    console.log('✅ 找到"安安"用户:', userAnAn.nickname);
  }
  
  // 测试3：获取分类
  console.log('\n3. 获取分类...');
  const { data: categories, error: error3 } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: true });
  
  if (error3) {
    console.log('❌ 错误:', error3);
  } else {
    console.log(`✅ 找到 ${categories.length} 个分类`);
    categories.forEach((c) => {
      console.log(`   - ${c.name} (${c.type})`);
    });
  }
}

testConnection();
