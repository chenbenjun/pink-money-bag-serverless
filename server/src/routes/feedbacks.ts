import express from "express";
import { getSupabaseClient } from "../storage/database/supabase-client.js";
import { insertFeedbackSchema, updateFeedbackSchema } from "../storage/database/shared/schema.js";

const router = express.Router();

// 创建反馈
router.post("/", async (req, res) => {
  try {
    const { user_id, content, contact } = insertFeedbackSchema.parse(req.body);

    const client = getSupabaseClient();
    
    // 验证用户存在
    const { data: userExists, error: userError } = await client
      .from("users")
      .select("id, name, nickname")
      .eq("id", user_id)
      .single();

    if (userError || !userExists) {
      return res.status(404).json({ success: false, error: "用户不存在" });
    }

    // 创建反馈
    const { data, error } = await client
      .from("feedbacks")
      .insert({
        user_id,
        content,
        contact,
        status: "pending",
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error("创建反馈失败:", error);
    if (error.name === "ZodError") {
      return res.status(400).json({ success: false, error: error.errors[0].message });
    }
    res.status(500).json({ success: false, error: "创建反馈失败" });
  }
});

// 获取所有反馈（管理员）
router.get("/", async (req, res) => {
  try {
    const client = getSupabaseClient();
    // 先获取反馈列表
    const { data: feedbacksData, error: feedbacksError } = await client
      .from("feedbacks")
      .select("*")
      .order('created_at', { ascending: false });

    if (feedbacksError) throw feedbacksError;

    // 如果没有反馈，直接返回
    if (!feedbacksData || feedbacksData.length === 0) {
      return res.json({ success: true, data: [] });
    }

    // 获取所有用户信息
    const userIds = [...new Set(feedbacksData.map(f => f.user_id))];
    const { data: usersData, error: usersError } = await client
      .from("users")
      .select("id, name, nickname")
      .in("id", userIds);

    if (usersError) throw usersError;

    // 组合数据
    const userMap = new Map();
    if (usersData) {
      usersData.forEach(user => {
        userMap.set(user.id, user);
      });
    }

    const result = feedbacksData.map(feedback => ({
      ...feedback,
      user: userMap.get(feedback.user_id) || null
    }));

    res.json({ success: true, data: result });
  } catch (error) {
    console.error("获取反馈列表失败:", error);
    res.status(500).json({ success: false, error: "获取反馈列表失败" });
  }
});

// 获取用户的反馈列表
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const client = getSupabaseClient();
    const { data, error } = await client
      .from("feedbacks")
      .select("*")
      .eq("user_id", userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error("获取用户反馈失败:", error);
    res.status(500).json({ success: false, error: "获取用户反馈失败" });
  }
});

// 更新反馈状态和回复（管理员）
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reply } = updateFeedbackSchema.parse(req.body);

    const client = getSupabaseClient();
    const { data, error } = await client
      .from("feedbacks")
      .update({ 
        status,
        reply,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return res.status(404).json({ success: false, error: "反馈不存在" });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error("更新反馈失败:", error);
    if (error.name === "ZodError") {
      return res.status(400).json({ success: false, error: error.errors[0].message });
    }
    res.status(500).json({ success: false, error: "更新反馈失败" });
  }
});

// 删除反馈（用户或管理员）
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, admin } = req.query;

    console.log("删除反馈请求:", { id, user_id, admin });

    const client = getSupabaseClient();
    
    // 如果不是管理员删除，需要验证 user_id
    if (admin !== 'true') {
      if (!user_id) {
        console.error("删除失败：缺少 user_id");
        return res.status(400).json({ success: false, error: "缺少用户ID" });
      }

      // 先查询记录是否存在
      const { data: existing, error: findError } = await client
        .from("feedbacks")
        .select("id, user_id")
        .eq("id", id)
        .single();

      if (findError || !existing) {
        console.error("删除失败：找不到记录", findError);
        return res.status(404).json({ success: false, error: "记录不存在" });
      }

      console.log("找到记录:", existing);

      if (existing.user_id !== user_id) {
        console.error("删除失败：无权删除此记录", { existing_user_id: existing.user_id, request_user_id: user_id });
        return res.status(403).json({ success: false, error: "无权删除此记录" });
      }
    }

    // 执行删除
    const { error } = await client
      .from("feedbacks")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("删除反馈错误:", error);
      throw error;
    }

    console.log("删除反馈成功:", id);
    res.json({ success: true, message: "删除成功" });
  } catch (error) {
    console.error("删除反馈失败:", error);
    res.status(500).json({ success: false, error: "删除反馈失败" });
  }
});

export default router;
