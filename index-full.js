import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';
import multer from 'multer';
import sharp from 'sharp';

// 从环境变量获取配置
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// 配置文件上传
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// 静态文件服务（用于管理后台）
app.use(express.static('public'));

// 健康检查
app.get('/api/v1/health', (req, res) => {
  res.set('Content-Type', 'application/json');
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ===== 用户相关 =====

// 获取所有用户（管理后台用）
app.get('/api/v1/users', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // 移除密码字段，但保留明文密码用于管理员查看
    const usersWithPlainPassword = data.map((user) => {
      const { password, ...rest } = user;
      return rest;
    });

    res.set('Content-Type', 'application/json');
    res.json({ success: true, data: usersWithPlainPassword });
  } catch (err) {
    console.error('获取用户列表失败:', err);
    res.set('Content-Type', 'application/json');
    res.status(500).json({ success: false, error: '获取用户列表失败' });
  }
});

// 用户登录
app.post('/api/v1/users/login', async (req, res) => {
  try {
    const { name, password } = req.body;

    if (!name || !password) {
      res.set('Content-Type', 'application/json');
      return res.status(400).json({ success: false, error: '用户名和密码不能为空' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('name', name)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        res.set('Content-Type', 'application/json');
        return res.status(401).json({ success: false, error: '用户名或密码错误' });
      }
      throw error;
    }

    // 验证密码（使用 bcrypt 比对）
    let isPasswordValid = false;
    if (user.password && user.password.startsWith('$2')) {
      // 使用 bcrypt 验证
      isPasswordValid = await bcrypt.compare(password, user.password);
    } else {
      // 明文密码比对（兼容旧数据）
      isPasswordValid = password === user.password_plain || password === user.password;
    }
    
    if (!isPasswordValid) {
      res.set('Content-Type', 'application/json');
      return res.status(401).json({ success: false, error: '用户名或密码错误' });
    }

    // 移除密码字段
    const { password: _, password_plain: __, ...userWithoutPassword } = user;
    res.set('Content-Type', 'application/json');
    res.json({ success: true, data: userWithoutPassword });
  } catch (err) {
    console.error('登录失败:', err);
    res.set('Content-Type', 'application/json');
    res.status(500).json({ success: false, error: '登录失败，请稍后重试' });
  }
});

// 根据用户名获取用户（用于检查用户名是否已存在）
app.get('/api/v1/users/by-name/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('name', name)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        res.set('Content-Type', 'application/json');
        return res.json({ success: true, data: null });
      }
      throw error;
    }

    // 移除密码字段
    const { password: _, password_plain: __, ...userWithoutPassword } = user;
    res.set('Content-Type', 'application/json');
    res.json({ success: true, data: userWithoutPassword });
  } catch (err) {
    console.error('获取用户失败:', err);
    res.set('Content-Type', 'application/json');
    res.status(500).json({ success: false, error: '获取用户失败' });
  }
});

// 根据ID获取用户
app.get('/api/v1/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        res.set('Content-Type', 'application/json');
        return res.status(404).json({ success: false, error: '用户不存在' });
      }
      throw error;
    }

    // 移除密码字段
    const { password, ...userWithoutPassword } = data;
    res.set('Content-Type', 'application/json');
    res.json({ success: true, data: userWithoutPassword });
  } catch (err) {
    console.error('获取用户失败:', err);
    res.set('Content-Type', 'application/json');
    res.status(500).json({ success: false, error: '获取用户失败' });
  }
});

// 创建新用户
app.post('/api/v1/users', async (req, res) => {
  try {
    const { name, password, nickname, avatar, age, gender, is_admin } = req.body;
    
    // 检查用户名是否已存在
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('name', name)
      .single();

    if (existingUser) {
      res.set('Content-Type', 'application/json');
      return res.status(400).json({ success: false, error: '用户名已存在' });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户（同时保存明文密码用于管理员查看）
    const { data, error } = await supabase
      .from('users')
      .insert({
        name,
        password: hashedPassword,
        password_plain: password,
        nickname,
        avatar,
        age,
        gender,
        is_admin: is_admin || false,
      })
      .select()
      .single();

    if (error) throw error;

    // 移除密码字段
    const { password: pwd, ...userWithoutPassword } = data;
    res.set('Content-Type', 'application/json');
    res.status(201).json({ success: true, data: userWithoutPassword });
  } catch (err) {
    console.error('创建用户失败:', err);
    res.set('Content-Type', 'application/json');
    res.status(500).json({ success: false, error: '创建用户失败' });
  }
});

// 更新用户信息
app.put('/api/v1/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // 如果更新中包含密码，需要加密
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
      updates.password_plain = req.body.password;
    }

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        res.set('Content-Type', 'application/json');
        return res.status(404).json({ success: false, error: '用户不存在' });
      }
      throw error;
    }

    // 移除密码字段
    const { password, ...userWithoutPassword } = data;
    res.set('Content-Type', 'application/json');
    res.json({ success: true, data: userWithoutPassword });
  } catch (err) {
    console.error('更新用户失败:', err);
    res.set('Content-Type', 'application/json');
    res.status(500).json({ success: false, error: '更新用户失败' });
  }
});

// 更新用户密码
app.put('/api/v1/users/:id/password', async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      res.set('Content-Type', 'application/json');
      return res.status(400).json({ success: false, error: '新密码不能为空' });
    }

    // 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const { data, error } = await supabase
      .from('users')
      .update({ 
        password: hashedPassword,
        password_plain: newPassword
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        res.set('Content-Type', 'application/json');
        return res.status(404).json({ success: false, error: '用户不存在' });
      }
      throw error;
    }

    res.set('Content-Type', 'application/json');
    res.json({ success: true, message: '密码更新成功' });
  } catch (err) {
    console.error('更新密码失败:', err);
    res.set('Content-Type', 'application/json');
    res.status(500).json({ success: false, error: '更新密码失败' });
  }
});

// 验证当前密码
app.post('/api/v1/users/:id/verify-password', async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword } = req.body;

    if (!currentPassword) {
      res.set('Content-Type', 'application/json');
      return res.status(400).json({ success: false, error: '当前密码不能为空' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('password, password_plain')
      .eq('id', id)
      .single();

    if (error || !user) {
      res.set('Content-Type', 'application/json');
      return res.status(404).json({ success: false, error: '用户不存在' });
    }

    // 验证密码
    let isValid = false;
    if (user.password && user.password.startsWith('$2')) {
      isValid = await bcrypt.compare(currentPassword, user.password);
    } else {
      isValid = currentPassword === user.password_plain || currentPassword === user.password;
    }

    res.set('Content-Type', 'application/json');
    res.json({ success: true, valid: isValid });
  } catch (err) {
    console.error('验证密码失败:', err);
    res.set('Content-Type', 'application/json');
    res.status(500).json({ success: false, error: '验证密码失败' });
  }
});

// 管理员重置用户密码
app.put('/api/v1/users/:id/reset-password', async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || !newPassword.trim()) {
      res.set('Content-Type', 'application/json');
      return res.status(400).json({ success: false, error: '新密码不能为空' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const { error } = await supabase
      .from('users')
      .update({ 
        password: hashedPassword,
        password_plain: newPassword
      })
      .eq('id', id);

    if (error) throw error;

    res.set('Content-Type', 'application/json');
    res.json({ success: true, message: '密码重置成功' });
  } catch (err) {
    console.error('重置密码失败:', err);
    res.set('Content-Type', 'application/json');
    res.status(500).json({ success: false, error: '重置密码失败' });
  }
});

// 上传用户头像
app.post('/api/v1/users/upload-avatar', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      res.set('Content-Type', 'application/json');
      return res.status(400).json({ success: false, error: '请选择要上传的图片' });
    }

    const { userId } = req.body;
    if (!userId) {
      res.set('Content-Type', 'application/json');
      return res.status(400).json({ success: false, error: '用户ID不能为空' });
    }

    // 使用 sharp 压缩图片
    const compressedBuffer = await sharp(req.file.buffer)
      .resize(200, 200, { fit: 'cover', position: 'center' })
      .jpeg({ quality: 80 })
      .toBuffer();
    
    // 将压缩后的图片转为 base64
    const base64Image = compressedBuffer.toString('base64');
    const dataUrl = `data:image/jpeg;base64,${base64Image}`;
    
    console.log('头像已压缩，原始大小:', req.file.size, '压缩后:', compressedBuffer.length, 'base64长度:', dataUrl.length);
    
    // 如果 base64 太大（超过 100KB），返回错误
    if (dataUrl.length > 100 * 1024) {
      res.set('Content-Type', 'application/json');
      return res.status(400).json({ 
        success: false, 
        error: '图片太大，请选择较小的图片' 
      });
    }
    
    res.set('Content-Type', 'application/json');
    res.json({ success: true, url: dataUrl });
  } catch (err) {
    console.error('上传头像失败:', err);
    res.set('Content-Type', 'application/json');
    res.status(500).json({ 
      success: false, 
      error: '上传头像失败: ' + (err.message || '未知错误')
    });
  }
});

// 删除用户
app.delete('/api/v1/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.set('Content-Type', 'application/json');
    res.json({ success: true, message: '用户删除成功' });
  } catch (err) {
    console.error('删除用户失败:', err);
    res.set('Content-Type', 'application/json');
    res.status(500).json({ success: false, error: '删除用户失败' });
  }
});

// ===== 分类相关 =====
app.get('/api/v1/categories', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('order', { ascending: true });
    
    if (error) throw error;
    res.set('Content-Type', 'application/json');
    res.json(data);
  } catch (err) {
    console.error('获取分类失败:', err);
    res.set('Content-Type', 'application/json');
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/v1/categories', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .insert([req.body])
      .select()
      .single();

    if (error) throw error;
    res.set('Content-Type', 'application/json');
    res.status(201).json(data);
  } catch (err) {
    console.error('创建分类失败:', err);
    res.set('Content-Type', 'application/json');
    res.status(500).json({ error: err.message });
  }
});

// ===== 交易相关 =====
app.get('/api/v1/transactions', async (req, res) => {
  try {
    const { user_id, start_date, end_date, type } = req.query;
    let query = supabase.from('transactions').select('*, categories(*)').order('date', { ascending: false });

    if (user_id) query = query.eq('user_id', user_id);
    if (start_date) query = query.gte('date', start_date);
    if (end_date) query = query.lte('date', end_date);
    if (type) query = query.eq('type', type);

    const { data, error } = await query;
    
    if (error) throw error;
    res.set('Content-Type', 'application/json');
    res.json(data);
  } catch (err) {
    console.error('获取交易记录失败:', err);
    res.set('Content-Type', 'application/json');
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/v1/transactions', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .insert([req.body])
      .select()
      .single();

    if (error) throw error;
    res.set('Content-Type', 'application/json');
    res.status(201).json(data);
  } catch (err) {
    console.error('创建交易记录失败:', err);
    res.set('Content-Type', 'application/json');
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/v1/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('transactions')
      .update(req.body)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.set('Content-Type', 'application/json');
    res.json(data);
  } catch (err) {
    console.error('更新交易记录失败:', err);
    res.set('Content-Type', 'application/json');
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/v1/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.set('Content-Type', 'application/json');
    res.status(204).send();
  } catch (err) {
    console.error('删除交易记录失败:', err);
    res.set('Content-Type', 'application/json');
    res.status(500).json({ error: err.message });
  }
});

// 清除用户所有交易记录
app.delete('/api/v1/transactions/clear-all', async (req, res) => {
  try {
    const { user_id } = req.query;
    
    if (!user_id) {
      res.set('Content-Type', 'application/json');
      return res.status(400).json({ success: false, error: '用户ID不能为空' });
    }

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('user_id', user_id);

    if (error) throw error;
    res.set('Content-Type', 'application/json');
    res.json({ success: true, message: '所有交易记录已清除' });
  } catch (err) {
    console.error('清除交易记录失败:', err);
    res.set('Content-Type', 'application/json');
    res.status(500).json({ error: err.message });
  }
});

// ===== 反馈相关 =====
app.get('/api/v1/feedbacks', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('feedbacks')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.set('Content-Type', 'application/json');
    res.json(data);
  } catch (err) {
    console.error('获取反馈失败:', err);
    res.set('Content-Type', 'application/json');
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/v1/feedbacks', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('feedbacks')
      .insert([req.body])
      .select()
      .single();

    if (error) throw error;
    res.set('Content-Type', 'application/json');
    res.status(201).json(data);
  } catch (err) {
    console.error('提交反馈失败:', err);
    res.set('Content-Type', 'application/json');
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
