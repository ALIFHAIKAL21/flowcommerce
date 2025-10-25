import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Orders } from './orders.entity';
import { Products } from '../products/products.entity';
import { Users } from '../users/users.entity';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Orders, Products, Users])],
  providers: [OrdersService],
  controllers: [OrdersController],
})
export class OrdersModule {}
