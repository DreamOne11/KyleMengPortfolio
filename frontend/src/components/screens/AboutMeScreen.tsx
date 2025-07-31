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
  
  
  
  return (
    <div className="relative w-full h-full overflow-hidden" onClick={handleBackgroundClick}>
      {/* Short Introduction - moved to top and aligned with logo */}
      <div className="absolute top-8 left-8 right-8 z-10">
        <h3 className="text-left text-[#263148] uppercase font-sans drop-shadow-sm font-extrabold tracking-wide mb-4" style={{ fontSize: '2rem', letterSpacing: '0.04em', textShadow: '0 2px 8px #b3c2d6' }}>
          ABOUT ME
        </h3>
        <div className="bg-[#2e394a] opacity-60 mb-6" style={{ height: '2px', width: '100%' }} />
      </div>
      {/* Dynamic Folders */}
        <div className={`absolute left-8 flex gap-4 md:gap-4`} style={{ top: responsive.isMobile ? '10rem' : '6rem' }}>
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
      
      {/* First vertical text - below folders */}
      <div className={`absolute left-8 text-gray-800 leading-relaxed`} style={{ 
        top: responsive.isMobile ? '16rem' : '12rem',
        fontSize: responsive.isMobile ? '0.9rem' : '1.1rem',
        lineHeight: '1.6'
      }}>
      </div>
      
      {/* Second vertical text - bottom right corner */}
      <div className={`absolute right-8 top-48 text-gray-800 leading-relaxed`} style={{ 
        fontSize: responsive.isMobile ? '0.9rem' : '1.1rem',
        lineHeight: '1.6'
      }}>
      </div>
      
      {/* 键帽 Logo - 居中显示 */}
      <div className="flex w-full h-full items-center justify-center pointer-events-none">
        <KeyboardLogoStacked />
      </div>
    </div>
  );
};

export default AboutMeScreen; 