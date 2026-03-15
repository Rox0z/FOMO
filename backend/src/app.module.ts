import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { db } from './drizzle';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { VendorsModule } from './vendors/vendors.module';
import { DatabaseInitializerService } from './db/database-initializer.service';

const drizzleProvider = {
  provide: 'DRIZZLE',
  useValue: db,
};

@Module({
  imports: [UsersModule, AuthModule, VendorsModule],
  controllers: [AppController],
  providers: [AppService, drizzleProvider, DatabaseInitializerService],
  exports: [drizzleProvider],
})
export class AppModule {}
