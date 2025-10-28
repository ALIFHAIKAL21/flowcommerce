// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  // ⚠️ Penting: gunakan express instance manual
  const app = await NestFactory.create(AppModule, {
    bodyParser: false, // Matikan body parser bawaan NestJS
  });

  // ✅ Stripe butuh raw body untuk verifikasi signature
  app.use('/payment/webhook', express.raw({ type: 'application/json' }));

  // ✅ Semua route lain tetap pakai JSON
  app.use(express.json());

  // ✅ Pipe validator (biar gak ngaruh ke webhook)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // ✅ CORS setup
  app.enableCors({
    origin: [
      'http://127.0.0.1:5500',
      'http://localhost:5500',
      'http://localhost:3001',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });

  await app.listen(3000);
  console.log('🚀 Server running on http://localhost:3000');
}

bootstrap();
