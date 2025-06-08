import React, { useState } from 'react';
import DesktopContainer from './components/DesktopContainer';
import TopBar from './components/TopBar';
import BottomDock from './components/BottomDock';
import Screen from './components/Screen';
import ParticleBackground from './components/ParticleBackground/ParticleBackground';

function App() {
  const [currentScreen, setCurrentScreen] = useState(0);
  const [isAnyFileManagerMaximized, setIsAnyFileManagerMaximized] = useState(false);

  const handleScreenChange = (screen: number) => {
    setCurrentScreen(screen);
  };

  return (
    <>
      <ParticleBackground />
      <DesktopContainer>
        <TopBar />
        <Screen 
          currentScreen={currentScreen} 
          onScreenChange={handleScreenChange}
          onAnyFileManagerMaximizedChange={setIsAnyFileManagerMaximized}
        />
        <BottomDock 
          currentScreen={currentScreen} 
          onScreenChange={handleScreenChange}
          isHidden={isAnyFileManagerMaximized}
        />
      </DesktopContainer>
    </>
  );
}

export default App;
