import fp from 'fastify-plugin';
import { FastifyPluginAsync } from 'fastify';
import cors from '@fastify/cors';
import { config } from '../config/env.js';

const corsPlugin: FastifyPluginAsync = fp(async (fastify) => {
  await fastify.register(cors, {
    origin: config.frontendUrls,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['*'],
    credentials: true,
    maxAge: 3600,
  });
});

export default corsPlugin;
