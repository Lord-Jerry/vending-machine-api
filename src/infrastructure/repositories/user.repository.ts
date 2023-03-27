import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { DatabaseService } from 'src/infrastructure/database/database.service';

@Injectable()
export class UserRepository {
  constructor(private db: DatabaseService) {}

  async create(data: Prisma.UserCreateInput) {
    return this.db.user.create({ data });
  }

  async findByUsername(username: string) {
    return this.db.user.findUnique({ where: { username } });
  }

  async findById(id: string) {
    return this.db.user.findUnique({ where: { id } });
  }

  async deposit(userId: string, amount: number) {
    return this.db.user.update({
      where: { id: userId },
      data: { deposit: { increment: amount } },
    });
  }

  async resetDeposit(userId: string) {
    return this.db.user.update({
      where: { id: userId },
      data: { deposit: 0 },
    });
  }
}
