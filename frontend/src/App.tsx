import React, { useState } from 'react';
import DesktopContainer from './components/DesktopContainer';
import TopBar from './components/TopBar';
import BottomDock from './components/BottomDock';
import Screen from './components/Screen';

function App() {
  const [currentScreen, setCurrentScreen] = useState(0);

  const handleScreenChange = (screen: number) => {
    setCurrentScreen(screen);
  };

  return (
    <DesktopContainer>
      <TopBar />
      <Screen 
        currentScreen={currentScreen} 
        onScreenChange={handleScreenChange}
      />
      <BottomDock 
        currentScreen={currentScreen} 
        onScreenChange={handleScreenChange}
      />
    </DesktopContainer>
  );
}

export default App;
