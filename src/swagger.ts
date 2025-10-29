import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('FlowCommerce API')
    .setDescription(
      'Professional E-Commerce Backend built with NestJS, PostgreSQL & Stripe Simulation',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);


  app.getHttpAdapter().get('/api-json', (req, res) => {
    res.json(document);
  });
}
