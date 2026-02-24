import { Router } from 'express';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { insertTransactionSchema, updateTransactionSchema } from '@/storage/database/shared/schema';

const router = Router();

// ============================================
// GET 路由 - 按优先级排序
// ============================================

// 1. 获取统计数据（静态路由，必须在 /:id 之前）
router.get('/stats', async (req, res) => {
	try {
		const client = getSupabaseClient();
		const { user_id } = req.query;

		// 必须提供 user_id
		if (!user_id) {
			return res.status(400).json({ error: 'user_id is required' });
		}

		// 获取该用户的所有收入
		const { data: incomeData, error: incomeError } = await client
			.from('transactions')
			.select('amount')
			.eq('user_id', user_id)
			.eq('type', 'income');

		// 获取该用户的所有支出
		const { data: expenseData, error: expenseError } = await client
			.from('transactions')
			.select('amount')
			.eq('user_id', user_id)
			.eq('type', 'expense');

		if (incomeError || expenseError) {
			return res.status(500).json({ error: 'Failed to fetch statistics' });
		}

		// 计算总收入
		const totalIncome = incomeData?.reduce((sum: number, item: any) => {
			return sum + parseFloat(item.amount);
		}, 0) || 0;

		// 计算总支出
		const totalExpense = expenseData?.reduce((sum: number, item: any) => {
			return sum + parseFloat(item.amount);
		}, 0) || 0;

		// 计算余额
		const balance = totalIncome - totalExpense;

		res.json({
			data: {
				totalIncome: totalIncome.toString(),
				totalExpense: totalExpense.toString(),
				balance: balance.toString(),
			}
		});
	} catch (error) {
		res.status(500).json({ error: 'Internal server error' });
	}
});

// 2. 获取所有交易记录（根路径）
router.get('/', async (req, res) => {
	try {
		const client = getSupabaseClient();
		const { type, user_id, category_id } = req.query;

		// 必须提供 user_id
		if (!user_id) {
			return res.status(400).json({ error: 'user_id is required' });
		}

		let query = client
			.from('transactions')
			.select('*')
			.eq('user_id', user_id)
			.order('transaction_date', { ascending: false });

		if (type && (type === 'income' || type === 'expense')) {
			query = query.eq('type', type);
		}

		if (category_id) {
			query = query.eq('category_id', category_id);
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

// 3. 获取单个交易记录（动态路由，必须放在最后）
router.get('/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const { user_id } = req.query;

		if (!user_id) {
			return res.status(400).json({ error: 'user_id is required' });
		}

		const client = getSupabaseClient();

		const { data, error } = await client
			.from('transactions')
			.select('*')
			.eq('id', id)
			.eq('user_id', user_id)
			.single();

		if (error) {
			return res.status(404).json({ error: 'Transaction not found' });
		}

		res.json({ data });
	} catch (error) {
		res.status(500).json({ error: 'Internal server error' });
	}
});

// ============================================
// POST 路由
// ============================================

router.post('/', async (req, res) => {
	try {
		const validatedData = insertTransactionSchema.parse(req.body);
		const client = getSupabaseClient();

		const { data, error } = await client
			.from('transactions')
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

// ============================================
// PUT 路由
// ============================================

router.put('/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const { user_id } = req.body;

		if (!user_id) {
			return res.status(400).json({ error: 'user_id is required' });
		}

		const validatedData = updateTransactionSchema.parse(req.body);
		const client = getSupabaseClient();

		const { data, error } = await client
			.from('transactions')
			.update(validatedData)
			.eq('id', id)
			.eq('user_id', user_id)
			.select()
			.single();

		if (error) {
			return res.status(500).json({ error: error.message });
		}

		if (!data) {
			return res.status(404).json({ error: 'Transaction not found' });
		}

		res.json({ data });
	} catch (error: any) {
		if (error.name === 'ZodError') {
			return res.status(400).json({ error: error.errors });
		}
		res.status(500).json({ error: 'Internal server error' });
	}
});

// ============================================
// DELETE 路由 - 按优先级排序
// ============================================

// 1. 清除所有交易记录（静态路由，必须在 /:id 之前）
router.delete('/clear-all', async (req, res) => {
	try {
		const { user_id } = req.query;

		if (!user_id) {
			return res.status(400).json({ error: 'user_id is required' });
		}

		const client = getSupabaseClient();

		const { error } = await client
			.from('transactions')
			.delete()
			.eq('user_id', user_id);

		if (error) {
			return res.status(500).json({ error: error.message });
		}

		res.status(204).send();
	} catch (error) {
		res.status(500).json({ error: 'Internal server error' });
	}
});

// 2. 删除单个交易记录（动态路由，必须放在最后）
router.delete('/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const { user_id } = req.query;

		if (!user_id) {
			return res.status(400).json({ error: 'user_id is required' });
		}

		const client = getSupabaseClient();

		const { error } = await client
			.from('transactions')
			.delete()
			.eq('id', id)
			.eq('user_id', user_id);

		if (error) {
			return res.status(500).json({ error: error.message });
		}

		res.status(204).send();
	} catch (error) {
		res.status(500).json({ error: 'Internal server error' });
	}
});

export default router;
