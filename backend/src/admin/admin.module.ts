import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

import { UsersModule } from '../users/users.module';
import { VendorsModule } from '../vendors/vendors.module';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [UsersModule, VendorsModule, EventsModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}