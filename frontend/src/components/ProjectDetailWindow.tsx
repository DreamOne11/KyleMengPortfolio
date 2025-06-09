import React, { useState, useRef, useEffect, useCallback } from 'react';

type Props = {
  project: {
    name: string;
    date?: string;
    kind?: string;
    desc?: string;
    techStack?: string[];
  };
  onClose: () => void;
  onFocus?: () => void;
  windowOffset?: { x: number; y: number };
  zIndex?: number;
  onMaximizeChange?: (isMax: boolean) => void;
  isActive?: boolean;
};

const ProjectDetailWindow: React.FC<Props> = ({ project, onClose, onFocus, windowOffset, zIndex, onMaximizeChange, isActive = false }) => {
  // Window size and position state
  const [windowSize, setWindowSize] = useState({ width: 700, height: 500 });
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

  // 最大化相关状态
  const [isMaximized, setIsMaximized] = useState(false);
  const [preMaximizeState, setPreMaximizeState] = useState<{
    size: { width: number; height: number };
    position: { x: number; y: number };
  } | null>(null);

  // 打开动画
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimated(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // 关闭动画处理
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  // 最大化/恢复窗口
  const handleMaximize = () => {
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
  };

  // Drag handling
  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFocus?.();
    
    // 如果窗口是最大化状态，禁用拖拽功能
    if (isMaximized) {
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
    // 最大化时禁用调整大小
    if (isMaximized) return;
    
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
      const fixedLeft = startPosition.current.x;
      const fixedRight = startPosition.current.x + startSize.current.width;
      const fixedTop = startPosition.current.y;
      const fixedBottom = startPosition.current.y + startSize.current.height;
      switch (direction) {
        case 'right':
          newWidth = Math.max(500, startSize.current.width + deltaX);
          break;
        case 'left':
          newWidth = Math.max(500, startSize.current.width - deltaX);
          newX = fixedRight - newWidth;
          break;
        case 'bottom':
          newHeight = Math.max(300, startSize.current.height + deltaY);
          break;
        case 'top':
          newHeight = Math.max(300, startSize.current.height - deltaY);
          newY = fixedBottom - newHeight;
          break;
        case 'top-left':
          newWidth = Math.max(500, startSize.current.width - deltaX);
          newHeight = Math.max(300, startSize.current.height - deltaY);
          newX = fixedRight - newWidth;
          newY = fixedBottom - newHeight;
          break;
        case 'top-right':
          newWidth = Math.max(500, startSize.current.width + deltaX);
          newHeight = Math.max(300, startSize.current.height - deltaY);
          newY = fixedBottom - newHeight;
          break;
        case 'bottom-left':
          newWidth = Math.max(500, startSize.current.width - deltaX);
          newHeight = Math.max(300, startSize.current.height + deltaY);
          newX = fixedRight - newWidth;
          break;
        case 'bottom-right':
          newWidth = Math.max(500, startSize.current.width + deltaX);
          newHeight = Math.max(300, startSize.current.height + deltaY);
          break;
      }
      setWindowSize({ width: newWidth, height: newHeight });
      setWindowPosition({ x: newX, y: newY });
    }
  }, []);

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
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
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
        minWidth: 400,
        minHeight: 300,
        transformOrigin: 'center center',
        willChange: 'transform, opacity',
        zIndex: isMaximized 
          ? (isActive ? 2000 : 1900)
          : (isActive ? 2000 : 1900),
      }}
    >
      {/* Resize handles - 最大化时隐藏 */}
      {!isMaximized && (
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
        className="h-12 bg-gray-100 border-b border-gray-300 flex items-center px-4 cursor-move"
        onMouseDown={handleDragStart}
      >
        <div className="flex items-center gap-2">
          {/* Traffic Light Buttons */}
          <button 
            onClick={handleClose}
            className="w-3 h-3 bg-red-500 rounded-full hover:bg-red-600 transition-colors cursor-pointer relative flex items-center justify-center"
            onMouseDown={(e) => e.stopPropagation()}
            onMouseEnter={() => setHoveredButton('close')}
            onMouseLeave={() => setHoveredButton(null)}
          >
            {hoveredButton === 'close' && (
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none" className="absolute">
                <path d="M1 1L7 7M7 1L1 7" stroke="black" strokeWidth="1" strokeLinecap="round"/>
              </svg>
            )}
          </button>
          <button 
            className="w-3 h-3 bg-yellow-500 rounded-full hover:bg-yellow-600 transition-colors cursor-pointer relative flex items-center justify-center"
            onMouseDown={(e) => e.stopPropagation()}
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
            className="w-3 h-3 bg-green-500 rounded-full hover:bg-green-600 transition-colors cursor-pointer relative flex items-center justify-center"
            onMouseDown={(e) => e.stopPropagation()}
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
        </div>
        <span className="ml-4 font-semibold text-gray-800 text-lg">{project.name}</span>
      </div>
      {/* 内容区 */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="mb-2 text-sm text-gray-500">{project.date} &nbsp;|&nbsp; {project.kind}</div>
        <div className="mb-4 text-base text-gray-700">{project.desc || 'No description yet.'}</div>
        {project.techStack && project.techStack.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {project.techStack.map((tech, idx) => (
              <span key={idx} className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded">{tech}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetailWindow; 