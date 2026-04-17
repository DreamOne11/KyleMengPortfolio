import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import Fastify from 'fastify';
import healthRoutes from '../../src/routes/health.js';

vi.mock('../../src/config/env.js', () => ({
  config: {
    nodeEnv: 'test',
    port: 8080,
    databaseUrl: 'postgresql://test',
    frontendUrls: ['http://localhost:3000'],
    isProduction: false,
  },
}));

const app = Fastify();

beforeAll(async () => {
  await app.register(healthRoutes);
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

describe('Health routes', () => {
  it('GET / returns welcome message', async () => {
    const res = await app.inject({ method: 'GET', url: '/' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toContain('Welcome');
  });

  it('GET /api/health returns OK', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/health' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toBe('OK');
  });

  it('GET /actuator/health returns UP status', async () => {
    const res = await app.inject({ method: 'GET', url: '/actuator/health' });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.status).toBe('UP');
    expect(body.components.db.status).toBe('UP');
  });
});
