import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { DatabaseService } from 'src/infrastructure/database/database.service';

@Injectable()
export class ProductRepository {
  constructor(private db: DatabaseService) {}

  async create(data: Prisma.ProductCreateInput) {
    return this.db.product.create({ data });
  }

  async update(id: string, data: Prisma.ProductUpdateInput) {
    return this.db.product.update({ where: { id }, data });
  }

  async getBySellerId(sellerId: string, cursor?: string, take = 25) {
    return this.db.product.findMany({
      take,
      where: { sellerId },
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
    });
  }

  async getAll(cursor?: string, take = 25) {
    return this.db.product.findMany({
      take,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
    });
  }

  async findById(id: string) {
    return this.db.product.findUnique({ where: { id } });
  }

  async delete(id: string) {
    return this.db.product.delete({ where: { id } });
  }
}
