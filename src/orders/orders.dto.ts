import { IsNumber, Min, IsString, IsOptional } from 'class-validator';

export class CreateOrderDto {
  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  total_price: number;

  @IsNumber()
  productId: number;

  @IsNumber()
  userId: number;
}

export class UpdateOrderDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  total_price?: number;

  @IsOptional()
  @IsString()
  status?: string;
}
