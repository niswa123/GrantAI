import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma/prisma.service';

describe('Auth E2E Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    app.setGlobalPrefix('api/v1');
    
    prisma = app.get<PrismaService>(PrismaService);
    
    await app.init();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    // Clean up test data
    await prisma.user.deleteMany({
      where: { email: { contains: 'e2e-test' } },
    });
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'e2e-test-user@example.com',
          password: 'SecurePassword123!',
        })
        .expect(201);

      expect(response.body).toHaveProperty('access_token');
      expect(typeof response.body.access_token).toBe('string');
    });

    it('should reject registration with invalid email', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'invalid-email',
          password: 'SecurePassword123!',
        })
        .expect(400);
    });

    it('should reject registration with weak password', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'e2e-test-weak@example.com',
          password: '123',
        })
        .expect(400);
    });

    it('should reject duplicate email registration', async () => {
      const email = 'e2e-test-duplicate@example.com';
      const password = 'SecurePassword123!';

      // First registration
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ email, password })
        .expect(201);

      // Duplicate registration
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ email, password })
        .expect(409);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    const testUser = {
      email: 'e2e-test-login@example.com',
      password: 'SecurePassword123!',
    };

    beforeEach(async () => {
      // Create test user
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(testUser);
    });

    it('should login successfully with correct credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send(testUser)
        .expect(200);

      expect(response.body).toHaveProperty('access_token');
      expect(typeof response.body.access_token).toBe('string');
    });

    it('should reject login with incorrect password', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123!',
        })
        .expect(401);
    });

    it('should reject login with non-existent email', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'SomePassword123!',
        })
        .expect(401);
    });

    it('should reject login with missing credentials', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({})
        .expect(400);
    });
  });

  describe('JWT Token Validation', () => {
    let accessToken: string;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'e2e-test-jwt@example.com',
          password: 'SecurePassword123!',
        });

      accessToken = response.body.access_token;
    });

    it('should access protected route with valid token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/company')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });

    it('should reject protected route without token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/company')
        .expect(401);
    });

    it('should reject protected route with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/company')
        .set('Authorization', 'Bearer invalid-token-here')
        .expect(401);
    });

    it('should reject protected route with malformed authorization header', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/company')
        .set('Authorization', 'InvalidFormat')
        .expect(401);
    });
  });
});
