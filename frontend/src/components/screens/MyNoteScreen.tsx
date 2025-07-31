import React from 'react';
import { useResponsive } from '../../utils/responsive';

const MyNoteScreen: React.FC = () => {
  const responsive = useResponsive();
  
  // 根据屏幕尺寸调整标题大小
  const getTitleSize = () => {
    if (responsive.isMobile) {
      return '1.5rem';
    } else if (responsive.isTablet) {
      return '1.75rem';
    } else {
      return '2rem';
    }
  };
  
  // 根据屏幕尺寸调整文本大小
  const getTextSize = () => {
    if (responsive.isMobile) {
      return '1rem';
    } else if (responsive.isTablet) {
      return '1.15rem';
    } else {
      return '1.25rem';
    }
  };
  
  return (
    <div className="relative w-full h-full overflow-hidden">
      <div className={`absolute top-8 ${responsive.isMobile ? 'left-4 right-4' : 'left-8 right-8'} z-10`}>
        <h3 
          className="text-left text-[#263148] uppercase font-sans drop-shadow-sm font-extrabold tracking-wide mb-4" 
          style={{ 
            fontSize: getTitleSize(), 
            letterSpacing: '0.04em', 
            textShadow: '0 2px 8px #b3c2d6' 
          }}
        >
          MY NOTE
        </h3>
        <div className="bg-[#2e394a] opacity-60 mb-6" style={{ height: '2px', width: '100%' }} />
        <div 
          className="text-gray-800 leading-relaxed text-left" 
          style={{ 
            fontSize: getTextSize(), 
            lineHeight: '1.75' 
          }}
        >
          <p className="mb-3">A collection of my thoughts and learnings.</p>
          <p className="mb-3">Technical insights, tutorials, and personal reflections.</p>
          <p className={responsive.isMobile ? "mb-3 hidden" : "mb-3"}>Sharing knowledge and experiences in software development.</p>
        </div>
      </div>
      <div 
        className={`absolute ${responsive.isMobile ? 'left-4 right-4 flex flex-col gap-4' : 'left-8 flex gap-8'}`} 
        style={{ top: responsive.isMobile ? '15rem' : '20rem' }}
      >
        {/* Note folders will be added here */}
      </div>
    </div>
  );
};

export default MyNoteScreen; 