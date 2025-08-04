import React, { useState } from 'react';
import { PhotoResponse } from '../../types/photography';

interface PhotoThumbnailProps {
  photo: PhotoResponse;
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
  onDoubleClick?: () => void;
  showMetadata?: boolean;
  className?: string;
}

const PhotoThumbnail: React.FC<PhotoThumbnailProps> = ({
  photo,
  size = 'medium',
  onClick,
  onDoubleClick,
  showMetadata = false,
  className = ''
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-16 h-12';
      case 'large':
        return 'w-32 h-24';
      case 'medium':
      default:
        return 'w-24 h-18';
    }
  };

  const formatLikesCount = (count: number) => {
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'k';
    }
    return count.toString();
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  return (
    <div 
      className={`relative bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow ${getSizeClasses()} ${className}`}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      {!imageError ? (
        <>
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            </div>
          )}
          <img
            src={photo.thumbnailPath}
            alt={photo.title}
            className={`w-full h-full object-cover transition-opacity ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-500">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}
      
      {/* 点赞数标记 */}
      {photo.likesCount > 0 && (
        <div className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full px-2 py-1 flex items-center space-x-1">
          <span>❤️</span>
          <span>{formatLikesCount(photo.likesCount)}</span>
        </div>
      )}

      {/* 元数据悬浮信息 */}
      {showMetadata && (
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-2 opacity-0 hover:opacity-100 transition-opacity">
          <p className="font-semibold truncate">{photo.title}</p>
          {photo.location && <p className="truncate">📍 {photo.location}</p>}
          <div className="flex justify-between items-center mt-1">
            <p>{formatDate(photo.takenAt)}</p>
            <p className="flex items-center space-x-1">
              <span>❤️</span>
              <span>{photo.likesCount}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoThumbnail;