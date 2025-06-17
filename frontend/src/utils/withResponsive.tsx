import React from 'react';
import { useResponsive } from './responsive';

// 响应式属性接口
export interface ResponsiveProps {
  responsive: {
    breakpoint: string;
    orientation: string;
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
    isPortrait: boolean;
    isLandscape: boolean;
  };
}

// 响应式高阶组件
export function withResponsive<P extends object>(
  Component: React.ComponentType<P & ResponsiveProps>
): React.FC<P> {
  return (props: P) => {
    const responsive = useResponsive();
    return <Component {...props} responsive={responsive} />;
  };
}

// 使用示例:
// const ResponsiveComponent = withResponsive(MyComponent); 