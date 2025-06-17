import React, { useState } from 'react';
import DesktopContainer from './components/layout/DesktopContainer';
import TopBar from './components/layout/TopBar';
import BottomDock from './components/layout/BottomDock';
import Screen from './components/layout/Screen';
import ParticleBackground from './components/ui/ParticleBackground/ParticleBackground';

function App() {
  const [currentScreen, setCurrentScreen] = useState(0);
  const [isAnyFileManagerMaximized, setIsAnyFileManagerMaximized] = useState(false);
  const [StagewiseComponent, setStagewiseComponent] = useState<React.ComponentType<any> | null>(null);

  const handleScreenChange = (screen: number) => {
    setCurrentScreen(screen);
  };

  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      Promise.all([
        import('@stagewise/toolbar-react'),
        import('@stagewise-plugins/react')
      ]).then(([toolbarModule, pluginsModule]) => {
        const { StagewiseToolbar } = toolbarModule;
        const { ReactPlugin } = pluginsModule;
        
        const WrappedStagewise = () => (
          <StagewiseToolbar 
            config={{
              plugins: [ReactPlugin]
            }}
          />
        );
        
        setStagewiseComponent(() => WrappedStagewise);
      }).catch(err => {
        console.error('Failed to load Stagewise:', err);
      });
    }
  }, []);

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
      {StagewiseComponent && <StagewiseComponent />}
    </>
  );
}

export default App;
