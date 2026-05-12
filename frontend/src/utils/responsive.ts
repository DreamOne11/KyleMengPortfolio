import { useEffect, useState } from 'react';

export const DESKTOP_SCREEN_WIDTH = 1400;
export const DESKTOP_SCREEN_HEIGHT = 900;

// 设备类型检测
export const isMobile = () => window.innerWidth <= 768;
export const isTablet = () => window.innerWidth > 768 && window.innerWidth <= 1024;
export const isDesktop = () => window.innerWidth > 1024;

// 获取当前断点
export const getCurrentBreakpoint = () => {
  const width = window.innerWidth;
  if (width <= 320) return 'xs';
  if (width <= 480) return 'sm';
  if (width <= 768) return 'md';
  if (width <= 1024) return 'lg';
  if (width <= 1440) return 'xl';
  return '2xl';
};

// 响应式缩放计算
export const getResponsiveScale = () => {
  const width = window.innerWidth;
  if (width <= 320) return 0.9;
  if (width <= 480) return 0.9;
  if (width <= 768) return 0.9;
  if (width <= 1024) return 0.9;
  if (width <= 1440) return 0.95;
  return Math.min(1, window.innerWidth / 1600);
};

// 固定桌面画布在浏览器视口中的占比，所有桌面布局只通过这一层缩放。
export const getDesktopScreenScale = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;

  if (width <= 768) return 1;

  const targetWidthRatio = 0.78;
  const verticalSafeArea = 48;
  const scaleByWidth = (width * targetWidthRatio) / DESKTOP_SCREEN_WIDTH;
  const scaleByHeight = Math.max(height - verticalSafeArea, 320) / DESKTOP_SCREEN_HEIGHT;

  return Math.min(scaleByWidth, scaleByHeight);
};

// 响应式窗口大小计算
export const getResponsiveWindowSize = (defaultWidth = 800, defaultHeight = 600) => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  
  if (width <= 480) {
    return { 
      width: width * 0.95, 
      height: height * 0.8 
    };
  } else if (width <= 768) {
    return { 
      width: width * 0.85, 
      height: height * 0.7 
    };
  } else if (width <= 1024) {
    return { 
      width: Math.min(700, width * 0.7), 
      height: Math.min(500, height * 0.6) 
    };
  }
  
  return { 
    width: defaultWidth, 
    height: defaultHeight 
  };
};

// 设备性能检测
export const getDevicePerformanceLevel = () => {
  // 简单性能检测，可以根据需要扩展
  const hardwareConcurrency = navigator.hardwareConcurrency || 2;
  const memory = (navigator as any).deviceMemory || 4;
  
  if (hardwareConcurrency >= 8 && memory >= 8) return 'high';
  if (hardwareConcurrency >= 4 && memory >= 4) return 'medium';
  return 'low';
};

// 响应式钩子
export const useResponsive = () => {
  const [breakpoint, setBreakpoint] = useState(getCurrentBreakpoint());
  const [orientation, setOrientation] = useState(
    window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
  );
  
  useEffect(() => {
    const handleResize = () => {
      setBreakpoint(getCurrentBreakpoint());
      setOrientation(
        window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
      );
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return {
    breakpoint,
    orientation,
    isMobile: ['xs', 'sm', 'md'].includes(breakpoint),
    isTablet: breakpoint === 'lg',
    isDesktop: ['xl', '2xl'].includes(breakpoint),
    isPortrait: orientation === 'portrait',
    isLandscape: orientation === 'landscape'
  };
}; 
