import { FastifyInstance } from 'fastify';
import healthRoutes from './health.js';
import photosRoutes from './photos.js';

export async function registerRoutes(fastify: FastifyInstance): Promise<void> {
  await fastify.register(healthRoutes);
  await fastify.register(photosRoutes);
}
