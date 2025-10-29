import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getRoot(): string {
    return '🚀 FlowCommerce API is running successfully! Visit /api/docs for Swagger documentation.';
  }
}
