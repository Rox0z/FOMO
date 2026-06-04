import { pgTable, serial, integer, varchar, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users';

export const vendorStatusEnum = pgEnum('vendor_status', ['pending', 'approved', 'rejected']);

export const vendorProfiles = pgTable('vendor_profiles', {
  id: serial('id').primaryKey(),

  userId: integer('user_id')
    .notNull()
    .unique()
    .references(() => users.id),

  businessName: varchar('business_name', { length: 255 }).notNull(),
  businessDescription: text('business_description'),

  status: vendorStatusEnum('status').notNull().default('pending'),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});