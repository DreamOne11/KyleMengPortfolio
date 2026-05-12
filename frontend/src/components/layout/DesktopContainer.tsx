import React, { useEffect, useState } from 'react';
import {
  DESKTOP_SCREEN_HEIGHT,
  DESKTOP_SCREEN_WIDTH,
  getDesktopScreenScale,
  useResponsive
} from '../../utils/responsive';

type Props = {
  children: React.ReactNode;
};

const DesktopContainer: React.FC<Props> = ({ children }) => {
  const responsive = useResponsive();
  const [scale, setScale] = useState(getDesktopScreenScale());
  
  useEffect(() => {
    const handleResize = () => {
      setScale(getDesktopScreenScale());
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (responsive.isMobile) {
    return (
      <div className="min-h-screen w-full flex items-stretch justify-center overflow-hidden">
        <div
          data-testid="desktop-screen-mobile"
          className="relative w-full h-[100svh] bg-white/10 border border-white/20 flex flex-col overflow-hidden shadow-2xl"
          style={{ zIndex: 1 }}
        >
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100svh] w-full flex items-center justify-center overflow-hidden">
      <div 
        data-testid="desktop-stage"
        className="relative"
        style={{
          width: DESKTOP_SCREEN_WIDTH * scale,
          height: DESKTOP_SCREEN_HEIGHT * scale,
          zIndex: 1,
        }}
      >
        <div
          data-testid="desktop-screen"
          className="absolute left-0 top-0 bg-white/10 border border-white/20 flex flex-col overflow-hidden shadow-2xl"
          style={{
            width: DESKTOP_SCREEN_WIDTH,
            height: DESKTOP_SCREEN_HEIGHT,
            borderRadius: 24,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            '--desktop-screen-scale': scale,
          } as React.CSSProperties}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default DesktopContainer; 
