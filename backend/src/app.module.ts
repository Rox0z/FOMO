import { Global, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { db } from './drizzle';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { VendorsModule } from './vendors/vendors.module';
import { DatabaseInitializerService } from './db/database-initializer.service';
import { EventsModule } from './events/events.module';

const drizzleProvider = {
  provide: 'DRIZZLE',
  useValue: db,
};

@Global()
@Module({
  imports: [UsersModule, AuthModule, VendorsModule, EventsModule],
  controllers: [AppController],
  providers: [AppService, drizzleProvider, DatabaseInitializerService],
  exports: [drizzleProvider],
})
  export class AppModule {}