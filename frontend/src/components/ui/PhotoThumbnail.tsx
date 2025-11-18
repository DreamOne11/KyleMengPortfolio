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
    </div>
  );
};

export default PhotoThumbnail;