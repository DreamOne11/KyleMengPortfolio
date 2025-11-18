import React, { useState, useRef, useCallback } from 'react';
import { PhotoResponse } from '../../types/photography';
import { useResponsive } from '../../utils/responsive';

interface CardCarouselProps {
  photos: PhotoResponse[];
  categoryName: string;
  categoryColor: string;
  onPhotoClick?: (photo: PhotoResponse) => void;
  className?: string;
}

const CardCarousel: React.FC<CardCarouselProps> = ({
  photos,
  categoryName,
  categoryColor,
  onPhotoClick,
  className = ''
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef<number>(0);
  const dragThreshold = 50; // 拖拽阈值
  const responsive = useResponsive();

  // 切换到下一张图片
  const nextPhoto = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  }, [photos.length]);

  // 鼠标事件处理（桌面端）
  const handleMouseDown = (e: React.MouseEvent) => {
    if (responsive.isMobile) return;
    setIsDragging(true);
    dragStartX.current = e.clientX;
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || responsive.isMobile) return;
    
    const deltaX = e.clientX - dragStartX.current;
    
    // 向左拖拽切换到下一张（负值）
    if (deltaX < -dragThreshold) {
      nextPhoto();
      setIsDragging(false);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 触摸事件处理（移动端）
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!responsive.isMobile) return;
    setIsDragging(true);
    dragStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !responsive.isMobile) return;
    
    const deltaX = e.touches[0].clientX - dragStartX.current;
    
    // 向左滑动切换到下一张（负值）
    if (deltaX < -dragThreshold) {
      nextPhoto();
      setIsDragging(false);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // 处理照片点击
  const handlePhotoClick = (photo: PhotoResponse) => {
    if (!isDragging && onPhotoClick) {
      onPhotoClick(photo);
    }
  };

  // 获取卡片样式
  const getCardStyle = (index: number) => {
    const relativeIndex = (index - currentIndex + photos.length) % photos.length;
    
    if (relativeIndex === 0) {
      // 当前卡片
      return {
        transform: 'translate3d(0, 0, 0) rotateY(0deg) scale(1)',
        zIndex: 5,
        opacity: 1,
      };
    } else if (relativeIndex === 1) {
      // 第二张卡片
      return {
        transform: 'translate3d(20px, 10px, -50px) rotateY(-10deg) scale(0.95)',
        zIndex: 4,
        opacity: 0.8,
      };
    } else if (relativeIndex === 2) {
      // 第三张卡片
      return {
        transform: 'translate3d(40px, 20px, -100px) rotateY(-15deg) scale(0.9)',
        zIndex: 3,
        opacity: 0.6,
      };
    } else if (relativeIndex === 3) {
      // 第四张卡片
      return {
        transform: 'translate3d(60px, 30px, -150px) rotateY(-20deg) scale(0.85)',
        zIndex: 2,
        opacity: 0.4,
      };
    } else {
      // 其他卡片
      return {
        transform: 'translate3d(80px, 40px, -200px) rotateY(-25deg) scale(0.8)',
        zIndex: 1,
        opacity: 0.2,
      };
    }
  };

  // 响应式尺寸
  const getCardSize = () => {
    if (responsive.isMobile) {
      return { width: '280px', height: '200px' };
    } else if (responsive.isTablet) {
      return { width: '320px', height: '240px' };
    } else {
      return { width: '360px', height: '270px' };
    }
  };

  const cardSize = getCardSize();

  if (!photos || photos.length === 0) {
    return (
      <div className={`flex flex-col items-center ${className}`}>
        <h3 className="text-lg font-bold mb-2" style={{ color: categoryColor }}>
          {categoryName}
        </h3>
        <div 
          className="bg-gray-200 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300"
          style={cardSize}
        >
          <p className="text-gray-500">No photos available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* 简化的提示信息 */}
      <div className="mb-3 text-center">
        <p className="text-xs text-gray-400">
          {responsive.isMobile ? 'Swipe left to browse' : 'Drag left to browse'} • {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
        </p>
      </div>

      {/* 卡片容器 */}
      <div 
        className="relative cursor-grab active:cursor-grabbing select-none"
        style={{ 
          width: cardSize.width, 
          height: cardSize.height,
          perspective: '1000px'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            className="absolute top-0 left-0 w-full h-full transition-all duration-500 ease-out rounded-lg overflow-hidden shadow-lg bg-white"
            style={{
              ...getCardStyle(index),
              backfaceVisibility: 'hidden',
            }}
            onClick={() => handlePhotoClick(photo)}
          >
            {/* 照片内容 */}
            <div className="relative w-full h-full">
              {photo.thumbnailPath ? (
                <img
                  src={photo.thumbnailPath}
                  alt={photo.title}
                  className="w-full h-full object-cover"
                  draggable={false}
                  onError={(e) => {
                    // 如果缩略图加载失败，尝试加载原图
                    const target = e.target as HTMLImageElement;
                    if (target.src !== photo.filePath) {
                      target.src = photo.filePath;
                    }
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <p className="text-gray-500">No image</p>
                </div>
              )}
              
              {/* 照片信息遮罩 */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                <h4 className="text-white font-semibold text-sm truncate">
                  {photo.title}
                </h4>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 进度指示器 */}
      <div className="flex space-x-1 mt-3">
        {photos.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'bg-blue-500 scale-125' 
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default CardCarousel;