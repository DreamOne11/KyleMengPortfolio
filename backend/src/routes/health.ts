import { FastifyPluginAsync } from 'fastify';

const healthRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async () => {
    return 'Welcome to Kyle Meng Portfolio API';
  });

  fastify.get('/api/health', async (_request, reply) => {
    reply.type('text/plain');
    return 'OK';
  });

  fastify.get('/actuator/health', async () => {
    return {
      status: 'UP',
      components: {
        db: { status: 'UP' },
        diskSpace: { status: 'UP' },
      },
    };
  });
};

export default healthRoutes;
