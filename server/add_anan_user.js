import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';

const supabaseUrl = 'https://cezhwkwlkhnikihfjres.supabase.co';
const supabaseKey = 'sb_publishable_5UDF5MyHJz6tZi3aV9_gyw_8MgaQUM7';

const supabase = createClient(supabaseUrl, supabaseKey);

async function addAnAnUser() {
  console.log('=== 添加"安安"用户 ===\n');
  
  // 1. 创建用户"安安"
  console.log('1. 创建用户"安安"...');
  const hashedPassword = bcrypt.hashSync('1234', 10);
  
  const { data: newUser, error: createError } = await supabase
    .from('users')
    .insert({
      name: '安安',
      nickname: '小安安',
      bio: '我爱零食',
      password: hashedPassword,
      password_plain: '1234',
      avatar: 'horse',
      avatar_type: 'custom',
      age: 10,
      gender: '女',
      is_admin: false,
    })
    .select()
    .single();
  
  if (createError) {
    console.log('❌ 创建用户失败:', createError);
    return;
  }
  
  console.log('✅ 用户创建成功!');
  console.log(`   用户ID: ${newUser.id}`);
  console.log(`   用户名: ${newUser.name}`);
  console.log(`   昵称: ${newUser.nickname}`);
  console.log(`   签名: ${newUser.bio}`);
  
  const userId = newUser.id;
  
  // 2. 查找"压岁钱"和"零食"分类
  console.log('\n2. 查找分类...');
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .in('name', ['压岁钱', '零食']);
  
  const 压岁钱Category = categories?.find(c => c.name === '压岁钱');
  const 零食Category = categories?.find(c => c.name === '零食');
  
  console.log(`   压岁钱分类ID: ${压岁钱Category?.id || '未找到'}`);
  console.log(`   零食分类ID: ${零食Category?.id || '未找到'}`);
  
  if (!压岁钱Category || !零食Category) {
    console.log('❌ 分类不存在，无法添加交易记录');
    return;
  }
  
  // 3. 添加交易记录
  console.log('\n3. 添加交易记录...');
  const transactions = [
    { amount: -80, type: 'expense', category_id: 零食Category.id, description: '支出' },
    { amount: 166, type: 'income', category_id: 压岁钱Category.id, description: '张姑婆' },
    { amount: 200, type: 'income', category_id: 压岁钱Category.id, description: '舒畅' },
    { amount: 200, type: 'income', category_id: 压岁钱Category.id, description: '三舅公' },
    { amount: 200, type: 'income', category_id: 压岁钱Category.id, description: '大舅婆' },
    { amount: 500, type: 'income', category_id: 压岁钱Category.id, description: '大舅公' },
    { amount: 200, type: 'income', category_id: 压岁钱Category.id, description: '大姨' },
    { amount: 300, type: 'income', category_id: 压岁钱Category.id, description: '小祖祖' },
    { amount: 300, type: 'income', category_id: 压岁钱Category.id, description: '大祖祖' },
    { amount: 300, type: 'income', category_id: 压岁钱Category.id, description: '姨婆' },
    { amount: 500, type: 'income', category_id: 压岁钱Category.id, description: '姑妈姑爹' },
    { amount: 300, type: 'income', category_id: 压岁钱Category.id, description: '星星姐姐' },
    { amount: 2026, type: 'income', category_id: 压岁钱Category.id, description: '外公外婆' },
    { amount: 200, type: 'income', category_id: 压岁钱Category.id, description: '舅舅' },
    { amount: 400, type: 'income', category_id: 压岁钱Category.id, description: '爸爸' },
    { amount: 200, type: 'income', category_id: 压岁钱Category.id, description: '婆婆' },
    { amount: -81, type: 'expense', category_id: 零食Category.id, description: '支出' },
    { amount: 50, type: 'income', category_id: 压岁钱Category.id, description: '千千姐姐' },
  ];
  
  const transactionsWithUserId = transactions.map((t, index) => ({
    user_id: userId,
    amount: t.amount,
    type: t.type,
    category_id: t.category_id,
    description: t.description,
    transaction_date: new Date(Date.now() - (index * 86400000)).toISOString(),
  }));
  
  const { data: insertedTransactions, error: insertError } = await supabase
    .from('transactions')
    .insert(transactionsWithUserId)
    .select();
  
  if (insertError) {
    console.log('❌ 添加交易记录失败:', insertError);
  } else {
    console.log(`✅ 成功添加 ${insertedTransactions.length} 条交易记录!`);
    
    // 计算统计
    const totalIncome = insertedTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const totalExpense = insertedTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0);
    
    console.log(`\n   总收入: ¥${totalIncome.toFixed(2)}`);
    console.log(`   总支出: ¥${totalExpense.toFixed(2)}`);
    console.log(`   余额: ¥${(totalIncome - totalExpense).toFixed(2)}`);
  }
  
  console.log('\n✅ 完成！现在可以用"安安"账户登录了。');
  console.log('   用户名: 安安');
  console.log('   密码: 1234');
}

addAnAnUser();
