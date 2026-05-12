import React, { useState, useRef, useEffect, useCallback } from 'react';
import MacOSFolderIcon from '../icons/MacOSFolderIcon';
import { useResponsive, getResponsiveWindowSize } from '../../utils/responsive';
import { PhotographyApiService } from '../../services/photographyApi';
import { PhotoResponse } from '../../types/photography';
import PhotoThumbnail from '../ui/PhotoThumbnail';

// 直接在文件中定义所需类型和函数
export interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  icon?: string;
  size?: string;
  date?: string;
  dateModified?: string;
  kind?: string;
}

// 获取文件夹内容的函数
export const getFilesForFolder = (folderName: string): FileItem[] => {
  // 根据文件夹名返回对应的文件列表
  switch (folderName.toLowerCase()) {
    case 'resume':
      return [
        { id: 'resume_file', name: 'Kyle_Meng_Resume.pdf', type: 'file', size: '289 KB', date: '2024-06-10', dateModified: '2024-06-10', kind: 'PDF Document' }
      ];
    case 'contact':
      return [
        { id: 'github', name: 'Github', type: 'file', size: '', date: '', dateModified: '', kind: 'Link' },
        { id: 'linkedin', name: 'LinkedIn', type: 'file', size: '', date: '', dateModified: '', kind: 'Link' },
        { id: 'instagram', name: 'Instagram', type: 'file', size: '', date: '', dateModified: '', kind: 'Link' },
        { id: 'email', name: 'Email', type: 'file', size: '', date: '', dateModified: '', kind: 'Link' }
      ];
    case 'all projects':
      // 返回默认内容或空列表，实际会使用customFiles
      return [];
    default:
      return [];
  }
};

type Props = {
  folderName: string;
  onClose: () => void;
  onBack?: () => void;
  sourcePosition?: { x: number; y: number }; // 文件夹的位置信息，用于动画起始点
  useRelativePositioning?: boolean; // 新增：是否使用相对定位
  onFocus?: () => void; // 新增：窗口获得焦点时的回调
  windowOffset?: { x: number; y: number }; // 新增：窗口偏移量，避免多个窗口重叠
  zIndex?: number; // 新增：窗口层级
  onOpenEmailComposer?: () => void; // 新增：打开邮件发送框的回调
  onMaximizeChange?: (isMax: boolean) => void; // 新增
  customFiles?: any[];
  onProjectDoubleClick?: (project: any) => void;
  isActive?: boolean; // 新增：是否处于活动状态
  photoCategoryId?: number; // Photography分类ID，用于获取照片
};

const FileManager: React.FC<Props> = ({ folderName, onClose, onBack, sourcePosition, useRelativePositioning, onFocus, windowOffset, zIndex, onOpenEmailComposer, onMaximizeChange, customFiles, onProjectDoubleClick, isActive = false, photoCategoryId }) => {
  const responsive = useResponsive();
  
  // 使用useEffect来监听folderName变化并更新文件列表
  const [files, setFiles] = useState<FileItem[]>([]);
  const [photos, setPhotos] = useState<PhotoResponse[]>([]);
  const [photosLoading, setPhotosLoading] = useState(false);

  // 当folderName改变时，重新获取文件列表
  useEffect(() => {
    setFiles(getFilesForFolder(folderName));
    setSelectedItems([]); // 清空选中状态
  }, [folderName]);

  // 获取照片数据的effect
  useEffect(() => {
    if (photoCategoryId) {
      const fetchPhotos = async () => {
        try {
          setPhotosLoading(true);
          const photoData = await PhotographyApiService.getPhotosByCategory(photoCategoryId);
          setPhotos(photoData);
        } catch (error) {
          console.error('Failed to fetch photos:', error);
          setPhotos([]);
        } finally {
          setPhotosLoading(false);
        }
      };

      fetchPhotos();
    }
  }, [photoCategoryId]);

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  
  // Window size and position state - 使用响应式窗口大小
  const defaultWindowSize = getResponsiveWindowSize(800, 600);
  const [windowSize, setWindowSize] = useState(defaultWindowSize);
  const [windowPosition, setWindowPosition] = useState({ 
    x: (windowOffset?.x || 0), 
    y: (windowOffset?.y || 0) 
  });
  
  // 最大化相关状态
  const [isMaximized, setIsMaximized] = useState(false);
  const [preMaximizeState, setPreMaximizeState] = useState<{
    size: { width: number; height: number };
    position: { x: number; y: number };
  } | null>(null);
  
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

  const getAnimationOffsetToSource = useCallback(() => {
    if (!sourcePosition) {
      return { x: 0, y: 0 };
    }

    const parentElement = windowRef.current?.parentElement;
    if (parentElement) {
      const parentRect = parentElement.getBoundingClientRect();
      const scaleX = parentElement.clientWidth > 0 ? parentRect.width / parentElement.clientWidth : 1;
      const scaleY = parentElement.clientHeight > 0 ? parentRect.height / parentElement.clientHeight : scaleX;
      const safeScaleX = Number.isFinite(scaleX) && scaleX > 0 ? scaleX : 1;
      const safeScaleY = Number.isFinite(scaleY) && scaleY > 0 ? scaleY : safeScaleX;

      const sourceX = (sourcePosition.x - parentRect.left) / safeScaleX;
      const sourceY = (sourcePosition.y - parentRect.top) / safeScaleY;
      const currentWindowCenterX = parentElement.clientWidth / 2 + windowPosition.x;
      const currentWindowCenterY = parentElement.clientHeight / 2 + windowPosition.y;

      return {
        x: sourceX - currentWindowCenterX,
        y: sourceY - currentWindowCenterY
      };
    }

    return {
      x: sourcePosition.x - (window.innerWidth / 2 + windowPosition.x),
      y: sourcePosition.y - (window.innerHeight / 2 + windowPosition.y)
    };
  }, [sourcePosition, windowPosition.x, windowPosition.y]);

  // 计算动画起始位置
  useEffect(() => {
    if (sourcePosition) {
      setAnimationStartPosition(getAnimationOffsetToSource());
      setIsPositionReady(true);
    } else {
      // 如果没有提供源位置，默认从屏幕中心开始
      setAnimationStartPosition({ x: 0, y: 0 });
      setIsPositionReady(true);
    }
  }, [sourcePosition, getAnimationOffsetToSource]);

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
      setAnimationStartPosition(getAnimationOffsetToSource());
    }
    
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleItemClick = (id: string, event: React.MouseEvent) => {
    event.stopPropagation(); // 防止事件冒泡到父容器
    
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
      
      // 特殊处理Kyle的简历文件
      if (item.name === 'Kyle_Meng_Resume.pdf') {
        // 在新标签页中打开简历PDF
        window.open('/resume.pdf', '_blank');
        return;
      }

      // 处理社交媒体链接
      switch (item.name) {
        case 'Github':
          window.open('https://github.com/DreamOne11', '_blank');
          return;
        case 'LinkedIn':
          window.open('https://www.linkedin.com/in/xmeng11/', '_blank');
          return;
        case 'Instagram':
          window.open('https://www.instagram.com/kylemeng78/', '_blank');
          return;
        case 'Email':
          // Email可以触发邮件客户端或者显示邮件地址
          if (onOpenEmailComposer) {
            console.log('Opening email composer');
            onOpenEmailComposer();
          } else {
            console.log('Email contact clicked but no composer handler');
          }
          return;
        default:
          break;
      }
      
      // 其他文件的默认处理
      // Could open file viewer
    }
  };

  // 移动端现在使用onClick事件处理，不再需要复杂的触摸事件处理

  // 处理空白区域点击，取消选中状态
  const handleBlankAreaClick = (event: React.MouseEvent) => {
    // 确保点击的是空白区域而不是文件项
    if (event.target === event.currentTarget) {
      setSelectedItems([]);
    }
  };

  // 渲染文件图标
  const renderFileIcon = (file: FileItem) => {
    // 首先检查是否为文件夹
    if (file.type === 'folder') {
      return <MacOSFolderIcon size={20} />;
    }

    // 根据文件名渲染不同的社交媒体图标
    switch (file.name) {
      case 'Github':
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path fillRule="evenodd" clipRule="evenodd" d="M10 0C4.477 0 0 4.477 0 10c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.341-3.369-1.341-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0110 4.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C17.137 18.163 20 14.418 20 10c0-5.523-4.477-10-10-10z" fill="#333"/>
          </svg>
        );
      case 'LinkedIn':
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M17.5 0h-15C1.125 0 0 1.125 0 2.5v15C0 18.875 1.125 20 2.5 20h15c1.375 0 2.5-1.125 2.5-2.5v-15C20 1.125 18.875 0 17.5 0zM6.25 17.5H3.125V7.5H6.25v10zM4.688 6.25c-1.031 0-1.875-.844-1.875-1.875S3.656 2.5 4.688 2.5s1.875.844 1.875 1.875S5.719 6.25 4.688 6.25zM17.5 17.5h-3.125v-5c0-1.375-.625-2.188-1.875-2.188-1.5 0-2.5 1.125-2.5 2.5v4.688H6.875V7.5H10v1.25c.5-.938 1.5-1.563 3.125-1.563 2.5 0 4.375 1.875 4.375 4.688v6.125z" fill="#0077B5"/>
          </svg>
        );
      case 'Instagram':
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 1.8c2.67 0 2.987.01 4.042.059 2.71.123 3.976 1.409 4.099 4.099.048 1.054.057 1.37.057 4.042 0 2.672-.01 2.988-.057 4.042-.123 2.687-1.387 3.975-4.1 4.099-1.054.048-1.37.058-4.041.058-2.67 0-2.987-.01-4.04-.058-2.718-.124-3.977-1.416-4.1-4.1-.048-1.054-.058-1.37-.058-4.041 0-2.67.01-2.986.058-4.04.124-2.69 1.387-3.977 4.1-4.1 1.054-.048 1.37-.059 4.04-.059L10 1.8zm0-1.8C7.284 0 6.944.012 5.877.06 2.246.227.227 2.242.061 5.877.012 6.944 0 7.284 0 10s.012 3.057.06 4.123c.167 3.632 2.182 5.65 5.817 5.817 1.067.048 1.407.06 4.123.06s3.057-.012 4.123-.06c3.629-.167 5.652-2.182 5.816-5.817.05-1.066.061-1.407.061-4.123s-.012-3.056-.06-4.122C19.773 2.249 17.76.228 14.124.061 13.057.012 12.716 0 10 0L10 0z" fill="url(#instagram-gradient)"/>
            <path d="M10 4.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 8.468a3.333 3.333 0 100-6.666 3.333 3.333 0 000 6.666z" fill="url(#instagram-gradient)"/>
            <circle cx="15.338" cy="4.662" r="1.2" fill="url(#instagram-gradient)"/>
            <defs>
              <linearGradient id="instagram-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#405DE6"/>
                <stop offset="25%" stopColor="#5851DB"/>
                <stop offset="50%" stopColor="#833AB4"/>
                <stop offset="75%" stopColor="#C13584"/>
                <stop offset="100%" stopColor="#E1306C"/>
              </linearGradient>
            </defs>
          </svg>
        );
      case 'Email':
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M18 4H2C1.45 4 1 4.45 1 5v10c0 .55.45 1 1 1h16c.55 0 1-.45 1-1V5c0-.55-.45-1-1-1zM18 6L10 11L2 6h16z" fill="#EA4335"/>
          </svg>
        );
      default:
        // 默认文件图标
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M4 3C3.44772 3 3 3.44772 3 4V16C3 16.5523 3.44772 17 4 17H16C16.5523 17 17 16.5523 17 16V7L13 3H4Z" fill="#E5E7EB"/>
            <path d="M13 3V7H17" fill="none" stroke="#9CA3AF" strokeWidth="1"/>
          </svg>
        );
    }
  };

  // Drag (move) handling functions
  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // 窗口获得焦点
    onFocus?.();
    
    // 如果窗口是最大化状态，禁用拖拽功能，符合macOS逻辑
    if (isMaximized) {
      return; // 直接返回，不执行任何拖拽逻辑
    }
    
    // 正常窗口模式的拖拽逻辑
    startMouse.current = { x: e.clientX, y: e.clientY };
    startPosition.current = { ...windowPosition };
    
    isDragging.current = true;
    setIsDraggingState(true); // 设置拖拽状态
    
    document.body.style.cursor = 'move';
    document.body.style.userSelect = 'none';
  };

  // Resize handling functions
  const handleResizeStart = (direction: string, e: React.MouseEvent) => {
    // 最大化时禁用调整大小
    if (isMaximized) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    // 窗口获得焦点
    onFocus?.();
    
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
      // Handle window dragging (moving) - 只在非最大化状态下会有拖拽
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
  }, []); // 移除isMaximized依赖，因为最大化时不会有拖拽状态

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
  }, []); // 使用空依赖数组，因为事件处理函数是稳定的

  // 处理窗口点击获得焦点
  const handleWindowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFocus?.();
  };

  // 移动设备交互模式判断
  const isMobileDevice = responsive.isMobile;

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

  // 添加项目触摸事件处理函数
  // handleProjectTouchEnd 已移除，现在使用onClick处理移动端交互

  return (
    <div 
      ref={windowRef}
      onClick={handleWindowClick}
      className={`${isMaximized ? 'absolute inset-0 rounded-none' : (useRelativePositioning ? 'absolute' : 'fixed')} bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col ${
        !isDraggingState && !isResizingState ? (
          isClosing 
            ? 'transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]'
            : 'transition-all duration-500 ease-[cubic-bezier(0.175,0.885,0.32,1.2)]'
        ) : ''
      }`}
      style={isMaximized ? {
        width: '100%',
        height: '100%',
        left: 0,
        top: 0,
        transform: 'none',
        opacity: 1,
        zIndex: isActive ? 1000 : 900,
      } : { 
        width: windowSize.width, 
        height: windowSize.height,
        left: useRelativePositioning 
          ? `calc(50% + ${windowPosition.x}px)` 
          : `calc(50% + ${windowPosition.x}px)`,
        top: useRelativePositioning 
          ? `calc(50% + ${windowPosition.y}px)` 
          : `calc(50% + ${windowPosition.y}px)`,
        transform: !isAnimated && !isClosing
          ? `translate(-50%, -50%) translate(${animationStartPosition.x}px, ${animationStartPosition.y}px) scale(0.01)`
          : isClosing 
            ? `translate(-50%, -50%) translate(${animationStartPosition.x}px, ${animationStartPosition.y}px) scale(0.01)`
            : 'translate(-50%, -50%) scale(1)',
        opacity: !isPositionReady ? 0 : (!isAnimated && !isClosing ? 0.1 : isClosing ? 0.1 : 1),
        minWidth: responsive.isMobile ? 300 : 400,
        minHeight: responsive.isMobile ? 200 : 300,
        transformOrigin: 'center center',
        willChange: 'transform, opacity',
        zIndex: isActive ? 1000 : 900,
      }}
    >
      {/* Resize handles - 最大化时或移动设备上隐藏 */}
      {!isMaximized && !isMobileDevice && (
        <>
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
        </>
      )}

      {/* Title Bar - Draggable Area */}
      <div 
        className={`h-10 md:h-12 bg-gray-100 border-b border-gray-300 flex items-center px-2 md:px-4 ${!isMaximized && !isMobileDevice ? 'cursor-move' : ''}`}
        onMouseDown={!isMaximized && !isMobileDevice ? handleDragStart : undefined}
      >
        <div className="flex items-center gap-1 md:gap-2">
          {/* Traffic Light Buttons */}
          <button 
            onClick={handleClose}
            className="w-2.5 h-2.5 md:w-3 md:h-3 bg-red-500 rounded-full hover:bg-red-600 transition-colors cursor-pointer relative flex items-center justify-center"
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
          {!isMobileDevice && (
            <>
              <button 
                className="w-2.5 h-2.5 md:w-3 md:h-3 bg-yellow-500 rounded-full hover:bg-yellow-600 transition-colors cursor-pointer relative flex items-center justify-center"
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
                className="w-2.5 h-2.5 md:w-3 md:h-3 bg-green-500 rounded-full hover:bg-green-600 transition-colors cursor-pointer relative flex items-center justify-center"
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
            </>
          )}
        </div>
        
        {/* Navigation and Title */}
        <div className="flex items-center gap-2 md:gap-3 ml-3 md:ml-6">
          <button 
            onClick={onBack}
            className="p-1 hover:bg-gray-200 rounded transition-colors cursor-pointer"
            disabled={!onBack}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="md:w-4 md:h-4">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button 
            className="p-1 hover:bg-gray-200 rounded transition-colors cursor-pointer"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="md:w-4 md:h-4">
              <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <span className="font-medium text-gray-800 text-sm md:text-base">{folderName}</span>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-1 md:gap-2 ml-auto">
          <button 
            className="p-1 md:p-2 hover:bg-gray-200 rounded transition-colors cursor-pointer"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="md:w-4 md:h-4">
              <path d="M2 4H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M2 8H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M2 12H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          <button 
            className="p-1 md:p-2 hover:bg-gray-200 rounded transition-colors cursor-pointer"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="md:w-4 md:h-4">
              <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2"/>
              <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Column Headers */}
      <div className="h-6 md:h-8 bg-gray-50 border-b border-gray-200 flex items-center text-xs font-medium text-gray-600">
        <div className="flex-1 px-2 md:px-4">Name</div>
        <div className="w-24 md:w-48 px-2 md:px-4 hidden sm:block">Date Modified</div>
        <div className="w-16 md:w-24 px-2 md:px-4 hidden md:block">Size</div>
        <div className="w-24 md:w-48 px-2 md:px-4 hidden lg:block">Kind</div>
      </div>

      {/* 文件列表区域，flex-1 保证 status bar 在底部 */}
      <div className="flex-1 overflow-auto">
        {photoCategoryId && photos.length > 0 ? (
          // Photography files - use grid layout for photos
          <div className="p-4">
            {photosLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-gray-500">Loading photos...</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {photos.map((photo) => (
                  <PhotoThumbnail
                    key={photo.id}
                    photo={photo}
                    size="medium"
                    showMetadata={false}
                    onClick={() => {
                      if (responsive.isMobile) {
                        // Mobile: single click to view photo
                        console.log('View photo:', photo.title);
                      }
                    }}
                    onDoubleClick={() => {
                      if (!responsive.isMobile) {
                        // Desktop: double click to view photo
                        console.log('View photo:', photo.title);
                      }
                    }}
                    className="w-full aspect-[4/3]"
                  />
                ))}
              </div>
            )}
          </div>
        ) : customFiles ? (
          <div className="flex flex-col divide-y divide-gray-100">
            {customFiles.map((item, idx) => (
              <div
                key={item.id || idx}
                className="flex items-center text-xs md:text-sm hover:bg-blue-50 transition cursor-pointer"
                onClick={(e) => {
                  // 移动端单击直接打开项目
                  if (responsive.isMobile) {
                    e.preventDefault();
                    onProjectDoubleClick && onProjectDoubleClick(item);
                  }
                }}
                onDoubleClick={(e) => {
                  // 桌面端双击打开项目
                  if (!responsive.isMobile) {
                    onProjectDoubleClick && onProjectDoubleClick(item);
                  }
                }}
              >
                <div className="flex-1 px-2 md:px-4 py-2 font-medium text-gray-800">{item.name}</div>
                <div className="w-24 md:w-48 px-2 md:px-4 text-gray-500 hidden sm:block">{item.date || '-'}</div>
                <div className="w-16 md:w-24 px-2 md:px-4 text-gray-500 hidden md:block">{item.size || '-'}</div>
                <div className="w-24 md:w-48 px-2 md:px-4 text-gray-500 hidden lg:block">{item.kind || '-'}</div>
              </div>
            ))}
          </div>
        ) : (
          <div onClick={handleBlankAreaClick}>
            {files.map((file) => (
              <div
                key={file.id}
                className={`h-10 md:h-12 flex items-center border-b border-gray-100 hover:bg-blue-50 cursor-pointer ${
                  selectedItems.includes(file.id) ? 'bg-blue-100' : ''
                }`}
                data-onboarding={folderName === 'Contact' && file.name === 'Email' ? 'contact-email' : undefined}
                onClick={(e) => {
                  // 移动端单击直接打开文件，桌面端单击选择文件
                  if (responsive.isMobile) {
                    e.preventDefault();
                    handleItemDoubleClick(file);
                  } else {
                    handleItemClick(file.id, e);
                  }
                }}
                onDoubleClick={() => {
                  // 桌面端双击打开文件
                  if (!responsive.isMobile) {
                    handleItemDoubleClick(file);
                  }
                }}
                // onTouchEnd={(e) => handleItemTouchEnd(file, e)} // 移除，使用onClick处理移动端交互
              >
                <div className="flex-1 flex items-center px-2 md:px-4">
                  <div className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3 flex items-center justify-center">
                    {renderFileIcon(file)}
                  </div>
                  <span className="text-xs md:text-sm text-gray-800">{file.name}</span>
                </div>
                <div className="w-24 md:w-48 px-2 md:px-4 text-xs md:text-sm text-gray-600 hidden sm:block">{file.dateModified}</div>
                <div className="w-16 md:w-24 px-2 md:px-4 text-xs md:text-sm text-gray-600 hidden md:block">{file.size}</div>
                <div className="w-24 md:w-48 px-2 md:px-4 text-xs md:text-sm text-gray-600 hidden lg:block">{file.kind}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status Bar - Draggable Area */}
      <div 
        className={`h-6 md:h-8 bg-gray-50 border-t border-gray-200 flex items-center px-2 md:px-4 text-xs text-gray-600 ${!isMaximized && !isMobileDevice ? 'cursor-move' : ''}`}
        onMouseDown={!isMaximized && !isMobileDevice ? handleDragStart : undefined}
      >
        <div className="flex items-center gap-1 overflow-hidden">
          <span className="text-blue-500 hidden xs:inline">📁</span>
          <span className="hidden sm:inline">Macintosh HD</span>
          <span className="hidden sm:inline">›</span>
          <span className="text-blue-500 hidden sm:inline">👤</span>
          <span className="hidden md:inline">Users</span>
          <span className="hidden md:inline">›</span>
          <span className="text-blue-500 hidden md:inline">👤</span>
          <span className="hidden md:inline">Kyle</span>
          <span className="hidden md:inline">›</span>
          <span className="text-blue-500 hidden md:inline">🖥️</span>
          <span className="hidden md:inline">Desktop</span>
          <span className="hidden md:inline">›</span>
          <span className="text-blue-500">📁</span>
          <span className="truncate">{folderName}</span>
        </div>
        <div className="ml-auto whitespace-nowrap">
          {photoCategoryId ? photos.length : (customFiles ? customFiles.length : files.length)} {photoCategoryId ? 'photos' : 'items'}
          <span className="hidden sm:inline">, 2.1 GB available</span>
        </div>
      </div>
    </div>
  );
};

export default FileManager; 
