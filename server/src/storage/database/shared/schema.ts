import { pgTable, index, varchar, timestamp, numeric, text, serial, integer, boolean } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { z } from "zod"



export const categories = pgTable("categories", {
	id: varchar({ length: 36 }).default(sql`gen_random_uuid()`).primaryKey().notNull(),
	name: varchar({ length: 50 }).notNull(),
	icon: varchar({ length: 50 }),
	color: varchar({ length: 20 }),
	type: varchar({ length: 20 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("categories_type_idx").using("btree", table.type.asc().nullsLast().op("text_ops")),
]);

export const transactions = pgTable("transactions", {
	id: varchar({ length: 36 }).default(sql`gen_random_uuid()`).primaryKey().notNull(),
	amount: numeric({ precision: 10, scale:  2 }).notNull(),
	type: varchar({ length: 20 }).notNull(),
	categoryId: varchar("category_id", { length: 36 }),
	description: text(),
	transactionDate: timestamp("transaction_date", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	userId: varchar("user_id", { length: 36 }).notNull(),
}, (table) => [
	index("transactions_category_id_idx").using("btree", table.categoryId.asc().nullsLast().op("text_ops")),
	index("transactions_transaction_date_idx").using("btree", table.transactionDate.asc().nullsLast().op("timestamptz_ops")),
	index("transactions_type_idx").using("btree", table.type.asc().nullsLast().op("text_ops")),
	index("transactions_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
]);

export const healthCheck = pgTable("health_check", {
	id: serial().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const users = pgTable("users", {
	id: varchar({ length: 36 }).default(sql`gen_random_uuid()`).primaryKey().notNull(),
	name: varchar({ length: 50 }).notNull(),
	nickname: varchar({ length: 50 }),
	password: varchar({ length: 255 }).notNull(),
	avatar: varchar({ length: 50 }),
	avatarType: varchar("avatar_type", { length: 20 }),
	avatarUrl: text("avatar_url"),
	bio: text(),
	age: integer(),
	gender: varchar({ length: 10 }),
	isAdmin: boolean("is_admin").default(false),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	passwordPlain: varchar("password_plain", { length: 100 }),
}, (table) => [
	index("users_is_admin_idx").using("btree", table.isAdmin.asc().nullsLast().op("bool_ops")),
	index("users_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
]);

export const feedbacks = pgTable("feedbacks", {
	id: varchar({ length: 36 }).default(sql`gen_random_uuid()`).primaryKey().notNull(),
	userId: varchar("user_id", { length: 36 }).notNull(),
	content: text().notNull(),
	contact: varchar({ length: 200 }).notNull(),
	status: varchar({ length: 20 }).default('pending'),
	reply: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("feedbacks_created_at_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamptz_ops")),
	index("feedbacks_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("feedbacks_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
]);

// Zod schemas for validation
export const insertCategorySchema = z.object({
	name: z.string().min(1).max(50),
	icon: z.string().max(50).optional(),
	color: z.string().max(20).optional(),
	type: z.enum(['income', 'expense']),
});

export const insertUserSchema = z.object({
	name: z.string().min(1).max(50),
	password: z.string().min(1),
	nickname: z.string().max(50).optional(),
	avatar: z.string().max(50).optional(),
	avatar_type: z.enum(['preset', 'custom']).optional(),
	avatar_url: z.string().optional(),
	bio: z.string().optional(),
	age: z.number().optional(),
	gender: z.enum(['male', 'female']).optional(),
	is_admin: z.boolean().default(false),
	password_plain: z.string().optional(),
});

export const updateUserSchema = insertUserSchema.partial();

export const updatePasswordSchema = z.object({
	newPassword: z.string().min(1),
});

export const insertTransactionSchema = z.object({
	amount: z.string().min(1),
	type: z.enum(['income', 'expense']),
	category_id: z.string().optional(),
	description: z.string().optional(),
	transaction_date: z.string().optional(),
	user_id: z.string().min(1),
});

export const updateTransactionSchema = insertTransactionSchema.partial();

export const insertFeedbackSchema = z.object({
	user_id: z.string().min(1),
	content: z.string().min(1),
	contact: z.string().min(1).max(200),
	status: z.enum(['pending', 'processing', 'resolved']).default('pending'),
	reply: z.string().optional(),
});

export const updateFeedbackSchema = insertFeedbackSchema.partial();
