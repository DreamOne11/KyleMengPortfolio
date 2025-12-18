import React from 'react';
import CardCarousel from '../ui/CardCarousel';
import MacOSFolderIcon from '../icons/MacOSFolderIcon';
import { useResponsive } from '../../utils/responsive';
import { PhotoCategoryResponse, PhotoResponse } from '../../types/photography';

type PhotographyScreenProps = {
  onPhotoCategoryFolderDoubleClick: (
    categoryId: number,
    categoryName: string,
    photos: PhotoResponse[],
    e: React.MouseEvent
  ) => void;
  photoCategories: PhotoCategoryResponse[];
  categoryPhotos: { [key: number]: PhotoResponse[] };
  allCategoryPhotos: { [key: number]: PhotoResponse[] };
  isDataLoaded: boolean;
};

const PhotographyScreen: React.FC<PhotographyScreenProps> = ({
  onPhotoCategoryFolderDoubleClick,
  photoCategories,
  categoryPhotos,
  allCategoryPhotos,
  isDataLoaded
}) => {
  const responsive = useResponsive();
  
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

  // 处理文件夹点击（移动端）或双击（桌面端）
  const handleFolderClick = (category: PhotoCategoryResponse, e: React.MouseEvent) => {
    e.stopPropagation();

    // 移动端单击直接打开
    if (responsive.isMobile) {
      const photos = allCategoryPhotos[category.id] || [];
      onPhotoCategoryFolderDoubleClick(category.id, category.displayName, photos, e);
    }
  };

  const handleFolderDoubleClick = (category: PhotoCategoryResponse, e: React.MouseEvent) => {
    e.stopPropagation();

    // 桌面端双击打开
    if (!responsive.isMobile) {
      const photos = allCategoryPhotos[category.id] || [];
      onPhotoCategoryFolderDoubleClick(category.id, category.displayName, photos, e);
    }
  };

  // Loading state (while data is being preloaded in App.tsx)
  if (!isDataLoaded || photoCategories.length === 0) {
    return (
      <div className="relative w-full h-full overflow-hidden">
        <div className="absolute top-8 z-10">
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
                <div key={category.id} className="flex flex-col items-center">
                  {/* Folder Button Above Carousel */}
                  <div
                    className="flex flex-col items-center cursor-pointer group"
                    onClick={(e) => handleFolderClick(category, e)}
                    onDoubleClick={(e) => handleFolderDoubleClick(category, e)}
                  >
                    <div className="w-16 h-16 flex items-center justify-center group-hover:scale-110 transition-all duration-200 rounded-lg hover:bg-white/10 mb-2">
                      <MacOSFolderIcon color={category.iconColor === '#3B82F6' ? 'blue' : 'purple'} />
                    </div>
                    <h3 className="font-semibold text-sm text-white px-3 py-1 rounded">
                      {category.displayName}
                    </h3>
                  </div>

                  <CardCarousel
                    photos={categoryPhotos[category.id] || []}
                    categoryName={category.displayName}
                    categoryColor={category.iconColor || '#3B82F6'}
                    className="w-full"
                  />
                </div>
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
          <div className="absolute top-24 left-4 right-4 bottom-12 overflow-hidden flex items-center justify-center">
            <div className={`grid ${responsive.isDesktop ? 'grid-cols-3' : responsive.isTablet ? 'grid-cols-2' : 'grid-cols-1'} gap-6 justify-items-center items-center w-full`}>
              {photoCategories.map((category) => (
                <div key={category.id} className="flex flex-col items-center">
                  {/* Folder Button Above Carousel */}
                  <div
                    className="flex flex-col items-center cursor-pointer group mb-4"
                    onClick={(e) => handleFolderClick(category, e)}
                    onDoubleClick={(e) => handleFolderDoubleClick(category, e)}
                  >
                    <div className="w-16 h-16 flex items-center justify-center group-hover:scale-110 transition-all duration-200 rounded-lg hover:bg-white/10">
                      <MacOSFolderIcon color={category.iconColor === '#3B82F6' ? 'blue' : 'purple'} />
                    </div>
                    <h3 className="font-semibold text-sm text-white px-3 py-1 rounded">
                      {category.displayName}
                    </h3>
                  </div>

                  <CardCarousel
                    photos={categoryPhotos[category.id] || []}
                    categoryName={category.displayName}
                    categoryColor={category.iconColor || '#3B82F6'}
                    className="w-full"
                  />
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PhotographyScreen; 