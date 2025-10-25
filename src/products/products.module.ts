import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Products } from './products.entity';
import { Categories } from '../categories/categories.entity'; 
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { UploadService } from '../uploads/uploads.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Products, Categories]), 
  ],
  providers: [ProductsService, UploadService],
  controllers: [ProductsController],
})
export class ProductsModule {}
