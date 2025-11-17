import React, { useState, useEffect } from 'react';
import DesktopContainer from './components/layout/DesktopContainer';
import TopBar from './components/layout/TopBar';
import BottomDock from './components/layout/BottomDock';
import Screen from './components/layout/Screen';
import ParticleBackground from './components/ui/ParticleBackground/ParticleBackground';
import LoadingScreen from './components/ui/LoadingScreen';
import OnboardingTutorial from './components/ui/OnboardingTutorial';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState(0);
  const [isAnyFileManagerMaximized, setIsAnyFileManagerMaximized] = useState(false);
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [triggerContactFolder, setTriggerContactFolder] = useState(0);

  // Check if onboarding has been completed
  useEffect(() => {
    // TEMPORARY: Always show onboarding for testing
    if (!isLoading) {
      // Delay showing onboarding slightly after loading completes
      const timer = setTimeout(() => {
        setShowOnboarding(true);
      }, 500);
      return () => clearTimeout(timer);
    }

    // Original code (commented out for testing):
    // const onboardingCompleted = localStorage.getItem('portfolio_onboarding_completed');
    // if (!onboardingCompleted && !isLoading) {
    //   const timer = setTimeout(() => {
    //     setShowOnboarding(true);
    //   }, 500);
    //   return () => clearTimeout(timer);
    // }
  }, [isLoading]);

  const handleScreenChange = (screen: number) => {
    setCurrentScreen(screen);
  };

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  const handleTriggerContactFolder = () => {
    // Trigger opening Contact folder by incrementing counter
    setTriggerContactFolder(prev => prev + 1);
  };

  const handleCloseContactFolder = () => {
    // Trigger closing Contact folder by setting to negative value
    setTriggerContactFolder(-1);
  };


  if (isLoading) {
    return <LoadingScreen onComplete={handleLoadingComplete} />;
  }

  return (
    <div className={`transition-opacity duration-1000 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
      <ParticleBackground />
      <DesktopContainer>
        <TopBar />
        <Screen
          currentScreen={currentScreen}
          onScreenChange={handleScreenChange}
          onAnyFileManagerMaximizedChange={setIsAnyFileManagerMaximized}
          onChatExpandedChange={setIsChatExpanded}
          triggerContactFolder={triggerContactFolder}
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
