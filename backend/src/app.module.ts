import { Global, Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
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

const drizzleProvider = {
  provide: 'DRIZZLE',
  useValue: db,
};

@Global()
@Module({
  imports: [
    // Global rate limiting: 100 requests per minute per IP
    // Auth routes have a stricter limit applied at the controller level
    ThrottlerModule.forRoot([
      {
        ttl: 60_000, // 1 minute window (ms)
        limit: 100,
      },
    ]),
    UsersModule,
    AuthModule,
    VendorsModule,
    EventsModule,
    AdminModule,
    TicketsModule,
    OrdersModule,
    EventEditsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    drizzleProvider,
    // Apply throttle guard globally
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  exports: [drizzleProvider],
})
export class AppModule {}
