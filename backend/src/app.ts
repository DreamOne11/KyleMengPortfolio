import Fastify, { FastifyInstance } from 'fastify';
import databasePlugin from './plugins/database.js';
import corsPlugin from './plugins/cors.js';
import sensiblePlugin from './plugins/sensible.js';
import { registerRoutes } from './routes/index.js';

export async function buildApp(): Promise<FastifyInstance> {
  const fastify = Fastify({
    logger: {
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    },
  });

  await fastify.register(databasePlugin);
  await fastify.register(corsPlugin);
  await fastify.register(sensiblePlugin);

  await registerRoutes(fastify);

  return fastify;
}
