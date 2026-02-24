import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function testQuery() {
  console.log('测试查询用户"安安"...');
  
  // 测试1：精确查询
  console.log('\n=== 测试1: 精确查询 ===');
  const { data: user1, error: error1 } = await supabase
    .from('users')
    .select('*')
    .eq('name', '安安')
    .single();
  
  console.log('查询结果:', user1);
  console.log('错误:', error1);
  
  // 测试2：LIKE 查询
  console.log('\n=== 测试2: LIKE 查询 ===');
  const { data: users2, error: error2 } = await supabase
    .from('users')
    .select('*')
    .ilike('name', '%安%');
  
  console.log('查询结果数量:', users2?.length);
  if (users2 && users2.length > 0) {
    console.log('第一个用户:', users2[0].name, users2[0].nickname);
  }
  console.log('错误:', error2);
  
  // 测试3：列出所有用户
  console.log('\n=== 测试3: 列出所有用户 ===');
  const { data: allUsers, error: error3 } = await supabase
    .from('users')
    .select('id, name, nickname')
    .order('created_at', { ascending: false });
  
  console.log('总用户数:', allUsers?.length);
  allUsers?.forEach((u) => {
    console.log(`- ${u.name} (${u.nickname}) - ${u.id}`);
  });
}

testQuery();
