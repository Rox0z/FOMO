import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { db } from './drizzle';
import { sql } from 'drizzle-orm';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('api/health')
  health(): { status: string } {
    return { status: 'ok' };
  }

  @Get('api/db-health')
  async dbHealth(): Promise<{ status: string }> {
    try {
      // Simple query to check DB connection
      await db.execute(sql`SELECT 1`)
      return { status: 'ok' };
    } catch (e) {
      console.trace(e)
      return { status: 'error' };
    }
  }
}
