import { Controller, Get, Inject } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import type { DrizzleDB } from './drizzle';

@Controller()
export class AppController {
  constructor(@Inject('DRIZZLE') private readonly db: DrizzleDB) {}

  @Get('api/health')
  health(): { status: string } {
    return { status: 'ok' };
  }

  @Get('api/db-health')
  async dbHealth(): Promise<{ status: string }> {
    try {
      await this.db.execute(sql`SELECT 1`);
      return { status: 'ok' };
    } catch (error) {
      console.trace(error);
      return { status: 'error' };
    }
  }
}
