import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import { setupSwagger } from './swagger';


async function bootstrap() {

  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });


  app.use('/payment/webhook', express.raw({ type: 'application/json' }));

  app.use(express.json());

  // global pipes
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

  // Setup Swagger 
  setupSwagger(app);

  // CORS setup 
  app.enableCors({
    origin: [
      'http://localhost:3001', 
      'http://127.0.0.1:3000',
      'http://localhost:5500',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });

  await app.listen(process.env.PORT || 3000, '0.0.0.0');
 console.log(`🚀 Server running on port ${process.env.PORT || 3000}`);
console.log(`📘 Swagger docs: /api/docs`);

}

bootstrap();
