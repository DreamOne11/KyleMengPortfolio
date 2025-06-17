import React from 'react';

type MacOSFolderIconProps = {
  color?: 'blue' | 'green' | 'orange' | 'purple' | 'red';
  size?: number;
  className?: string;
};

const MacOSFolderIcon: React.FC<MacOSFolderIconProps> = ({ 
  color = 'blue', 
  size = 48, 
  className = '' 
}) => {
  const getColors = () => {
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