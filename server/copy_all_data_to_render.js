import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';

// Render Supabase（目标数据库）
const targetUrl = 'https://cezhwkwlkhnikihfjres.supabase.co';
const targetKey = 'sb_publishable_5UDF5MyHJz6tZi3aV9_gyw_8MgaQUM7';

const targetClient = createClient(targetUrl, targetKey);

// 源数据库中的用户数据（从 SQL 查询获取）
const sourceUsers = [
  {
    id: '4b443ebf-a9c9-44bc-bbfb-733330cc9f9f',
    name: 'test',
    nickname: 'test',
    bio: '好几年了空间空军呕吐',
    password_plain: '',
    avatar: 'frog',
    avatar_type: 'custom',
    avatar_url: 'https://picsum.photos/seed/1771695398028y1vcnn/200/200',
    age: 28,
    gender: 'male',
    is_admin: false,
  },
  {
    id: 'ef4ca30d-61be-443f-8319-7a2443c11f0c',
    name: '抽烟罚款',
    nickname: '抽烟罚款',
    bio: '老爸一次抽烟罚10元10次抽烟罚100元，绝对让他赔个倾家荡产。本次不计支出只计收入看一下一个月有多少。',
    password_plain: '1234',
    avatar: 'rabbit',
    avatar_type: 'preset',
    avatar_url: null,
    age: 65,
    gender: 'female',
    is_admin: false,
  },
  {
    id: '0530ca24-ff85-43df-a939-89b2df092f24',
    name: '啦啦',
    nickname: '娜姐',
    bio: null,
    password_plain: '1111',
    avatar: 'dragon',
    avatar_type: 'preset',
    avatar_url: null,
    age: 55,
    gender: 'female',
    is_admin: false,
  },
  {
    id: 'aaf035dc-e717-4ae3-b1a5-9560dca3ea88',
    name: '英语复习',
    nickname: '老爸安安',
    bio: null,
    password_plain: '1234',
    avatar: 'cat',
    avatar_type: 'preset',
    avatar_url: null,
    age: 48,
    gender: 'female',
    is_admin: false,
  },
  {
    id: '3a11b712-4d8e-4a83-a280-5d787b1a56b2',
    name: 'admin',
    nickname: '超级管理员',
    bio: '我是一个兵。',
    password_plain: '',
    avatar: 'apple-whole',
    avatar_type: 'custom',
    avatar_url: 'data:image/jpeg;base64,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',
    age: 30,
    gender: 'male',
    is_admin: true,
  },
  {
    id: '9aad0f11-e602-4be2-902b-95a58b27cc79',
    name: '舒畅',
    nickname: '畅畅',
    bio: null,
    password_plain: '1111',
    avatar: 'cat',
    avatar_type: 'preset',
    avatar_url: null,
    age: 55,
    gender: 'female',
    is_admin: false,
  },
];

// 源数据库中的交易记录数据
const sourceTransactions = [
  { id: '999b6f7a-99bd-45bd-9eaf-58376838cc58', user_id: '4b443ebf-a9c9-44bc-bbfb-733330cc9f9f', amount: '50', type: 'income', category_id: '1', description: null, transaction_date: '2026-02-22T01:37:14.248+08:00' },
  { id: 'de5482ff-cf0c-4aa4-bfef-42077bd9c25c', user_id: '4b443ebf-a9c9-44bc-bbfb-733330cc9f9f', amount: '99', type: 'income', category_id: '3', description: null, transaction_date: '2026-02-22T03:14:11.497+08:00' },
  { id: '16a92331-f2d0-4b41-b415-bdc99321acce', user_id: '4b443ebf-a9c9-44bc-bbfb-733330cc9f9f', amount: '52', type: 'expense', category_id: '44da63d5-b44c-4f5c-9321-45c947c360d8', description: null, transaction_date: '2026-02-22T03:14:19.014+08:00' },
  { id: 'eae8b12a-a1c1-4771-ad36-42542dfd8db6', user_id: '0bc5eeb0-5e26-4d08-9a57-c87b0b2f9b8f', amount: '300', type: 'income', category_id: 'bd32543a-a4fe-40d5-8437-32170c2d51b8', description: '姨婆', transaction_date: '2026-02-22T00:00:00+08:00' },
  { id: '8e4a1f01-6bc9-4ec1-bb8a-dc0488c3968e', user_id: '0bc5eeb0-5e26-4d08-9a57-c87b0b2f9b8f', amount: '166', type: 'income', category_id: 'bd32543a-a4fe-40d5-8437-32170c2d51b8', description: '张姑婆', transaction_date: '2026-02-22T00:00:00+08:00' },
  { id: '80c1616e-31f0-445e-9383-300634f10042', user_id: '0bc5eeb0-5e26-4d08-9a57-c87b0b2f9b8f', amount: '200', type: 'income', category_id: 'bd32543a-a4fe-40d5-8437-32170c2d51b8', description: '舒畅', transaction_date: '2026-02-22T00:00:00+08:00' },
  { id: '8272ce2a-ab62-4725-abfa-722aa621bd48', user_id: '0bc5eeb0-5e26-4d08-9a57-c87b0b2f9b8f', amount: '200', type: 'income', category_id: 'bd32543a-a4fe-40d5-8437-32170c2d51b8', description: '三舅公', transaction_date: '2026-02-22T00:00:00+08:00' },
  { id: '812dc13e-2bcd-4863-9c47-5f4f212edbfa', user_id: '0bc5eeb0-5e26-4d08-9a57-c87b0b2f9b8f', amount: '200', type: 'income', category_id: 'bd32543a-a4fe-40d5-8437-32170c2d51b8', description: '大舅婆', transaction_date: '2026-02-22T00:00:00+08:00' },
  { id: '5cc5274b-2272-46af-a5cc-f79a0dac50c5', user_id: '0bc5eeb0-5e26-4d08-9a57-c87b0b2f9b8f', amount: '500', type: 'income', category_id: 'bd32543a-a4fe-40d5-8437-32170c2d51b8', description: '大舅公', transaction_date: '2026-02-22T00:00:00+08:00' },
  { id: 'df97c93b-32b8-4f12-b2bb-606b991e0f0a', user_id: '0bc5eeb0-5e26-4d08-9a57-c87b0b2f9b8f', amount: '200', type: 'income', category_id: 'bd32543a-a4fe-40d5-8437-32170c2d51b8', description: '大姨', transaction_date: '2026-02-22T00:00:00+08:00' },
  { id: '68284207-274d-4180-a931-dbee6bb676b2', user_id: '0bc5eeb0-5e26-4d08-9a57-c87b0b2f9b8f', amount: '300', type: 'income', category_id: 'bd32543a-a4fe-40d5-8437-32170c2d51b8', description: '小祖祖', transaction_date: '2026-02-22T00:00:00+08:00' },
  { id: '5c2f90ad-1b9b-4365-b2c0-08dda16311a1', user_id: '0bc5eeb0-5e26-4d08-9a57-c87b0b2f9b8f', amount: '300', type: 'income', category_id: 'bd32543a-a4fe-40d5-8437-32170c2d51b8', description: '大祖祖', transaction_date: '2026-02-22T00:00:00+08:00' },
  { id: '5d1ef25a-2986-45f8-b3bd-a5385694d0ea', user_id: '0bc5eeb0-5e26-4d08-9a57-c87b0b2f9b8f', amount: '50', type: 'income', category_id: 'bd32543a-a4fe-40d5-8437-32170c2d51b8', description: '千千姐姐', transaction_date: '2026-02-22T00:00:00+08:00' },
  { id: '3c177c8a-0762-4387-bb2f-7751f1fb1ff7', user_id: '0bc5eeb0-5e26-4d08-9a57-c87b0b2f9b8f', amount: '500', type: 'income', category_id: 'bd32543a-a4fe-40d5-8437-32170c2d51b8', description: '姑妈姑爹', transaction_date: '2026-02-22T00:00:00+08:00' },
  { id: '17f80d4f-c7a1-48cc-9f5c-f57b4985a281', user_id: '0bc5eeb0-5e26-4d08-9a57-c87b0b2f9b8f', amount: '300', type: 'income', category_id: 'bd32543a-a4fe-40d5-8437-32170c2d51b8', description: '星星姐姐', transaction_date: '2026-02-22T00:00:00+08:00' },
  { id: '9f2dd593-a8f1-4edf-aa77-6e6bcd914463', user_id: '0bc5eeb0-5e26-4d08-9a57-c87b0b2f9b8f', amount: '2026', type: 'income', category_id: 'bd32543a-a4fe-40d5-8437-32170c2d51b8', description: '外公外婆', transaction_date: '2026-02-22T00:00:00+08:00' },
  { id: '340bbd24-ceea-4eac-8887-4ace11009ed7', user_id: '0bc5eeb0-5e26-4d08-9a57-c87b0b2f9b8f', amount: '200', type: 'income', category_id: 'bd32543a-a4fe-40d5-8437-32170c2d51b8', description: '舅舅', transaction_date: '2026-02-22T00:00:00+08:00' },
  { id: 'cb24f2b0-1099-4e61-b043-89362ace526e', user_id: '0bc5eeb0-5e26-4d08-9a57-c87b0b2f9b8f', amount: '400', type: 'income', category_id: 'bd32543a-a4fe-40d5-8437-32170c2d51b8', description: '爸爸', transaction_date: '2026-02-22T00:00:00+08:00' },
  { id: '20fce91d-f0b3-4d88-bcd7-32cb6582a4f1', user_id: '0bc5eeb0-5e26-4d08-9a57-c87b0b2f9b8f', amount: '200', type: 'income', category_id: 'bd32543a-a4fe-40d5-8437-32170c2d51b8', description: '婆婆', transaction_date: '2026-02-22T00:00:00+08:00' },
  { id: '9975eedd-b348-420f-a712-fbb5c3a6d8dc', user_id: '0bc5eeb0-5e26-4d08-9a57-c87b0b2f9b8f', amount: '81', type: 'expense', category_id: '44da63d5-b44c-4f5c-9321-45c947c360d8', description: '支出', transaction_date: '2026-02-22T00:00:00+08:00' },
  { id: '75aaa421-c82c-4013-8a03-7e8cd28fbef9', user_id: '3a11b712-4d8e-4a83-a280-5d787b1a56b2', amount: '500', type: 'income', category_id: '1', description: null, transaction_date: '2026-02-22T04:59:39.671+08:00' },
  { id: '525dc07f-3be5-4713-bdfb-b830c21c0df2', user_id: 'ef4ca30d-61be-443f-8319-7a2443c11f0c', amount: '10', type: 'income', category_id: '3b74fbcb-bc8f-4cf5-9a22-bede8bdc4654', description: null, transaction_date: '2026-02-22T22:17:39.877+08:00' },
  { id: '21e5ed4a-c730-49d3-a707-f1f524f7e4ce', user_id: '3a11b712-4d8e-4a83-a280-5d787b1a56b2', amount: '5', type: 'income', category_id: '1', description: '测试', transaction_date: '2026-02-22T04:59:51.992+08:00' },
  { id: '62bf4d94-629e-413b-87dd-f844424f86ed', user_id: 'aaf035dc-e717-4ae3-b1a5-9560dca3ea88', amount: '10', type: 'income', category_id: 'f97d7ddc-919e-4529-afba-593a118a9b69', description: null, transaction_date: '2026-02-23T10:54:41.036+08:00' },
  { id: 'e4dd9344-e68f-4b82-a85d-2f04df5ebeea', user_id: '0bc5eeb0-5e26-4d08-9a57-c87b0b2f9b8f', amount: '8', type: 'expense', category_id: '990449dc-cdf8-436c-8f68-7d51ec37bda2', description: null, transaction_date: '2026-02-23T21:54:57.097+08:00' },
];

async function copyAllData() {
  console.log('=== 复制所有用户和交易记录 ===\n');

  // 1. 检查目标数据库中已存在的用户
  console.log('1. 检查已存在的用户...');
  const { data: existingUsers } = await targetClient
    .from('users')
    .select('name')
    .order('created_at', { ascending: false });

  const existingNames = existingUsers?.map(u => u.name) || [];
  console.log(`   已存在 ${existingNames.length} 个用户:`, existingNames.join(', '));

  // 2. 复制用户（跳过已存在的）
  console.log('\n2. 复制用户...');
  let copiedUsers = 0;
  let skippedUsers = 0;

  for (const user of sourceUsers) {
    if (existingNames.includes(user.name)) {
      console.log(`   ⏭️  跳过已存在用户: ${user.name}`);
      skippedUsers++;
      continue;
    }

    // 重新生成密码哈希
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

  // 3. 复制交易记录
  console.log('\n3. 复制交易记录...');
  
  // 获取目标数据库中已有的交易记录ID
  const { data: existingTransactions } = await targetClient
    .from('transactions')
    .select('id');
  const existingTransIds = existingTransactions?.map(t => t.id) || [];

  let copiedTransactions = 0;
  let skippedTransactions = 0;

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

  // 4. 验证结果
  console.log('\n4. 验证结果...');
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
