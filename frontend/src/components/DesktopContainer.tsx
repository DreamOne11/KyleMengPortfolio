import React from 'react';

type Props = {
  children: React.ReactNode;
};

const DesktopContainer: React.FC<Props> = ({ children }) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <div 
        className="relative bg-white/10 backdrop-blur-md border border-white/20 flex flex-col overflow-hidden shadow-2xl"
        style={{
          width: 'min(88vw, 1400px)',
          height: 'min(90vh, 900px)',
          borderRadius: 'clamp(0.75rem, 2vw, 1.5rem)',
          transform: 'scale(min(1, 100vw / 1600))', // 基于1600px基准宽度进行缩放
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