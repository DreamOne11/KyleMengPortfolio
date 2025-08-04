// Photography Screen TypeScript Type Definitions

export interface PhotoCategory {
  id: number;
  name: string;
  displayName: string;
  description: string;
  iconColor: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Photo {
  id: number;
  categoryId: number;
  categoryName: string;
  title: string;
  description: string;
  filePath: string;
  thumbnailPath: string;
  takenAt: string;
  location: string;
  likesCount: number;
  createdAt: string;
  updatedAt: string;
}

// API Response Types
export interface PhotoCategoryResponse {
  id: number;
  name: string;
  displayName: string;
  description: string;
  iconColor: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  photoCount: number;
}

export interface PhotoResponse {
  id: number;
  categoryId: number;
  categoryName: string;
  title: string;
  description: string;
  filePath: string;
  thumbnailPath: string;
  takenAt: string;
  location: string;
  likesCount: number;
  createdAt: string;
  updatedAt: string;
}

// API Error Types
export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

// API Response Wrapper
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

// Like interaction types
export interface LikeResponse {
  photoId: number;
  likesCount: number;
  success: boolean;
}

// Pagination Types
export interface PaginationParams {
  page?: number;
  size?: number;
}

// Search Types
export interface SearchParams extends PaginationParams {
  keyword?: string;
  categoryId?: number;
}