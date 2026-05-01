import { PhotoCategoryResponse, PhotoResponse } from '../types/photography';

const now = '2026-01-01T00:00:00.000Z';

export const localPhotoCategories: PhotoCategoryResponse[] = [
  {
    id: 1,
    name: 'portrait',
    displayName: 'Portrait',
    description: 'Capturing the essence of human beings through portraiture',
    iconColor: '#EC4899',
    sortOrder: 1,
    photoCount: 5,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 2,
    name: 'landscape',
    displayName: 'Landscape',
    description: 'Exploring the beauty of natural scenery and environments',
    iconColor: '#10B981',
    sortOrder: 2,
    photoCount: 5,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 3,
    name: 'humanist',
    displayName: 'Humanist',
    description: 'Documentary and cultural photography celebrating humanity',
    iconColor: '#3B82F6',
    sortOrder: 3,
    photoCount: 5,
    createdAt: now,
    updatedAt: now,
  },
];

const photo = (
  id: number,
  categoryId: number,
  categoryName: string,
  title: string,
  fileName: string
): PhotoResponse => ({
  id,
  categoryId,
  categoryName,
  title,
  filePath: `/images/photography/${categoryName}/thumbnails/${fileName}-full.webp`,
  thumbnailPath: `/images/photography/${categoryName}/thumbnails/${fileName}-card.webp`,
  createdAt: now,
  updatedAt: now,
});

export const localPhotosByCategory: Record<number, PhotoResponse[]> = {
  1: [
    photo(1, 1, 'portrait', 'Portrait Study 1', 'DSC_4769'),
    photo(2, 1, 'portrait', 'Portrait Study 2', 'DSC_6428'),
    photo(3, 1, 'portrait', 'Portrait Study 3', 'IMG_2781'),
    photo(4, 1, 'portrait', 'Portrait Study 4', 'IMG_2923'),
    photo(5, 1, 'portrait', 'Portrait Study 5', 'IMG_4382'),
  ],
  2: [
    photo(6, 2, 'landscape', 'Mountain Vista', 'DSC_1093'),
    photo(7, 2, 'landscape', 'Serene Waters', 'DSC_1174'),
    photo(8, 2, 'landscape', 'Natural Beauty', 'DSC_1180'),
    photo(9, 2, 'landscape', 'Wilderness Scene', 'DSC_1190'),
    photo(10, 2, 'landscape', 'Scenic Overlook', 'DSC_1195'),
  ],
  3: [
    photo(11, 3, 'humanist', 'Human Connection', 'DSC_3590'),
    photo(12, 3, 'humanist', 'Daily Life', 'DSC_3592'),
    photo(13, 3, 'humanist', 'Cultural Expression', 'DSC_3595'),
    photo(14, 3, 'humanist', 'Social Documentary', 'DSC_3597'),
    photo(15, 3, 'humanist', 'Life Stories', 'DSC_3642'),
  ],
};

export const localPhotos = Object.values(localPhotosByCategory).flat();
