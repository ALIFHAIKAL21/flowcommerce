import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import { setupSwagger } from './swagger';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { json, raw } from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
  });

  const expressApp = app.getHttpAdapter().getInstance();

  // Express Body Parsers
  expressApp.use('/payment/webhook', raw({ type: 'application/json' }));

  // General JSON parser
  expressApp.use(json());

  // Static files (serve from /public)
  app.useStaticAssets(join(process.cwd(), 'public'));

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      disableErrorMessages: process.env.NODE_ENV === 'production',
    }),
  );

  // Swagger
  setupSwagger(app);

  // CORS
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://flowcommerce.onrender.com',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Basic Route → serve public/index.html
  expressApp.get('/', (_req, res) => {
    res.sendFile(join(process.cwd(), 'public', 'index.html'));
  });

  // Start Server
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Server running at ${baseUrlFromEnv()}`);
  console.log(`📘 Swagger: ${baseUrlFromEnv()}/api/docs`);
}

// Get base URL from environment or default to localhost
function baseUrlFromEnv() {
  return process.env.RENDER_EXTERNAL_URL || `http://localhost:${process.env.PORT || 3000}`;
}

bootstrap();
