import { PrismaClient } from '@prisma/client';
import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { ConfigMangerService } from 'src/infrastructure/config/config.service';

@Injectable()
export class DatabaseService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(DatabaseService.name);
  constructor(config: ConfigMangerService) {
    const url = config.get('DATABASE_URL');

    super({
      datasources: {
        db: {
          url,
        },
      },
      // log: ['query', 'info', 'warn'],
    });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('database connected');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
