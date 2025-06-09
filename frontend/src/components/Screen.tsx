import React, { useRef, useState } from 'react';
import FileManager from './FileManager';
import EmailComposer from './EmailComposer';
import MacOSFolderIcon from './MacOSFolderIcon';
import KyleChat from './KyleChat';
import KeyboardLogoStacked from './KeyboardLogoStacked';
import ProjectDetailWindow from './ProjectDetailWindow';

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
    customFiles?: any[];
  }>>([]);
  const [openEmailComposers, setOpenEmailComposers] = useState<Array<{
    id: string;
    zIndex: number;
  }>>([]);

  // 1. 在 Screen 组件顶部添加 project 数据和弹窗状态
  const allProjects = [
    { id: 'portfolio', name: 'Portfolio', date: '2024-06-09', kind: 'Web', desc: 'Personal Portfolio Website for showing my ideas and creations.' },
    { id: 'searchengine', name: 'Compus Network Search Engine', date: '2024-05-01', kind: 'Java', desc: '基于Java的分布式全文搜索引擎，支持高效网页抓取、索引与多条件检索。' },
    { id: 'ithink', name: 'iThink Ideas Investment Platform', date: '2023-12-15', kind: 'Java', desc: '基于Java的思维导图与团队协作平台，支持多人实时编辑、任务分配与进度追踪。' },
    { id: 'blank1', name: 'Blank Project 1', date: '', kind: '', desc: '' },
    { id: 'blank2', name: 'Blank Project 2', date: '', kind: '', desc: '' },
  ];
  const [projectDetailModal, setProjectDetailModal] = useState<{ open: boolean, project: any } | null>(null);

  // 在 Screen 组件顶部添加 projectDetailWindows 状态
  const [projectDetailWindows, setProjectDetailWindows] = useState<Array<{id: string, project: any, zIndex: number, windowOffset: {x: number, y: number}}>>([]);

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
      if (folderId === 'all-projects') {
        // 弹出 FileManager，内容为 allProjects
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
        return;
      }
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
        <div className="absolute right-[-395px] top-[260px] w-[900px] h-[440px]">
          <KeyboardLogoStacked />
        </div>
      </div>
    );
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

  // Screen Content Components
  const MyWorkContent = () => {
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
      if (folderId === 'all-projects') {
        // 弹出 FileManager，内容为 allProjects
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
        return;
      }
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
        {/* All projects folder */}
        <div
            className={`flex flex-col items-center cursor-pointer group transition-all duration-200 rounded-lg p-1 absolute left-8`}
            style={{ top: '15.5rem' }}
            onClick={() => setSelectedFolder('all-projects')}
            onDoubleClick={handleAllProjectsFolderDoubleClick}
          >
            <div className={`w-16 h-16 flex items-center justify-center group-hover:scale-110 transition-all duration-200 rounded-lg hover:bg-white/10 mb-1 ${selectedFolder === 'all-projects' ? 'bg-white/10' : ''}`}>
              <MacOSFolderIcon color="orange" />
            </div>
            <h3 className={`font-semibold text-xs px-2 py-1 rounded ${selectedFolder === 'all-projects' ? 'text-white bg-blue-500' : 'text-white'}`}>All projects</h3>
          </div>
        <div className="absolute left-8 flex gap-8" style={{ top: '22rem' }}>
          {/* Project folders will be added here */}
          {/* Project Showcase 1 */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl p-6 w-[370px] flex flex-col gap-4 relative group transition-transform hover:scale-105 card font-sans" style={{fontFamily: "Inter, Poppins, Manrope, sans-serif"}}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-lg font-bold title transition-colors duration-200" style={{color:'#1A1A1A', fontWeight:700, textShadow:'0 1px 2px rgba(0,0,0,0.15)'}}>Portfolio</span>
              <a href="https://github.com/DreamOne11/KyleMengPortfolio" target="_blank" rel="noopener noreferrer" className="ml-auto">
                {/* GitHub Icon */}
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path fill="#1A1A1A" d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.344-3.369-1.344-.454-1.157-1.11-1.465-1.11-1.465-.908-.62.069-.608.069-.608 1.003.07 1.531 1.034 1.531 1.034.892 1.532 2.341 1.09 2.91.834.092-.648.35-1.09.636-1.34-2.22-.254-4.555-1.113-4.555-4.951 0-1.093.39-1.986 1.029-2.685-.103-.254-.446-1.272.098-2.651 0 0 .84-.27 2.75 1.027A9.564 9.564 0 0112 6.844c.85.004 1.705.116 2.504.34 1.909-1.297 2.747-1.027 2.747-1.027.546 1.38.203 2.397.1 2.651.64.7 1.028 1.592 1.028 2.685 0 3.847-2.339 4.695-4.566 4.945.359.31.678.922.678 1.857 0 1.34-.012 2.422-.012 2.75 0 .267.18.577.688.48C19.137 20.203 22 16.448 22 12.021 22 6.484 17.523 2 12 2Z"/></svg>
              </a>
            </div>
            <div className="description text-sm mb-2" style={{color:'#333'}}>Personal Portfolio Website for showing my ideas and creations.</div>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="label text-xs font-semibold px-2 py-1" style={{color:'#1A1A1A',background:'rgba(255,255,255,0.1)',borderRadius:'6px',textShadow:'0 1px 4px rgba(0,0,0,0.18)'}}>React</span>
              <span className="label text-xs font-semibold px-2 py-1" style={{color:'#1A1A1A',background:'rgba(255,255,255,0.1)',borderRadius:'6px',textShadow:'0 1px 4px rgba(0,0,0,0.18)'}}>TypeScript</span>
              <span className="label text-xs font-semibold px-2 py-1" style={{color:'#1A1A1A',background:'rgba(255,255,255,0.1)',borderRadius:'6px',textShadow:'0 1px 4px rgba(0,0,0,0.18)'}}>TailwindCSS</span>
              <span className="label text-xs font-semibold px-2 py-1" style={{color:'#1A1A1A',background:'rgba(255,255,255,0.1)',borderRadius:'6px',textShadow:'0 1px 4px rgba(0,0,0,0.18)'}}>Three.js</span>
              <span className="label text-xs font-semibold px-2 py-1" style={{color:'#1A1A1A',background:'rgba(255,255,255,0.1)',borderRadius:'6px',textShadow:'0 1px 4px rgba(0,0,0,0.18)'}}>SpringBoot</span>
            </div>
          </div>
          {/* Project Showcase 2 */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl p-6 w-[370px] flex flex-col gap-4 relative group transition-transform hover:scale-105 card font-sans" style={{fontFamily: "Inter, Poppins, Manrope, sans-serif"}}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-lg font-bold title transition-colors duration-200" style={{color:'#1A1A1A', fontWeight:700, textShadow:'0 1px 2px rgba(0,0,0,0.15)'}}>Compus Network Search Engine</span>
              <a href="https://github.com/DreamOne11/SearchEngine" target="_blank" rel="noopener noreferrer" className="ml-auto">
                {/* GitHub Icon */}
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path fill="#1A1A1A" d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.344-3.369-1.344-.454-1.157-1.11-1.465-1.11-1.465-.908-.62.069-.608.069-.608 1.003.07 1.531 1.034 1.531 1.034.892 1.532 2.341 1.09 2.91.834.092-.648.35-1.09.636-1.34-2.22-.254-4.555-1.113-4.555-4.951 0-1.093.39-1.986 1.029-2.685-.103-.254-.446-1.272.098-2.651 0 0 .84-.27 2.75 1.027A9.564 9.564 0 0112 6.844c.85.004 1.705.116 2.504.34 1.909-1.297 2.747-1.027 2.747-1.027.546 1.38.203 2.397.1 2.651.64.7 1.028 1.592 1.028 2.685 0 3.847-2.339 4.695-4.566 4.945.359.31.678.922.678 1.857 0 1.34-.012 2.422-.012 2.75 0 .267.18.577.688.48C19.137 20.203 22 16.448 22 12.021 22 6.484 17.523 2 12 2Z"/></svg>
              </a>
            </div>
            <div className="description text-sm mb-2" style={{color:'#333'}}>基于Java的分布式全文搜索引擎，支持高效网页抓取、索引与多条件检索。</div>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="label text-xs font-semibold px-2 py-1" style={{color:'#1A1A1A',background:'rgba(255,255,255,0.1)',borderRadius:'6px',textShadow:'0 1px 4px rgba(0,0,0,0.18)'}}>Java</span>
              <span className="label text-xs font-semibold px-2 py-1" style={{color:'#1A1A1A',background:'rgba(255,255,255,0.1)',borderRadius:'6px',textShadow:'0 1px 4px rgba(0,0,0,0.18)'}}>Python</span>
              <span className="label text-xs font-semibold px-2 py-1" style={{color:'#1A1A1A',background:'rgba(255,255,255,0.1)',borderRadius:'6px',textShadow:'0 1px 4px rgba(0,0,0,0.18)'}}>CSS</span>
              <span className="label text-xs font-semibold px-2 py-1" style={{color:'#1A1A1A',background:'rgba(255,255,255,0.1)',borderRadius:'6px',textShadow:'0 1px 4px rgba(0,0,0,0.18)'}}>分布式</span>
            </div>
          </div>
          {/* Project Showcase 3 */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl p-6 w-[370px] flex flex-col gap-4 relative group transition-transform hover:scale-105 card font-sans" style={{fontFamily: "Inter, Poppins, Manrope, sans-serif"}}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-lg font-bold title transition-colors duration-200" style={{color:'#1A1A1A', fontWeight:700, textShadow:'0 1px 2px rgba(0,0,0,0.15)'}}>iThink Platform</span>
              <a href="https://github.com/Chocolate-Prince-and-Six-Dwarfs/iThink/" target="_blank" rel="noopener noreferrer" className="ml-auto">
                {/* GitHub Icon */}
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path fill="#1A1A1A" d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.344-3.369-1.344-.454-1.157-1.11-1.465-1.11-1.465-.908-.62.069-.608.069-.608 1.003.07 1.531 1.034 1.531 1.034.892 1.532 2.341 1.09 2.91.834.092-.648.35-1.09.636-1.34-2.22-.254-4.555-1.113-4.555-4.951 0-1.093.39-1.986 1.029-2.685-.103-.254-.446-1.272.098-2.651 0 0 .84-.27 2.75 1.027A9.564 9.564 0 0112 6.844c.85.004 1.705.116 2.504.34 1.909-1.297 2.747-1.027 2.747-1.027.546 1.38.203 2.397.1 2.651.64.7 1.028 1.592 1.028 2.685 0 3.847-2.339 4.695-4.566 4.945.359.31.678.922.678 1.857 0 1.34-.012 2.422-.012 2.75 0 .267.18.577.688.48C19.137 20.203 22 16.448 22 12.021 22 6.484 17.523 2 12 2Z"/></svg>
              </a>
            </div>
            <div className="description text-sm mb-2" style={{color:'#333'}}>基于Java的思维导图与团队协作平台，支持多人实时编辑、任务分配与进度追踪。</div>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="label text-xs font-semibold px-2 py-1" style={{color:'#1A1A1A',background:'rgba(255,255,255,0.1)',borderRadius:'6px',textShadow:'0 1px 4px rgba(0,0,0,0.18)'}}>Java</span>
              <span className="label text-xs font-semibold px-2 py-1" style={{color:'#1A1A1A',background:'rgba(255,255,255,0.1)',borderRadius:'6px',textShadow:'0 1px 4px rgba(0,0,0,0.18)'}}>JavaScript</span>
              <span className="label text-xs font-semibold px-2 py-1" style={{color:'#1A1A1A',background:'rgba(255,255,255,0.1)',borderRadius:'6px',textShadow:'0 1px 4px rgba(0,0,0,0.18)'}}>CSS</span>
              <span className="label text-xs font-semibold px-2 py-1" style={{color:'#1A1A1A',background:'rgba(255,255,255,0.1)',borderRadius:'6px',textShadow:'0 1px 4px rgba(0,0,0,0.18)'}}>团队协作</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

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

  // 3. 新增 ProjectDetailModal 组件（仿照 EmailComposer，内容可用占位符）
  const ProjectDetailModal = ({ open, project, onClose }: any) => {
    if (!open) return null;
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30">
        <div className="bg-white rounded-2xl shadow-2xl p-8 min-w-[400px] max-w-[90vw] relative" style={{fontFamily: 'Inter, Poppins, Manrope, sans-serif'}}>
          <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700" onClick={onClose}>&times;</button>
          <h2 className="text-2xl font-bold mb-2" style={{color:'#1A1A1A'}}>{project?.name}</h2>
          <div className="mb-2 text-sm text-gray-500">{project?.date} &nbsp;|&nbsp; {project?.kind}</div>
          <div className="mb-4 text-base text-gray-700">{project?.desc || 'No description yet.'}</div>
          {/* 可扩展更多详细内容 */}
        </div>
      </div>
    );
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