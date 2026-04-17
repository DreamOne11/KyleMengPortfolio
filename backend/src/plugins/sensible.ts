import fp from 'fastify-plugin';
import { FastifyPluginAsync } from 'fastify';
import sensible from '@fastify/sensible';

const sensiblePlugin: FastifyPluginAsync = fp(async (fastify) => {
  await fastify.register(sensible);
});

export default sensiblePlugin;
