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
  className = ''
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0); // 当前拖拽偏移量
  const dragStartX = useRef<number>(0);
  const dragThreshold = 100; // 拖拽切换的临界点（像素）
  const responsive = useResponsive();

  // 切换到下一张图片
  const nextPhoto = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
    setDragOffset(0); // 重置拖拽偏移
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

    // 只允许向左拖拽（负值），限制最大拖拽距离
    if (deltaX < 0) {
      setDragOffset(Math.max(deltaX, -dragThreshold * 1.5));
    }
  };

  const handleMouseUp = () => {
    if (!isDragging) return;

    // 如果拖拽超过临界点，切换到下一张
    if (dragOffset < -dragThreshold) {
      nextPhoto();
    } else {
      // 否则回弹
      setDragOffset(0);
    }

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

    // 只允许向左拖拽（负值），限制最大拖拽距离
    if (deltaX < 0) {
      setDragOffset(Math.max(deltaX, -dragThreshold * 1.5));
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;

    // 如果拖拽超过临界点，切换到下一张
    if (dragOffset < -dragThreshold) {
      nextPhoto();
    } else {
      // 否则回弹
      setDragOffset(0);
    }

    setIsDragging(false);
  };


  // 获取卡片样式 - 根据拖拽偏移动态调整
  const getCardStyle = (index: number) => {
    const relativeIndex = (index - currentIndex + photos.length) % photos.length;

    // 计算拖拽进度（0-1）
    const dragProgress = Math.min(Math.abs(dragOffset) / dragThreshold, 1);

    if (relativeIndex === 0) {
      // 当前卡片 - 跟随拖拽移动
      const translateX = dragOffset;
      const opacity = 1; // 保持100%不透明
      const scale = 1 - dragProgress * 0.05; // 稍微缩小

      return {
        transform: `translate3d(${translateX}px, 0, 0) rotateY(0deg) rotateZ(${dragProgress * -5}deg) scale(${scale})`,
        zIndex: 5,
        opacity: opacity,
        transition: isDragging ? 'none' : 'all 0.3s ease-out',
      };
    } else if (relativeIndex === 1) {
      // 下一张卡片 - 逐渐显现、放大、上浮
      const baseX = 12;
      const baseY = 2;
      const baseZ = -20;
      const baseRotateY = -8;
      const baseRotateZ = 2;
      const baseScale = 0.98;

      // 根据拖拽进度，向当前卡片位置移动
      const translateX = baseX - dragProgress * baseX; // 从12px移动到0
      const translateY = baseY - dragProgress * baseY; // 从2px移动到0
      const translateZ = baseZ + dragProgress * baseZ; // 从-20px移动到0
      const rotateY = baseRotateY + dragProgress * baseRotateY; // 从-8deg移动到0
      const rotateZ = baseRotateZ - dragProgress * baseRotateZ; // 从2deg移动到0
      const scale = baseScale + dragProgress * (1 - baseScale); // 从0.98放大到1
      const opacity = 0.95 + dragProgress * 0.05; // 从0.95到1

      return {
        transform: `translate3d(${translateX}px, ${translateY}px, ${translateZ}px) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) scale(${scale})`,
        zIndex: 4,
        opacity: opacity,
        transition: isDragging ? 'none' : 'all 0.3s ease-out',
      };
    } else if (relativeIndex === 2) {
      // 第三张卡片
      return {
        transform: 'translate3d(24px, 4px, -40px) rotateY(-12deg) rotateZ(3deg) scale(0.96)',
        zIndex: 3,
        opacity: 0.9,
        transition: isDragging ? 'none' : 'all 0.3s ease-out',
      };
    } else if (relativeIndex === 3) {
      // 第四张卡片
      return {
        transform: 'translate3d(36px, 6px, -60px) rotateY(-16deg) rotateZ(4deg) scale(0.94)',
        zIndex: 2,
        opacity: 0.85,
        transition: isDragging ? 'none' : 'all 0.3s ease-out',
      };
    } else if (relativeIndex === 4) {
      // 第五张卡片
      return {
        transform: 'translate3d(48px, 8px, -80px) rotateY(-20deg) rotateZ(5deg) scale(0.92)',
        zIndex: 1,
        opacity: 0.8,
        transition: isDragging ? 'none' : 'all 0.3s ease-out',
      };
    } else {
      // 其他卡片
      return {
        transform: 'translate3d(60px, 10px, -100px) rotateY(-24deg) rotateZ(6deg) scale(0.9)',
        zIndex: 0,
        opacity: 0.75,
        transition: isDragging ? 'none' : 'all 0.3s ease-out',
      };
    }
  };

  // 响应式尺寸 - 纵向卡片 (高 > 宽)
  const getCardSize = () => {
    if (responsive.isMobile) {
      return { width: '200px', height: '280px' };
    } else if (responsive.isTablet) {
      return { width: '240px', height: '340px' };
    } else {
      return { width: '280px', height: '400px' };
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

  // 计算可见的卡片索引（渲染5张卡片形成扇形堆叠）
  const getVisibleIndexes = () => {
    const indexes = [];
    // 渲染当前卡片及后续4张，形成扇形堆叠
    for (let i = 0; i < 5; i++) {
      indexes.push((currentIndex + i) % photos.length);
    }
    return indexes;
  };

  const visibleIndexes = getVisibleIndexes();

  return (
    <div className={`flex flex-col items-center ${className}`}>
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
        {photos.map((photo, index) => {
          // 只渲染可见的卡片（当前±1）
          if (!visibleIndexes.includes(index)) {
            return null;
          }

          return (
            <div
              key={photo.id}
              className="absolute top-0 left-0 w-full h-full overflow-hidden"
              style={{
                ...getCardStyle(index),
                backfaceVisibility: 'hidden',
                border: '8px solid white',
                borderRadius: '16px',
              }}
            >
              {/* 照片内容 */}
              <div className="relative w-full h-full bg-white"
                style={{ borderRadius: '8px' }}
              >
                {photo.thumbnailPath ? (
                  <img
                    src={photo.thumbnailPath}
                    alt={photo.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    draggable={false}
                    style={{ objectFit: 'cover' }}
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
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
};

export default CardCarousel;