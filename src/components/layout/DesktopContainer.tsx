import React, { useEffect, useState } from 'react';
import { getResponsiveScale, getResponsiveContainerRatio } from '../../utils/responsive';

type Props = {
  children: React.ReactNode;
};

const DesktopContainer: React.FC<Props> = ({ children }) => {
  const [scale, setScale] = useState(getResponsiveScale());
  const [ratio, setRatio] = useState(getResponsiveContainerRatio());
  
  // 添加响应式监听以处理屏幕尺寸变化
  useEffect(() => {
    const handleResize = () => {
      setScale(getResponsiveScale());
      setRatio(getResponsiveContainerRatio());
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <div 
        className="relative bg-white/10 backdrop-blur-md border border-white/20 flex flex-col overflow-hidden shadow-2xl"
        style={{
          width: `min(${ratio * 100}vw, 1400px)`,
          height: `min(${ratio * 100}vh, 900px)`,
          borderRadius: 'clamp(0.5rem, 1.5vw, 1.5rem)',
          transform: `scale(${scale})`,
          transformOrigin: 'center',
          zIndex: 1
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default DesktopContainer; 