import { Router } from 'express';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { insertCategorySchema } from '@/storage/database/shared/schema';

const router = Router();

// 获取所有分类（按用户过滤）
router.get('/', async (req, res) => {
	try {
		const client = getSupabaseClient();
		const { type, user_id } = req.query;

		if (!user_id) {
			return res.status(400).json({ error: 'user_id is required' });
		}

		let query = client.from('categories').select('*').order('created_at', { ascending: true });

		// 按用户过滤
		query = query.eq('user_id', user_id);

		// 按类型过滤
		if (type && (type === 'income' || type === 'expense')) {
			query = query.eq('type', type);
		}

		const { data, error } = await query;

		if (error) {
			return res.status(500).json({ error: error.message });
		}

		res.json({ data });
	} catch (error) {
		res.status(500).json({ error: 'Internal server error' });
	}
});

// 创建分类
router.post('/', async (req, res) => {
	try {
		const validatedData = insertCategorySchema.parse(req.body);
		const client = getSupabaseClient();

		const { data, error } = await client
			.from('categories')
			.insert(validatedData)
			.select()
			.single();

		if (error) {
			return res.status(500).json({ error: error.message });
		}

		res.status(201).json({ data });
	} catch (error: any) {
		if (error.name === 'ZodError') {
			return res.status(400).json({ error: error.errors });
		}
		res.status(500).json({ error: 'Internal server error' });
	}
});

// 更新分类（验证用户权限）
router.put('/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const { user_id, ...updateData } = insertCategorySchema.partial().parse(req.body);

		if (!user_id) {
			return res.status(400).json({ error: 'user_id is required' });
		}

		const client = getSupabaseClient();

		// 先检查分类是否属于该用户
		const { data: existingCategory, error: checkError } = await client
			.from('categories')
			.select('id, user_id')
			.eq('id', id)
			.single();

		if (checkError || !existingCategory) {
			return res.status(404).json({ error: 'Category not found' });
		}

		if (existingCategory.user_id !== user_id) {
			return res.status(403).json({ error: 'You do not have permission to update this category' });
		}

		// 更新分类
		const { data, error } = await client
			.from('categories')
			.update(updateData)
			.eq('id', id)
			.select()
			.single();

		if (error) {
			return res.status(500).json({ error: error.message });
		}

		res.json({ data });
	} catch (error: any) {
		if (error.name === 'ZodError') {
			return res.status(400).json({ error: error.errors });
		}
		res.status(500).json({ error: 'Internal server error' });
	}
});

// 删除分类（验证用户权限）
router.delete('/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const { user_id } = req.query;

		if (!user_id) {
			return res.status(400).json({ error: 'user_id is required' });
		}

		const client = getSupabaseClient();

		// 先检查分类是否属于该用户
		const { data: existingCategory, error: checkError } = await client
			.from('categories')
			.select('id, user_id')
			.eq('id', id)
			.single();

		if (checkError || !existingCategory) {
			return res.status(404).json({ error: 'Category not found' });
		}

		if (existingCategory.user_id !== user_id) {
			return res.status(403).json({ error: 'You do not have permission to delete this category' });
		}

		// 删除分类
		const { error } = await client
			.from('categories')
			.delete()
			.eq('id', id);

		if (error) {
			return res.status(500).json({ error: error.message });
		}

		res.status(204).send();
	} catch (error) {
		res.status(500).json({ error: 'Internal server error' });
	}
});

export default router;
