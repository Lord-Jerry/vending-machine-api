import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsIn([5, 10, 20, 50, 100])
  cost: number;

  @IsNumber()
  amount_available: number;
}

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsIn([5, 10, 20, 50, 100])
  @IsOptional()
  cost?: number;

  @IsNumber()
  @IsOptional()
  amount_available?: number;
}

export class ProductParamsDto {
  @IsString()
  product_id: string;
}

export class ProductPaginationDto {
  @IsString()
  @IsOptional()
  cursor?: string;
}

export class BuyProductDto {
  @IsString()
  product_id: string;

  @IsNumber()
  amount: number;
}
