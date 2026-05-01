// Photography API Service Layer
import axios, { AxiosResponse } from 'axios';
import {
  PhotoCategoryResponse,
  PhotoResponse,
  ApiError,
  PaginationParams
} from '../types/photography';
import {
  localPhotoCategories,
  localPhotos,
  localPhotosByCategory
} from '../data/localPhotographyFallback';

// API Base Configuration
// 使用环境变量或默认值
// 生产环境使用相对路径（通过 Nginx 反向代理）
const API_BASE_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? '/api'  // 生产环境：通过 Nginx 代理访问后端
    : 'http://localhost:8080/api');    // 本地开发地址

// Create Axios instance with base configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const isLocalFallbackEnabled = import.meta.env.DEV;

const normalizePhotoPath = (path?: string | null): string => {
  if (!path) return '';
  return path.replace(/^\/photos\/photography\//, '/images/photography/');
};

const normalizePhoto = (photo: PhotoResponse): PhotoResponse => ({
  ...photo,
  filePath: normalizePhotoPath(photo.filePath),
  thumbnailPath: normalizePhotoPath(photo.thumbnailPath),
});

const normalizePhotos = (photos: PhotoResponse[]): PhotoResponse[] => photos.map(normalizePhoto);

const hasRenderablePhotos = (photos: PhotoResponse[]): boolean =>
  photos.some(photo => Boolean(photo.thumbnailPath || photo.filePath));

const paginate = (photos: PhotoResponse[], params?: PaginationParams): PhotoResponse[] => {
  if (!params || params.page === undefined || params.size === undefined) return photos;

  const start = params.page * params.size;
  return photos.slice(start, start + params.size);
};

// Request interceptor for adding auth tokens (if needed in future)
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token here if needed in future
    // const token = localStorage.getItem('authToken');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for unified error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    const apiError: ApiError = {
      message: error.response?.data?.message || error.message || 'An unexpected error occurred',
      status: error.response?.status || 500,
      code: error.response?.data?.code || 'UNKNOWN_ERROR'
    };
    
    // Log error for debugging
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: apiError.status,
      message: apiError.message
    });
    
    return Promise.reject(apiError);
  }
);

// Photography API Service Class
export class PhotographyApiService {
  // Get all photo categories with photo counts
  static async getPhotoCategories(): Promise<PhotoCategoryResponse[]> {
    try {
      const response = await apiClient.get<PhotoCategoryResponse[]>('/photo-categories');
      const categories = response.data;

      if (isLocalFallbackEnabled && categories.every(category => category.photoCount === 0)) {
        return localPhotoCategories;
      }

      return categories;
    } catch (error) {
      if (isLocalFallbackEnabled) {
        console.warn('Using local photography fallback categories:', error);
        return localPhotoCategories;
      }

      throw error;
    }
  }

  // Get specific photo category by ID
  static async getPhotoCategoryById(id: number): Promise<PhotoCategoryResponse> {
    try {
      const response = await apiClient.get<PhotoCategoryResponse>(`/photo-categories/${id}`);
      return response.data;
    } catch (error) {
      const fallbackCategory = localPhotoCategories.find(category => category.id === id);
      if (isLocalFallbackEnabled && fallbackCategory) {
        return fallbackCategory;
      }

      throw error;
    }
  }

  // Get photos by category ID with optional pagination
  static async getPhotosByCategory(
    categoryId: number,
    params?: PaginationParams
  ): Promise<PhotoResponse[]> {
    try {
      const queryParams = params ? { page: params.page ?? 0, size: params.size ?? 20 } : undefined;
      const response = await apiClient.get(`/photos/category/${categoryId}`, { params: queryParams });
      const data = response.data;
      const photos = normalizePhotos(Array.isArray(data) ? data : (data.content ?? []));

      if (isLocalFallbackEnabled && !hasRenderablePhotos(photos) && localPhotosByCategory[categoryId]) {
        return paginate(localPhotosByCategory[categoryId], params);
      }

      return photos;
    } catch (error) {
      if (isLocalFallbackEnabled && localPhotosByCategory[categoryId]) {
        console.warn(`Using local photography fallback photos for category ${categoryId}:`, error);
        return paginate(localPhotosByCategory[categoryId], params);
      }

      throw error;
    }
  }

  // Get specific photo by ID
  static async getPhotoById(id: number): Promise<PhotoResponse> {
    try {
      const response = await apiClient.get<PhotoResponse>(`/photos/${id}`);
      return normalizePhoto(response.data);
    } catch (error) {
      const fallbackPhoto = localPhotos.find(photo => photo.id === id);
      if (isLocalFallbackEnabled && fallbackPhoto) {
        return fallbackPhoto;
      }

      throw error;
    }
  }

  // Get popular photos ordered by likes count
  static async getPopularPhotos(): Promise<PhotoResponse[]> {
    const response = await apiClient.get<PhotoResponse[]>('/photos/popular');
    return normalizePhotos(response.data);
  }

  // Get top photos by likes count
  static async getTopPhotos(): Promise<PhotoResponse[]> {
    const response = await apiClient.get<PhotoResponse[]>('/photos/top');
    return normalizePhotos(response.data);
  }

  // Get popular photos by category ordered by likes count
  static async getPopularPhotosByCategory(categoryId: number): Promise<PhotoResponse[]> {
    const response = await apiClient.get<PhotoResponse[]>(`/photos/category/${categoryId}/popular`);
    return normalizePhotos(response.data);
  }

  // Get all photos with optional pagination
  static async getAllPhotos(params?: PaginationParams): Promise<PhotoResponse[]> {
    try {
      const queryParams = params ? { page: params.page ?? 0, size: params.size ?? 20 } : undefined;
      const response = await apiClient.get('/photos', { params: queryParams });
      const data = response.data;
      const photos = normalizePhotos(Array.isArray(data) ? data : (data.content ?? []));

      if (isLocalFallbackEnabled && !hasRenderablePhotos(photos)) {
        return paginate(localPhotos, params);
      }

      return photos;
    } catch (error) {
      if (isLocalFallbackEnabled) {
        console.warn('Using local photography fallback photos:', error);
        return paginate(localPhotos, params);
      }

      throw error;
    }
  }

  // Health check endpoint to test API connection
  static async healthCheck(): Promise<boolean> {
    try {
      await apiClient.get('/photo-categories');
      return true;
    } catch (error) {
      console.warn('Photography API health check failed:', error);
      return false;
    }
  }
}

// Error handling utilities
export const handleApiError = (error: ApiError): string => {
  switch (error.status) {
    case 404:
      return 'Requested resource not found';
    case 500:
      return 'Server error. Please try again later';
    case 503:
      return 'Service temporarily unavailable';
    default:
      return error.message || 'An unexpected error occurred';
  }
};

// Retry mechanism for failed requests
export const retryApiCall = async <T>(
  apiCall: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: ApiError | null = null;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error as ApiError;
      
      // Don't retry for client errors (4xx)
      if (lastError.status >= 400 && lastError.status < 500) {
        throw lastError;
      }
      
      // Wait before retrying
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }
  
  // Throw error object properly
  throw new Error(lastError?.message || 'Max retries exceeded');
};

export default PhotographyApiService;
