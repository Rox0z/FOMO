import { Injectable, Inject } from '@nestjs/common';
import { desc } from 'drizzle-orm';
import { auditLogs } from '../db/schema/logs';
import type { DrizzleDB } from '../drizzle';

@Injectable()
export class LogsService {
  constructor(
    @Inject('DRIZZLE') private db: DrizzleDB,
  ) {}

  // Procura todos os logs registados na base de dados
  async findAll() {
    return this.db
      .select()
      .from(auditLogs)
      .orderBy(desc(auditLogs.createdAt));
  }

  // Método utilitário para ser chamado quando quiseres guardar um log novo
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