import { pgTable, serial, timestamp, varchar, text, integer, decimal, boolean, index } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { createSchemaFactory } from "drizzle-zod";
import { z } from "zod";


export const healthCheck = pgTable("health_check", {
	id: serial().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

// 用户表
export const users = pgTable(
	"users",
	{
		id: varchar("id", { length: 36 })
			.primaryKey()
			.default(sql`gen_random_uuid()`),
		name: varchar("name", { length: 50 }).notNull(), // 用户名（登录用）
		nickname: varchar("nickname", { length: 50 }), // 昵称
		password: varchar("password", { length: 255 }).notNull(), // 密码（bcrypt加密）
		password_plain: varchar("password_plain", { length: 100 }), // 明文密码（用于管理员查看）
		avatar: varchar("avatar", { length: 50 }), // 预设头像名称
		avatar_type: varchar("avatar_type", { length: 20 }), // 'preset' 或 'custom'
		avatar_url: text("avatar_url"), // 自定义头像URL (base64)
		bio: text("bio"), // 个性签名
		age: integer("age"), // 年龄
		gender: varchar("gender", { length: 10 }), // 'male' 或 'female'
		is_admin: boolean("is_admin").default(false), // 是否管理员
		created_at: timestamp("created_at", { withTimezone: true, mode: 'string' })
			.defaultNow()
			.notNull(),
		updated_at: timestamp("updated_at", { withTimezone: true, mode: 'string' })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		index("users_name_idx").on(table.name),
		index("users_is_admin_idx").on(table.is_admin),
	]
);

// 分类表
export const categories = pgTable(
	"categories",
	{
		id: varchar("id", { length: 36 })
			.primaryKey()
			.default(sql`gen_random_uuid()`),
		name: varchar("name", { length: 50 }).notNull(),
		icon: varchar("icon", { length: 50 }), // 图标名称
		color: varchar("color", { length: 20 }), // 颜色
		type: varchar("type", { length: 20 }).notNull(), // income 或 expense
		createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		index("categories_type_idx").on(table.type),
	]
);

// 交易记录表
export const transactions = pgTable(
	"transactions",
	{
		id: varchar("id", { length: 36 })
			.primaryKey()
			.default(sql`gen_random_uuid()`),
		user_id: varchar("user_id", { length: 36 }).notNull(), // 用户ID
		amount: decimal("amount", { precision: 10, scale: 2 }).notNull(), // 金额
		type: varchar("type", { length: 20 }).notNull(), // income 或 expense
		category_id: varchar("category_id", { length: 36 }), // 分类ID
		description: text("description"), // 描述
		transaction_date: timestamp("transaction_date", { withTimezone: true, mode: 'string' })
			.defaultNow()
			.notNull(), // 交易日期
		createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		index("transactions_user_id_idx").on(table.user_id),
		index("transactions_type_idx").on(table.type),
		index("transactions_transaction_date_idx").on(table.transaction_date),
		index("transactions_category_id_idx").on(table.category_id),
	]
);

// 意见反馈表
export const feedbacks = pgTable(
	"feedbacks",
	{
		id: varchar("id", { length: 36 })
			.primaryKey()
			.default(sql`gen_random_uuid()`),
		user_id: varchar("user_id", { length: 36 }).notNull(), // 提交反馈的用户ID
		content: text("content").notNull(), // 反馈内容
		contact: varchar("contact", { length: 200 }).notNull(), // 联系方式
		status: varchar("status", { length: 20 }).default("pending"), // 处理状态：pending, processing, resolved
		reply: text("reply"), // 管理员回复
		created_at: timestamp("created_at", { withTimezone: true, mode: 'string' })
			.defaultNow()
			.notNull(),
		updated_at: timestamp("updated_at", { withTimezone: true, mode: 'string' })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		index("feedbacks_user_id_idx").on(table.user_id),
		index("feedbacks_status_idx").on(table.status),
		index("feedbacks_created_at_idx").on(table.created_at),
	]
);

// Zod schemas for validation
const { createInsertSchema: createCoercedInsertSchema } = createSchemaFactory({
	coerce: { date: true },
});

export const insertCategorySchema = createCoercedInsertSchema(categories).pick({
	name: true,
	icon: true,
	color: true,
	type: true,
});

export const insertTransactionSchema = createCoercedInsertSchema(transactions).pick({
	user_id: true,
	amount: true,
	type: true,
	category_id: true,
	description: true,
	transaction_date: true,
});

export const updateTransactionSchema = createCoercedInsertSchema(transactions)
	.pick({
		amount: true,
		type: true,
		category_id: true,
		description: true,
		transaction_date: true,
	})
	.partial();

// 用户相关 schemas
export const insertUserSchema = createCoercedInsertSchema(users).pick({
	name: true,
	nickname: true,
	password: true,
	avatar: true,
	avatar_type: true,
	avatar_url: true,
	bio: true,
	age: true,
	gender: true,
	is_admin: true,
});

export const updateUserSchema = createCoercedInsertSchema(users)
	.pick({
		nickname: true,
		avatar: true,
		avatar_type: true,
		avatar_url: true,
		bio: true,
		age: true,
		gender: true,
		is_admin: true,
	})
	.partial();

export const updatePasswordSchema = z.object({
	newPassword: z.string().min(1, "密码不能为空"),
});

// 反馈相关 schemas
export const insertFeedbackSchema = createCoercedInsertSchema(feedbacks).pick({
	user_id: true,
	content: true,
	contact: true,
	status: true,
	reply: true,
});

export const updateFeedbackSchema = createCoercedInsertSchema(feedbacks)
	.pick({
		status: true,
		reply: true,
	})
	.partial();

// TypeScript types
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type UpdateTransaction = z.infer<typeof updateTransactionSchema>;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type Feedback = typeof feedbacks.$inferSelect;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type UpdateFeedback = z.infer<typeof updateFeedbackSchema>;
