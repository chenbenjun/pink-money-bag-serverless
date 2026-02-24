import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';

// 沙箱 Supabase（源数据库）
const sourceUrl = process.env.SUPABASE_URL;
const sourceKey = process.env.SUPABASE_ANON_KEY;

// Render Supabase（目标数据库）
const targetUrl = 'https://cezhwkwlkhnikihfjres.supabase.co';
const targetKey = 'sb_publishable_5UDF5MyHJz6tZi3aV9_gyw_8MgaQUM7';

const sourceClient = createClient(sourceUrl, sourceKey);
const targetClient = createClient(targetUrl, targetKey);

async function copyAllData() {
  console.log('=== 开始复制所有用户数据 ===\n');

  // 1. 获取源数据库中的所有用户
  console.log('1. 获取源数据库中的所有用户...');
  const { data: sourceUsers, error: usersError } = await sourceClient
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (usersError) {
    console.log('❌ 获取用户失败:', usersError);
    return;
  }

  console.log(`✅ 找到 ${sourceUsers.length} 个用户`);
  sourceUsers.forEach((u) => {
    console.log(`   - ${u.name} (${u.nickname}) - ID: ${u.id}`);
  });

  // 2. 获取源数据库中的所有交易记录
  console.log('\n2. 获取源数据库中的所有交易记录...');
  const { data: sourceTransactions, error: transError } = await sourceClient
    .from('transactions')
    .select('*')
    .order('transaction_date', { ascending: false });

  if (transError) {
    console.log('❌ 获取交易记录失败:', transError);
    return;
  }

  console.log(`✅ 找到 ${sourceTransactions.length} 条交易记录`);

  // 3. 检查目标数据库中已存在的用户
  console.log('\n3. 检查目标数据库中已存在的用户...');
  const { data: existingUsers } = await targetClient
    .from('users')
    .select('name')
    .order('created_at', { ascending: false });

  const existingNames = existingUsers?.map(u => u.name) || [];
  console.log(`   已存在 ${existingNames.length} 个用户:`, existingNames.join(', '));

  // 4. 复制用户（跳过已存在的）
  console.log('\n4. 复制用户到目标数据库...');
  let copiedUsers = 0;
  let skippedUsers = 0;

  for (const user of sourceUsers) {
    if (existingNames.includes(user.name)) {
      console.log(`   ⏭️  跳过已存在用户: ${user.name}`);
      skippedUsers++;
      continue;
    }

    // 重新生成密码哈希（使用 password_plain）
    const hashedPassword = bcrypt.hashSync(user.password_plain || '123456', 10);

    const { error: insertError } = await targetClient
      .from('users')
      .insert({
        id: user.id,
        name: user.name,
        nickname: user.nickname,
        bio: user.bio,
        password: hashedPassword,
        password_plain: user.password_plain,
        avatar: user.avatar,
        avatar_type: user.avatar_type,
        avatar_url: user.avatar_url,
        age: user.age,
        gender: user.gender,
        is_admin: user.is_admin,
      });

    if (insertError) {
      console.log(`   ❌ 复制用户失败 ${user.name}:`, insertError.message);
    } else {
      console.log(`   ✅ 复制用户: ${user.name}`);
      copiedUsers++;
    }
  }

  console.log(`\n   新增用户: ${copiedUsers} 个`);
  console.log(`   跳过用户: ${skippedUsers} 个`);

  // 5. 复制交易记录
  console.log('\n5. 复制交易记录到目标数据库...');
  let copiedTransactions = 0;
  let skippedTransactions = 0;

  // 获取目标数据库中已有的交易记录ID
  const { data: existingTransactions } = await targetClient
    .from('transactions')
    .select('id');
  const existingTransIds = existingTransactions?.map(t => t.id) || [];

  for (const trans of sourceTransactions) {
    if (existingTransIds.includes(trans.id)) {
      skippedTransactions++;
      continue;
    }

    const { error: insertError } = await targetClient
      .from('transactions')
      .insert({
        id: trans.id,
        user_id: trans.user_id,
        amount: trans.amount,
        type: trans.type,
        category_id: trans.category_id,
        description: trans.description,
        transaction_date: trans.transaction_date,
      });

    if (insertError) {
      console.log(`   ❌ 复制交易失败:`, insertError.message);
    } else {
      copiedTransactions++;
    }
  }

  console.log(`   新增交易: ${copiedTransactions} 条`);
  console.log(`   跳过交易: ${skippedTransactions} 条`);

  // 6. 验证结果
  console.log('\n6. 验证目标数据库...');
  const { data: targetUsers } = await targetClient
    .from('users')
    .select('id, name, nickname')
    .order('created_at', { ascending: false });

  const { data: targetTransactions } = await targetClient
    .from('transactions')
    .select('*');

  console.log(`   用户总数: ${targetUsers?.length || 0}`);
  targetUsers?.forEach((u) => {
    console.log(`   - ${u.name} (${u.nickname})`);
  });

  console.log(`   交易记录总数: ${targetTransactions?.length || 0}`);

  console.log('\n✅ 数据复制完成！');
}

copyAllData();
