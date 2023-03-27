import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { DatabaseService } from 'src/infrastructure/database/database.service';

import { UserRepository } from 'src/infrastructure/repositories/user.repository';
import { ProductRepository } from 'src/infrastructure/repositories/product.repository';

type ProductInput = {
  cost: number;
  productName: string;
  amountAvailable: number;
};

@Injectable()
export class ProductService {
  constructor(
    private db: DatabaseService,
    private userRepository: UserRepository,
    private productRepository: ProductRepository,
  ) {}

  public async create(sellerId: string, data: ProductInput) {
    await this._findByUserIdOrFail(sellerId);

    return this.productRepository.create({
      ...data,
      seller: { connect: { id: sellerId } },
    });
  }

  public async update(
    sellerId: string,
    productId: string,
    data: Partial<ProductInput>,
  ) {
    const [product] = await Promise.all([
      this._findByProductIdOrFail(productId),
      this._findByUserIdOrFail(sellerId),
    ]);

    if (product.sellerId !== sellerId) {
      throw new UnauthorizedException('you are not the seller of this product');
    }

    return this.productRepository.update(productId, {
      ...data,
    });
  }

  public async delete(sellerId: string, productId: string) {
    const [product] = await Promise.all([
      this._findByProductIdOrFail(productId),
      this._findByUserIdOrFail(sellerId),
    ]);

    if (product.sellerId !== sellerId) {
      throw new UnauthorizedException('you are not the seller of this product');
    }

    return this.productRepository.delete(productId);
  }

  public async getProducts(cursor?: string) {
    return this.productRepository.getAll(cursor);
  }

  public async getProductsBySellerId(sellerId: string, cursor?: string) {
    await this._findByUserIdOrFail(sellerId);

    return this.productRepository.getBySellerId(sellerId, cursor);
  }

  public async buyProduct(userId: string, productId: string, amount: number) {
    const [product, user] = await Promise.all([
      this._findByProductIdOrFail(productId),
      this._findByUserIdOrFail(userId),
    ]);

    if (product.amountAvailable < amount) {
      throw new NotFoundException('not enough product available');
    }

    if (user.deposit < product.cost * amount) {
      throw new UnauthorizedException('not enough deposit');
    }

    const [updatedUser] = await this.db.$transaction([
      this.db.user.update({
        where: { id: userId },
        data: { deposit: { decrement: product.cost * amount } },
      }),
      this.db.product.update({
        where: { id: productId },
        data: { amountAvailable: { decrement: amount } },
      }),
    ]);

    return {
      totalSpend: product.cost * amount,
      productPurchased: product.productName,
      change: this._calculateChangeInCoins(updatedUser.deposit),
    };
  }

  private async _findByUserIdOrFail(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException('user not found');

    return user;
  }

  private async _findByProductIdOrFail(productId: string) {
    const product = await this.productRepository.findById(productId);
    if (!product) throw new NotFoundException('product not found');

    return product;
  }

  private _calculateChangeInCoins(change: number) {
    const changeInCoins: number[] = [];
    let remainingChange = change;
    const coins = [100, 50, 20, 10, 5];

    for (const coin of coins) {
      while (remainingChange >= coin) {
        changeInCoins.push(coin);
        remainingChange -= coin;
      }
    }

    return changeInCoins;
  }
}
