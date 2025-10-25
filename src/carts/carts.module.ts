import { Module } from '@nestjs/common';
import { CartsService } from './carts.service';
import { CartsController } from './carts.controller';
import { Carts } from './carts.entity';
import { Products } from '../products/products.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from '../users/users.entity';

@Module({
  imports : [TypeOrmModule.forFeature([Carts, Products, Users])],
  providers: [CartsService],
  controllers: [CartsController]
})
export class CartsModule {}
