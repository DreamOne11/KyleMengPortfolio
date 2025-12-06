import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useResponsive, getResponsiveWindowSize } from '../../utils/responsive';

type Props = {
  onClose: () => void;
  onFocus?: () => void;
  windowOffset?: { x: number; y: number };
  zIndex?: number;
  onMaximizeChange?: (isMax: boolean) => void;
  isActive?: boolean;
};

const EmailComposer: React.FC<Props> = ({ onClose, onFocus, windowOffset, zIndex, onMaximizeChange, isActive = false }) => {
  const responsive = useResponsive();
  
  // 表单状态
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  // Window size and position state - 使用响应式窗口大小
  const defaultWindowSize = getResponsiveWindowSize(700, 700);
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

  // Email sending states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // 最大化相关状态
  const [isMaximized, setIsMaximized] = useState(false);
  const [preMaximizeState, setPreMaximizeState] = useState<{
    size: { width: number; height: number };
    position: { x: number; y: number };
  } | null>(null);

  const windowRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);
  const isDragging = useRef(false);
  const resizeDirection = useRef('');
  const startMouse = useRef({ x: 0, y: 0 });
  const startSize = useRef({ width: 0, height: 0 });
  const startPosition = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number | null>(null);
  const lastMoveTime = useRef<number>(0);

  // 移动设备交互模式判断
  const isMobileDevice = responsive.isMobile;

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

  // 表单处理
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // 使用 Formspree 发送邮件
      // 注意：请将 'xpwzojpk' 替换为你自己的 Formspree 表单ID
      const response = await fetch('https://formspree.io/f/mqabapvr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message,
          _subject: 'Contact from Portfolio Website',
          _replyto: formData.email,
        }),
      });

      if (response.ok) {
        setSubmitStatus('success');
        // 重置表单
        setFormData({ name: '', email: '', message: '' });
        // 延迟关闭窗口
        setTimeout(() => {
          handleClose();
        }, 2000);
      } else {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 最大化/恢复窗口
  const handleMaximize = useCallback(() => {
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

  // 修改 handleDragStart，在最大化状态下禁用拖拽
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

  // 修改 handleResizeStart，在最大化状态下禁用调整大小
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
    // 添加时间节流：限制更新频率到60fps
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
          newWidth = Math.max(responsive.isMobile ? 300 : 500, startSize.current.width + deltaX);
          newX = fixedLeft;
          break;
        case 'left':
          newWidth = Math.max(responsive.isMobile ? 300 : 500, startSize.current.width - deltaX);
          newX = fixedRight - newWidth;
          break;
        case 'bottom':
          newHeight = Math.max(responsive.isMobile ? 400 : 500, startSize.current.height + deltaY);
          newY = fixedTop;
          break;
        case 'top':
          newHeight = Math.max(responsive.isMobile ? 400 : 500, startSize.current.height - deltaY);
          newY = fixedBottom - newHeight;
          break;
        case 'top-left':
          newWidth = Math.max(responsive.isMobile ? 300 : 500, startSize.current.width - deltaX);
          newHeight = Math.max(responsive.isMobile ? 400 : 500, startSize.current.height - deltaY);
          newX = fixedRight - newWidth;
          newY = fixedBottom - newHeight;
          break;
        case 'top-right':
          newWidth = Math.max(responsive.isMobile ? 300 : 500, startSize.current.width + deltaX);
          newHeight = Math.max(responsive.isMobile ? 400 : 500, startSize.current.height - deltaY);
          newX = fixedLeft;
          newY = fixedBottom - newHeight;
          break;
        case 'bottom-left':
          newWidth = Math.max(responsive.isMobile ? 300 : 500, startSize.current.width - deltaX);
          newHeight = Math.max(responsive.isMobile ? 400 : 500, startSize.current.height + deltaY);
          newX = fixedRight - newWidth;
          newY = fixedTop;
          break;
        case 'bottom-right':
          newWidth = Math.max(responsive.isMobile ? 300 : 500, startSize.current.width + deltaX);
          newHeight = Math.max(responsive.isMobile ? 400 : 500, startSize.current.height + deltaY);
          newX = fixedLeft;
          newY = fixedTop;
          break;
      }
      
      setWindowSize({ width: newWidth, height: newHeight });
      setWindowPosition({ x: newX, y: newY });
    }
  }, [responsive.isMobile]); // 添加 responsive.isMobile 依赖

  const handleMouseUp = useCallback(() => {
    // 清理动画帧
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

  // 优化事件监听器的添加和移除 - 使用简化方式
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

  return (
    <div
      ref={windowRef}
      onClick={() => onFocus?.()}
      className={`fixed bg-white border border-gray-300 shadow-2xl ${
        !isDraggingState && !isResizingState ? (
          isClosing ? 'transition-all duration-300 ease-out' : 'transition-all duration-300 ease-out'
        ) : ''
      } ${
        isClosing ? 'scale-75 opacity-0' : isAnimated ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
      } ${isMaximized ? 'rounded-none' : 'rounded-lg'} overflow-hidden`}
      style={{
        width: isMaximized ? '100%' : windowSize.width,
        height: isMaximized ? '100%' : windowSize.height,
        left: isMaximized ? 0 : `50%`,
        top: isMaximized ? 0 : `50%`,
        transform: isMaximized 
          ? 'none'
          : `translate(calc(-50% + ${windowPosition.x}px), calc(-50% + ${windowPosition.y}px))`,
        zIndex: isMaximized 
          ? (isActive ? 2000 : 1900)
          : (isActive ? 2000 : 1900),
      }}
    >
      {/* Resize handles - 最大化时或移动设备上隐藏 */}
      {!isMaximized && !isMobileDevice && (
        <>
          {/* Edge handles */}
          <div 
            className="absolute top-0 left-4 right-4 h-1 cursor-ns-resize hover:bg-blue-200/50 z-20"
            onMouseDown={(e) => handleResizeStart('top', e)}
          />
          <div 
            className="absolute bottom-0 left-4 right-4 h-1 cursor-ns-resize hover:bg-blue-200/50 z-20"
            onMouseDown={(e) => handleResizeStart('bottom', e)}
          />
          <div 
            className="absolute left-0 top-4 bottom-4 w-1 cursor-ew-resize hover:bg-blue-200/50 z-20"
            onMouseDown={(e) => handleResizeStart('left', e)}
          />
          <div 
            className="absolute right-0 top-4 bottom-4 w-1 cursor-ew-resize hover:bg-blue-200/50 z-20"
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

      {/* Title Bar */}
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
        
        <div className="flex items-center gap-2 md:gap-3 ml-3 md:ml-6">
          <span className="font-medium text-gray-800 text-sm md:text-base">Send me an email</span>
        </div>
      </div>

      {/* Email Form Content */}
      <div className="flex-1 p-4 md:p-8 overflow-auto min-h-0">
        <div className="mb-4 md:mb-6">
          <p className="text-gray-600 text-sm md:text-base mb-4 md:mb-6">
            Get in touch with me! Your message will be sent directly to <strong>kylemeng11@outlook.com</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6 h-full flex flex-col">
          {/* Status Messages */}
          {submitStatus === 'success' && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3 md:p-4">
              <div className="flex items-center">
                <svg className="w-4 h-4 md:w-5 md:h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-green-800 font-medium text-sm md:text-base">Email sent successfully! Thank you for your message.</p>
              </div>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 md:p-4">
              <div className="flex items-center">
                <svg className="w-4 h-4 md:w-5 md:h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-red-800 font-medium text-sm md:text-base">Failed to send email. Please try again later or send an email directly to kylemeng11@outlook.com</p>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              disabled={isSubmitting}
              className={`w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base ${
                isSubmitting ? 'bg-gray-50 cursor-not-allowed' : ''
              }`}
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              disabled={isSubmitting}
              className={`w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base ${
                isSubmitting ? 'bg-gray-50 cursor-not-allowed' : ''
              }`}
              required
            />
          </div>

          <div className="flex-1 flex flex-col">
            <label htmlFor="message" className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              disabled={isSubmitting}
              rows={isMobileDevice ? 6 : 8}
              className={`flex-1 w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none min-h-[150px] md:min-h-[200px] text-sm md:text-base ${
                isSubmitting ? 'bg-gray-50 cursor-not-allowed' : ''
              }`}
              required
            />
          </div>

          <div className="flex justify-end pt-4 md:pt-6 mt-auto">
            <button
              type="submit"
              disabled={isSubmitting || submitStatus === 'success'}
              className={`px-6 md:px-8 py-2 md:py-3 rounded-md font-medium transition-colors flex items-center text-sm md:text-base ${
                isSubmitting || submitStatus === 'success'
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
            >
              {isSubmitting && (
                <svg className="animate-spin -ml-1 mr-2 md:mr-3 h-4 w-4 md:h-5 md:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {isSubmitting ? 'Sending...' : submitStatus === 'success' ? 'Sent!' : 'Send email'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmailComposer; 