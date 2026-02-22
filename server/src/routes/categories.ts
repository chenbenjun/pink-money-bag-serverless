import { Router } from 'express';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { insertCategorySchema } from '@/storage/database/shared/schema';

const router = Router();

// 获取所有分类
router.get('/', async (req, res) => {
	try {
		const client = getSupabaseClient();
		const { type } = req.query;

		let query = client.from('categories').select('*').order('created_at', { ascending: true });

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

// 更新分类
router.put('/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const validatedData = insertCategorySchema.partial().parse(req.body);
		const client = getSupabaseClient();

		const { data, error } = await client
			.from('categories')
			.update(validatedData)
			.eq('id', id)
			.select()
			.single();

		if (error) {
			return res.status(500).json({ error: error.message });
		}

		if (!data) {
			return res.status(404).json({ error: 'Category not found' });
		}

		res.json({ data });
	} catch (error: any) {
		if (error.name === 'ZodError') {
			return res.status(400).json({ error: error.errors });
		}
		res.status(500).json({ error: 'Internal server error' });
	}
});

// 删除分类
router.delete('/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const client = getSupabaseClient();

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
