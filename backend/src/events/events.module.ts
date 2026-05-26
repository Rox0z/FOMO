import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { ImagesService } from '../services/images.service';
import { HttpModule } from '@nestjs/axios';
import { EventEditsModule } from 'src/event-edits/event-edits.module';

import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { BadRequestException } from '@nestjs/common';

@Module({
  imports: [
    HttpModule,
    EventEditsModule,

    MulterModule.register({
      storage: memoryStorage(),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB max
      },
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(new BadRequestException('Só são permitidas imagens.'), false);
        }
        cb(null, true);
      },
    }),
  ],
  controllers: [EventsController],
  providers: [EventsService, ImagesService],
  exports: [EventsService],
})
export class EventsModule {}
