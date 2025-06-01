import React from 'react';

type Props = {
  currentScreen: number;
  onScreenChange: (screen: number) => void;
};

const BottomDock: React.FC<Props> = ({ currentScreen, onScreenChange }) => {
  const dockItems = [
    { id: 0, emoji: '👋', label: 'About Me' },
    { id: 1, emoji: '💼', label: 'My Work' },
    { id: 2, emoji: '📝', label: 'My Note' },
    { id: 3, emoji: '📸', label: 'Photography' }
  ];

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 px-6 py-3 rounded-2xl bg-white/30 backdrop-blur-md shadow-lg border border-white/20">
      {dockItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onScreenChange(item.id)}
          className={`w-12 h-12 flex items-center justify-center rounded-full transition-all duration-200 ${
            currentScreen === item.id 
              ? 'bg-white/40 scale-110 shadow-lg' 
              : 'hover:bg-white/20 hover:scale-105'
          }`}
          title={item.label}
        >
          <span className="text-xl">{item.emoji}</span>
        </button>
      ))}
    </div>
  );
};

export default BottomDock; 