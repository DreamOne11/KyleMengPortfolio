import React, { useRef, useState } from 'react';
import FileManager from './FileManager';
import EmailComposer from './EmailComposer';
import MacOSFolderIcon from './MacOSFolderIcon';

type Props = {
  currentScreen: number;
  onScreenChange: (screen: number) => void;
  children?: React.ReactNode;
};

const Screen: React.FC<Props> = ({ currentScreen, onScreenChange, children }) => {
  const startXRef = useRef<number>(0);
  const startYRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

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
    // 修改为支持多个打开的文件管理器
    const [openFileManagers, setOpenFileManagers] = useState<Array<{
      id: string;
      folderName: string;
      sourcePosition: { x: number; y: number };
      zIndex: number;
    }>>([]);

    // 邮件发送框状态管理
    const [openEmailComposers, setOpenEmailComposers] = useState<Array<{
      id: string;
      zIndex: number;
    }>>([]);
    
    // 文件夹配置 - 便于扩展和维护
    const folders = [
      {
        id: 'resume',
        name: 'Resume',
        color: 'blue' as const
      },
      {
        id: 'contact',
        name: 'Contact',
        color: 'green' as const
      }
    ];
    
    const handleFolderClick = (folderId: string, e: React.MouseEvent) => {
      e.stopPropagation(); // 防止事件冒泡
      setSelectedFolder(folderId);
    };
    
    const handleFolderDoubleClick = (folderId: string, action: () => void, e: React.MouseEvent) => {
      e.stopPropagation(); // 防止事件冒泡
      
      // 检查该文件夹是否已经打开
      const isAlreadyOpen = openFileManagers.some(fm => fm.id === folderId);
      if (isAlreadyOpen) {
        // 如果已经打开，将其置顶
        setOpenFileManagers(prev => 
          prev.map(fm => ({
            ...fm,
            zIndex: fm.id === folderId ? Math.max(...prev.map(f => f.zIndex)) + 1 : fm.zIndex
          }))
        );
        return;
      }
      
      // 获取文件夹图标的位置信息（更精确的中心点）
      const folderElement = e.currentTarget.querySelector('svg') || e.currentTarget;
      const rect = folderElement.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      console.log('Folder position:', { x: centerX, y: centerY }); // 调试用
      
      // 计算新窗口的z-index
      const maxZIndex = openFileManagers.length > 0 ? Math.max(...openFileManagers.map(fm => fm.zIndex)) : 1000;
      
      // 添加新的文件管理器
      const folderName = folders.find(f => f.id === folderId)?.name || folderId;
      setOpenFileManagers(prev => [...prev, {
        id: folderId,
        folderName,
        sourcePosition: { x: centerX, y: centerY },
        zIndex: maxZIndex + 1
      }]);
    };

    const handleBackgroundClick = () => {
      setSelectedFolder(null); // 点击空白区域取消选中
    };

    const handleCloseFileManager = (folderId: string) => {
      setOpenFileManagers(prev => prev.filter(fm => fm.id !== folderId));
    };

    const handleFileManagerFocus = (folderId: string) => {
      // 将点击的窗口置顶
      setOpenFileManagers(prev => 
        prev.map(fm => ({
          ...fm,
          zIndex: fm.id === folderId ? Math.max(...prev.map(f => f.zIndex)) + 1 : fm.zIndex
        }))
      );
    };

    // 邮件发送框处理函数
    const handleOpenEmailComposer = () => {
      // 检查是否已经有邮件发送框打开
      if (openEmailComposers.length > 0) {
        // 如果已经打开，将其置顶
        setOpenEmailComposers(prev => 
          prev.map(ec => ({
            ...ec,
            zIndex: Math.max(...prev.map(e => e.zIndex)) + 1
          }))
        );
        return;
      }

      // 计算新窗口的z-index
      const allZIndices = [
        ...openFileManagers.map(fm => fm.zIndex),
        ...openEmailComposers.map(ec => ec.zIndex)
      ];
      const maxZIndex = allZIndices.length > 0 ? Math.max(...allZIndices) : 1000;

      // 添加新的邮件发送框
      setOpenEmailComposers(prev => [...prev, {
        id: 'email-composer',
        zIndex: maxZIndex + 1
      }]);
    };

    const handleCloseEmailComposer = (composerId: string) => {
      setOpenEmailComposers(prev => prev.filter(ec => ec.id !== composerId));
    };

    const handleEmailComposerFocus = (composerId: string) => {
      // 将点击的窗口置顶
      const allZIndices = [
        ...openFileManagers.map(fm => fm.zIndex),
        ...openEmailComposers.map(ec => ec.zIndex)
      ];
      const maxZIndex = Math.max(...allZIndices);

      setOpenEmailComposers(prev => 
        prev.map(ec => ({
          ...ec,
          zIndex: ec.id === composerId ? maxZIndex + 1 : ec.zIndex
        }))
      );
    };

    return (
    <div className="relative w-full h-full" onClick={handleBackgroundClick}>
      {/* Kyle Logo */}
      <div className="absolute bottom-40 right-8 z-20">
        <img 
          src="/KyleLogo.png" 
          alt="Kyle Logo" 
          className="object-contain select-none max-w-none h-auto"
          style={{ width: 'min(25vw, 400px)' }}
          draggable="false"
          onDragStart={(e) => e.preventDefault()}
        />
      </div>
      
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
        </div>
      </div>
      
      {/* Dynamic Folders - positioned below ABOUT section */}
      <div className="absolute left-8 flex gap-8" style={{ top: '20rem' }}>
        {folders.map((folder) => (
          <div 
            key={folder.id}
            className="flex flex-col items-center cursor-pointer group transition-all duration-200 rounded-lg p-1"
            onClick={(e) => handleFolderClick(folder.id, e)}
            onDoubleClick={(e) => handleFolderDoubleClick(folder.id, () => {}, e)}
          >
            <div className={`w-16 h-16 flex items-center justify-center group-hover:scale-110 transition-all duration-200 rounded-lg hover:bg-white/10 mb-1 ${
              selectedFolder === folder.id ? 'bg-white/10' : ''
            }`}>
              <MacOSFolderIcon color={folder.color} />
            </div>
            <h3 className={`font-semibold text-xs px-2 py-1 rounded ${
              selectedFolder === folder.id ? 'text-white bg-blue-500' : 'text-white'
            }`}>{folder.name}</h3>
          </div>
        ))}
      </div>
      
      {/* Multiple FileManager Modals */}
      {openFileManagers.map((fileManager, index) => (
        <FileManager
          key={fileManager.id}
          folderName={fileManager.folderName}
          onClose={() => handleCloseFileManager(fileManager.id)}
          sourcePosition={fileManager.sourcePosition}
          onFocus={() => handleFileManagerFocus(fileManager.id)}
          windowOffset={{ x: index * 30, y: index * 30 }} // 为每个窗口添加偏移，避免完全重叠
          zIndex={fileManager.zIndex}
          onOpenEmailComposer={handleOpenEmailComposer}
        />
      ))}

      {/* Email Composer Modals */}
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

  // Generic Screen Content for other screens
  const GenericScreenContent = ({ screen }: { screen: typeof screens[0] }) => (
    <div className="text-center text-white max-w-2xl">
      <div className="text-8xl mb-6 animate-bounce">{screen.emoji}</div>
      <h1 className="text-5xl font-bold mb-6 tracking-tight">{screen.title}</h1>
      <p className="text-2xl opacity-80 mb-12 leading-relaxed">{screen.subtitle}</p>
      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8">
        <p className="text-white/90">
          This section is coming soon! Stay tuned for exciting content.
        </p>
      </div>
    </div>
  );

  return (
    <div className="relative w-full h-full overflow-hidden">
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
            {index === 0 ? <AboutMeContent /> : <GenericScreenContent screen={screen} />}
          </div>
        ))}
      </div>
      
      {children}
    </div>
  );
};

export default Screen; 