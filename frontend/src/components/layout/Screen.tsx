import React, { useRef, useState } from 'react';
import FileManager from '../windows/FileManager';
import EmailComposer from '../windows/EmailComposer';
import KyleChat from '../windows/KyleChat';
import ProjectDetailWindow from '../windows/ProjectDetailWindow';
import { useResponsive } from '../../utils/responsive';

// 导入拆分后的屏幕组件
import AboutMeScreen from '../screens/AboutMeScreen';
import MyWorkScreen from '../screens/MyWorkScreen';
import MyNoteScreen from '../screens/MyNoteScreen';
import PhotographyScreen from '../screens/PhotographyScreen';

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
  const responsive = useResponsive();

  // 顶层管理所有文件管理器和邮件窗口
  const [openFileManagers, setOpenFileManagers] = useState<Array<{
    id: string;
    folderName: string;
    sourcePosition: { x: number; y: number };
    zIndex: number;
    isMaximized?: boolean;
    customFiles?: any[];
  }>>([]);
  const [openEmailComposers, setOpenEmailComposers] = useState<Array<{
    id: string;
    zIndex: number;
  }>>([]);

  const allProjects = [
    { id: 'portfolio', name: 'Portfolio', date: '2024-06-09', kind: 'Web', desc: 'Personal Portfolio Website for showing my ideas and creations.' },
    { id: 'searchengine', name: 'Compus Network Search Engine', date: '2024-05-01', kind: 'Java', desc: '基于Java的分布式全文搜索引擎，支持高效网页抓取、索引与多条件检索。' },
    { id: 'ithink', name: 'iThink Ideas Investment Platform', date: '2023-12-15', kind: 'Java', desc: '基于Java的思维导图与团队协作平台，支持多人实时编辑、任务分配与进度追踪。' },
    { id: 'blank1', name: 'Blank Project 1', date: '', kind: '', desc: '' },
    { id: 'blank2', name: 'Blank Project 2', date: '', kind: '', desc: '' },
  ];

  // 在 Screen 组件顶部添加 projectDetailWindows 状态
  const [projectDetailWindows, setProjectDetailWindows] = useState<Array<{id: string, project: any, zIndex: number, windowOffset: {x: number, y: number}}>>([]);

  // 最大化状态计算和通知
  const isAnyFileManagerMaximized = openFileManagers.some(fm => fm.isMaximized);
  React.useEffect(() => {
    onAnyFileManagerMaximizedChange?.(isAnyFileManagerMaximized);
  }, [isAnyFileManagerMaximized, onAnyFileManagerMaximizedChange]);

  // 防止双击缩放
  React.useEffect(() => {
    // 添加meta标签禁用缩放
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (viewportMeta) {
      viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
      document.head.appendChild(meta);
    }
  }, []);

  

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
    
    // 根据屏幕大小调整滑动阈值
    const threshold = responsive.isMobile ? 50 : 80;

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

  // 处理文件夹双击事件的通用函数
  const handleFolderDoubleClick = (folderId: string, e: React.MouseEvent, folderName: string) => {
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
    
    setOpenFileManagers(prev => [...prev, {
      id: folderId,
      folderName,
      sourcePosition: { x: centerX, y: centerY },
      zIndex: maxZIndex + 1,
      isMaximized: false
    }]);
  };

  // 在 Screen 组件内定义专门处理 all-projects 文件夹的 handleAllProjectsFolderDoubleClick
  const handleAllProjectsFolderDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const folderId = 'all-projects';
    const isAlreadyOpen = openFileManagers.some(fm => fm.id === folderId);
    if (isAlreadyOpen) {
      setOpenFileManagers(prev => prev.map(fm => ({
        ...fm,
        zIndex: fm.id === folderId ? Math.max(...prev.map(f => f.zIndex)) + 1 : fm.zIndex
      })));
      return;
    }
    const folderElement = e.currentTarget.querySelector('svg') || e.currentTarget;
    const rect = folderElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const maxZIndex = openFileManagers.length > 0 ? Math.max(...openFileManagers.map(fm => fm.zIndex)) : 1000;
    setOpenFileManagers(prev => [...prev, {
      id: folderId,
      folderName: 'All projects',
      sourcePosition: { x: centerX, y: centerY },
      zIndex: maxZIndex + 1,
      isMaximized: false,
      customFiles: allProjects
    }]);
  };

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
        className={`flex w-full h-full transition-transform ${responsive.isMobile ? 'duration-300' : 'duration-500'} ease-in-out`}
        style={{ transform: `translateX(-${currentScreen * 100}%)` }}
      >
        {screens.map((screen, index) => (
          <div
            key={screen.id}
            className={`min-w-full h-full flex items-center justify-center ${responsive.isMobile ? 'p-0' : responsive.isTablet ? 'p-2' : 'p-8'} cursor-grab active:cursor-grabbing select-none touch-none`}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
            onDoubleClick={(e) => e.preventDefault()}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            {index === 0 ? (
              <AboutMeScreen onFolderDoubleClick={handleFolderDoubleClick} />
            ) : index === 1 ? (
              <MyWorkScreen onAllProjectsFolderDoubleClick={handleAllProjectsFolderDoubleClick} />
            ) : index === 2 ? (
              <MyNoteScreen />
            ) : (
              <PhotographyScreen />
            )}
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
          customFiles={fileManager.customFiles}
          onProjectDoubleClick={(project: any) => {
            setProjectDetailWindows(prev => {
              // 若已存在同 id 的弹窗，则聚焦（提升 zIndex）
              const exist = prev.find(w => w.id === project.id);
              if (exist) {
                const maxZ = Math.max(...prev.map(w => w.zIndex));
                return prev.map(w => w.id === project.id ? {...w, zIndex: maxZ + 1} : w);
              }
              const maxZ = prev.length > 0 ? Math.max(...prev.map(w => w.zIndex)) : 2000;
              return [...prev, {id: project.id, project, zIndex: maxZ + 1, windowOffset: {x: prev.length * 40, y: prev.length * 40}}];
            });
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
      
      {/* Project Detail Windows */}
      {projectDetailWindows.map((win, idx) => (
        <ProjectDetailWindow
          key={win.id}
          project={win.project}
          onClose={() => setProjectDetailWindows(prev => prev.filter(w => w.id !== win.id))}
          onFocus={() => setProjectDetailWindows(prev => {
            const maxZ = Math.max(...prev.map(w => w.zIndex));
            return prev.map(w => w.id === win.id ? {...w, zIndex: maxZ + 1} : w);
          })}
          windowOffset={win.windowOffset}
          zIndex={win.zIndex}
        />
      ))}
    </div>
  );
};

export default Screen; 