import { createClient } from '@supabase/supabase-js';

// Render Supabase（目标数据库）
const targetUrl = 'https://cezhwkwlkhnikihfjres.supabase.co';
const targetKey = 'sb_publishable_5UDF5MyHJz6tZi3aV9_gyw_8MgaQUM7';

const targetClient = createClient(targetUrl, targetKey);

async function testFeedbackWithUser() {
  console.log('=== 测试用户反馈功能 ===\n');

  // 1. 获取一个普通用户
  const { data: users, error: userError } = await targetClient
    .from('users')
    .select('*')
    .eq('name', '安安')
    .single();

  if (userError || !users) {
    console.log('❌ 获取用户失败:', userError?.message);
    return;
  }

  console.log('✅ 找到用户:', users.name);
  console.log('   用户 ID:', users.id);

  // 2. 创建一个测试反馈
  const { data: feedback, error: feedbackError } = await targetClient
    .from('feedbacks')
    .insert({
      user_id: users.id,
      content: '这是一个测试反馈，用于验证意见反馈功能是否正常。',
      contact: 'test@example.com',
      status: 'pending',
    })
    .select()
    .single();

  if (feedbackError) {
    console.log('\n❌ 创建反馈失败:', feedbackError.message);
    console.log('错误详情:', feedbackError);
    return;
  }

  console.log('\n✅ 反馈创建成功！');
  console.log('   反馈 ID:', feedback.id);
  console.log('   内容:', feedback.content);
  console.log('   联系方式:', feedback.contact);
  console.log('   状态:', feedback.status);
  console.log('   创建时间:', feedback.created_at);

  // 3. 验证反馈是否保存到数据库
  const { data: savedFeedback, error: checkError } = await targetClient
    .from('feedbacks')
    .select('*')
    .eq('id', feedback.id)
    .single();

  if (checkError) {
    console.log('\n❌ 验证失败:', checkError.message);
    return;
  }

  console.log('\n✅ 反馈验证成功！数据已正确保存到数据库。');

  // 4. 获取用户的所有反馈
  const { data: userFeedbacks, error: listError } = await targetClient
    .from('feedbacks')
    .select('*')
    .eq('user_id', users.id)
    .order('created_at', { ascending: false });

  if (listError) {
    console.log('\n❌ 获取用户反馈列表失败:', listError.message);
    return;
  }

  console.log('\n✅ 用户反馈列表：');
  console.log(`   共 ${userFeedbacks?.length || 0} 条反馈`);
  userFeedbacks?.forEach((f, i) => {
    console.log(`   ${i + 1}. ${f.content.substring(0, 20)}... (${f.status})`);
  });

  console.log('\n✅ 测试完成！意见反馈功能正常。');
}

testFeedbackWithUser();
