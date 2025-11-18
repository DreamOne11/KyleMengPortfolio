import React, { useState, useEffect } from 'react';
import { PhotoCategoryResponse, PhotoResponse } from '../../types/photography';
import { PhotographyApiService } from '../../services/photographyApi';
import { useResponsive } from '../../utils/responsive';

type Props = {
  category: PhotoCategoryResponse;
  onClose: () => void;
  onPhotoClick: (photo: PhotoResponse) => void;
};

const PhotoGridViewer: React.FC<Props> = ({ category, onClose, onPhotoClick }) => {
  const [photos, setPhotos] = useState<PhotoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const responsive = useResponsive();

  // Load all photos in category
  useEffect(() => {
    const loadPhotos = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await PhotographyApiService.getPhotosByCategory(category.id);
        setPhotos(data);
      } catch (err) {
        setError('Failed to load photos');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadPhotos();
  }, [category.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      {/* Modal Window */}
      <div className={`bg-white rounded-2xl shadow-2xl overflow-hidden ${
        responsive.isMobile ? 'w-full h-full' : 'w-[90vw] h-[85vh] max-w-6xl'
      }`}>
        {/* Window Header */}
        <div className="bg-gradient-to-r from-gray-100 to-gray-200 px-4 py-3 flex items-center justify-between border-b border-gray-300">
          {/* macOS Window Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
            />
            <button className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors" />
            <button className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors" />
          </div>

          {/* Window Title */}
          <div className="flex-1 text-center">
            <h2 className="text-sm font-semibold text-gray-700">{category.displayName}</h2>
          </div>

          {/* Info */}
          <div className="text-xs text-gray-500">
            {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
          </div>
        </div>

        {/* Content Area */}
        <div className="h-[calc(100%-57px)] overflow-y-auto bg-white p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-red-600">{error}</p>
            </div>
          ) : photos.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">No photos in this category</p>
            </div>
          ) : (
            <div className={`grid ${
              responsive.isMobile
                ? 'grid-cols-2 gap-3'
                : responsive.isTablet
                  ? 'grid-cols-3 gap-4'
                  : 'grid-cols-4 gap-6'
            }`}>
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="group cursor-pointer"
                  onClick={() => onPhotoClick(photo)}
                >
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 shadow-md hover:shadow-xl transition-shadow duration-200">
                    {photo.thumbnailPath ? (
                      <img
                        src={photo.thumbnailPath}
                        alt={photo.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (target.src !== photo.filePath) {
                            target.src = photo.filePath;
                          }
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <p className="text-gray-400">No image</p>
                      </div>
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 flex items-end p-3">
                      <h3 className="text-white text-sm font-medium truncate opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {photo.title}
                      </h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhotoGridViewer;
