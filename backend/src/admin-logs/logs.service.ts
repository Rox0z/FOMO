import { Injectable, Inject } from '@nestjs/common';
import { desc } from 'drizzle-orm';
import { auditLogs } from '../db/schema/logs';
import type { DrizzleDB } from '../drizzle';

@Injectable()
export class LogsService {
  constructor(
    @Inject('DRIZZLE') private db: DrizzleDB,
  ) {}

  async findAll() {
    return this.db
      .select()
      .from(auditLogs)
      .orderBy(desc(auditLogs.createdAt));
  }

  async createLog(action: string, adminName: string = 'Admin Principal') {
    return this.db
      .insert(auditLogs)
      .values({
        action: action,
        admin: adminName,
      })
      .returning();
  }
}