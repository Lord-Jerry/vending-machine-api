import {
  Put,
  Get,
  Post,
  Body,
  Query,
  Param,
  Request,
  HttpStatus,
  Controller,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  Delete,
  HttpCode,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { HasRoles, RolesGuard, Role } from 'src/infrastructure/auth/role.guard';
import { IRequestUser } from 'src/infrastructure/auth/jwt.guard';

import {
  BuyProductDto,
  CreateProductDto,
  UpdateProductDto,
  ProductParamsDto,
  ProductPaginationDto,
} from 'src/application/dtos/product.dto';

import { ProductService } from 'src/domain/services/product.service';

@Controller('product')
@UseInterceptors(ClassSerializerInterceptor)
export class ProductController {
  constructor(private productService: ProductService) {}

  @HasRoles(Role.SELLER)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  async create(@Request() req: IRequestUser, @Body() body: CreateProductDto) {
    await this.productService.create(req.user.userId, {
      cost: body.cost,
      productName: body.name,
      amountAvailable: body.amount_available,
    });

    return {
      message: 'product created',
    };
  }

  @HasRoles(Role.SELLER)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @HttpCode(HttpStatus.OK)
  async update(
    @Request() req: IRequestUser,
    @Body() body: UpdateProductDto,
    @Param() params: ProductParamsDto,
  ) {
    await this.productService.update(req.user.userId, params.product_id, {
      cost: body.cost,
      productName: body.name,
      amountAvailable: body.amount_available,
    });

    return {
      message: 'product updated',
    };
  }

  @HasRoles(Role.BUYER)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post('buy')
  @HttpCode(HttpStatus.CREATED)
  async buy(@Request() req: IRequestUser, @Body() body: BuyProductDto) {
    return this.productService.buyProduct(
      req.user.userId,
      body.product_id,
      body.amount,
    );
  }

  @HasRoles(Role.SELLER)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Delete('delete/:product_id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Request() req: IRequestUser, @Param() body: ProductParamsDto) {
    await this.productService.delete(req.user.userId, body.product_id);
  }

  @Get('list')
  @HttpCode(HttpStatus.OK)
  async list(@Query() query: ProductPaginationDto) {
    return this.productService.getProducts(query.cursor);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('list-by-seller')
  @HttpCode(HttpStatus.OK)
  async listBySeller(
    @Request() req: IRequestUser,
    @Query() query: ProductPaginationDto,
  ) {
    return this.productService.getProductsBySellerId(
      req.user.userId,
      query.cursor,
    );
  }
}
