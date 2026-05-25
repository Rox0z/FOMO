import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

import { UsersModule } from '../users/users.module';
import { VendorsModule } from '../vendors/vendors.module';
import { EventsModule } from '../events/events.module';
import { LogsModule } from 'src/logs/logs.module';
import { EventEditsModule } from 'src/event-edits/event-edits.module';

@Module({
  imports: [UsersModule, VendorsModule, EventsModule, LogsModule, EventEditsModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}