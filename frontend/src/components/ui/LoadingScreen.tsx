import React, { useState, useEffect } from 'react';

type Props = {
  onComplete: () => void;
};

const LoadingScreen: React.FC<Props> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [avatarVisible, setAvatarVisible] = useState(false);

  useEffect(() => {
    // Show avatar after a brief delay
    const avatarTimer = setTimeout(() => {
      setAvatarVisible(true);
    }, 500);

    // Simulate loading progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          // Complete loading after progress bar finishes
          setTimeout(() => {
            onComplete();
          }, 300);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => {
      clearTimeout(avatarTimer);
      clearInterval(progressInterval);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
      {/* Kyle Avatar */}
      <div className={`mb-20 transition-all duration-1000 ${avatarVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <div className="relative">
          {/* Pulsing glow effect */}
          <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse blur-xl scale-150"></div>
          
          {/* Avatar container */}
          <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full bg-white p-2 shadow-2xl">
            <img 
              src="/kyle-avatar.png" 
              alt="Kyle Avatar" 
              className="w-full h-full object-contain rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-64 md:w-80">
        {/* Progress Bar Background */}
        <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
          {/* Progress Bar Fill */}
          <div 
            className="h-full bg-white rounded-full transition-all duration-100 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Optional loading text */}
      <div className={`absolute bottom-10 left-1/2 -translate-x-1/2 text-white/60 text-sm transition-opacity duration-1000 ${avatarVisible ? 'opacity-100' : 'opacity-0'}`}>
        Loading Kyle's Portfolio...
      </div>
    </div>
  );
};

export default LoadingScreen;