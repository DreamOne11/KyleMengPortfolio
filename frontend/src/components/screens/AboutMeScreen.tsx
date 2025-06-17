import React, { useState } from 'react';
import MacOSFolderIcon from '../icons/MacOSFolderIcon';
import KeyboardLogoStacked from '../ui/KeyboardLogoStacked';
import { useResponsive } from '../../utils/responsive';

type AboutMeScreenProps = {
  onFolderDoubleClick: (folderId: string, e: React.MouseEvent, folderName: string) => void;
};

const AboutMeScreen: React.FC<AboutMeScreenProps> = ({ onFolderDoubleClick }) => {
  const responsive = useResponsive();
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  
  // 文件夹配置
  const folders = [
    { id: 'resume', name: 'Resume', color: 'blue' as const },
    { id: 'contact', name: 'Contact', color: 'green' as const }
  ];
  
  const handleFolderClick = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFolder(folderId);
  };
  
  const handleFolderDoubleClick = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const folderName = folders.find(f => f.id === folderId)?.name || folderId;
    onFolderDoubleClick(folderId, e, folderName);
  };
  
  const handleBackgroundClick = () => setSelectedFolder(null);
  
  // 根据屏幕尺寸获取键盘Logo的位置样式
  const getKeyboardLogoStyle = () => {
    if (responsive.isMobile) {
      return "absolute right-[-80px] top-[340px] scale-75 opacity-60";
    } else if (responsive.isTablet) {
      return "absolute right-[-180px] top-[300px] scale-90 opacity-80";
    } else if (responsive.breakpoint === 'lg') {
      return "absolute right-[-300px] top-[280px] w-[800px] h-[440px]";
    } else {
      return "absolute right-[-395px] top-[260px] w-[900px] h-[440px]";
    }
  };
  
  return (
    <div className="relative w-full h-full" onClick={handleBackgroundClick}>
      {/* Short Introduction - moved to top and aligned with logo */}
      <div className="absolute top-8 left-8 right-8 z-10">
        <h3 className="text-left text-[#263148] uppercase font-sans drop-shadow-sm font-extrabold tracking-wide mb-4" style={{ fontSize: '2rem', letterSpacing: '0.04em', textShadow: '0 2px 8px #b3c2d6' }}>
          ABOUT
        </h3>
        {/*<div className="bg-[#2e394a] opacity-60 mb-6" style={{ height: '2px', width: '100%' }} />*/} 
        {/* <div className="text-gray-800 leading-relaxed text-left" style={{ fontSize: responsive.isMobile ? '1rem' : '1.25rem', lineHeight: '1.75' }}>
          <p className="mb-3">Hi, my name is Kyle Meng, a new grad from University of Ottawa.</p>
          <p className="mb-3">An aspiring software engineer, also an amateur photographer.</p>
          <p className="mb-3">Passionate about web development, distributed systems, and photography.</p>
          <p className="mb-3">Check the folders below to learn more about me.</p>
        </div> */}
      </div>
      {/* Dynamic Folders */}
        <div className={`absolute left-8 flex gap-4 md:gap-4`} style={{ top: responsive.isMobile ? '10rem' : '5rem' }}>
          {folders.map((folder) => (
            <div key={folder.id} className="flex flex-col items-center cursor-pointer group transition-all duration-200 rounded-lg p-1"
              onClick={(e) => handleFolderClick(folder.id, e)}
              onDoubleClick={(e) => handleFolderDoubleClick(folder.id, e)}>
              <div className={`w-12 h-12 md:w-16 md:h-16 flex items-center justify-center group-hover:scale-110 transition-all duration-200 rounded-lg hover:bg-white/10 mb-1 ${selectedFolder === folder.id ? 'bg-white/10' : ''}`}>
                <MacOSFolderIcon color={folder.color} />
              </div>
              <h3 className={`font-semibold text-xs px-2 py-1 rounded ${selectedFolder === folder.id ? 'text-white bg-blue-500' : 'text-white'}`}>{folder.name}</h3>
            </div>
          ))}
        </div>
      
      
      {/* 键帽 Logo - 居中显示 */}
      <div className="flex w-full h-full items-center justify-center pointer-events-none">
        <KeyboardLogoStacked />
      </div>
    </div>
  );
};

export default AboutMeScreen; 