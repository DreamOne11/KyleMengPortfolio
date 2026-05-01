import React, { useState, useEffect } from 'react';
import { useResponsive } from '../../utils/responsive';

type Props = {
  currentScreen: number;
  onScreenChange: (screen: number) => void;
  isHidden?: boolean;
};

const BottomDock: React.FC<Props> = ({ currentScreen, onScreenChange, isHidden }) => {
  const responsive = useResponsive();
  const [isScrolling, setIsScrolling] = useState(false);

  const dockItems = [
    { id: 0, emoji: '👋', label: 'Home', mobileLabel: 'Home' },
    { id: 1, emoji: '📸', label: 'Photography', mobileLabel: 'Photo' },
  ];

  // 监听滚动事件
  useEffect(() => {
    if (!responsive.isMobile) return;

    let scrollTimer: ReturnType<typeof setTimeout>;

    const handleScroll = () => {
      setIsScrolling(true);
      
      // 清除之前的定时器
      clearTimeout(scrollTimer);
      
      // 设置新的定时器，滚动停止300ms后设置为false
      scrollTimer = setTimeout(() => {
        setIsScrolling(false);
      }, 300);
    };

    // 添加滚动监听器到多个可能的滚动源
    const addScrollListeners = () => {
      // 全局滚动
      window.addEventListener('scroll', handleScroll, { passive: true });
      document.addEventListener('scroll', handleScroll, { passive: true });
      
      // 查找所有可滚动元素
      const scrollableElements = document.querySelectorAll(
        '[style*="overflow"], .overflow-auto, .overflow-y-auto, .overflow-x-auto, .overflow-scroll'
      );
      
      scrollableElements.forEach(element => {
        element.addEventListener('scroll', handleScroll, { passive: true });
      });

      // 特别监听可能的屏幕容器
      const screenContainers = document.querySelectorAll(
        '[class*="h-full"], [class*="overflow"]'
      );
      
      screenContainers.forEach(container => {
        container.addEventListener('scroll', handleScroll, { passive: true });
      });
    };

    // 初始添加监听器
    addScrollListeners();

    // 延迟再次添加监听器，确保DOM完全加载
    const delayedListenerTimeout = setTimeout(addScrollListeners, 1000);

    return () => {
      clearTimeout(scrollTimer);
      clearTimeout(delayedListenerTimeout);
      
      // 移除所有监听器
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('scroll', handleScroll);
      
      const allScrollable = document.querySelectorAll(
        '[style*="overflow"], .overflow-auto, .overflow-y-auto, .overflow-x-auto, .overflow-scroll, [class*="h-full"], [class*="overflow"]'
      );
      
      allScrollable.forEach(element => {
        element.removeEventListener('scroll', handleScroll);
      });
    };
  }, [responsive.isMobile, currentScreen]); // 添加currentScreen依赖，屏幕切换时重新绑定监听器

  if (isHidden) return null;

  // 移动端顶部导航栏设计
  if (responsive.isMobile) {
    return (
      <div className="absolute top-12 left-4 right-4 z-50 top-navigation">
        <div className={`rounded-3xl shadow-lg px-2 py-1 transition-all duration-300 ${
          isScrolling
            ? 'bg-white/80 backdrop-blur-md border border-white/30'
            : 'bg-transparent'
        }`}>
          <div className="flex justify-around items-center">
            {dockItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onScreenChange(item.id)}
                className={`text-sm font-medium transition-all duration-200 px-2 py-1 rounded-3xl min-w-[56px] text-center
                  ${currentScreen === item.id 
                    ? `text-gray-900 shadow-sm ${isScrolling ? 'bg-gray-200/60' : 'bg-white/50'}` 
                    : `text-gray-600 hover:text-gray-800 ${isScrolling ? 'hover:bg-gray-100/40' : 'hover:bg-white/30'}`
                  }
                `}
              >
                {item.mobileLabel}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 桌面端保持底部 Dock 设计
  return (
    <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex gap-1 md:gap-2 px-3 md:px-6 py-1.5 md:py-3 rounded-[12px] md:rounded-[24px] bg-white/20 backdrop-blur-xl shadow-2xl border border-white/20 bottom-dock">
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
