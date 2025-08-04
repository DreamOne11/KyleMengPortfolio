import React, { useState, useEffect } from 'react';
import CardCarousel from '../ui/CardCarousel';
import { useResponsive } from '../../utils/responsive';
import { PhotographyApiService, handleApiError } from '../../services/photographyApi';
import { PhotoCategoryResponse, PhotoResponse, ApiError } from '../../types/photography';

type PhotographyScreenProps = {
  onPhotoClick?: (photo: PhotoResponse) => void;
};

const PhotographyScreen: React.FC<PhotographyScreenProps> = ({ onPhotoClick }) => {
  const [photoCategories, setPhotoCategories] = useState<PhotoCategoryResponse[]>([]);
  const [categoryPhotos, setCategoryPhotos] = useState<{ [key: number]: PhotoResponse[] }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const responsive = useResponsive();
  
  // Load photo categories and their photos from API
  useEffect(() => {
    const loadPhotographyData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load categories
        const categories = await PhotographyApiService.getPhotoCategories();
        const sortedCategories = categories.sort((a, b) => a.sortOrder - b.sortOrder);
        setPhotoCategories(sortedCategories);
        
        // Load photos for each category (limit to 5 photos per category)
        const photosData: { [key: number]: PhotoResponse[] } = {};
        await Promise.all(
          sortedCategories.map(async (category) => {
            try {
              const photos = await PhotographyApiService.getPhotosByCategory(category.id, { page: 0, size: 5 });
              photosData[category.id] = photos;
            } catch (err) {
              console.warn(`Failed to load photos for category ${category.name}:`, err);
              photosData[category.id] = [];
            }
          })
        );
        
        setCategoryPhotos(photosData);
      } catch (err) {
        const apiError = err as ApiError;
        setError(handleApiError(apiError));
        console.error('Failed to load photography data:', apiError);
      } finally {
        setLoading(false);
      }
    };

    loadPhotographyData();
  }, []);
  
  // 根据屏幕尺寸调整标题大小
  const getTitleSize = () => {
    if (responsive.isMobile) {
      return '1.5rem';
    } else if (responsive.isTablet) {
      return '1.75rem';
    } else {
      return '2rem';
    }
  };
  
  // 根据屏幕尺寸调整文本大小
  const getTextSize = () => {
    if (responsive.isMobile) {
      return '1rem';
    } else if (responsive.isTablet) {
      return '1.15rem';
    } else {
      return '1.25rem';
    }
  };

  // 处理照片点击
  const handlePhotoClick = (photo: PhotoResponse) => {
    if (onPhotoClick) {
      onPhotoClick(photo);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="relative w-full h-full overflow-hidden">
        <div className="absolute top-8 left-8 right-8 z-10">
          <h3 
            className="text-left text-[#263148] uppercase font-sans drop-shadow-sm font-extrabold tracking-wide mb-4" 
            style={{ 
              fontSize: getTitleSize(), 
              letterSpacing: '0.04em', 
              textShadow: '0 2px 8px #b3c2d6' 
            }}
          >
            PHOTOGRAPHY
          </h3>
          <div className="bg-[#2e394a] opacity-60 mb-2" style={{ height: '2px', width: '100%' }} />
          <div 
            className="text-gray-800 leading-relaxed text-left" 
            style={{ 
              fontSize: getTextSize(), 
              lineHeight: '1.75' 
            }}
          >
            <p className="mb-2">Loading photography collections...</p>
          </div>
        </div>
        
        {/* Loading animation */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="relative w-full h-full overflow-hidden">
        <div className="absolute top-8 left-8 right-8 z-10">
          <h3 
            className="text-left text-[#263148] uppercase font-sans drop-shadow-sm font-extrabold tracking-wide mb-4" 
            style={{ 
              fontSize: getTitleSize(), 
              letterSpacing: '0.04em', 
              textShadow: '0 2px 8px #b3c2d6' 
            }}
          >
            PHOTOGRAPHY
          </h3>
          <div className="bg-[#2e394a] opacity-60 mb-2" style={{ height: '2px', width: '100%' }} />
          <div 
            className="text-gray-800 leading-relaxed text-left" 
            style={{ 
              fontSize: getTextSize(), 
              lineHeight: '1.75' 
            }}
          >
            <p className="mb-2 text-red-600">Error: {error}</p>
            <p className="text-sm text-gray-600">Please try again later or check your connection.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* 移动端滚动容器 */}
      {responsive.isMobile ? (
        <div className="w-full h-full overflow-y-auto overflow-x-hidden">
          <div className="flex flex-col min-h-full px-4 pt-24 pb-6">
            {/* 标题和介绍部分 */}
            <div className="mb-6">
              <h3 
                className="text-left text-[#263148] uppercase font-sans drop-shadow-sm font-extrabold tracking-wide mb-4" 
                style={{ 
                  fontSize: getTitleSize(), 
                  letterSpacing: '0.04em', 
                  textShadow: '0 2px 8px #b3c2d6' 
                }}
              >
                PHOTOGRAPHY
              </h3>
              <div className="bg-[#2e394a] opacity-60 mb-2" style={{ height: '2px', width: '100%' }} />
              <div 
                className="text-gray-800 leading-relaxed text-left mb-6" 
                style={{ 
                  fontSize: getTextSize(), 
                  lineHeight: '1.75' 
                }}
              >
                <p className="mb-3">Explore my photography collections through interactive card carousels.</p>
              </div>
            </div>

            {/* Card Carousels */}
            <div className="space-y-8">
              {photoCategories.map((category) => (
                <CardCarousel
                  key={category.id}
                  photos={categoryPhotos[category.id] || []}
                  categoryName={category.displayName}
                  categoryColor={category.iconColor || '#3B82F6'}
                  onPhotoClick={handlePhotoClick}
                  className="w-full"
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        // 桌面端布局
        <>
          <div className="absolute top-8 left-8 right-8 z-10">
            <h3 
              className="text-left text-[#263148] uppercase font-sans drop-shadow-sm font-extrabold tracking-wide mb-4" 
              style={{ 
                fontSize: getTitleSize(), 
                letterSpacing: '0.04em', 
                textShadow: '0 2px 8px #b3c2d6' 
              }}
            >
              PHOTOGRAPHY
            </h3>
            <div className="bg-[#2e394a] opacity-60 mb-2" style={{ height: '2px', width: '100%' }} />
            <div 
              className="text-gray-800 leading-relaxed text-left" 
              style={{ 
                fontSize: getTextSize(), 
                lineHeight: '1.75' 
              }}
            >
              <p className="mb-2">Explore my photography collections through interactive card carousels.</p>
            </div>
          </div>
          
          {/* Card Carousels Container */}
          <div className="absolute top-48 left-8 right-8 bottom-8 overflow-y-auto">
            <div className={`grid ${responsive.isDesktop ? 'grid-cols-3' : responsive.isTablet ? 'grid-cols-2' : 'grid-cols-1'} gap-8 justify-items-center`}>
              {photoCategories.map((category) => (
                <CardCarousel
                  key={category.id}
                  photos={categoryPhotos[category.id] || []}
                  categoryName={category.displayName}
                  categoryColor={category.iconColor || '#3B82F6'}
                  onPhotoClick={handlePhotoClick}
                  className="w-full"
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PhotographyScreen; 