import { Module } from '@nestjs/common';
import { EventEditsService } from './event-edits.service';
import { LogsModule } from '../logs/logs.module'; // Importa se precisares do LogsService

@Module({
  imports: [LogsModule], // Injeta o LogsModule para que o EventEditsService consiga criar logs
  providers: [EventEditsService],
  exports: [EventEditsService],
})
export class EventEditsModule {}