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
  const [StagewiseComponent, setStagewiseComponent] = useState<React.ComponentType<any> | null>(null);

  const handleScreenChange = (screen: number) => {
    setCurrentScreen(screen);
  };

  const handleLoadingComplete = () => {
    setIsLoading(false);
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
        />
        <BottomDock 
          currentScreen={currentScreen} 
          onScreenChange={handleScreenChange}
          isHidden={isAnyFileManagerMaximized}
        />
      </DesktopContainer>
      {StagewiseComponent && <StagewiseComponent />}
    </div>
  );
}

export default App;
