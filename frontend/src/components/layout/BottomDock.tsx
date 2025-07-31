import React from 'react';

type Props = {
  currentScreen: number;
  onScreenChange: (screen: number) => void;
  isHidden?: boolean;
};

const BottomDock: React.FC<Props> = ({ currentScreen, onScreenChange, isHidden }) => {
  if (isHidden) return null;

  const dockItems = [
    { id: 0, emoji: '👋', label: 'About Me' },
    { id: 1, emoji: '💼', label: 'My Work' },
    { id: 2, emoji: '📝', label: 'My Note' },
    { id: 3, emoji: '📸', label: 'Photography' }
  ];

  return (
    <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex gap-1 md:gap-2 px-3 md:px-6 py-1.5 md:py-3 rounded-[12px] md:rounded-[24px] bg-white/20 backdrop-blur-xl shadow-2xl border border-white/20">
      {dockItems.map((item, idx) => (
        <React.Fragment key={item.id}>
          <button
            onClick={() => onScreenChange(item.id)}
            className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center rounded-lg md:rounded-xl transition-all duration-200 bg-white/30 text-white text-base sm:text-lg md:text-xl shadow-md backdrop-blur-md border border-white/20
              ${currentScreen === item.id ? 'bg-white/50 ring-2 ring-white/60 shadow-xl scale-110' : 'hover:bg-white/40 hover:scale-105'}
            `}
            title={item.label}
          >
            <span>{item.emoji}</span>
          </button>
          {/* 分隔符，仅在不是最后一个按钮时显示，在小屏幕上隐藏 */}
          {idx < dockItems.length - 1 && (
            <div className="hidden sm:flex items-center mx-1 md:mx-2">
              <span className="w-1 h-1 bg-white/60 rounded-full block"></span>
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default BottomDock; 