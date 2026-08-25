import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { AllExceptionsFilter } from './../src/common/filters/all-exceptions.filter';
import { HttpExceptionFilter } from './../src/common/filters/http-exception.filter';
import { TransformInterceptor } from './../src/common/interceptors/transform.interceptor';

interface ApiEnvelope<T> {
  code: number;
  message: string;
  data: T;
}

interface Paginated {
  list: unknown[];
  total: number;
  page: number;
  pageSize: number;
}

describe('Blog API (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    app.useGlobalInterceptors(new TransformInterceptor());
    app.useGlobalFilters(new AllExceptionsFilter(), new HttpExceptionFilter());
    await app.init();
  });

  it('/api/posts (GET) returns unified envelope', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/posts')
      .expect(200);
    const body = res.body as ApiEnvelope<unknown[]>;
    expect(body.code).toBe(0);
    expect(body.message).toBe('ok');
    expect(Array.isArray(body.data)).toBe(true);
  });

  it('/api/posts?page=1&pageSize=2 (GET) returns paginated structure', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/posts')
      .query({ page: 1, pageSize: 2 })
      .expect(200);
    const body = res.body as ApiEnvelope<Paginated>;
    expect(body.code).toBe(0);
    expect(body.data).toHaveProperty('list');
    expect(body.data).toHaveProperty('total');
    expect(body.data).toHaveProperty('page');
    expect(body.data).toHaveProperty('pageSize');
  });

  it('/api/posts/{id} (GET) returns full detail with codingChallenge', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/posts/handwritten-promise-all')
      .expect(200);
    const body = res.body as ApiEnvelope<{
      codingChallenge: { testCases: unknown[] };
      content: string;
    }>;
    expect(body.code).toBe(0);
    expect(body.data.codingChallenge.testCases.length).toBeGreaterThan(0);
    expect(body.data.content.length).toBeGreaterThan(0);
  });

  it('GET /api/posts/unknown (GET) returns 404 envelope', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/posts/unknown')
      .expect(404);
    const body = res.body as ApiEnvelope<null>;
    expect(body.code).toBe(404);
    expect(body.data).toBeNull();
  });

  it('/api/comments (POST) validates input', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/comments')
      .send({ author: '', content: '' })
      .expect(400);
    const body = res.body as ApiEnvelope<null>;
    expect(body.code).toBe(400);
    expect(body.data).toBeNull();
  });

  afterEach(async () => {
    await app.close();
  });
});
