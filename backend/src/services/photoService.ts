import { PrismaClient, Prisma } from '@prisma/client';
import { PhotoCategoryResponse, PhotoResponse, PaginatedPhotos } from '../types/api.js';

type CategoryWithCount = Prisma.PhotoCategoryGetPayload<{
  include: { _count: { select: { photos: true } } };
}>;

type PhotoWithCategory = Prisma.PhotoGetPayload<{
  include: { category: true };
}>;

function mapCategory(cat: CategoryWithCount): PhotoCategoryResponse {
  return {
    id: Number(cat.id),
    name: cat.name,
    displayName: cat.displayName,
    description: cat.description ?? null,
    iconColor: cat.iconColor ?? '#3B82F6',
    sortOrder: cat.sortOrder ?? 0,
    photoCount: cat._count.photos,
    createdAt: cat.createdAt?.toISOString() ?? new Date().toISOString(),
    updatedAt: cat.updatedAt?.toISOString() ?? new Date().toISOString(),
  };
}

function mapPhoto(photo: PhotoWithCategory): PhotoResponse {
  return {
    id: Number(photo.id),
    title: photo.title,
    filePath: photo.filePath,
    thumbnailPath: photo.thumbnailPath ?? null,
    categoryId: Number(photo.categoryId),
    categoryName: photo.category.name,
    createdAt: photo.createdAt?.toISOString() ?? new Date().toISOString(),
    updatedAt: photo.updatedAt?.toISOString() ?? new Date().toISOString(),
  };
}

export class PhotoService {
  constructor(private readonly prisma: PrismaClient) {}

  async getAllCategories(): Promise<PhotoCategoryResponse[]> {
    const categories = await this.prisma.photoCategory.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: { _count: { select: { photos: true } } },
    });
    return categories.map(mapCategory);
  }

  async getCategoryById(id: number): Promise<PhotoCategoryResponse | null> {
    const cat = await this.prisma.photoCategory.findUnique({
      where: { id: BigInt(id) },
      include: { _count: { select: { photos: true } } },
    });
    if (!cat) return null;
    return mapCategory(cat);
  }

  async getAllPhotos(page?: number, size?: number): Promise<PhotoResponse[] | PaginatedPhotos> {
    if (page !== undefined && size !== undefined) {
      const [photos, total] = await Promise.all([
        this.prisma.photo.findMany({
          skip: page * size,
          take: size,
          orderBy: { createdAt: 'desc' },
          include: { category: true },
        }),
        this.prisma.photo.count(),
      ]);
      return {
        content: photos.map(mapPhoto),
        totalElements: total,
        totalPages: Math.ceil(total / size),
        size,
        number: page,
      };
    }

    const photos = await this.prisma.photo.findMany({
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    });
    return photos.map(mapPhoto);
  }

  async getPhotoById(id: number): Promise<PhotoResponse | null> {
    const photo = await this.prisma.photo.findUnique({
      where: { id: BigInt(id) },
      include: { category: true },
    });
    if (!photo) return null;
    return mapPhoto(photo);
  }

  async getPhotosByCategory(
    categoryId: number,
    page?: number,
    size?: number
  ): Promise<PhotoResponse[] | PaginatedPhotos> {
    const where = { categoryId: BigInt(categoryId) };

    if (page !== undefined && size !== undefined) {
      const [photos, total] = await Promise.all([
        this.prisma.photo.findMany({
          where,
          skip: page * size,
          take: size,
          orderBy: { createdAt: 'desc' },
          include: { category: true },
        }),
        this.prisma.photo.count({ where }),
      ]);
      return {
        content: photos.map(mapPhoto),
        totalElements: total,
        totalPages: Math.ceil(total / size),
        size,
        number: page,
      };
    }

    const photos = await this.prisma.photo.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    });
    return photos.map(mapPhoto);
  }
}
