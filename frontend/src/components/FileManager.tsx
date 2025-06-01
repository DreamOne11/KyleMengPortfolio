import React, { useState, useRef, useEffect, useCallback } from 'react';
import MacOSFolderIcon from './MacOSFolderIcon';

type FileItem = {
  id: string;
  name: string;
  type: 'folder' | 'file';
  dateModified: string;
  size: string;
  kind: string;
};

type Props = {
  folderName: string;
  onClose: () => void;
  onBack?: () => void;
  sourcePosition?: { x: number; y: number }; // 文件夹的位置信息，用于动画起始点
  useRelativePositioning?: boolean; // 新增：是否使用相对定位
};

const FileManager: React.FC<Props> = ({ folderName, onClose, onBack, sourcePosition, useRelativePositioning }) => {
  const [files] = useState<FileItem[]>([
    {
      id: '1',
      name: 'Resume.pdf',
      type: 'file',
      dateModified: 'May 30, 2024 at 11:13 PM',
      size: '2.1 MB',
      kind: 'Portable Document Format (PDF)'
    },
    {
      id: '2',
      name: 'Cover Letter.docx',
      type: 'file',
      dateModified: 'May 28, 2024 at 3:45 PM',
      size: '45 KB',
      kind: 'Microsoft Word Document'
    },
    {
      id: '3',
      name: 'Projects',
      type: 'folder',
      dateModified: 'May 25, 2024 at 9:20 AM',
      size: '--',
      kind: 'Folder'
    }
  ]);

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  
  // Window size and position state
  const [windowSize, setWindowSize] = useState({ width: 800, height: 600 });
  const [windowPosition, setWindowPosition] = useState({ x: 0, y: 0 });
  
  // Button hover states
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  
  // Animation states
  const [isAnimated, setIsAnimated] = useState(false); // 改为动画完成状态
  const [isClosing, setIsClosing] = useState(false);
  const [animationStartPosition, setAnimationStartPosition] = useState({ x: 0, y: 0 });
  const [isPositionReady, setIsPositionReady] = useState(false); // 新增：位置是否准备好
  const [isDraggingState, setIsDraggingState] = useState(false); // 新增：拖拽状态
  const [isResizingState, setIsResizingState] = useState(false); // 新增：调整大小状态
  
  const windowRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);
  const isDragging = useRef(false);
  const resizeDirection = useRef('');
  const startMouse = useRef({ x: 0, y: 0 });
  const startSize = useRef({ width: 0, height: 0 });
  const startPosition = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number | null>(null); // 新增：动画帧引用
  const lastMoveTime = useRef<number>(0); // 新增：记录上次移动时间

  // 计算动画起始位置
  useEffect(() => {
    if (sourcePosition) {
      if (useRelativePositioning) {
        // 相对定位：相对于父容器计算偏移
        const containerRect = windowRef.current?.parentElement?.getBoundingClientRect();
        if (containerRect) {
          const containerCenterX = containerRect.width / 2;
          const containerCenterY = containerRect.height / 2;
          const offsetX = (sourcePosition.x - containerRect.left) - containerCenterX;
          const offsetY = (sourcePosition.y - containerRect.top) - containerCenterY;
          console.log('Relative positioning - Animation start position:', { offsetX, offsetY, sourcePosition, containerRect });
          setAnimationStartPosition({ x: offsetX, y: offsetY });
        } else {
          // 降级处理
          setAnimationStartPosition({ x: 0, y: 0 });
        }
      } else {
        // 固定定位：相对于整个视口计算偏移
        const viewportCenterX = window.innerWidth / 2;
        const viewportCenterY = window.innerHeight / 2;
        const offsetX = sourcePosition.x - viewportCenterX;
        const offsetY = sourcePosition.y - viewportCenterY;
        console.log('Fixed positioning - Animation start position:', { offsetX, offsetY, sourcePosition });
        setAnimationStartPosition({ x: offsetX, y: offsetY });
      }
      setIsPositionReady(true);
    } else {
      // 如果没有提供源位置，默认从屏幕中心开始
      setAnimationStartPosition({ x: 0, y: 0 });
      setIsPositionReady(true);
    }
  }, [sourcePosition, useRelativePositioning]);

  // 打开动画 - 组件挂载后立即开始动画
  useEffect(() => {
    console.log('Component mounted, starting animation');
    // 组件挂载后短暂延迟开始动画
    const timer = setTimeout(() => {
      if (isPositionReady) { // 只有位置准备好了才开始动画
        console.log('Starting animation to center');
        setIsAnimated(true);
      }
    }, 50); // 减少延迟让动画更即时
    
    return () => clearTimeout(timer);
  }, [isPositionReady]); // 依赖isPositionReady

  // 关闭动画处理
  const handleClose = () => {
    console.log('Starting close animation');
    setIsClosing(true);
    
    // 重新计算从当前窗口中心到源文件夹位置的偏移
    if (sourcePosition) {
      if (useRelativePositioning) {
        // 相对定位模式：需要考虑父容器的偏移
        const containerRect = windowRef.current?.parentElement?.getBoundingClientRect();
        if (containerRect) {
          // 计算当前窗口的实际中心位置（屏幕坐标）
          const currentWindowCenterX = containerRect.left + containerRect.width / 2 + windowPosition.x;
          const currentWindowCenterY = containerRect.top + containerRect.height / 2 + windowPosition.y;
          
          // 计算从当前窗口中心到文件夹图标的偏移
          const offsetX = sourcePosition.x - currentWindowCenterX;
          const offsetY = sourcePosition.y - currentWindowCenterY;
          
          console.log('Relative close animation:', {
            currentWindowCenter: { x: currentWindowCenterX, y: currentWindowCenterY },
            sourcePosition,
            offset: { x: offsetX, y: offsetY }
          });
          
          setAnimationStartPosition({ x: offsetX, y: offsetY });
        }
      } else {
        // 固定定位模式：计算从当前窗口中心到文件夹图标的偏移
        const currentWindowCenterX = window.innerWidth / 2 + windowPosition.x;
        const currentWindowCenterY = window.innerHeight / 2 + windowPosition.y;
        
        // 计算从当前窗口中心到文件夹图标的偏移
        const offsetX = sourcePosition.x - currentWindowCenterX;
        const offsetY = sourcePosition.y - currentWindowCenterY;
        
        console.log('Fixed close animation:', {
          currentWindowCenter: { x: currentWindowCenterX, y: currentWindowCenterY },
          sourcePosition,
          offset: { x: offsetX, y: offsetY }
        });
        
        setAnimationStartPosition({ x: offsetX, y: offsetY });
      }
    }
    
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleItemClick = (id: string, event: React.MouseEvent) => {
    if (event.metaKey || event.ctrlKey) {
      // Multi-select with Cmd/Ctrl
      setSelectedItems(prev => 
        prev.includes(id) 
          ? prev.filter(item => item !== id)
          : [...prev, id]
      );
    } else {
      // Single select
      setSelectedItems([id]);
    }
  };

  const handleItemDoubleClick = (item: FileItem) => {
    if (item.type === 'folder') {
      console.log(`Opening folder: ${item.name}`);
      // Could open another FileManager instance
    } else {
      console.log(`Opening file: ${item.name}`);
      // Could open file viewer
    }
  };

  // Drag (move) handling functions
  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    isDragging.current = true;
    setIsDraggingState(true); // 设置拖拽状态
    startMouse.current = { x: e.clientX, y: e.clientY };
    startPosition.current = { ...windowPosition };
    
    document.body.style.cursor = 'move';
    document.body.style.userSelect = 'none';
  };

  // Resize handling functions
  const handleResizeStart = (direction: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    isResizing.current = true;
    setIsResizingState(true); // 设置调整大小状态
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

  // 优化的鼠标移动处理函数
  const handleMouseMove = useCallback((e: MouseEvent) => {
    // 简单的时间节流：限制更新频率到60fps
    const now = Date.now();
    if (now - lastMoveTime.current < 16) {
      return;
    }
    lastMoveTime.current = now;

    if (isDragging.current) {
      // Handle window dragging (moving)
      const deltaX = e.clientX - startMouse.current.x;
      const deltaY = e.clientY - startMouse.current.y;
      
      const newX = startPosition.current.x + deltaX;
      const newY = startPosition.current.y + deltaY;
      
      setWindowPosition({ x: newX, y: newY });
    } else if (isResizing.current) {
      // Handle window resizing - keep opposite edges at fixed absolute positions
      const deltaX = e.clientX - startMouse.current.x;
      const deltaY = e.clientY - startMouse.current.y;
      
      let newWidth = startSize.current.width;
      let newHeight = startSize.current.height;
      let newX = startPosition.current.x;
      let newY = startPosition.current.y;
      
      const direction = resizeDirection.current;
      
      // Calculate fixed edge positions (absolute coordinates on screen)
      const fixedLeft = startPosition.current.x;
      const fixedRight = startPosition.current.x + startSize.current.width;
      const fixedTop = startPosition.current.y;
      const fixedBottom = startPosition.current.y + startSize.current.height;
      
      switch (direction) {
        case 'right':
          // 固定左边缘绝对位置，只移动右边缘
          newWidth = Math.max(400, startSize.current.width + deltaX);
          newX = fixedLeft; // 左边缘绝对位置不变
          break;
          
        case 'left':
          // 固定右边缘绝对位置，只移动左边缘
          newWidth = Math.max(400, startSize.current.width - deltaX);
          newX = fixedRight - newWidth; // 确保右边缘绝对位置不变
          break;
          
        case 'bottom':
          // 固定上边缘绝对位置，只移动下边缘
          newHeight = Math.max(300, startSize.current.height + deltaY);
          newY = fixedTop; // 上边缘绝对位置不变
          break;
          
        case 'top':
          // 固定下边缘绝对位置，只移动上边缘
          newHeight = Math.max(300, startSize.current.height - deltaY);
          newY = fixedBottom - newHeight; // 确保下边缘绝对位置不变
          break;
          
        case 'top-left':
          // 固定右下角绝对位置，移动左边缘和上边缘
          newWidth = Math.max(400, startSize.current.width - deltaX);
          newHeight = Math.max(300, startSize.current.height - deltaY);
          newX = fixedRight - newWidth; // 确保右边缘绝对位置不变
          newY = fixedBottom - newHeight; // 确保下边缘绝对位置不变
          break;
          
        case 'top-right':
          // 固定左下角绝对位置，移动右边缘和上边缘
          newWidth = Math.max(400, startSize.current.width + deltaX);
          newHeight = Math.max(300, startSize.current.height - deltaY);
          newX = fixedLeft; // 确保左边缘绝对位置不变
          newY = fixedBottom - newHeight; // 确保下边缘绝对位置不变
          break;
          
        case 'bottom-left':
          // 固定右上角绝对位置，移动左边缘和下边缘
          newWidth = Math.max(400, startSize.current.width - deltaX);
          newHeight = Math.max(300, startSize.current.height + deltaY);
          newX = fixedRight - newWidth; // 确保右边缘绝对位置不变
          newY = fixedTop; // 确保上边缘绝对位置不变
          break;
          
        case 'bottom-right':
          // 固定左上角绝对位置，移动右边缘和下边缘
          newWidth = Math.max(400, startSize.current.width + deltaX);
          newHeight = Math.max(300, startSize.current.height + deltaY);
          newX = fixedLeft; // 确保左边缘绝对位置不变
          newY = fixedTop; // 确保上边缘绝对位置不变
          break;
      }
      
      setWindowSize({ width: newWidth, height: newHeight });
      setWindowPosition({ x: newX, y: newY });
    }
  }, []);

  // 优化的鼠标抬起处理函数
  const handleMouseUp = useCallback(() => {
    // 清理动画帧
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    if (isDragging.current || isResizing.current) {
      isDragging.current = false;
      isResizing.current = false;
      setIsDraggingState(false); // 重置拖拽状态
      setIsResizingState(false); // 重置调整大小状态
      resizeDirection.current = '';
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      // 清理事件监听器
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      // 清理动画帧
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // useCallback没有依赖，所以这里可以安全使用空数组

  return (
    <div 
      ref={windowRef}
      className={`${useRelativePositioning ? 'absolute' : 'fixed'} bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col z-50 ${
        !isDraggingState && !isResizingState ? (
          isClosing 
            ? 'transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]'
            : 'transition-all duration-500 ease-[cubic-bezier(0.175,0.885,0.32,1.2)]'
        ) : ''
      }`}
      style={{ 
        width: windowSize.width, 
        height: windowSize.height,
        left: useRelativePositioning 
          ? `calc(50% + ${windowPosition.x}px)` 
          : `calc(50% + ${windowPosition.x}px)`,
        top: useRelativePositioning 
          ? `calc(50% + ${windowPosition.y}px)` 
          : `calc(50% + ${windowPosition.y}px)`,
        transform: !isAnimated && !isClosing
          ? `translate(-50%, -50%) translate(${animationStartPosition.x}px, ${animationStartPosition.y}px) scale(0.01)` // 初始状态：偏移到文件夹位置，极小尺寸
          : isClosing 
            ? `translate(-50%, -50%) translate(${animationStartPosition.x}px, ${animationStartPosition.y}px) scale(0.01)` // 关闭状态：偏移到文件夹位置，极小尺寸  
            : 'translate(-50%, -50%) scale(1)', // 动画完成：在屏幕中心，正常尺寸
        opacity: !isPositionReady ? 0 : (!isAnimated && !isClosing ? 0.1 : isClosing ? 0.1 : 1), // 优化透明度变化
        minWidth: 400,
        minHeight: 300,
        transformOrigin: 'center center', // 确保缩放从中心点开始
        willChange: 'transform, opacity', // 提示浏览器优化动画性能
      }}
    >
      {/* Resize handles */}
      {/* Top edge */}
      <div 
        className="absolute top-0 left-2 right-2 h-2 cursor-ns-resize hover:bg-blue-200/30 z-10"
        onMouseDown={(e) => handleResizeStart('top', e)}
      />
      
      {/* Bottom edge */}
      <div 
        className="absolute bottom-0 left-2 right-2 h-2 cursor-ns-resize hover:bg-blue-200/30 z-10"
        onMouseDown={(e) => handleResizeStart('bottom', e)}
      />
      
      {/* Left edge */}
      <div 
        className="absolute top-2 bottom-2 left-0 w-2 cursor-ew-resize hover:bg-blue-200/30 z-10"
        onMouseDown={(e) => handleResizeStart('left', e)}
      />
      
      {/* Right edge */}
      <div 
        className="absolute top-2 bottom-2 right-0 w-2 cursor-ew-resize hover:bg-blue-200/30 z-10"
        onMouseDown={(e) => handleResizeStart('right', e)}
      />
      
      {/* Corner handles */}
      {/* Top-left corner */}
      <div 
        className="absolute top-0 left-0 w-4 h-4 cursor-nw-resize hover:bg-blue-200/50 z-20"
        onMouseDown={(e) => handleResizeStart('top-left', e)}
      />
      
      {/* Top-right corner */}
      <div 
        className="absolute top-0 right-0 w-4 h-4 cursor-ne-resize hover:bg-blue-200/50 z-20"
        onMouseDown={(e) => handleResizeStart('top-right', e)}
      />
      
      {/* Bottom-left corner */}
      <div 
        className="absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize hover:bg-blue-200/50 z-20"
        onMouseDown={(e) => handleResizeStart('bottom-left', e)}
      />
      
      {/* Bottom-right corner */}
      <div 
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize hover:bg-blue-200/50 z-20"
        onMouseDown={(e) => handleResizeStart('bottom-right', e)}
      />

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
                <path d="M1 1L7 7M7 1L1 7" stroke="white" strokeWidth="1" strokeLinecap="round"/>
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
                <path d="M1 3H5" stroke="white" strokeWidth="1" strokeLinecap="round"/>
              </svg>
            )}
          </button>
          <button 
            className="w-3 h-3 bg-green-500 rounded-full hover:bg-green-600 transition-colors cursor-pointer relative flex items-center justify-center"
            onMouseDown={(e) => e.stopPropagation()}
            onMouseEnter={() => setHoveredButton('maximize')}
            onMouseLeave={() => setHoveredButton(null)}
          >
            {hoveredButton === 'maximize' && (
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none" className="absolute">
                <path d="M4 1V7M1 4H7" stroke="white" strokeWidth="1" strokeLinecap="round"/>
              </svg>
            )}
          </button>
        </div>
        
        {/* Navigation and Title */}
        <div className="flex items-center gap-3 ml-6">
          <button 
            onClick={onBack}
            className="p-1 hover:bg-gray-200 rounded transition-colors cursor-pointer"
            disabled={!onBack}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button 
            className="p-1 hover:bg-gray-200 rounded transition-colors cursor-pointer"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <span className="font-medium text-gray-800">{folderName}</span>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 ml-auto">
          <button 
            className="p-2 hover:bg-gray-200 rounded transition-colors cursor-pointer"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 4H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M2 8H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M2 12H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          <button 
            className="p-2 hover:bg-gray-200 rounded transition-colors cursor-pointer"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2"/>
              <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Column Headers */}
      <div className="h-8 bg-gray-50 border-b border-gray-200 flex items-center text-xs font-medium text-gray-600">
        <div className="flex-1 px-4">Name</div>
        <div className="w-48 px-4">Date Modified</div>
        <div className="w-24 px-4">Size</div>
        <div className="w-48 px-4">Kind</div>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-auto">
        {files.map((file) => (
          <div
            key={file.id}
            className={`h-12 flex items-center border-b border-gray-100 hover:bg-blue-50 cursor-pointer ${
              selectedItems.includes(file.id) ? 'bg-blue-100' : ''
            }`}
            onClick={(e) => handleItemClick(file.id, e)}
            onDoubleClick={() => handleItemDoubleClick(file)}
          >
            <div className="flex-1 flex items-center px-4">
              <div className="w-6 h-6 mr-3 flex items-center justify-center">
                {file.type === 'folder' ? (
                  <MacOSFolderIcon size={20} />
                ) : (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M4 3C3.44772 3 3 3.44772 3 4V16C3 16.5523 3.44772 17 4 17H16C16.5523 17 17 16.5523 17 16V7L13 3H4Z" fill="#E5E7EB"/>
                    <path d="M13 3V7H17" fill="none" stroke="#9CA3AF" strokeWidth="1"/>
                  </svg>
                )}
              </div>
              <span className="text-sm text-gray-800">{file.name}</span>
            </div>
            <div className="w-48 px-4 text-sm text-gray-600">{file.dateModified}</div>
            <div className="w-24 px-4 text-sm text-gray-600">{file.size}</div>
            <div className="w-48 px-4 text-sm text-gray-600">{file.kind}</div>
          </div>
        ))}
      </div>

      {/* Status Bar - Draggable Area */}
      <div 
        className="h-8 bg-gray-50 border-t border-gray-200 flex items-center px-4 text-xs text-gray-600 cursor-move"
        onMouseDown={handleDragStart}
      >
        <div className="flex items-center gap-1">
          <span className="text-blue-500">📁</span>
          <span>Macintosh HD</span>
          <span>›</span>
          <span className="text-blue-500">👤</span>
          <span>Users</span>
          <span>›</span>
          <span className="text-blue-500">👤</span>
          <span>Kyle</span>
          <span>›</span>
          <span className="text-blue-500">🖥️</span>
          <span>Desktop</span>
          <span>›</span>
          <span className="text-blue-500">📁</span>
          <span>{folderName}</span>
        </div>
        <div className="ml-auto">
          {files.length} items, 2.1 GB available
        </div>
      </div>
    </div>
  );
};

export default FileManager; 