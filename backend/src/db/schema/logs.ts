import { pgTable, serial, varchar, timestamp } from 'drizzle-orm/pg-core';

export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  action: varchar('action', { length: 255 }).notNull(),
  admin: varchar('admin', { length: 100 }).notNull().default('Admin Principal'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});