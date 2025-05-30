import React from 'react';

const BottomDock: React.FC = () => {
  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-6 px-8 py-3 rounded-2xl bg-white/30 backdrop-blur-md shadow-lg border border-white/20">
      <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition"><span role="img" aria-label="close">❌</span></button>
      <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition"><span role="img" aria-label="grid">🟪</span></button>
      <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition"><span role="img" aria-label="mail">✉️</span></button>
    </div>
  );
};

export default BottomDock; 