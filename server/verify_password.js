import bcrypt from 'bcrypt';

const storedHash = '$2b$10$uLIW0p6vtdP4ufGpwCuAjOxxirKkWxIve/rPZJP1AG.c2PVi2nplq';
const password = '1234';

console.log('验证密码...');
console.log('存储的哈希:', storedHash);
console.log('尝试密码:', password);

const isValid = bcrypt.compareSync(password, storedHash);
console.log('验证结果:', isValid ? '✅ 正确' : '❌ 错误');

// 重新生成一个新的哈希来验证
const newHash = bcrypt.hashSync(password, 10);
console.log('新生成的哈希:', newHash);
const isNewValid = bcrypt.compareSync(password, newHash);
console.log('新哈希验证:', isNewValid ? '✅ 正确' : '❌ 错误');
