import { useEffect, useState } from 'react';

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
  if (width <= 320) return 0.6;
  if (width <= 480) return 0.7;
  if (width <= 768) return 0.8;
  if (width <= 1024) return 0.9;
  if (width <= 1440) return 0.95;
  return Math.min(1, window.innerWidth / 1600);
};

// 获取响应式容器尺寸比例
export const getResponsiveContainerRatio = () => {
  const width = window.innerWidth;
  if (width <= 480) return 0.98; // 移动设备使用98%的视口
  if (width <= 768) return 0.97; // 平板设备使用97%的视口
  return 0.95; // 桌面设备使用95%的视口
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