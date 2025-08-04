// Photography API Service Layer
import axios, { AxiosResponse } from 'axios';
import {
  PhotoCategoryResponse,
  PhotoResponse,
  ApiError,
  PaginationParams,
  SearchParams,
  LikeResponse
} from '../types/photography';

// API Base Configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:8080/api';

// Create Axios instance with base configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
      return response.data;
    } catch (error) {
      throw error as ApiError;
    }
  }

  // Get specific photo category by ID
  static async getPhotoCategoryById(id: number): Promise<PhotoCategoryResponse> {
    try {
      const response = await apiClient.get<PhotoCategoryResponse>(`/photo-categories/${id}`);
      return response.data;
    } catch (error) {
      throw error as ApiError;
    }
  }

  // Get photos by category ID with optional pagination
  static async getPhotosByCategory(
    categoryId: number, 
    params?: PaginationParams
  ): Promise<PhotoResponse[]> {
    try {
      const response = await apiClient.get<PhotoResponse[]>(`/photos/category/${categoryId}`, {
        params: {
          page: params?.page || 0,
          size: params?.size || 20
        }
      });
      return response.data;
    } catch (error) {
      throw error as ApiError;
    }
  }

  // Get specific photo by ID
  static async getPhotoById(id: number): Promise<PhotoResponse> {
    try {
      const response = await apiClient.get<PhotoResponse>(`/photos/${id}`);
      return response.data;
    } catch (error) {
      throw error as ApiError;
    }
  }

  // Get popular photos ordered by likes count
  static async getPopularPhotos(): Promise<PhotoResponse[]> {
    try {
      const response = await apiClient.get<PhotoResponse[]>('/photos/popular');
      return response.data;
    } catch (error) {
      throw error as ApiError;
    }
  }

  // Get top photos by likes count
  static async getTopPhotos(): Promise<PhotoResponse[]> {
    try {
      const response = await apiClient.get<PhotoResponse[]>('/photos/top');
      return response.data;
    } catch (error) {
      throw error as ApiError;
    }
  }

  // Get popular photos by category ordered by likes count
  static async getPopularPhotosByCategory(categoryId: number): Promise<PhotoResponse[]> {
    try {
      const response = await apiClient.get<PhotoResponse[]>(`/photos/category/${categoryId}/popular`);
      return response.data;
    } catch (error) {
      throw error as ApiError;
    }
  }

  // Search photos by keyword
  static async searchPhotos(params: SearchParams): Promise<PhotoResponse[]> {
    try {
      const response = await apiClient.get<PhotoResponse[]>('/photos/search', {
        params: {
          keyword: params.keyword,
          page: params.page || 0,
          size: params.size || 20
        }
      });
      return response.data;
    } catch (error) {
      throw error as ApiError;
    }
  }

  // Get all photos with optional pagination
  static async getAllPhotos(params?: PaginationParams): Promise<PhotoResponse[]> {
    try {
      const response = await apiClient.get<PhotoResponse[]>('/photos', {
        params: {
          page: params?.page || 0,
          size: params?.size || 20
        }
      });
      return response.data;
    } catch (error) {
      throw error as ApiError;
    }
  }

  // Like a photo
  static async likePhoto(photoId: number): Promise<PhotoResponse> {
    try {
      const response = await apiClient.post<PhotoResponse>(`/photos/${photoId}/like`);
      return response.data;
    } catch (error) {
      throw error as ApiError;
    }
  }

  // Unlike a photo
  static async unlikePhoto(photoId: number): Promise<PhotoResponse> {
    try {
      const response = await apiClient.post<PhotoResponse>(`/photos/${photoId}/unlike`);
      return response.data;
    } catch (error) {
      throw error as ApiError;
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
  let lastError: ApiError;
  
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
  
  throw lastError!;
};

export default PhotographyApiService;