import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs'

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule, {
      logger: ['log', 'error', 'warn', 'debug', 'verbose'],
    });
    app.enableCors();
    await app.listen(3000);
    console.log('Application is running on: http://localhost:3000');
  } catch (error) {
    console.error('Bootstrap failed:', error);
    process.exit(1);
  }
}
dotenv.config();
bootstrap();