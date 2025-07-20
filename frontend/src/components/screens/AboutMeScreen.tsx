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
    <div className="relative w-full h-full" onClick={handleBackgroundClick}>
      {/* Short Introduction - moved to top and aligned with logo */}
      <div className="absolute top-8 left-8 right-8 z-10">
        <h3 className="text-left text-[#263148] uppercase font-sans drop-shadow-sm font-extrabold tracking-wide mb-4" style={{ fontSize: '2rem', letterSpacing: '0.04em', textShadow: '0 2px 8px #b3c2d6' }}>
          ABOUT
        </h3>
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
      
      {/* First vertical text - below folders */}
      <div className={`absolute left-8 text-gray-800 leading-relaxed`} style={{ 
        top: responsive.isMobile ? '16rem' : '12rem',
        fontSize: responsive.isMobile ? '0.9rem' : '1.1rem',
        lineHeight: '1.6'
      }}>
        <div className="flex flex-col">
          <span>Based in Ottawa</span>
          <span>Software Developer</span>
          <span>Amateur Photographer</span>
          <span>I think web design</span>
          <span>can be more </span>
          <span>diverse and inspiring.</span>
          <span>I am pursuing</span>
          <span>new expressions</span>
          <span>through experiments</span>
          <span>and thoughts.</span>
        </div>
      </div>
      
      {/* Second vertical text - bottom right corner */}
      <div className={`absolute right-8 top-48 text-gray-800 leading-relaxed`} style={{ 
        fontSize: responsive.isMobile ? '0.9rem' : '1.1rem',
        lineHeight: '1.6'
      }}>
        <div className="flex flex-col items-end">
          <span>Photography and Web</span>
          <span>design are both</span>
          <span>aesthetically pleasing</span>
          <span>the composition of</span>
          <span>a photograph is</span>
          <span>as important as</span>
          <span>the layout of</span>
          <span>a web page providing</span>
          <span>a stunning visual</span>
          <span>experience and</span>
          <span>interaction.</span>
        </div>
      </div>
      
      {/* 键帽 Logo - 居中显示 */}
      <div className="flex w-full h-full items-center justify-center pointer-events-none">
        <KeyboardLogoStacked />
      </div>
    </div>
  );
};

export default AboutMeScreen; 