import { Type, Static } from '@sinclair/typebox';

export const PhotoCategoryResponseSchema = Type.Object({
  id: Type.Number(),
  name: Type.String(),
  displayName: Type.String(),
  description: Type.Union([Type.String(), Type.Null()]),
  iconColor: Type.String(),
  sortOrder: Type.Number(),
  photoCount: Type.Number(),
  createdAt: Type.String(),
  updatedAt: Type.String(),
});

export const PhotoResponseSchema = Type.Object({
  id: Type.Number(),
  title: Type.String(),
  filePath: Type.String(),
  thumbnailPath: Type.Union([Type.String(), Type.Null()]),
  categoryId: Type.Number(),
  categoryName: Type.String(),
  createdAt: Type.String(),
  updatedAt: Type.String(),
});

export const PaginatedPhotosSchema = Type.Object({
  content: Type.Array(PhotoResponseSchema),
  totalElements: Type.Number(),
  totalPages: Type.Number(),
  size: Type.Number(),
  number: Type.Number(),
});

export type PhotoCategoryResponse = Static<typeof PhotoCategoryResponseSchema>;
export type PhotoResponse = Static<typeof PhotoResponseSchema>;
export type PaginatedPhotos = Static<typeof PaginatedPhotosSchema>;
