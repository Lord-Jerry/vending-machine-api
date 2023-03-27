import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { ConfigMangerModule } from 'src/infrastructure/config/config.module';
import { ConfigMangerService } from 'src/infrastructure/config/config.service';
import { PrismaModule } from 'src/infrastructure/database/database.module';

import { UserService } from 'src/domain/services/user.service';
import { JwtStrategy } from 'src/infrastructure/auth/jwt.strategy';
import { ProductService } from 'src/domain/services/product.service';
import { UserRepository } from 'src/infrastructure/repositories/user.repository';
import { ProductRepository } from 'src/infrastructure/repositories/product.repository';

import { UserController } from 'src/application/controllers/users.controller';
import { ProductController } from 'src/application/controllers/product.controller';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    ConfigMangerModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
  ],
  providers: [
    JwtStrategy,
    UserService,
    ProductService,
    UserRepository,
    ProductRepository,
    ConfigMangerService,
  ],
  controllers: [UserController, ProductController],
})
export class AppModule {}
