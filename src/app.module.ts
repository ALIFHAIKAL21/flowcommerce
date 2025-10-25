import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Users } from './users/users.entity';
import { Products } from './products/products.entity';
import { Carts } from './carts/carts.entity';
import { Orders } from './orders/orders.entity';
import { Categories } from './categories/categories.entity';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { OrdersModule } from './orders/orders.module';
import { UploadController } from './uploads/uploads.controller';
import { UploadService } from './uploads/uploads.service';
import { CartsModule } from './carts/carts.module';
import { OrderItems } from './orders/order-items.entity';

@Module({
  imports: [
    
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_NAME || 'flowcommerce',
      entities: [Users, Products, Orders, OrderItems, Categories, Carts],
      synchronize: true,
    }),

    
    AuthModule,
    UsersModule,
    ProductsModule,
    OrdersModule,
    CategoriesModule,
    CartsModule,
  ],

  controllers: [UploadController],
  providers: [UploadService],
})
export class AppModule {}
