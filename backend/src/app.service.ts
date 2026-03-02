import { Injectable } from '@nestjs/common';
import { db } from './drizzle';

@Injectable()
export class AppService {
  private readonly db = db;
  getHello(): string {
    return 'Hello World!';
  }
}
