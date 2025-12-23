import React, { useRef, useState } from 'react';
import FileManager from '../windows/FileManager';
import EmailComposer from '../windows/EmailComposer';

import ProjectDetailWindow from '../windows/ProjectDetailWindow';
import { useResponsive } from '../../utils/responsive';

// 导入拆分后的屏幕组件
import HomeScreen from '../screens/HomeScreen';
import PhotographyScreen from '../screens/PhotographyScreen';

import { PhotoCategoryResponse, PhotoResponse } from '../../types/photography';

type PhotographyData = {
  categories: PhotoCategoryResponse[];
  categoryPhotos: { [key: number]: PhotoResponse[] };
  allCategoryPhotos: { [key: number]: PhotoResponse[] };
  isLoaded: boolean;
};

type Props = {
  currentScreen: number;
  onScreenChange: (screen: number) => void;
  onAnyFileManagerMaximizedChange?: (isMax: boolean) => void;
  triggerContactFolder?: number;
  photographyData: PhotographyData;
};

const Screen: React.FC<Props> = ({ currentScreen, onScreenChange, onAnyFileManagerMaximizedChange, triggerContactFolder, photographyData }) => {
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
    photoCategoryId?: number;
  }>>([]);
  const [openEmailComposers, setOpenEmailComposers] = useState<Array<{
    id: string;
    zIndex: number;
  }>>([]);

  const allProjects = [
    { 
      id: 'portfolio', 
      name: 'Portfolio', 
      date: '2025-06-09', 
      size: 'Personal', 
      kind: 'React, TypeScript', 
      desc: 'Personal Portfolio Website for showing my ideas and creations.',
      detailedDesc: 'A desktop-inspired personal portfolio website built with React and TypeScript, featuring a unique macOS-style interface with 3D elements, particle backgrounds, and responsive design. The site simulates an operating system experience with window management, file system navigation, and interactive components.',
      screenshot: '/img/projects/portfolio.png',
      techStack: ['React', 'TypeScript', 'Three.js', 'Tailwind CSS', 'GSAP', 'CRACO'],
      links: {
        website: 'https://www.kylemeng.com',
        github: 'https://github.com/DreamOne11/KyleMengPortfolio'
      }
    },
    { 
      id: 'suogogo', 
      name: 'Suogogo Platform', 
      date: '2025-07-01', 
      size: 'Team', 
      kind: 'React, TypeScript', 
      desc: 'Suogogo is a shipping platform for cross-board logistics.',
      detailedDesc: 'A comprehensive cross-border logistics platform that connects shippers and carriers globally. Features real-time tracking, automated pricing, route optimization, and multi-language support. Built with modern web technologies to handle high-volume international shipping operations.',
      screenshot: '/img/projects/suogogo.png',
      techStack: ['React', 'TypeScript', 'Tailwind CSS', 'Node.js', 'PostgreSQL', 'Redis'],
      links: {
        website: 'https://www.suogogo.com',
        github: null
      }
    },
    { 
      id: 'searchengine', 
      name: 'Campus Network Search Engine', 
      date: '2021-06-01', 
      size: 'Personal', 
      kind: 'Java, Hadoop', 
      desc: 'A distributed full-text search engine based on Java, supporting efficient web page crawling, indexing, and multi-condition retrieval.',
      detailedDesc: 'A distributed search engine designed for campus networks, featuring intelligent web crawling, inverted indexing, and advanced query processing. Implemented with Hadoop ecosystem for scalable data processing and HBase for efficient data storage. Supports Boolean queries, phrase matching, and relevance ranking.',
      screenshot: '/img/projects/searchEngine.png',
      techStack: ['Java', 'Hadoop', 'HBase', 'Selenium', 'Lucene', 'Spring Boot'],
      links: {
        website: null,
        github: 'https://github.com/DreamOne11/SearchEngine'
      }
    },
    {
      id: 'ithink',
      name: 'iThink Ideas Investment Platform',
      date: '2020-12-15',
      size: 'Team',
      kind: 'Java, Spring Boot',
      desc: 'A platform for idea investment and collaboration.',
      detailedDesc: 'A comprehensive idea investment and collaboration platform that connects innovators with investors. Features idea submission, evaluation workflows, funding mechanisms, and project management tools. Includes both web platform and WeChat Mini Program for mobile access.',
      screenshot: '/img/projects/iThink.png',
      techStack: ['Java', 'Spring Boot', 'MySQL', 'WeChat Mini Program', 'Vue.js', 'MyBatis'],
      links: {
        website: null,
        github: 'https://github.com/Chocolate-Prince-and-Six-Dwarfs/iThink/'
      }
    },
    {
      id: 'datapipeline',
      name: 'E-commerce Data Pipeline',
      date: '2024-03-15',
      size: 'Team',
      kind: 'Snowflake, Airflow, dbt',
      desc: 'A data pipeline for e-commerce data.',
      detailedDesc: 'A scalable data pipeline solution for processing and analyzing e-commerce data at scale. Features automated ETL workflows, data quality monitoring, and real-time analytics capabilities. Built with modern data engineering tools to handle millions of transactions and provide actionable insights.',
      screenshot: '/img/projects/dataPipeline.jpg',
      techStack: ['Snowflake', 'Airflow', 'dbt', 'Python', 'SQL'],
      links: {
        website: null,
        github: null
      }
    },
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

  // Auto-open/close Contact folder when triggered from onboarding
  React.useEffect(() => {
    if (triggerContactFolder === undefined) return;

    const folderId = 'contact';

    if (triggerContactFolder > 0) {
      // Open Contact folder
      const folderName = 'Contact';
      const isAlreadyOpen = openFileManagers.some(fm => fm.id === folderId);

      if (!isAlreadyOpen) {
        const maxZIndex = openFileManagers.length > 0 ? Math.max(...openFileManagers.map(fm => fm.zIndex)) : 1000;

        setOpenFileManagers(prev => [...prev, {
          id: folderId,
          folderName,
          sourcePosition: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
          zIndex: maxZIndex + 1,
          isMaximized: false
        }]);
      }
    } else if (triggerContactFolder < 0) {
      // Close Contact folder - always close regardless of current state
      setOpenFileManagers(prev => prev.filter(fm => fm.id !== folderId));
    }
  }, [triggerContactFolder, openFileManagers]);

  

  const screens = [
    { id: 0, title: 'Home', subtitle: 'About Me & My Work', emoji: '👋' },
    { id: 1, title: 'Photography', subtitle: 'Visual Stories', emoji: '📸' }
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

  // 处理照片分类文件夹双击事件 - 打开包含该分类所有照片的 FileManager
  const handlePhotoCategoryFolderDoubleClick = (
    categoryId: number,
    categoryName: string,
    photos: any[],
    e: React.MouseEvent
  ) => {
    e.stopPropagation();

    const folderId = `photo-category-${categoryId}`;
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
      folderName: categoryName,
      sourcePosition: { x: centerX, y: centerY },
      zIndex: maxZIndex + 1,
      isMaximized: false,
      customFiles: photos,
      photoCategoryId: categoryId
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
      {/* Sliding Screens Container */}
      <div 
        className={`flex w-full h-full transition-transform ${responsive.isMobile ? 'duration-300' : 'duration-500'} ease-in-out`}
        style={{ transform: `translateX(-${currentScreen * 100}%)` }}
      >
        {screens.map((screen, index) => (
          <div
            key={screen.id}
            className={`min-w-full h-full flex items-center justify-center ${responsive.isMobile ? 'p-0' : responsive.isTablet ? 'p-2' : 'p-8'} cursor-grab active:cursor-grabbing select-none touch-none overflow-hidden`}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
            onDoubleClick={(e) => e.preventDefault()}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            {/* 始终渲染所有屏幕，使用 CSS 控制显示/隐藏 */}
            <div className={index === 0 ? 'w-full h-full' : 'hidden'}>
              <HomeScreen
                onFolderDoubleClick={handleFolderDoubleClick}
                onAllProjectsFolderDoubleClick={handleAllProjectsFolderDoubleClick}
                onProjectDoubleClick={(projectId: string) => {
                  // 从 allProjects 中查找完整的项目信息
                  const project = allProjects.find(p => p.id === projectId);
                  if (!project) return;

                  setProjectDetailWindows(prev => {
                    // 若已存在同 id 的弹窗，则聚焦（提升 zIndex）
                    const exist = prev.find(w => w.id === projectId);
                    if (exist) {
                      const maxZ = Math.max(...prev.map(w => w.zIndex));
                      return prev.map(w => w.id === projectId ? {...w, zIndex: maxZ + 1} : w);
                    }
                    const maxZ = prev.length > 0 ? Math.max(...prev.map(w => w.zIndex)) : 2000;
                    return [...prev, {id: projectId, project, zIndex: maxZ + 1, windowOffset: {x: prev.length * 40, y: prev.length * 40}}];
                  });
                }}
              />
            </div>
            <div className={index === 1 ? 'w-full h-full' : 'hidden'}>
              <PhotographyScreen
                onPhotoCategoryFolderDoubleClick={handlePhotoCategoryFolderDoubleClick}
                photoCategories={photographyData.categories}
                categoryPhotos={photographyData.categoryPhotos}
                allCategoryPhotos={photographyData.allCategoryPhotos}
                isDataLoaded={photographyData.isLoaded}
              />
            </div>
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
          photoCategoryId={fileManager.photoCategoryId}
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