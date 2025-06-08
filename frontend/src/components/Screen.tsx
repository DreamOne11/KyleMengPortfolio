import React, { useRef, useState } from 'react';
import FileManager from './FileManager';
import EmailComposer from './EmailComposer';
import MacOSFolderIcon from './MacOSFolderIcon';
import KyleChat from './KyleChat';
import KeyboardLogoStacked from './KeyboardLogoStacked';

type Props = {
  currentScreen: number;
  onScreenChange: (screen: number) => void;
  onAnyFileManagerMaximizedChange?: (isMax: boolean) => void;
};

const Screen: React.FC<Props> = ({ currentScreen, onScreenChange, onAnyFileManagerMaximizedChange }) => {
  const startXRef = useRef<number>(0);
  const startYRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // 顶层管理所有文件管理器和邮件窗口
  const [openFileManagers, setOpenFileManagers] = useState<Array<{
    id: string;
    folderName: string;
    sourcePosition: { x: number; y: number };
    zIndex: number;
    isMaximized?: boolean;
  }>>([]);
  const [openEmailComposers, setOpenEmailComposers] = useState<Array<{
    id: string;
    zIndex: number;
  }>>([]);

  // 最大化状态计算和通知
  const isAnyFileManagerMaximized = openFileManagers.some(fm => fm.isMaximized);
  React.useEffect(() => {
    onAnyFileManagerMaximizedChange?.(isAnyFileManagerMaximized);
  }, [isAnyFileManagerMaximized, onAnyFileManagerMaximizedChange]);

  const screens = [
    { id: 0, title: 'About Me', subtitle: 'Get to know me better', emoji: '👋' },
    { id: 1, title: 'My Work', subtitle: 'Projects & Experience', emoji: '💼' },
    { id: 2, title: 'My Note', subtitle: 'Thoughts & Learning', emoji: '📝' },
    { id: 3, title: 'Photography', subtitle: 'Visual Stories', emoji: '📸' }
  ];

  const handleScreenChange = (newScreen: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    onScreenChange(newScreen);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    startYRef.current = e.touches[0].clientY;
    isDraggingRef.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current) return;
    
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = Math.abs(currentX - startXRef.current);
    const deltaY = Math.abs(currentY - startYRef.current);
    
    if (deltaX > deltaY && deltaX > 10) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDraggingRef.current) return;
    
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const deltaX = startXRef.current - endX;
    const deltaY = Math.abs(startYRef.current - endY);
    const threshold = 80;

    if (Math.abs(deltaX) > threshold && Math.abs(deltaX) > deltaY * 2) {
      if (deltaX > 0 && currentScreen < screens.length - 1) {
        handleScreenChange(currentScreen + 1);
      } else if (deltaX < 0 && currentScreen > 0) {
        handleScreenChange(currentScreen - 1);
      }
    }
    
    isDraggingRef.current = false;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
    isDraggingRef.current = true;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    
    const deltaX = Math.abs(e.clientX - startXRef.current);
    const deltaY = Math.abs(e.clientY - startYRef.current);
    
    if (deltaX > deltaY && deltaX > 10) {
      e.preventDefault();
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    
    const endX = e.clientX;
    const endY = e.clientY;
    const deltaX = startXRef.current - endX;
    const deltaY = Math.abs(startYRef.current - endY);
    const threshold = 80;

    if (Math.abs(deltaX) > threshold && Math.abs(deltaX) > deltaY * 2) {
      if (deltaX > 0 && currentScreen < screens.length - 1) {
        handleScreenChange(currentScreen + 1);
      } else if (deltaX < 0 && currentScreen > 0) {
        handleScreenChange(currentScreen - 1);
      }
    }
    
    isDraggingRef.current = false;
  };

  // About Me Screen Content
  const AboutMeContent = () => {
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
    const handleFolderDoubleClick = (folderId: string, action: () => void, e: React.MouseEvent) => {
      e.stopPropagation();
      // 检查该文件夹是否已经打开
      const isAlreadyOpen = openFileManagers.some(fm => fm.id === folderId);
      if (isAlreadyOpen) {
        setOpenFileManagers(prev => prev.map(fm => ({
          ...fm,
          zIndex: fm.id === folderId ? Math.max(...prev.map(f => f.zIndex)) + 1 : fm.zIndex
        })));
        return;
      }
      // 获取文件夹图标的位置信息
      const folderElement = e.currentTarget.querySelector('svg') || e.currentTarget;
      const rect = folderElement.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const maxZIndex = openFileManagers.length > 0 ? Math.max(...openFileManagers.map(fm => fm.zIndex)) : 1000;
      const folderName = folders.find(f => f.id === folderId)?.name || folderId;
      setOpenFileManagers(prev => [...prev, {
        id: folderId,
        folderName,
        sourcePosition: { x: centerX, y: centerY },
        zIndex: maxZIndex + 1,
        isMaximized: false
      }]);
    };
    const handleBackgroundClick = () => setSelectedFolder(null);
    return (
      <div className="relative w-full h-full" onClick={handleBackgroundClick}>
        {/* Short Introduction - moved to top and aligned with logo */}
        <div className="absolute top-8 left-8 right-8 z-10">
          <h3 className="text-left text-[#263148] uppercase font-sans drop-shadow-sm font-extrabold tracking-wide mb-4" style={{ fontSize: '2rem', letterSpacing: '0.04em', textShadow: '0 2px 8px #b3c2d6' }}>
            ABOUT
          </h3>
          <div className="bg-[#2e394a] opacity-60 mb-6" style={{ height: '2px', width: '100%' }} />
          <div className="text-gray-800 leading-relaxed text-left" style={{ fontSize: '1.25rem', lineHeight: '1.75' }}>
            <p className="mb-3">Hi, my name is Kyle Meng, a new grad from University of Ottawa.</p>
            <p className="mb-3">An aspiring software engineer, also an amateur photographer.</p>
            <p className="mb-3">Passionate about web development, distributed systems, and photography.</p>
            <p className="mb-3">Check the folders below to learn more about me.</p>
          </div>
        </div>
        {/* Dynamic Folders */}
        <div className="absolute left-8 flex gap-8" style={{ top: '20rem' }}>
          {folders.map((folder) => (
            <div key={folder.id} className="flex flex-col items-center cursor-pointer group transition-all duration-200 rounded-lg p-1"
              onClick={(e) => handleFolderClick(folder.id, e)}
              onDoubleClick={(e) => handleFolderDoubleClick(folder.id, () => {}, e)}>
              <div className={`w-16 h-16 flex items-center justify-center group-hover:scale-110 transition-all duration-200 rounded-lg hover:bg-white/10 mb-1 ${selectedFolder === folder.id ? 'bg-white/10' : ''}`}>
                <MacOSFolderIcon color={folder.color} />
              </div>
              <h3 className={`font-semibold text-xs px-2 py-1 rounded ${selectedFolder === folder.id ? 'text-white bg-blue-500' : 'text-white'}`}>{folder.name}</h3>
            </div>
          ))}
        </div>
        {/* 键帽 Logo ——固定红框位置，可根据需要微调 right/top/w/h */}
        <div className="absolute right-[135px] top-[280px] w-[450px] h-[220px]">
          <KeyboardLogoStacked />
        </div>
      </div>
    );
  };

  // Screen Content Components
  const MyWorkContent = () => (
    <div className="relative w-full h-full">
      <div className="absolute top-8 left-8 right-8 z-10">
        <h3 className="text-left text-[#263148] uppercase font-sans drop-shadow-sm font-extrabold tracking-wide mb-4" style={{ fontSize: '2rem', letterSpacing: '0.04em', textShadow: '0 2px 8px #b3c2d6' }}>
          MY WORK
        </h3>
        <div className="bg-[#2e394a] opacity-60 mb-6" style={{ height: '2px', width: '100%' }} />
        <div className="text-gray-800 leading-relaxed text-left" style={{ fontSize: '1.25rem', lineHeight: '1.75' }}>
          <p className="mb-3">Welcome to my professional journey.</p>
          <p className="mb-3">Here you'll find my projects, experiences, and technical achievements.</p>
          <p className="mb-3">Explore my work and see how I bring ideas to life through code.</p>
        </div>
      </div>
      <div className="absolute left-8 flex gap-8" style={{ top: '20rem' }}>
        {/* Project folders will be added here */}
      </div>
    </div>
  );

  const MyNoteContent = () => (
    <div className="relative w-full h-full">
      <div className="absolute top-8 left-8 right-8 z-10">
        <h3 className="text-left text-[#263148] uppercase font-sans drop-shadow-sm font-extrabold tracking-wide mb-4" style={{ fontSize: '2rem', letterSpacing: '0.04em', textShadow: '0 2px 8px #b3c2d6' }}>
          MY NOTE
        </h3>
        <div className="bg-[#2e394a] opacity-60 mb-6" style={{ height: '2px', width: '100%' }} />
        <div className="text-gray-800 leading-relaxed text-left" style={{ fontSize: '1.25rem', lineHeight: '1.75' }}>
          <p className="mb-3">A collection of my thoughts and learnings.</p>
          <p className="mb-3">Technical insights, tutorials, and personal reflections.</p>
          <p className="mb-3">Sharing knowledge and experiences in software development.</p>
        </div>
      </div>
      <div className="absolute left-8 flex gap-8" style={{ top: '20rem' }}>
        {/* Note folders will be added here */}
      </div>
    </div>
  );

  const PhotographyContent = () => (
    <div className="relative w-full h-full">
      <div className="absolute top-8 left-8 right-8 z-10">
        <h3 className="text-left text-[#263148] uppercase font-sans drop-shadow-sm font-extrabold tracking-wide mb-4" style={{ fontSize: '2rem', letterSpacing: '0.04em', textShadow: '0 2px 8px #b3c2d6' }}>
          PHOTOGRAPHY
        </h3>
        <div className="bg-[#2e394a] opacity-60 mb-6" style={{ height: '2px', width: '100%' }} />
        <div className="text-gray-800 leading-relaxed text-left" style={{ fontSize: '1.25rem', lineHeight: '1.75' }}>
          <p className="mb-3">Capturing moments through my lens.</p>
          <p className="mb-3">A visual journey of landscapes, street photography, and more.</p>
          <p className="mb-3">Exploring the world one frame at a time.</p>
        </div>
      </div>
      <div className="absolute left-8 flex gap-8" style={{ top: '20rem' }}>
        {/* Photography folders will be added here */}
      </div>
    </div>
  );

  // 邮件发送框处理函数
  const handleOpenEmailComposer = () => {
    if (openEmailComposers.length > 0) {
      setOpenEmailComposers(prev => prev.map(ec => ({
        ...ec,
        zIndex: Math.max(...prev.map(e => e.zIndex)) + 1
      })));
      return;
    }
    const allZIndices = [
      ...openFileManagers.map(fm => fm.zIndex),
      ...openEmailComposers.map(ec => ec.zIndex)
    ];
    const maxZIndex = allZIndices.length > 0 ? Math.max(...allZIndices) : 1000;
    setOpenEmailComposers(prev => [...prev, {
      id: 'email-composer',
      zIndex: maxZIndex + 1
    }]);
  };
  const handleCloseFileManager = (folderId: string) => {
    setOpenFileManagers(prev => prev.filter(fm => fm.id !== folderId));
  };
  const handleFileManagerFocus = (folderId: string) => {
    setOpenFileManagers(prev => prev.map(fm => ({
      ...fm,
      zIndex: fm.id === folderId ? Math.max(...prev.map(f => f.zIndex)) + 1 : fm.zIndex
    })));
  };
  const handleCloseEmailComposer = (composerId: string) => {
    setOpenEmailComposers(prev => prev.filter(ec => ec.id !== composerId));
  };
  const handleEmailComposerFocus = (composerId: string) => {
    const allZIndices = [
      ...openFileManagers.map(fm => fm.zIndex),
      ...openEmailComposers.map(ec => ec.zIndex)
    ];
    const maxZIndex = Math.max(...allZIndices);
    setOpenEmailComposers(prev => prev.map(ec => ({
      ...ec,
      zIndex: ec.id === composerId ? maxZIndex + 1 : ec.zIndex
    })));
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Show KyleChat on all screens */}
      <KyleChat />
      {/* Sliding Screens Container */}
      <div 
        className={`flex w-full h-full transition-transform duration-500 ease-in-out`}
        style={{ transform: `translateX(-${currentScreen * 100}%)` }}
      >
        {screens.map((screen, index) => (
          <div
            key={screen.id}
            className="min-w-full h-full flex items-center justify-center p-8 cursor-grab active:cursor-grabbing select-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            {index === 0 ? <AboutMeContent /> : 
             index === 1 ? <MyWorkContent /> :
             index === 2 ? <MyNoteContent /> :
             <PhotographyContent />}
          </div>
        ))}
      </div>
      {/* FileManager Modals 顶层渲染 */}
      {openFileManagers.map((fileManager, index) => (
        <FileManager
          key={fileManager.id}
          folderName={fileManager.folderName}
          onClose={() => handleCloseFileManager(fileManager.id)}
          sourcePosition={fileManager.sourcePosition}
          onFocus={() => handleFileManagerFocus(fileManager.id)}
          windowOffset={{ x: index * 30, y: index * 30 }}
          zIndex={fileManager.zIndex}
          onOpenEmailComposer={handleOpenEmailComposer}
          onMaximizeChange={(isMax) => {
            setOpenFileManagers(prev => prev.map(fm =>
              fm.id === fileManager.id ? { ...fm, isMaximized: isMax } : fm
            ));
          }}
        />
      ))}
      {/* EmailComposer Modals 顶层渲染 */}
      {openEmailComposers.map((emailComposer, index) => (
        <EmailComposer
          key={emailComposer.id}
          onClose={() => handleCloseEmailComposer(emailComposer.id)}
          onFocus={() => handleEmailComposerFocus(emailComposer.id)}
          windowOffset={{ x: index * 40, y: index * 40 }}
          zIndex={emailComposer.zIndex}
        />
      ))}
    </div>
  );
};

export default Screen; 