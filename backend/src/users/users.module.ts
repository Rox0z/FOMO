import { Module } from '@nestjs/common';
import { db } from '../drizzle';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    {
      provide: 'DRIZZLE',
      useValue: db,
    },
  ],
  exports: [UsersService, 'DRIZZLE'],
})
export class UsersModule {}
