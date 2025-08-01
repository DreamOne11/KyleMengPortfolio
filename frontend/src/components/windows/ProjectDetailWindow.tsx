import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useResponsive, getResponsiveWindowSize } from '../../utils/responsive';

type Props = {
  project: {
    name: string;
    date?: string;
    kind?: string;
    desc?: string;
    detailedDesc?: string;
    screenshot?: string;
    techStack?: string[];
    links?: {
      website?: string | null;
      github?: string | null;
    };
  };
  onClose: () => void;
  onFocus?: () => void;
  windowOffset?: { x: number; y: number };
  zIndex?: number;
  onMaximizeChange?: (isMax: boolean) => void;
  isActive?: boolean;
};

const ProjectDetailWindow: React.FC<Props> = ({ project, onClose, onFocus, windowOffset, zIndex, onMaximizeChange, isActive = false }) => {
  const responsive = useResponsive();
  
  // Window size and position state - 使用响应式窗口大小
  const defaultWindowSize = getResponsiveWindowSize(700, 500);
  const [windowSize, setWindowSize] = useState(defaultWindowSize);
  const [windowPosition, setWindowPosition] = useState({ 
    x: (windowOffset?.x || 0), 
    y: (windowOffset?.y || 0) 
  });

  // Button hover states
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  // Animation states
  const [isAnimated, setIsAnimated] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isDraggingState, setIsDraggingState] = useState(false);
  const [isResizingState, setIsResizingState] = useState(false);

  const windowRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);
  const isDragging = useRef(false);
  const resizeDirection = useRef('');
  const startMouse = useRef({ x: 0, y: 0 });
  const startSize = useRef({ width: 0, height: 0 });
  const startPosition = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number | null>(null);
  const lastMoveTime = useRef<number>(0);
  
  // 触摸事件相关引用
  const lastTapTimeRef = useRef<number>(0);
  const tapPositionRef = useRef<{x: number, y: number}>({x: 0, y: 0});
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 移动设备交互模式判断
  const isMobileDevice = responsive.isMobile;

  // 最大化相关状态
  const [isMaximized, setIsMaximized] = useState(false);
  const [preMaximizeState, setPreMaximizeState] = useState<{
    size: { width: number; height: number };
    position: { x: number; y: number };
  } | null>(null);

  // 关闭动画处理
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  // 最大化/恢复窗口
  const handleMaximize = React.useCallback(() => {
    if (isMaximized) {
      if (preMaximizeState) {
        setWindowSize(preMaximizeState.size);
        setWindowPosition(preMaximizeState.position);
        setPreMaximizeState(null);
        setIsMaximized(false);
        onMaximizeChange?.(false); // 通知还原
      }
    } else {
      setPreMaximizeState({
        size: { ...windowSize },
        position: { ...windowPosition }
      });
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      setWindowPosition({ x: 0, y: 0 });
      setIsMaximized(true);
      onMaximizeChange?.(true); // 通知最大化
    }
    onFocus?.();
  }, [isMaximized, preMaximizeState, windowSize, windowPosition, onMaximizeChange, onFocus]);

  // 在移动设备上自动最大化窗口
  useEffect(() => {
    if (isMobileDevice && !isMaximized) {
      handleMaximize();
    }
  }, [isMobileDevice, isMaximized, handleMaximize]);

  // 打开动画
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimated(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // 触摸事件处理 - 窗口拖动
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isMaximized || isMobileDevice) return;
    
    onFocus?.();
    const touch = e.touches[0];
    startMouse.current = { x: touch.clientX, y: touch.clientY };
    startPosition.current = { ...windowPosition };
    tapPositionRef.current = { x: touch.clientX, y: touch.clientY };
    
    // 记录触摸开始时间，用于双击检测
    const now = Date.now();
    if (now - lastTapTimeRef.current < 300) {
      // 检测到双击，执行最大化/还原操作
      handleMaximize();
      lastTapTimeRef.current = 0;
    } else {
      lastTapTimeRef.current = now;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isMaximized || isMobileDevice) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - startMouse.current.x;
    const deltaY = touch.clientY - startMouse.current.y;
    
    // 如果移动距离超过阈值，则认为是拖动而不是点击
    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      const newX = startPosition.current.x + deltaX;
      const newY = startPosition.current.y + deltaY;
      setWindowPosition({ x: newX, y: newY });
      setIsDraggingState(true);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isMaximized || isMobileDevice) return;
    
    setIsDraggingState(false);
  };

  // Drag handling
  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFocus?.();
    
    // 如果窗口是最大化状态或在移动设备上，禁用拖拽功能
    if (isMaximized || isMobileDevice) {
      return;
    }
    
    startMouse.current = { x: e.clientX, y: e.clientY };
    startPosition.current = { ...windowPosition };
    isDragging.current = true;
    document.body.style.cursor = 'move';
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    setIsDraggingState(true);
  };

  // Resize handling
  const handleResizeStart = (direction: string, e: React.MouseEvent) => {
    // 最大化时或在移动设备上禁用调整大小
    if (isMaximized || isMobileDevice) return;
    
    e.preventDefault();
    e.stopPropagation();
    onFocus?.();
    isResizing.current = true;
    setIsResizingState(true);
    resizeDirection.current = direction;
    startMouse.current = { x: e.clientX, y: e.clientY };
    startSize.current = { ...windowSize };
    startPosition.current = { ...windowPosition };
    document.body.style.cursor = getCursorStyle(direction);
    document.body.style.userSelect = 'none';
  };

  const getCursorStyle = (direction: string) => {
    switch (direction) {
      case 'top':
      case 'bottom':
        return 'ns-resize';
      case 'left':
      case 'right':
        return 'ew-resize';
      case 'top-left':
      case 'bottom-right':
        return 'nw-resize';
      case 'top-right':
      case 'bottom-left':
        return 'ne-resize';
      default:
        return 'default';
    }
  };

  // 优化拖拽处理 - 添加节流和useCallback包装
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const now = Date.now();
    if (now - lastMoveTime.current < 16) {
      return;
    }
    lastMoveTime.current = now;
    if (isDragging.current) {
      const deltaX = e.clientX - startMouse.current.x;
      const deltaY = e.clientY - startMouse.current.y;
      const newX = startPosition.current.x + deltaX;
      const newY = startPosition.current.y + deltaY;
      setWindowPosition({ x: newX, y: newY });
    } else if (isResizing.current) {
      const deltaX = e.clientX - startMouse.current.x;
      const deltaY = e.clientY - startMouse.current.y;
      let newWidth = startSize.current.width;
      let newHeight = startSize.current.height;
      let newX = startPosition.current.x;
      let newY = startPosition.current.y;
      const direction = resizeDirection.current;
      const fixedRight = startPosition.current.x + startSize.current.width;
      const fixedBottom = startPosition.current.y + startSize.current.height;
      switch (direction) {
        case 'right':
          newWidth = Math.max(responsive.isMobile ? 300 : 500, startSize.current.width + deltaX);
          break;
        case 'left':
          newWidth = Math.max(responsive.isMobile ? 300 : 500, startSize.current.width - deltaX);
          newX = fixedRight - newWidth;
          break;
        case 'bottom':
          newHeight = Math.max(responsive.isMobile ? 200 : 300, startSize.current.height + deltaY);
          break;
        case 'top':
          newHeight = Math.max(responsive.isMobile ? 200 : 300, startSize.current.height - deltaY);
          newY = fixedBottom - newHeight;
          break;
        case 'top-left':
          newWidth = Math.max(responsive.isMobile ? 300 : 500, startSize.current.width - deltaX);
          newHeight = Math.max(responsive.isMobile ? 200 : 300, startSize.current.height - deltaY);
          newX = fixedRight - newWidth;
          newY = fixedBottom - newHeight;
          break;
        case 'top-right':
          newWidth = Math.max(responsive.isMobile ? 300 : 500, startSize.current.width + deltaX);
          newHeight = Math.max(responsive.isMobile ? 200 : 300, startSize.current.height - deltaY);
          newY = fixedBottom - newHeight;
          break;
        case 'bottom-left':
          newWidth = Math.max(responsive.isMobile ? 300 : 500, startSize.current.width - deltaX);
          newHeight = Math.max(responsive.isMobile ? 200 : 300, startSize.current.height + deltaY);
          newX = fixedRight - newWidth;
          break;
        case 'bottom-right':
          newWidth = Math.max(responsive.isMobile ? 300 : 500, startSize.current.width + deltaX);
          newHeight = Math.max(responsive.isMobile ? 200 : 300, startSize.current.height + deltaY);
          break;
      }
      setWindowSize({ width: newWidth, height: newHeight });
      setWindowPosition({ x: newX, y: newY });
    }
  }, [responsive]);

  // 优化的鼠标抬起处理函数
  const handleMouseUp = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (isDragging.current || isResizing.current) {
      isDragging.current = false;
      isResizing.current = false;
      setIsDraggingState(false);
      setIsResizingState(false);
      resizeDirection.current = '';
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    const timeoutId = tapTimeoutRef.current;
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [handleMouseMove, handleMouseUp]);

  // 处理窗口点击获得焦点
  const handleWindowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFocus?.();
  };

  return (
    <div 
      ref={windowRef}
      onClick={handleWindowClick}
      className={`fixed bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col border border-gray-200 ${
        !isDraggingState && !isResizingState ? (
          isClosing 
            ? 'transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]'
            : 'transition-all duration-500 ease-[cubic-bezier(0.175,0.885,0.32,1.2)]'
        ) : ''
      } ${isMaximized ? 'rounded-none' : ''}`}
      style={{
        width: isMaximized ? '100%' : windowSize.width, 
        height: isMaximized ? '100%' : windowSize.height,
        left: isMaximized ? 0 : `calc(50% + ${windowPosition.x}px)`,
        top: isMaximized ? 0 : `calc(50% + ${windowPosition.y}px)`,
        transform: isMaximized 
          ? 'none'
          : isClosing
            ? 'translate(-50%, -50%) scale(0.95)'
            : isAnimated
              ? 'translate(-50%, -50%) scale(1)'
              : 'translate(-50%, -50%) scale(0.95)',
        opacity: isClosing ? 0.1 : isAnimated ? 1 : 0.1,
        minWidth: responsive.isMobile ? 300 : 400,
        minHeight: responsive.isMobile ? 200 : 300,
        transformOrigin: 'center center',
        willChange: 'transform, opacity',
        zIndex: isMaximized 
          ? (isActive ? 2000 : 1900)
          : (isActive ? 2000 : 1900),
      }}
    >
      {/* Resize handles - 最大化时或移动设备上隐藏 */}
      {!isMaximized && !isMobileDevice && (
        <>
          {/* Top edge */}
          <div className="absolute top-0 left-2 right-2 h-2 cursor-ns-resize hover:bg-blue-200/30 z-10"
            onMouseDown={(e) => handleResizeStart('top', e)}
          />
          {/* Bottom edge */}
          <div className="absolute bottom-0 left-2 right-2 h-2 cursor-ns-resize hover:bg-blue-200/30 z-10"
            onMouseDown={(e) => handleResizeStart('bottom', e)}
          />
          {/* Left edge */}
          <div className="absolute top-2 bottom-2 left-0 w-2 cursor-ew-resize hover:bg-blue-200/30 z-10"
            onMouseDown={(e) => handleResizeStart('left', e)}
          />
          {/* Right edge */}
          <div className="absolute top-2 bottom-2 right-0 w-2 cursor-ew-resize hover:bg-blue-200/30 z-10"
            onMouseDown={(e) => handleResizeStart('right', e)}
          />
          {/* Corner handles */}
          <div className="absolute top-0 left-0 w-4 h-4 cursor-nw-resize hover:bg-blue-200/50 z-20"
            onMouseDown={(e) => handleResizeStart('top-left', e)}
          />
          <div className="absolute top-0 right-0 w-4 h-4 cursor-ne-resize hover:bg-blue-200/50 z-20"
            onMouseDown={(e) => handleResizeStart('top-right', e)}
          />
          <div className="absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize hover:bg-blue-200/50 z-20"
            onMouseDown={(e) => handleResizeStart('bottom-left', e)}
          />
          <div className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize hover:bg-blue-200/50 z-20"
            onMouseDown={(e) => handleResizeStart('bottom-right', e)}
          />
        </>
      )}
      {/* Title Bar - Draggable Area */}
      <div 
        className={`h-10 md:h-12 bg-gray-100 border-b border-gray-300 flex items-center px-2 md:px-4 ${!isMaximized && !isMobileDevice ? 'cursor-move' : ''}`}
        onMouseDown={!isMaximized && !isMobileDevice ? handleDragStart : undefined}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex items-center gap-1 md:gap-2">
          {/* Traffic Light Buttons */}
          <button 
            onClick={handleClose}
            className="w-2.5 h-2.5 md:w-3 md:h-3 bg-red-500 rounded-full hover:bg-red-600 transition-colors cursor-pointer relative flex items-center justify-center"
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onMouseEnter={() => setHoveredButton('close')}
            onMouseLeave={() => setHoveredButton(null)}
          >
            {hoveredButton === 'close' && (
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none" className="absolute">
                <path d="M1 1L7 7M7 1L1 7" stroke="black" strokeWidth="1" strokeLinecap="round"/>
              </svg>
            )}
          </button>
          {!isMobileDevice && (
            <>
              <button 
                className="w-2.5 h-2.5 md:w-3 md:h-3 bg-yellow-500 rounded-full hover:bg-yellow-600 transition-colors cursor-pointer relative flex items-center justify-center"
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onMouseEnter={() => setHoveredButton('minimize')}
                onMouseLeave={() => setHoveredButton(null)}
              >
                {hoveredButton === 'minimize' && (
                  <svg width="6" height="6" viewBox="0 0 6 6" fill="none" className="absolute">
                    <path d="M1 3H5" stroke="black" strokeWidth="1" strokeLinecap="round"/>
                  </svg>
                )}
              </button>
              <button 
                onClick={handleMaximize}
                className="w-2.5 h-2.5 md:w-3 md:h-3 bg-green-500 rounded-full hover:bg-green-600 transition-colors cursor-pointer relative flex items-center justify-center"
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onMouseEnter={() => setHoveredButton('maximize')}
                onMouseLeave={() => setHoveredButton(null)}
              >
                {hoveredButton === 'maximize' && (
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none" className="absolute">
                    {isMaximized ? (
                      // 恢复图标：两个矩形
                      <g>
                        {/* 后面的矩形 */}
                        <rect x="1" y="1" width="6" height="6" fill="none" stroke="black" strokeWidth="1"/>
                      </g>
                    ) : (
                      // 最大化图标：加号
                      <path d="M4 1V7M1 4H7" stroke="black" strokeWidth="1" strokeLinecap="round"/>
                    )}
                  </svg>
                )}
              </button>
            </>
          )}
        </div>
        <span className="ml-2 md:ml-4 font-semibold text-gray-800 text-base md:text-lg truncate">{project.name}</span>
      </div>
      {/* 内容区 */}
      <div className="flex-1 p-3 md:p-6 overflow-auto">
        {/* 项目基本信息 */}
        <div className="mb-3 md:mb-4">
          <div className="mb-1 md:mb-2 text-xs md:text-sm text-gray-500 flex flex-wrap gap-1">
            <span>{project.date}</span>
            <span className="hidden xs:inline">&nbsp;|&nbsp;</span>
            <span>{project.kind}</span>
          </div>
          <div className="mb-3 md:mb-4 text-sm md:text-base text-gray-700 leading-relaxed">
            {project.detailedDesc || project.desc || 'No description yet.'}
          </div>
        </div>

        {/* 项目截图 */}
        {project.screenshot && (
          <div className="mb-4 md:mb-6">
            <h3 className="text-sm md:text-base font-semibold text-gray-800 mb-2">Project Screenshot</h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
              <img 
                src={project.screenshot} 
                alt={`${project.name} screenshot`}
                className="w-full h-auto object-cover"
                style={{ maxHeight: responsive.isMobile ? '200px' : '300px' }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = '<div class="flex items-center justify-center h-32 text-gray-400 text-sm">Screenshot not available</div>';
                  }
                }}
              />
            </div>
          </div>
        )}

        {/* 技术栈标签 */}
        {project.techStack && project.techStack.length > 0 && (
          <div className="mb-4 md:mb-6">
            <h3 className="text-sm md:text-base font-semibold text-gray-800 mb-2">Tech Stack</h3>
            <div className="flex flex-wrap gap-1.5 md:gap-2">
              {project.techStack.map((tech, idx) => (
                <span 
                  key={idx} 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-medium px-2.5 py-1 md:px-3 md:py-1.5 rounded-full shadow-sm hover:shadow-md transition-shadow"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 项目链接 */}
        {project.links && (project.links.website || project.links.github) && (
          <div className="mb-4 md:mb-6">
            <h3 className="text-sm md:text-base font-semibold text-gray-800 mb-2">Links</h3>
            <div className="flex flex-wrap gap-2 md:gap-3">
              {project.links.website && (
                <a 
                  href={project.links.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-colors shadow-sm hover:shadow-md"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
                  </svg>
                  Visit Website
                </a>
              )}
              {project.links.github && (
                <a 
                  href={project.links.github} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-colors shadow-sm hover:shadow-md"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.344-3.369-1.344-.454-1.157-1.11-1.465-1.11-1.465-.908-.62.069-.608.069-.608 1.003.07 1.531 1.034 1.531 1.034.892 1.532 2.341 1.09 2.91.834.092-.648.35-1.09.636-1.34-2.22-.254-4.555-1.113-4.555-4.951 0-1.093.39-1.986 1.029-2.685-.103-.254-.446-1.272.098-2.651 0 0 .84-.27 2.75 1.027A9.564 9.564 0 0112 6.844c.85.004 1.705.116 2.504.34 1.909-1.297 2.747-1.027 2.747-1.027.546 1.38.203 2.397.1 2.651.64.7 1.028 1.592 1.028 2.685 0 3.847-2.339 4.695-4.566 4.945.359.31.678.922.678 1.857 0 1.34-.012 2.422-.012 2.75 0 .267.18.577.688.48C19.137 20.203 22 16.448 22 12.021 22 6.484 17.523 2 12 2Z" fill="currentColor"/>
                  </svg>
                  View on GitHub
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetailWindow; 