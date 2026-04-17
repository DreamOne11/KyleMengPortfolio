import React, { useState, useEffect } from 'react';
import DesktopContainer from './components/layout/DesktopContainer';
import TopBar from './components/layout/TopBar';
import BottomDock from './components/layout/BottomDock';
import Screen from './components/layout/Screen';
import ParticleBackground from './components/ui/ParticleBackground/ParticleBackground';
import LoadingScreen from './components/ui/LoadingScreen';
import OnboardingTutorial from './components/ui/OnboardingTutorial';
import { PhotographyApiService } from './services/photographyApi';
import { PhotoCategoryResponse, PhotoResponse } from './types/photography';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState(0);
  const [isAnyFileManagerMaximized, setIsAnyFileManagerMaximized] = useState(false);
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [triggerContactFolder, setTriggerContactFolder] = useState(0);

  // Photography data state - preloaded at app initialization
  const [photoCategories, setPhotoCategories] = useState<PhotoCategoryResponse[]>([]);
  const [categoryPhotos, setCategoryPhotos] = useState<{ [key: number]: PhotoResponse[] }>({});
  const [allCategoryPhotos, setAllCategoryPhotos] = useState<{ [key: number]: PhotoResponse[] }>({});
  const [photographyDataLoaded, setPhotographyDataLoaded] = useState(false);

  // Preload photography data at app initialization
  useEffect(() => {
    const loadPhotographyData = async () => {
      try {
        // Load categories
        const categories = await PhotographyApiService.getPhotoCategories();
        const sortedCategories = categories.sort((a, b) => a.sortOrder - b.sortOrder);
        setPhotoCategories(sortedCategories);

        // Load photos for each category
        const photosData: { [key: number]: PhotoResponse[] } = {};
        const allPhotosData: { [key: number]: PhotoResponse[] } = {};

        await Promise.all(
          sortedCategories.map(async (category) => {
            try {
              // Load first 5 photos for carousel display
              const carouselPhotos = await PhotographyApiService.getPhotosByCategory(category.id, { page: 0, size: 5 });
              photosData[category.id] = carouselPhotos;

              // Load all photos for folder view
              const allPhotos = await PhotographyApiService.getPhotosByCategory(category.id);
              allPhotosData[category.id] = allPhotos;
            } catch (err) {
              console.warn(`Failed to load photos for category ${category.name}:`, err);
              photosData[category.id] = [];
              allPhotosData[category.id] = [];
            }
          })
        );

        setCategoryPhotos(photosData);
        setAllCategoryPhotos(allPhotosData);
        setPhotographyDataLoaded(true);
      } catch (err) {
        console.error('Failed to preload photography data:', err);
        setPhotographyDataLoaded(true); // Still set to true to prevent infinite loading
      }
    };

    loadPhotographyData();
  }, []);

  // Preload thumbnail images after data is loaded
  useEffect(() => {
    if (photographyDataLoaded && photoCategories.length > 0) {
      // Collect all thumbnail paths that need to be preloaded
      const imagesToPreload: string[] = [];

      photoCategories.forEach(category => {
        const photos = categoryPhotos[category.id] || [];
        photos.forEach(photo => {
          if (photo.thumbnailPath) {
            imagesToPreload.push(photo.thumbnailPath);
          }
        });
      });

      // Preload images into browser cache
      imagesToPreload.forEach(src => {
        const img = new Image();
        img.src = src;
      });

      console.log(`Preloaded ${imagesToPreload.length} thumbnail images`);
    }
  }, [photographyDataLoaded, photoCategories, categoryPhotos]);

  // Check if onboarding has been completed
  useEffect(() => {
    const onboardingCompleted = localStorage.getItem('portfolio_onboarding_completed');
    if (!onboardingCompleted && !isLoading) {
      const timer = setTimeout(() => {
        setShowOnboarding(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  const handleScreenChange = (screen: number) => {
    setCurrentScreen(screen);
  };

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    // Reset trigger state after onboarding completes
    setTriggerContactFolder(0);
  };

  const handleTriggerContactFolder = () => {
    // Trigger opening Contact folder by incrementing counter
    setTriggerContactFolder(prev => prev + 1);
  };

  const handleCloseContactFolder = () => {
    // Trigger closing Contact folder by setting to negative value
    setTriggerContactFolder(-1);
  };

  const handleStartOnboarding = () => {
    // Reset folder trigger state and close any open Contact folder
    setTriggerContactFolder(-1);
    // Small delay to ensure folder closes before starting onboarding
    setTimeout(() => {
      setTriggerContactFolder(0);
      setShowOnboarding(true);
    }, 100);
  };


  if (isLoading) {
    return <LoadingScreen onComplete={handleLoadingComplete} />;
  }

  return (
    <div className={`transition-opacity duration-1000 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
      <ParticleBackground />
      <DesktopContainer>
        <TopBar onStartOnboarding={handleStartOnboarding} />
        <Screen
          currentScreen={currentScreen}
          onScreenChange={handleScreenChange}
          onAnyFileManagerMaximizedChange={setIsAnyFileManagerMaximized}
          onChatExpandedChange={setIsChatExpanded}
          triggerContactFolder={triggerContactFolder}
          photographyData={{
            categories: photoCategories,
            categoryPhotos: categoryPhotos,
            allCategoryPhotos: allCategoryPhotos,
            isLoaded: photographyDataLoaded
          }}
        />
        <BottomDock
          currentScreen={currentScreen}
          onScreenChange={handleScreenChange}
          isHidden={isAnyFileManagerMaximized || isChatExpanded}
        />
      </DesktopContainer>

      {/* Onboarding Tutorial */}
      {showOnboarding && (
        <OnboardingTutorial
          onComplete={handleOnboardingComplete}
          onTriggerContactFolder={handleTriggerContactFolder}
          onCloseContactFolder={handleCloseContactFolder}
        />
      )}
    </div>
  );
}

export default App;
