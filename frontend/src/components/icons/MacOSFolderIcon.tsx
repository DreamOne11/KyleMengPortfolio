import React from 'react';

type MacOSFolderIconProps = {
  color?: 'blue' | 'green' | 'orange' | 'purple' | 'red' | string;
  size?: number;
  className?: string;
};

const MacOSFolderIcon: React.FC<MacOSFolderIconProps> = ({ 
  color = 'blue', 
  size = 48, 
  className = '' 
}) => {
  const getColors = () => {
    // If color starts with #, treat it as a hex color
    if (color.startsWith('#')) {
      return { 
        primary: color, 
        secondary: lightenColor(color, 20) 
      };
    }
    
    // Otherwise use predefined colors
    switch (color) {
      case 'green':
        return { primary: '#10B981', secondary: '#34D399' };
      case 'orange':
        return { primary: '#F59E0B', secondary: '#FCD34D' };
      case 'purple':
        return { primary: '#8B5CF6', secondary: '#A78BFA' };
      case 'red':
        return { primary: '#EF4444', secondary: '#FB7185' };
      case 'blue':
      default:
        return { primary: '#3B82F6', secondary: '#60A5FA' };
    }
  };

  // Helper function to lighten a hex color
  const lightenColor = (hex: string, percent: number) => {
    const num = parseInt(hex.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = ((num >> 8) & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  };

  const colors = getColors();

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 48 48" 
      fill="none"
      className={`drop-shadow-md ${className}`}
    >
      {/* 文件夹底层 */}
      <path 
        d="M6 14C6 11.7909 7.79086 10 10 10H18L22 14H38C40.2091 14 42 15.7909 42 18V34C42 36.2091 40.2091 38 38 38H10C7.79086 38 6 36.2091 6 34V14Z" 
        fill={colors.primary}
        className="drop-shadow-md"
      />
      {/* 文件夹表层 */}
      <path 
        d="M6 18C6 15.7909 7.79086 14 10 14H18L22 18H38C40.2091 18 42 19.7909 42 22V34C42 36.2091 40.2091 38 38 38H10C7.79086 38 6 36.2091 6 34V18Z" 
        fill={colors.secondary}
        className="drop-shadow-sm"
      />
    </svg>
  );
};

export default MacOSFolderIcon; 