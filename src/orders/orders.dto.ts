// src/orders/orders.dto.ts
import { IsIn, IsOptional, IsString } from 'class-validator';

export class CreateOrderDto {
  
  @IsOptional()
  @IsString()
  note?: string;
}

export class UpdateOrderStatusDto {
  @IsString()
  @IsIn(['pending', 'paid', 'refunded'])
  status: string;
}
