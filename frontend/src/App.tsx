import React, { useState } from 'react';
import DesktopContainer from './components/layout/DesktopContainer';
import TopBar from './components/layout/TopBar';
import BottomDock from './components/layout/BottomDock';
import Screen from './components/layout/Screen';
import ParticleBackground from './components/ui/ParticleBackground/ParticleBackground';
import LoadingScreen from './components/ui/LoadingScreen';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState(0);
  const [isAnyFileManagerMaximized, setIsAnyFileManagerMaximized] = useState(false);
  const [isChatExpanded, setIsChatExpanded] = useState(false);


  const handleScreenChange = (screen: number) => {
    setCurrentScreen(screen);
  };

  const handleLoadingComplete = () => {
    setIsLoading(false);
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
        />
        <BottomDock 
          currentScreen={currentScreen} 
          onScreenChange={handleScreenChange}
          isHidden={isAnyFileManagerMaximized || isChatExpanded}
        />
      </DesktopContainer>
    </div>
  );
}

export default App;
