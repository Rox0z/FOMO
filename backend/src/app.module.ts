import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { db } from './drizzle';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'DRIZZLE',
      useValue: db,
    },
  ],
})
export class AppModule {}
