import { Global, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { db } from './drizzle';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { VendorsModule } from './vendors/vendors.module';
import { EventsModule } from './events/events.module';
import { AdminModule } from './admin/admin.module';
import { TicketsModule } from './tickets/tickets.module';
import { OrdersModule } from './orders/orders.module';
import { EventEditsModule } from './event-edits/event-edits.module';
import { EmailsModule } from './services/emails/emails.module';
import { ImagesModule } from './services/images/images.module';

const drizzleProvider = {
  provide: 'DRIZZLE',
  useValue: db,
};

@Global()
@Module({
  imports: [UsersModule, AuthModule, VendorsModule, EventsModule, AdminModule, 
            TicketsModule, OrdersModule, EventEditsModule, EmailsModule, ImagesModule],
  controllers: [AppController],
  providers: [AppService, drizzleProvider],
  exports: [drizzleProvider],
})
  export class AppModule {}