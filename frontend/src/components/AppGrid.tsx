import React from 'react';

type AppGridProps = {
  onAppClick: () => void;
};

const AppGrid: React.FC<AppGridProps> = ({ onAppClick }) => {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="grid grid-cols-1 gap-8">
        <div className="flex flex-col items-center cursor-pointer group" onClick={onAppClick}>
          <div className="w-16 h-16 rounded-2xl bg-white/30 flex items-center justify-center text-2xl shadow-md mb-2 group-hover:bg-white/50 transition">
            <span role="img" aria-label="about">👋</span>
          </div>
          <span className="text-white font-medium text-sm leading-tight text-center">About Me</span>
          <span className="text-white/60 text-xs text-center">Learn More</span>
        </div>
      </div>
    </div>
  );
};

export default AppGrid; 