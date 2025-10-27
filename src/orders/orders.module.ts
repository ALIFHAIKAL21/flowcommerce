import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Orders } from './orders.entity';
import { OrderItems } from './order-items.entity';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Products } from '../products/products.entity';
import { Users } from '../users/users.entity';
import { Carts } from '../carts/carts.entity';
import { PaymentModule } from '../payment/payment.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Orders, OrderItems, Products, Users, Carts]),
    PaymentModule
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
