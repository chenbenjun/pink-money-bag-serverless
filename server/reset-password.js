import bcrypt from 'bcrypt';
import { getSupabaseClient } from './src/storage/database/supabase-client.js';

async function resetPassword() {
  console.log('=== 开始重置安安密码 ===');
  
  try {
    const client = getSupabaseClient();
    
    // 1. 查找安安用户
    const { data: user, error: findError } = await client
      .from('users')
      .select('id, name')
      .eq('name', '安安')
      .single();
    
    if (findError || !user) {
      console.log('找不到安安用户');
      return;
    }
    
    console.log('找到用户:', user.name, user.id);
    
    // 2. 加密密码 1234
    const hashedPassword = await bcrypt.hash('1234', 10);
    console.log('密码加密完成');
    
    // 3. 更新密码
    const { error: updateError } = await client
      .from('users')
      .update({ password: hashedPassword })
      .eq('id', user.id);
    
    if (updateError) {
      console.log('更新密码失败:', updateError);
      return;
    }
    
    console.log('✅ 安安密码已重置为: 1234');
    console.log('现在可以用 安安 / 1234 登录了');
    
  } catch (error) {
    console.error('重置密码失败:', error);
  }
}

resetPassword();
