import * as argon2 from 'argon2';
import * as request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';

import { AppModule } from 'src/app.module';
import { PrismaModule } from 'src/infrastructure/database/database.module';
import { DatabaseService } from 'src/infrastructure/database/database.service';

describe('UserController (e2e', () => {
  let app: INestApplication;
  let prismaService: DatabaseService;
  let jwtService: JwtService;
  let buyerAccessToken: string;
  let sellerAccessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, PrismaModule],
      providers: [JwtService],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = moduleFixture.get<DatabaseService>(DatabaseService);
    jwtService = moduleFixture.get<JwtService>(JwtService);
    app.useGlobalPipes(new ValidationPipe());

    const buyer = await prismaService.user.create({
      data: {
        username: 'user-buyer-test1',
        password: await argon2.hash('buyer-test'),
        role: 'BUYER',
        deposit: 50,
      },
    });

    buyerAccessToken = jwtService.sign({
      role: buyer.role,
      userId: buyer.id,
      username: buyer.username,
    });

    const seller = await prismaService.user.create({
      data: {
        username: 'user-seller-test',
        password: await argon2.hash('seller-test'),
        role: 'SELLER',
      },
    });

    sellerAccessToken = jwtService.sign({
      role: seller.role,
      userId: seller.id,
      username: seller.username,
    });
    await app.init();
  });

  afterAll(async () => {
    await prismaService.$disconnect();
    await app.close();
  });

  describe('/user/deposit', () => {
    it('should deposit for users who are BUYERS', async () => {
      const payload = {
        amount: 50,
      };

      return request(app.getHttpServer())
        .post('/user/deposit')
        .set('Authorization', `Bearer ${buyerAccessToken}`)
        .send(payload)
        .expect(201);
    });

    it('should throw a forbidden error if user is a seller', async () => {
      const payload = {
        amount: 50,
      };

      return request(app.getHttpServer())
        .post('/user/deposit')
        .set('Authorization', `Bearer ${sellerAccessToken}`)
        .send(payload)
        .expect(403);
    });
  });
});
