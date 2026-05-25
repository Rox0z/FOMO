import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { ImagesService } from '../services/images.service';
import { HttpModule } from '@nestjs/axios';
import { EventEditsModule } from 'src/event-edits/event-edits.module';

import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

@Module({
  imports: [
    HttpModule,
    EventEditsModule,

    MulterModule.register({
      storage: memoryStorage(),
    }),
  ],
  controllers: [EventsController],
  providers: [EventsService, ImagesService],
  exports: [EventsService],
})
export class EventsModule {}