import { Global, Module } from '@nestjs/common';
import { db } from '../drizzle';

@Global()
@Module({
  providers: [
    {
      provide: 'DRIZZLE',
      useValue: db,
    },
  ],
  exports: ['DRIZZLE'],
})
export class DatabaseModule {}