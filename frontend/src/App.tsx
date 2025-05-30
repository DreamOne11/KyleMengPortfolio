import React, { useState } from 'react';
import DesktopContainer from './components/DesktopContainer';
import TopBar from './components/TopBar';
import AppGrid from './components/AppGrid';
import BottomDock from './components/BottomDock';
import About from './components/About';

function App() {
  const [showAbout, setShowAbout] = useState(false);

  return (
    <DesktopContainer>
      <TopBar />
      {showAbout ? <About onClose={() => setShowAbout(false)} /> : <AppGrid onAppClick={() => setShowAbout(true)} />}
      <BottomDock />
    </DesktopContainer>
  );
}

export default App;
