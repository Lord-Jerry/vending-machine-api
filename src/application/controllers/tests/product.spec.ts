import * as argon2 from 'argon2';
import * as request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';

import { CreateProductDto } from 'src/application/dtos/product.dto';
import { AppModule } from 'src/app.module';
import { PrismaModule } from 'src/infrastructure/database/database.module';
import { DatabaseService } from 'src/infrastructure/database/database.service';

describe('ProductController (e2e)', () => {
  let app: INestApplication;
  let prismaService: DatabaseService;
  let jwtService: JwtService;
  let buyerAccessToken: string;
  let sellerAccessToken: string;
  let sellerProduct = null;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, PrismaModule],
      providers: [JwtService],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = moduleFixture.get<DatabaseService>(DatabaseService);
    jwtService = moduleFixture.get<JwtService>(JwtService);
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  beforeEach(async () => {
    await prismaService.$transaction([
      prismaService.product.deleteMany(),
      prismaService.user.deleteMany(),
    ]);

    const seller = await prismaService.user.create({
      data: {
        username: 'seller-test',
        password: await argon2.hash('seller-test'),
        role: 'SELLER',
      },
    });

    sellerProduct = await prismaService.product.create({
      data: {
        sellerId: seller.id,
        productName: 'test 1',
        cost: 5,
        amountAvailable: 5,
      },
    });

    sellerAccessToken = jwtService.sign({
      role: seller.role,
      userId: seller.id,
      username: seller.username,
    });

    const buyer = await prismaService.user.create({
      data: {
        username: 'buyer-test',
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
  });

  afterAll(async () => {
    await prismaService.$disconnect();
    await app.close();
  });

  describe('/product/create', () => {
    it('should create a new product', async () => {
      const createProductDto: CreateProductDto = {
        cost: 100,
        name: 'Test Product',
        amount_available: 10,
      };

      return request(app.getHttpServer())
        .post('/product/create')
        .set('Authorization', `Bearer ${sellerAccessToken}`)
        .send(createProductDto)
        .expect(201);
    });

    it('should throw an error when creating a product with a buyers access token', async () => {
      const createProductDto: CreateProductDto = {
        cost: 100,
        name: 'Test Product',
        amount_available: 10,
      };

      return request(app.getHttpServer())
        .post('/product/create')
        .set('Authorization', `Bearer ${buyerAccessToken}`)
        .send(createProductDto)
        .expect(403);
    });
  });

  describe('/product/buy', () => {
    it('should buy aproduct', async () => {
      const payload = {
        product_id: sellerProduct.id,
        amount: 1,
      };

      const response = await request(app.getHttpServer())
        .post('/product/buy')
        .set('Authorization', `Bearer ${buyerAccessToken}`)
        .send(payload)
        .expect(201);
      expect(response.body.change).toStrictEqual([20, 20, 5]);
    });

    it('should throw an error if a seller tries to call this endpoint', async () => {
      const payload = {
        product_id: sellerProduct.id,
        amount: 1,
      };

      await request(app.getHttpServer())
        .post('/product/buy')
        .set('Authorization', `Bearer ${sellerAccessToken}`)
        .send(payload)
        .expect(403);
    });
  });
});
