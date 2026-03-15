import { Inject, Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class DatabaseInitializerService implements OnModuleInit {
  constructor(@Inject('DRIZZLE') private db: any) {}

  async onModuleInit() {
    try {
      console.log('✓ Database ready - migrations handled by Drizzle Kit');
    } catch (error) {
      console.error('Error during database initialization:', error);
      throw error;
    }
  }
}
