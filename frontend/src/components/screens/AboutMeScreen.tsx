import React, { useState } from 'react';
import MacOSFolderIcon from '../icons/MacOSFolderIcon';
import KeyboardLogoStacked from '../ui/KeyboardLogoStacked';
import KyleInteractive from '../ui/KyleInteractive';
import { useResponsive } from '../../utils/responsive';

type AboutMeScreenProps = {
  onFolderDoubleClick: (folderId: string, e: React.MouseEvent, folderName: string) => void;
  onChatExpandedChange?: (isExpanded: boolean) => void;
};

const AboutMeScreen: React.FC<AboutMeScreenProps> = ({ onFolderDoubleClick, onChatExpandedChange }) => {
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
    
    // 移动端单击直接打开文件夹
    if (responsive.isMobile) {
      const folderName = folders.find(f => f.id === folderId)?.name || folderId;
      onFolderDoubleClick(folderId, e, folderName);
    }
  };
  
  const handleFolderDoubleClick = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // 桌面端才响应双击事件
    if (!responsive.isMobile) {
      const folderName = folders.find(f => f.id === folderId)?.name || folderId;
      onFolderDoubleClick(folderId, e, folderName);
    }
  };
  
  const handleBackgroundClick = () => setSelectedFolder(null);
  
  
  
  // 移动端垂直布局
  if (responsive.isMobile) {
    return (
      <div className="relative w-full h-full overflow-y-auto overflow-x-hidden" onClick={handleBackgroundClick}>
        <div className="flex flex-col min-h-full px-4 pt-20 pb-6"> {/* pt-20 为顶部导航栏留出空间 */}
          
          {/* About Me 标题和分割线 */}
           <div className="flex-shrink-0">
            <h3 className="text-left text-[#263148] uppercase font-sans drop-shadow-sm font-extrabold tracking-wide mb-4" 
                style={{ fontSize: '1.5rem', letterSpacing: '0.04em', textShadow: '0 2px 8px #b3c2d6' }}>
              ABOUT ME
            </h3>
          </div>
          
          {/* KyleInteractive - 顶部 */}
          <div className="w-full h-32 flex-shrink-0">
            <KyleInteractive onChatExpandedChange={onChatExpandedChange} />
          </div>
          
          {/* 两个文件夹 */}
          <div className="flex justify-center gap-4 flex-shrink-0">
            {folders.map((folder) => (
              <div
                key={folder.id}
                className="flex flex-col items-center cursor-pointer group transition-all duration-200 rounded-lg p-2"
                onClick={(e) => handleFolderClick(folder.id, e)}
                onDoubleClick={(e) => handleFolderDoubleClick(folder.id, e)}
                data-onboarding={folder.id === 'contact' ? 'contact-folder' : undefined}
              >
                <div className={`w-16 h-16 flex items-center justify-center group-hover:scale-110 transition-all duration-200 rounded-lg hover:bg-white/10 mb-2 ${selectedFolder === folder.id ? 'bg-white/10' : ''}`}>
                  <MacOSFolderIcon color={folder.color} />
                </div>
                <h3 className={`font-semibold text-sm px-3 py-1 rounded ${selectedFolder === folder.id ? 'text-white bg-blue-500' : 'text-white'}`}>
                  {folder.name}
                </h3>
              </div>
            ))}
          </div>
          
          {/* KeyboardLogoStacked - 底部 */}
          <div className="flex justify-center flex-shrink-0 mt-8">
            <KeyboardLogoStacked />
          </div>
          
        </div>
      </div>
    );
  }

  // 桌面端保持原有布局
  return (
    <div className="relative w-full h-full overflow-hidden" onClick={handleBackgroundClick}>
      {/* KyleInteractive - 右上角 */}
      <div className="absolute top-2 right-2 z-20">
        <KyleInteractive onChatExpandedChange={onChatExpandedChange} />
      </div>
      
      {/* Short Introduction - moved to top and aligned with logo */}
      <div className="absolute top-8 left-8 right-8 z-10">
        <h3 className="text-left text-[#263148] uppercase font-sans drop-shadow-sm font-extrabold tracking-wide mb-4" style={{ fontSize: '2rem', letterSpacing: '0.04em', textShadow: '0 2px 8px #b3c2d6' }}>
          ABOUT ME
        </h3>
      </div>

      {/* Dynamic Folders */}
        <div className={`absolute left-8 flex gap-4 md:gap-4`} style={{ top: responsive.isMobile ? '6rem' : '6rem' }}>
          {folders.map((folder) => (
            <div
              key={folder.id}
              className="flex flex-col items-center cursor-pointer group transition-all duration-200 rounded-lg p-1"
              onClick={(e) => handleFolderClick(folder.id, e)}
              onDoubleClick={(e) => handleFolderDoubleClick(folder.id, e)}
              data-onboarding={folder.id === 'contact' ? 'contact-folder' : undefined}
            >
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