import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Users } from './users/users.entity';
import { Products } from './products/products.entity';
import { Carts } from './carts/carts.entity';
import { Orders } from './orders/orders.entity';
import { Categories } from './categories/categories.entity';
import { OrderItems } from './orders/order-items.entity';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { OrdersModule } from './orders/orders.module';
import { CartsModule } from './carts/carts.module';
import { UploadController } from './uploads/uploads.controller';
import { UploadService } from './uploads/uploads.service';
import { PaymentModule } from './payment/payment.module';



@Module({
  imports: [
    // Environment Config
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database Connection
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [Users, Products, Orders, OrderItems, Categories, Carts],
      synchronize: false,
      ssl: true,
      extra: {
        ssl: { rejectUnauthorized: false },
      },
    }),


    //Core Business Modules
    AuthModule,
    UsersModule,
    ProductsModule,
    OrdersModule,
    CategoriesModule,
    CartsModule,
    PaymentModule,

  ],

  controllers: [UploadController],
  providers: [UploadService],

})
export class AppModule { }
