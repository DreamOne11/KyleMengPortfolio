import { FastifyPluginAsync } from 'fastify';
import { PhotoService } from '../services/photoService.js';

const photosRoutes: FastifyPluginAsync = async (fastify) => {
  const service = new PhotoService(fastify.prisma);

  fastify.get('/api/photo-categories', async () => {
    return service.getAllCategories();
  });

  fastify.get<{ Params: { id: string } }>('/api/photo-categories/:id', async (request, reply) => {
    const id = parseInt(request.params.id, 10);
    if (isNaN(id)) return reply.badRequest('Invalid id');

    const category = await service.getCategoryById(id);
    if (!category) return reply.notFound('Category not found');
    return category;
  });

  fastify.get<{ Querystring: { page?: string; size?: string } }>('/api/photos', async (request) => {
    const { page, size } = request.query;
    if (page !== undefined && size !== undefined) {
      return service.getAllPhotos(parseInt(page, 10), parseInt(size, 10));
    }
    return service.getAllPhotos();
  });

  fastify.get<{ Params: { id: string } }>('/api/photos/:id', async (request, reply) => {
    const id = parseInt(request.params.id, 10);
    if (isNaN(id)) return reply.badRequest('Invalid id');

    const photo = await service.getPhotoById(id);
    if (!photo) return reply.notFound('Photo not found');
    return photo;
  });

  fastify.get<{
    Params: { categoryId: string };
    Querystring: { page?: string; size?: string };
  }>('/api/photos/category/:categoryId', async (request, reply) => {
    const categoryId = parseInt(request.params.categoryId, 10);
    if (isNaN(categoryId)) return reply.badRequest('Invalid categoryId');

    const { page, size } = request.query;
    if (page !== undefined && size !== undefined) {
      return service.getPhotosByCategory(categoryId, parseInt(page, 10), parseInt(size, 10));
    }
    return service.getPhotosByCategory(categoryId);
  });
};

export default photosRoutes;
