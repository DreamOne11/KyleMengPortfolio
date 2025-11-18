import React, { useState } from 'react';
import MacOSFolderIcon from '../icons/MacOSFolderIcon';
import { useResponsive } from '../../utils/responsive';

type MyWorkScreenProps = {
  onAllProjectsFolderDoubleClick: (e: React.MouseEvent) => void;
};

const MyWorkScreen: React.FC<MyWorkScreenProps> = ({ onAllProjectsFolderDoubleClick }) => {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
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
  
  // 根据屏幕尺寸调整文件夹图标大小
  const getFolderSize = () => {
    if (responsive.isMobile) {
      return 'w-12 h-12';
    } else if (responsive.isTablet) {
      return 'w-14 h-14';
    } else {
      return 'w-16 h-16';
    }
  };
  
  // 根据屏幕尺寸调整项目卡片宽度
  const getCardWidth = () => {
    if (responsive.isMobile) {
      return 'w-full max-w-[320px]';
    } else if (responsive.isTablet) {
      return 'w-[320px]';
    } else {
      return 'w-[370px]';
    }
  };
  
  // 移除未使用的 getCardsLayout 函数
  // 项目卡片布局已在具体的 JSX 中直接定义
  
  // 根据屏幕尺寸调整顶部位置
  const getTopPosition = () => {
    if (responsive.isMobile) {
      return { folder: '13rem', cards: '20rem' };
    } else if (responsive.isTablet) {
      return { folder: '10.5rem', cards: '20rem' };
    } else {
      return { folder: '10.5rem', cards: '18rem' };
    }
  };
  
  const topPositions = getTopPosition();
  
  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* 移动端滚动容器 */}
      {responsive.isMobile ? (
        <div className="w-full h-full overflow-y-auto overflow-x-hidden">
          <div className="flex flex-col min-h-full px-4 pt-24 pb-6">
            {/* 标题和介绍部分 */}
            <div className="mb-2">
              <h3 
                className="text-left text-[#263148] uppercase font-sans drop-shadow-sm font-extrabold tracking-wide mb-4" 
                style={{ 
                  fontSize: getTitleSize(), 
                  letterSpacing: '0.04em', 
                  textShadow: '0 2px 8px #b3c2d6' 
                }}
              >
                MY WORK
              </h3>
              <div className="bg-[#2e394a] opacity-60 mb-2" style={{ height: '2px', width: '100%' }} />
              <div 
                className="text-gray-800 leading-relaxed text-left mb-6" 
                style={{ 
                  fontSize: getTextSize(), 
                  lineHeight: '1.75' 
                }}
              >
                <p className="mb-3">I'm passionate about crafting experiences that are engaging, accessible, and meaningful.</p>
              </div>
            </div>

            {/* All projects folder */}
            <div className="mb-4 flex justify-center">
              <div
                className="flex flex-col items-center cursor-pointer group transition-all duration-200 rounded-lg p-1"
                onClick={(e) => {
                  setSelectedFolder('all-projects');
                  // 移动端单击直接打开文件夹
                  if (responsive.isMobile) {
                    onAllProjectsFolderDoubleClick(e);
                  }
                }}
                onDoubleClick={(e) => {
                  // 桌面端才响应双击事件
                  if (!responsive.isMobile) {
                    onAllProjectsFolderDoubleClick(e);
                  }
                }}
              >
                <div className={`${getFolderSize()} flex items-center justify-center group-hover:scale-110 transition-all duration-200 rounded-lg hover:bg-white/10 mb-1 ${selectedFolder === 'all-projects' ? 'bg-white/10' : ''}`}>
                  <MacOSFolderIcon color="orange" />
                </div>
                <h3 className={`font-semibold text-xs px-2 py-1 rounded ${selectedFolder === 'all-projects' ? 'text-white bg-blue-500' : 'text-white'}`}>All projects</h3>
              </div>
            </div>
            
            {/* 项目展示卡片 */}
            <div className="flex flex-col items-center gap-6">
              {/* Project Showcase 1 */}
              <div className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl p-6 ${getCardWidth()} flex flex-col gap-4 relative group transition-transform hover:scale-105 card font-sans`} style={{fontFamily: "Inter, Poppins, Manrope, sans-serif"}}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-lg font-bold title transition-colors duration-200" style={{color:'#1A1A1A', fontWeight:700, textShadow:'0 1px 2px rgba(0,0,0,0.15)'}}>Suogogo Platform</span>
                  <a href="https://www.suogogo.com" target="_blank" rel="noopener noreferrer" className="ml-auto">
                  <svg width="24" height="24" viewBox="0 0 1198 1226" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M997.1 786.062V612.059C997.1 560.948 976.948 539.771 916.847 565.725L702.486 689.486C691.819 695.645 678.486 687.947 678.486 675.63V620.467C678.486 614.751 681.536 609.469 686.486 606.611L916.847 473.612L972.927 441.544C983.645 435.415 983.677 419.971 972.985 413.798L606.389 202.144C601.438 199.285 595.339 199.285 590.389 202.144L208 422.916C203.05 425.774 200 431.056 200 436.772V785.877C200 791.593 203.05 796.875 208 799.733L598.71 1025.31L989.1 799.918C994.051 797.06 997.1 791.778 997.1 786.062ZM908.847 754.782L606.697 929.228C601.753 932.082 595.664 932.087 590.716 929.239L287.584 754.778C282.623 751.923 279.565 746.635 279.565 740.911V482.072C279.565 476.356 282.615 471.074 287.565 468.216L590.389 293.38C595.339 290.522 601.438 290.522 606.389 293.38L815.073 413.865C825.74 420.023 825.74 435.419 815.073 441.577L608.043 561.106C603.093 563.964 600.043 569.246 600.043 574.962V750.163L600.291 812.663C600.339 824.924 613.593 832.576 624.236 826.488L678.486 795.452L892.847 671.691C903.514 665.532 916.847 673.23 916.847 685.547V740.926C916.847 746.642 913.797 751.924 908.847 754.782Z" fill="#059212"/>
                  </svg>
                </a>
                </div>
                <div className="description text-sm mb-2" style={{color:'#333'}}>Suogogo is a shipping platform for cross-board logistics.</div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="label text-xs font-semibold px-2 py-1" style={{color:'#1A1A1A',background:'rgba(255,255,255,0.1)',borderRadius:'6px',textShadow:'0 1px 4px rgba(0,0,0,0.18)'}}>React</span>
                  <span className="label text-xs font-semibold px-2 py-1" style={{color:'#1A1A1A',background:'rgba(255,255,255,0.1)',borderRadius:'6px',textShadow:'0 1px 4px rgba(0,0,0,0.18)'}}>TypeScript</span>
                  <span className="label text-xs font-semibold px-2 py-1" style={{color:'#1A1A1A',background:'rgba(255,255,255,0.1)',borderRadius:'6px',textShadow:'0 1px 4px rgba(0,0,0,0.18)'}}>TailwindCSS</span>
                </div>
              </div>

              {/* Project Showcase 2 */}
              <div className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl p-6 ${getCardWidth()} flex flex-col gap-4 relative group transition-transform hover:scale-105 card font-sans`} style={{fontFamily: "Inter, Poppins, Manrope, sans-serif"}}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-lg font-bold title transition-colors duration-200" style={{color:'#1A1A1A', fontWeight:700, textShadow:'0 1px 2px rgba(0,0,0,0.15)'}}>Search Engine</span>
                  <a href="https://github.com/DreamOne11/SearchEngine" target="_blank" rel="noopener noreferrer" className="ml-auto">
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path fill="#1A1A1A" d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.344-3.369-1.344-.454-1.157-1.11-1.465-1.11-1.465-.908-.62.069-.608.069-.608 1.003.07 1.531 1.034 1.531 1.034.892 1.532 2.341 1.09 2.91.834.092-.648.35-1.09.636-1.34-2.22-.254-4.555-1.113-4.555-4.951 0-1.093.39-1.986 1.029-2.685-.103-.254-.446-1.272.098-2.651 0 0 .84-.27 2.75 1.027A9.564 9.564 0 0112 6.844c.85.004 1.705.116 2.504.34 1.909-1.297 2.747-1.027 2.747-1.027.546 1.38.203 2.397.1 2.651.64.7 1.028 1.592 1.028 2.685 0 3.847-2.339 4.695-4.566 4.945.359.31.678.922.678 1.857 0 1.34-.012 2.422-.012 2.75 0 .267.18.577.688.48C19.137 20.203 22 16.448 22 12.021 22 6.484 17.523 2 12 2Z"/></svg>
                  </a>
                </div>
                <div className="description text-sm mb-2" style={{color:'#333'}}>A campus search engine base on Java, support efficient web page crawling, indexing and  webpage search.</div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="label text-xs font-semibold px-2 py-1" style={{color:'#1A1A1A',background:'rgba(255,255,255,0.1)',borderRadius:'6px',textShadow:'0 1px 4px rgba(0,0,0,0.18)'}}>Java</span>
                  <span className="label text-xs font-semibold px-2 py-1" style={{color:'#1A1A1A',background:'rgba(255,255,255,0.1)',borderRadius:'6px',textShadow:'0 1px 4px rgba(0,0,0,0.18)'}}>Hadoop</span>
                  <span className="label text-xs font-semibold px-2 py-1" style={{color:'#1A1A1A',background:'rgba(255,255,255,0.1)',borderRadius:'6px',textShadow:'0 1px 4px rgba(0,0,0,0.18)'}}>HBase</span>
                  <span className="label text-xs font-semibold px-2 py-1" style={{color:'#1A1A1A',background:'rgba(255,255,255,0.1)',borderRadius:'6px',textShadow:'0 1px 4px rgba(0,0,0,0.18)'}}>Selenium</span>
                </div>
              </div>

              {/* Project Showcase 3 */}
              <div className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl p-6 ${getCardWidth()} flex flex-col gap-4 relative group transition-transform hover:scale-105 card font-sans`} style={{fontFamily: "Inter, Poppins, Manrope, sans-serif"}}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-lg font-bold title transition-colors duration-200" style={{color:'#1A1A1A', fontWeight:700, textShadow:'0 1px 2px rgba(0,0,0,0.15)'}}>iThink Platform</span>
                  <a href="https://github.com/Chocolate-Prince-and-Six-Dwarfs/iThink/" target="_blank" rel="noopener noreferrer" className="ml-auto">
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path fill="#1A1A1A" d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.344-3.369-1.344-.454-1.157-1.11-1.465-1.11-1.465-.908-.62.069-.608.069-.608 1.003.07 1.531 1.034 1.531 1.034.892 1.532 2.341 1.09 2.91.834.092-.648.35-1.09.636-1.34-2.22-.254-4.555-1.113-4.555-4.951 0-1.093.39-1.986 1.029-2.685-.103-.254-.446-1.272.098-2.651 0 0 .84-.27 2.75 1.027A9.564 9.564 0 0112 6.844c.85.004 1.705.116 2.504.34 1.909-1.297 2.747-1.027 2.747-1.027.546 1.38.203 2.397.1 2.651.64.7 1.028 1.592 1.028 2.685 0 3.847-2.339 4.695-4.566 4.945.359.31.678.922.678 1.857 0 1.34-.012 2.422-.012 2.75 0 .267.18.577.688.48C19.137 20.203 22 16.448 22 12.021 22 6.484 17.523 2 12 2Z"/></svg>
                  </a>
                </div>
                <div className="description text-sm mb-2" style={{color:'#333'}}>A creative investment website to help you find brainstorming creative ideas.</div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="label text-xs font-semibold px-2 py-1" style={{color:'#1A1A1A',background:'rgba(255,255,255,0.1)',borderRadius:'6px',textShadow:'0 1px 4px rgba(0,0,0,0.18)'}}>Java</span>
                  <span className="label text-xs font-semibold px-2 py-1" style={{color:'#1A1A1A',background:'rgba(255,255,255,0.1)',borderRadius:'6px',textShadow:'0 1px 4px rgba(0,0,0,0.18)'}}>SpringBoot</span>
                  <span className="label text-xs font-semibold px-2 py-1" style={{color:'#1A1A1A',background:'rgba(255,255,255,0.1)',borderRadius:'6px',textShadow:'0 1px 4px rgba(0,0,0,0.18)'}}>Wechat Mini Program</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // 桌面端布局保持不变
        <>
          <div className="absolute top-8 left-8 right-8 z-10">
        <h3 
          className="text-left text-[#263148] uppercase font-sans drop-shadow-sm font-extrabold tracking-wide mb-4" 
          style={{ 
            fontSize: getTitleSize(), 
            letterSpacing: '0.04em', 
            textShadow: '0 2px 8px #b3c2d6' 
          }}
        >
          MY WORK
        </h3>
            <div className="bg-[#2e394a] opacity-60 mb-2" style={{ height: '2px', width: '100%' }} />
        <div 
          className="text-gray-800 leading-relaxed text-left" 
          style={{ 
            fontSize: getTextSize(), 
            lineHeight: '1.75' 
          }}
        >
              <p className="mb-2">I'm passionate about crafting experiences that are engaging, accessible, and meaningful.</p>
        </div>
      </div>
      
      {/* All projects folder */}
      <div
            className="flex flex-col items-center cursor-pointer group transition-all duration-200 rounded-lg p-1 absolute left-8"
        style={{ top: topPositions.folder }}
        onClick={() => setSelectedFolder('all-projects')}
        onDoubleClick={onAllProjectsFolderDoubleClick}
      >
        <div className={`${getFolderSize()} flex items-center justify-center group-hover:scale-110 transition-all duration-200 rounded-lg hover:bg-white/10 mb-1 ${selectedFolder === 'all-projects' ? 'bg-white/10' : ''}`}>
          <MacOSFolderIcon color="orange" />
        </div>
        <h3 className={`font-semibold text-xs px-2 py-1 rounded ${selectedFolder === 'all-projects' ? 'text-white bg-blue-500' : 'text-white'}`}>All projects</h3>
      </div>
      
      <div 
            className="absolute left-1/2 transform -translate-x-1/2 flex gap-8" 
        style={{ top: topPositions.cards }}
      >
        {/* Project Showcase 1 */}
        <div className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl p-6 ${getCardWidth()} flex flex-col gap-4 relative group transition-transform hover:scale-105 card font-sans`} style={{fontFamily: "Inter, Poppins, Manrope, sans-serif"}}>
          <div className="flex items-center gap-3 mb-2">
                <span className="text-lg font-bold title transition-colors duration-200" style={{color:'#1A1A1A', fontWeight:700, textShadow:'0 1px 2px rgba(0,0,0,0.15)'}}>Suogogo Platform</span>
                <a href="https://www.suogogo.com" target="_blank" rel="noopener noreferrer" className="ml-auto">
                  <svg width="24" height="24" viewBox="0 0 1198 1226" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M997.1 786.062V612.059C997.1 560.948 976.948 539.771 916.847 565.725L702.486 689.486C691.819 695.645 678.486 687.947 678.486 675.63V620.467C678.486 614.751 681.536 609.469 686.486 606.611L916.847 473.612L972.927 441.544C983.645 435.415 983.677 419.971 972.985 413.798L606.389 202.144C601.438 199.285 595.339 199.285 590.389 202.144L208 422.916C203.05 425.774 200 431.056 200 436.772V785.877C200 791.593 203.05 796.875 208 799.733L598.71 1025.31L989.1 799.918C994.051 797.06 997.1 791.778 997.1 786.062ZM908.847 754.782L606.697 929.228C601.753 932.082 595.664 932.087 590.716 929.239L287.584 754.778C282.623 751.923 279.565 746.635 279.565 740.911V482.072C279.565 476.356 282.615 471.074 287.565 468.216L590.389 293.38C595.339 290.522 601.438 290.522 606.389 293.38L815.073 413.865C825.74 420.023 825.74 435.419 815.073 441.577L608.043 561.106C603.093 563.964 600.043 569.246 600.043 574.962V750.163L600.291 812.663C600.339 824.924 613.593 832.576 624.236 826.488L678.486 795.452L892.847 671.691C903.514 665.532 916.847 673.23 916.847 685.547V740.926C916.847 746.642 913.797 751.924 908.847 754.782Z" fill="#059212"/>
                  </svg>
            </a>
          </div>
              <div className="description text-sm mb-2" style={{color:'#333'}}>Suogogo is a shipping platform for cross-board logistics.</div>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="label text-xs font-semibold px-2 py-1" style={{color:'#1A1A1A',background:'rgba(255,255,255,0.1)',borderRadius:'6px',textShadow:'0 1px 4px rgba(0,0,0,0.18)'}}>React</span>
            <span className="label text-xs font-semibold px-2 py-1" style={{color:'#1A1A1A',background:'rgba(255,255,255,0.1)',borderRadius:'6px',textShadow:'0 1px 4px rgba(0,0,0,0.18)'}}>TypeScript</span>
            <span className="label text-xs font-semibold px-2 py-1" style={{color:'#1A1A1A',background:'rgba(255,255,255,0.1)',borderRadius:'6px',textShadow:'0 1px 4px rgba(0,0,0,0.18)'}}>TailwindCSS</span>
          </div>
        </div>

        {/* Project Showcase 2 */}
        <div className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl p-6 ${getCardWidth()} flex flex-col gap-4 relative group transition-transform hover:scale-105 card font-sans`} style={{fontFamily: "Inter, Poppins, Manrope, sans-serif"}}>
          <div className="flex items-center gap-3 mb-2">
                <span className="text-lg font-bold title transition-colors duration-200" style={{color:'#1A1A1A', fontWeight:700, textShadow:'0 1px 2px rgba(0,0,0,0.15)'}}>Campus Search Engine</span>
            <a href="https://github.com/DreamOne11/SearchEngine" target="_blank" rel="noopener noreferrer" className="ml-auto">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path fill="#1A1A1A" d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.344-3.369-1.344-.454-1.157-1.11-1.465-1.11-1.465-.908-.62.069-.608.069-.608 1.003.07 1.531 1.034 1.531 1.034.892 1.532 2.341 1.09 2.91.834.092-.648.35-1.09.636-1.34-2.22-.254-4.555-1.113-4.555-4.951 0-1.093.39-1.986 1.029-2.685-.103-.254-.446-1.272.098-2.651 0 0 .84-.27 2.75 1.027A9.564 9.564 0 0112 6.844c.85.004 1.705.116 2.504.34 1.909-1.297 2.747-1.027 2.747-1.027.546 1.38.203 2.397.1 2.651.64.7 1.028 1.592 1.028 2.685 0 3.847-2.339 4.695-4.566 4.945.359.31.678.922.678 1.857 0 1.34-.012 2.422-.012 2.75 0 .267.18.577.688.48C19.137 20.203 22 16.448 22 12.021 22 6.484 17.523 2 12 2Z"/></svg>
            </a>
          </div>
          <div className="description text-sm mb-2" style={{color:'#333'}}>A campus search engine base on Java, support efficient web page crawling, indexing and  webpage search.</div>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="label text-xs font-semibold px-2 py-1" style={{color:'#1A1A1A',background:'rgba(255,255,255,0.1)',borderRadius:'6px',textShadow:'0 1px 4px rgba(0,0,0,0.18)'}}>Java</span>
            <span className="label text-xs font-semibold px-2 py-1" style={{color:'#1A1A1A',background:'rgba(255,255,255,0.1)',borderRadius:'6px',textShadow:'0 1px 4px rgba(0,0,0,0.18)'}}>Hadoop</span>
            <span className="label text-xs font-semibold px-2 py-1" style={{color:'#1A1A1A',background:'rgba(255,255,255,0.1)',borderRadius:'6px',textShadow:'0 1px 4px rgba(0,0,0,0.18)'}}>HBase</span>
            <span className="label text-xs font-semibold px-2 py-1" style={{color:'#1A1A1A',background:'rgba(255,255,255,0.1)',borderRadius:'6px',textShadow:'0 1px 4px rgba(0,0,0,0.18)'}}>Selenium</span>
          </div>
        </div>

        {/* Project Showcase 3 */}
        <div className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl p-6 ${getCardWidth()} flex flex-col gap-4 relative group transition-transform hover:scale-105 card font-sans`} style={{fontFamily: "Inter, Poppins, Manrope, sans-serif"}}>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-lg font-bold title transition-colors duration-200" style={{color:'#1A1A1A', fontWeight:700, textShadow:'0 1px 2px rgba(0,0,0,0.15)'}}>iThink Platform</span>
            <a href="https://github.com/Chocolate-Prince-and-Six-Dwarfs/iThink/" target="_blank" rel="noopener noreferrer" className="ml-auto">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path fill="#1A1A1A" d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.344-3.369-1.344-.454-1.157-1.11-1.465-1.11-1.465-.908-.62.069-.608.069-.608 1.003.07 1.531 1.034 1.531 1.034.892 1.532 2.341 1.09 2.91.834.092-.648.35-1.09.636-1.34-2.22-.254-4.555-1.113-4.555-4.951 0-1.093.39-1.986 1.029-2.685-.103-.254-.446-1.272.098-2.651 0 0 .84-.27 2.75 1.027A9.564 9.564 0 0112 6.844c.85.004 1.705.116 2.504.34 1.909-1.297 2.747-1.027 2.747-1.027.546 1.38.203 2.397.1 2.651.64.7 1.028 1.592 1.028 2.685 0 3.847-2.339 4.695-4.566 4.945.359.31.678.922.678 1.857 0 1.34-.012 2.422-.012 2.75 0 .267.18.577.688.48C19.137 20.203 22 16.448 22 12.021 22 6.484 17.523 2 12 2Z"/></svg>
            </a>
          </div>
          <div className="description text-sm mb-2" style={{color:'#333'}}>A creative investment website to help you find brainstorming creative ideas.</div>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="label text-xs font-semibold px-2 py-1" style={{color:'#1A1A1A',background:'rgba(255,255,255,0.1)',borderRadius:'6px',textShadow:'0 1px 4px rgba(0,0,0,0.18)'}}>Java</span>
            <span className="label text-xs font-semibold px-2 py-1" style={{color:'#1A1A1A',background:'rgba(255,255,255,0.1)',borderRadius:'6px',textShadow:'0 1px 4px rgba(0,0,0,0.18)'}}>SpringBoot</span>
            <span className="label text-xs font-semibold px-2 py-1" style={{color:'#1A1A1A',background:'rgba(255,255,255,0.1)',borderRadius:'6px',textShadow:'0 1px 4px rgba(0,0,0,0.18)'}}>Wechat Mini Program</span>
                <span className="label text-xs font-semibold px-2 py-1" style={{color:'#1A1A1A',background:'rgba(255,255,255,0.1)',borderRadius:'6px',textShadow:'0 1px 4px rgba(0,0,0,0.18)'}}>MySQL</span>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
};

export default MyWorkScreen; 