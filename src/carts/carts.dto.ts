import { IsNumber, IsOptional, Min } from 'class-validator';

export class CreateCartDto {
  @IsNumber()
  userId: number;

  @IsNumber()
  productId: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number = 1;

  
}

export class UpdateCartDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number;
}
