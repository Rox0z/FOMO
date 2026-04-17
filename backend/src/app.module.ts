import { Global, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { db } from './drizzle';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { VendorsModule } from './vendors/vendors.module';
import { EventsModule } from './events/events.module';
import { AdminModule } from './admin/admin.module';

const drizzleProvider = {
  provide: 'DRIZZLE',
  useValue: db,
};

@Global()
@Module({
  imports: [UsersModule, AuthModule, VendorsModule, EventsModule, AdminModule],
  controllers: [AppController],
  providers: [AppService, drizzleProvider],
  exports: [drizzleProvider],
})
  export class AppModule {}