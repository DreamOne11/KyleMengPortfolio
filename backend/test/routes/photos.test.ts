import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import Fastify from 'fastify';
import sensible from '@fastify/sensible';
import photosRoutes from '../../src/routes/photos.js';

vi.mock('../../src/config/env.js', () => ({
  config: {
    nodeEnv: 'test',
    port: 8080,
    databaseUrl: 'postgresql://test',
    frontendUrls: ['http://localhost:3000'],
    isProduction: false,
  },
}));

const mockCategories = [
  {
    id: 1,
    name: 'portrait',
    displayName: 'Portrait',
    description: null,
    iconColor: '#EC4899',
    sortOrder: 1,
    photoCount: 5,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

const mockPhoto = {
  id: 1,
  title: 'Portrait 1',
  filePath: '/photos/portrait/1.webp',
  thumbnailPath: '/photos/portrait/thumb/1.webp',
  categoryId: 1,
  categoryName: 'portrait',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

vi.mock('../../src/services/photoService.js', () => ({
  PhotoService: vi.fn().mockImplementation(() => ({
    getAllCategories: vi.fn().mockResolvedValue(mockCategories),
    getCategoryById: vi.fn().mockImplementation((id: number) =>
      id === 1 ? Promise.resolve(mockCategories[0]) : Promise.resolve(null)
    ),
    getAllPhotos: vi.fn().mockResolvedValue([mockPhoto]),
    getPhotoById: vi.fn().mockImplementation((id: number) =>
      id === 1 ? Promise.resolve(mockPhoto) : Promise.resolve(null)
    ),
    getPhotosByCategory: vi.fn().mockResolvedValue([mockPhoto]),
  })),
}));

const app = Fastify();

beforeAll(async () => {
  await app.register(sensible);
  app.decorate('prisma', {} as never);
  await app.register(photosRoutes);
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

describe('Photo category routes', () => {
  it('GET /api/photo-categories returns array', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/photo-categories' });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(Array.isArray(body)).toBe(true);
    expect(body[0].photoCount).toBe(5);
  });

  it('GET /api/photo-categories/1 returns category', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/photo-categories/1' });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).name).toBe('portrait');
  });

  it('GET /api/photo-categories/999 returns 404', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/photo-categories/999' });
    expect(res.statusCode).toBe(404);
  });
});

describe('Photo routes', () => {
  it('GET /api/photos returns array', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/photos' });
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(JSON.parse(res.body))).toBe(true);
  });

  it('GET /api/photos/1 returns photo', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/photos/1' });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).categoryId).toBe(1);
  });

  it('GET /api/photos/999 returns 404', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/photos/999' });
    expect(res.statusCode).toBe(404);
  });

  it('GET /api/photos/category/1 returns array', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/photos/category/1' });
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(JSON.parse(res.body))).toBe(true);
  });
});
