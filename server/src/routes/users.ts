import express from "express";
import bcrypt from "bcrypt";
import multer from "multer";
import sharp from "sharp";
import { getSupabaseClient } from "../storage/database/supabase-client.js";
import {
  users,
  insertUserSchema,
  updateUserSchema,
  updatePasswordSchema,
} from "../storage/database/shared/schema.js";

const router = express.Router();

// 配置文件上传
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// 获取所有用户（仅管理员）- 包含明文密码
router.get("/", async (req, res) => {
  try {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    // 移除加密密码字段，但保留明文密码
    const usersWithPlainPassword = data.map((user: any) => {
      const { password, ...rest } = user;
      return rest;
    });

    res.json({ success: true, data: usersWithPlainPassword });
  } catch (error) {
    console.error("获取用户列表失败:", error);
    res.status(500).json({ success: false, error: "获取用户列表失败" });
  }
});

// 根据用户名获取单个用户（用于登录）
router.get("/by-name/:name", async (req, res) => {
  try {
    const { name } = req.params;
    const client = getSupabaseClient();
    const { data, error } = await client
      .from("users")
      .select("*")
      .eq("name", name)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return res.json({ success: true, data: null });
      }
      throw error;
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error("获取用户失败:", error);
    res.status(500).json({ success: false, error: "获取用户失败" });
  }
});

// 获取单个用户
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const client = getSupabaseClient();
    const { data, error } = await client
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({ success: false, error: "用户不存在" });
      }
      throw error;
    }

    // 移除密码字段
    const { password, ...userWithoutPassword } = data;
    res.json({ success: true, data: userWithoutPassword });
  } catch (error) {
    console.error("获取用户失败:", error);
    res.status(500).json({ success: false, error: "获取用户失败" });
  }
});

// 创建新用户
router.post("/", async (req, res) => {
  try {
    const validatedData = insertUserSchema.parse(req.body);
    
    // 检查用户名是否已存在
    const client = getSupabaseClient();
    const { data: existingUser } = await client
      .from("users")
      .select("id")
      .eq("name", validatedData.name)
      .single();

    if (existingUser) {
      return res.status(400).json({ success: false, error: "用户名已存在" });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // 创建用户（同时保存明文密码用于管理员查看）
    const { data, error } = await client
      .from("users")
      .insert({
        ...validatedData,
        password: hashedPassword,
        password_plain: validatedData.password,
      })
      .select()
      .single();

    if (error) throw error;

    // 移除密码字段
    const { password, ...userWithoutPassword } = data;
    res.status(201).json({ success: true, data: userWithoutPassword });
  } catch (error) {
    console.error("创建用户失败:", error);
    if (error.name === "ZodError") {
      return res.status(400).json({ success: false, error: error.errors[0].message });
    }
    res.status(500).json({ success: false, error: "创建用户失败" });
  }
});

// 更新用户信息
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = updateUserSchema.parse(req.body);

    const client = getSupabaseClient();
    const { data, error } = await client
      .from("users")
      .update(validatedData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({ success: false, error: "用户不存在" });
      }
      throw error;
    }

    // 移除密码字段
    const { password, ...userWithoutPassword } = data;
    res.json({ success: true, data: userWithoutPassword });
  } catch (error) {
    console.error("更新用户失败:", error);
    if (error.name === "ZodError") {
      return res.status(400).json({ success: false, error: error.errors[0].message });
    }
    res.status(500).json({ success: false, error: "更新用户失败" });
  }
});

// 更新用户密码
router.put("/:id/password", async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = updatePasswordSchema.parse(req.body);

    // 加密新密码
    const hashedPassword = await bcrypt.hash(validatedData.newPassword, 10);

    const client = getSupabaseClient();
    const { data, error } = await client
      .from("users")
      .update({ 
        password: hashedPassword,
        password_plain: validatedData.newPassword // 同时保存明文密码用于管理员查看
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({ success: false, error: "用户不存在" });
      }
      throw error;
    }

    res.json({ success: true, message: "密码更新成功" });
  } catch (error) {
    console.error("更新密码失败:", error);
    if (error.name === "ZodError") {
      return res.status(400).json({ success: false, error: error.errors[0].message });
    }
    res.status(500).json({ success: false, error: "更新密码失败" });
  }
});

// 登录验证（验证用户名和密码）
router.post("/login", async (req, res) => {
  try {
    const { name, password } = req.body;
    
    if (!name || !password) {
      return res.status(400).json({ success: false, error: "用户名和密码不能为空" });
    }

    // 获取用户信息（包含密码）
    const client = getSupabaseClient();
    const { data: user, error } = await client
      .from("users")
      .select("*")
      .eq("name", name)
      .single();

    if (error || !user) {
      return res.status(401).json({ success: false, error: "用户名或密码错误" });
    }

    // 验证密码
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, error: "用户名或密码错误" });
    }

    // 返回用户信息（不包含密码）
    const { password: _, ...userWithoutPassword } = user;
    res.json({ success: true, data: userWithoutPassword });
  } catch (error) {
    console.error("登录失败:", error);
    res.status(500).json({ success: false, error: "登录失败" });
  }
});

// 验证当前密码（用于修改密码前验证）
router.post("/:id/verify-password", async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword } = req.body;

    if (!currentPassword) {
      return res.status(400).json({ success: false, error: "当前密码不能为空" });
    }

    const client = getSupabaseClient();
    const { data: user, error } = await client
      .from("users")
      .select("password")
      .eq("id", id)
      .single();

    if (error || !user) {
      return res.status(404).json({ success: false, error: "用户不存在" });
    }

    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    res.json({ success: true, valid: passwordMatch });
  } catch (error) {
    console.error("验证密码失败:", error);
    res.status(500).json({ success: false, error: "验证密码失败" });
  }
});

// 管理员重置用户密码（不需要知道旧密码）
router.put("/:id/reset-password", async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || !newPassword.trim()) {
      return res.status(400).json({ success: false, error: "新密码不能为空" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const client = getSupabaseClient();
    const { error } = await client
      .from("users")
      .update({ 
        password: hashedPassword,
        password_plain: newPassword // 同时保存明文密码用于管理员查看
      })
      .eq("id", id);

    if (error) throw error;

    res.json({ success: true, message: "密码重置成功" });
  } catch (error) {
    console.error("重置密码失败:", error);
    res.status(500).json({ success: false, error: "重置密码失败" });
  }
});

// 上传用户头像 - 压缩后使用 base64 存储
router.post("/upload-avatar", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "请选择要上传的图片" });
    }

    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, error: "用户ID不能为空" });
    }

    // 使用 sharp 压缩图片
    const compressedBuffer = await sharp(req.file.buffer)
      .resize(200, 200, { fit: 'cover', position: 'center' }) // 压缩到 200x200
      .jpeg({ quality: 80 }) // JPEG 格式，质量 80%
      .toBuffer();
    
    // 将压缩后的图片转为 base64
    const base64Image = compressedBuffer.toString('base64');
    const dataUrl = `data:image/jpeg;base64,${base64Image}`;
    
    console.log("头像已压缩并转为 base64，原始大小:", req.file.size, "压缩后:", compressedBuffer.length, "base64长度:", dataUrl.length);
    
    // 如果 base64 太大（超过 100KB），返回错误
    if (dataUrl.length > 100 * 1024) {
      return res.status(400).json({ 
        success: false, 
        error: "图片太大，请选择较小的图片" 
      });
    }
    
    res.json({ success: true, url: dataUrl });
  } catch (error: any) {
    console.error("上传头像失败:", error);
    res.status(500).json({ 
      success: false, 
      error: "上传头像失败: " + (error.message || '未知错误') 
    });
  }
});

// 删除用户
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const client = getSupabaseClient();
    const { error } = await client
      .from("users")
      .delete()
      .eq("id", id);

    if (error) throw error;

    res.json({ success: true, message: "用户删除成功" });
  } catch (error) {
    console.error("删除用户失败:", error);
    res.status(500).json({ success: false, error: "删除用户失败" });
  }
});

export default router;
