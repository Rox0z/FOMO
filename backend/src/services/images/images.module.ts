import { Global, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ImagesService } from './images.service';

@Global()
@Module({
  imports: [HttpModule],
  providers: [ImagesService],
  exports: [ImagesService],
})
export class ImagesModule {}