import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma/prisma.service';

/**
 * Full User Flow E2E Test
 * 
 * Tests the complete user journey:
 * 1. Register
 * 2. Create Company
 * 3. Add Projects
 * 4. Add Expenses
 * 5. Run Analysis
 * 6. Generate Claim
 * 7. Download PDF
 */
describe('Full User Flow E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;
  let companyId: string;
  let projectIds: string[] = [];
  let expenseIds: string[] = [];
  let analysisId: string;
  let claimId: string;

  const testEmail = `e2e-flow-${Date.now()}@example.com`;

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
    // Cleanup
    if (companyId) {
      await prisma.company.deleteMany({
        where: { id: companyId },
      });
    }
    await prisma.user.deleteMany({
      where: { email: testEmail },
    });
    
    await prisma.$disconnect();
    await app.close();
  });

  describe('Step 1: User Registration', () => {
    it('should register a new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: testEmail,
          password: 'SecurePassword123!',
        })
        .expect(201);

      expect(response.body).toHaveProperty('access_token');
      accessToken = response.body.access_token;
    });
  });

  describe('Step 2: Create Company', () => {
    it('should create a company', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/company')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'E2E Test Company',
          country: 'NL',
          industry: 'Software Development',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('E2E Test Company');
      expect(response.body.country).toBe('NL');
      companyId = response.body.id;
    });

    it('should retrieve the created company', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/company')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.id).toBe(companyId);
      expect(response.body.name).toBe('E2E Test Company');
    });
  });

  describe('Step 3: Add Projects', () => {
    it('should create first R&D project', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/company/${companyId}/projects`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'AI-Powered Recommendation Engine',
          description: 'Developing a novel machine learning algorithm for personalized product recommendations using deep learning and real-time data processing.',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      projectIds.push(response.body.id);
    });

    it('should create second R&D project', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/company/${companyId}/projects`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Blockchain-based Supply Chain System',
          description: 'Research and development of a distributed ledger system for transparent supply chain tracking with smart contract automation.',
        })
        .expect(201);

      projectIds.push(response.body.id);
    });

    it('should create non-R&D project', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/company/${companyId}/projects`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Marketing Website Redesign',
          description: 'Updating the company website with a new design and improved user experience.',
        })
        .expect(201);

      projectIds.push(response.body.id);
    });

    it('should list all projects', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/company/${companyId}/projects`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(3);
    });
  });

  describe('Step 4: Add Expenses', () => {
    it('should add salary expense', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/company/${companyId}/expenses`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          type: 'salary',
          amount: 150000,
          currency: 'EUR',
          date: '2024-01-15',
          description: 'Senior ML Engineer salary for Q1 2024',
        })
        .expect(201);

      expenseIds.push(response.body.id);
    });

    it('should add contractor expense', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/company/${companyId}/expenses`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          type: 'contractor',
          amount: 50000,
          currency: 'EUR',
          date: '2024-02-01',
          description: 'External blockchain consultant',
        })
        .expect(201);

      expenseIds.push(response.body.id);
    });

    it('should add software expense', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/company/${companyId}/expenses`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          type: 'software',
          amount: 10000,
          currency: 'EUR',
          date: '2024-01-01',
          description: 'Cloud computing and ML tools licenses',
        })
        .expect(201);

      expenseIds.push(response.body.id);
    });

    it('should add equipment expense', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/company/${companyId}/expenses`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          type: 'equipment',
          amount: 25000,
          currency: 'EUR',
          date: '2024-01-10',
          description: 'GPU servers for ML training',
        })
        .expect(201);

      expenseIds.push(response.body.id);
    });

    it('should list all expenses', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/company/${companyId}/expenses`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(4);
    });
  });

  describe('Step 5: Run Analysis', () => {
    let jobId: string;

    it('should start analysis job', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/company/${companyId}/analysis/run`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(201);

      expect(response.body).toHaveProperty('jobId');
      expect(response.body.status).toBe('queued');
      jobId = response.body.jobId;
    });

    it('should poll job status until completion', async () => {
      // Poll with timeout (max 60 seconds)
      const maxAttempts = 30;
      let attempts = 0;
      let completed = false;

      while (attempts < maxAttempts && !completed) {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/company/${companyId}/analysis/jobs/${jobId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);

        if (response.body.state === 'completed') {
          completed = true;
          expect(response.body).toHaveProperty('result');
          analysisId = response.body.result.id;
        } else if (response.body.state === 'failed') {
          throw new Error(`Analysis job failed: ${response.body.error}`);
        }

        if (!completed) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          attempts++;
        }
      }

      expect(completed).toBe(true);
    }, 120000); // 2 minute timeout

    it('should retrieve analysis result', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/company/${companyId}/analysis/${analysisId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('rd_score');
      expect(response.body).toHaveProperty('estimated_amount');
      expect(response.body.rd_score).toBeGreaterThan(0);
      expect(response.body.estimated_amount).toBeGreaterThan(0);
    });

    it('should list all analysis runs', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/company/${companyId}/analysis`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('Step 6: Generate Claim', () => {
    let jobId: string;

    it('should start claim generation job', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/company/${companyId}/claims/generate`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(201);

      expect(response.body).toHaveProperty('jobId');
      expect(response.body.status).toBe('queued');
      jobId = response.body.jobId;
    });

    it('should poll job status until completion', async () => {
      const maxAttempts = 30;
      let attempts = 0;
      let completed = false;

      while (attempts < maxAttempts && !completed) {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/company/${companyId}/claims/jobs/${jobId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);

        if (response.body.state === 'completed') {
          completed = true;
          expect(response.body).toHaveProperty('result');
          claimId = response.body.result.id;
        } else if (response.body.state === 'failed') {
          throw new Error(`Claim generation failed: ${response.body.error}`);
        }

        if (!completed) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          attempts++;
        }
      }

      expect(completed).toBe(true);
    }, 120000);

    it('should retrieve generated claim', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/company/${companyId}/claims/${claimId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('generated_text');
      expect(response.body).toHaveProperty('estimated_amount');
      expect(response.body.status).toBe('generated');
      expect(response.body.generated_text).toBeTruthy();
    });

    it('should list all claims', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/company/${companyId}/claims`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('Step 7: Download PDF', () => {
    it('should download claim as PDF', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/company/${companyId}/claims/${claimId}/pdf`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.headers['content-type']).toBe('application/pdf');
      expect(response.headers['content-disposition']).toContain('attachment');
      expect(response.body).toBeTruthy();
    });
  });

  describe('Step 8: Submit Claim', () => {
    it('should submit the claim', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/company/${companyId}/claims/${claimId}/submit`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.status).toBe('submitted');
    });

    it('should verify claim status changed', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/company/${companyId}/claims/${claimId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.status).toBe('submitted');
    });
  });

  describe('Step 9: Analytics', () => {
    it('should retrieve analytics report', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/analytics')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('totalUsers');
      expect(response.body).toHaveProperty('totalCompanies');
      expect(response.body).toHaveProperty('totalAnalysisRuns');
      expect(response.body).toHaveProperty('totalClaims');
    });
  });
});
