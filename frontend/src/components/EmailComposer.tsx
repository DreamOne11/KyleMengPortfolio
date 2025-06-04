import React, { useState, useRef, useEffect, useCallback } from 'react';

type Props = {
  onClose: () => void;
  onFocus?: () => void;
  windowOffset?: { x: number; y: number };
  zIndex?: number;
};

const EmailComposer: React.FC<Props> = ({ onClose, onFocus, windowOffset, zIndex }) => {
  // 表单状态
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  // Window size and position state
  const [windowSize, setWindowSize] = useState({ width: 700, height: 700 });
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

  const windowRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);
  const isDragging = useRef(false);
  const resizeDirection = useRef('');
  const startMouse = useRef({ x: 0, y: 0 });
  const startSize = useRef({ width: 0, height: 0 });
  const startPosition = useRef({ x: 0, y: 0 });

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

  // Drag handling
  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    onFocus?.();
    
    startMouse.current = { x: e.clientX, y: e.clientY };
    startPosition.current = { ...windowPosition };
    isDragging.current = true;
    setIsDraggingState(true);
    document.body.style.cursor = 'move';
    document.body.style.userSelect = 'none';
  };

  // Resize handling
  const handleResizeStart = (direction: string, e: React.MouseEvent) => {
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

  const handleMouseMove = useCallback((e: MouseEvent) => {
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
          newX = fixedLeft;
          break;
        case 'left':
          newWidth = Math.max(500, startSize.current.width - deltaX);
          newX = fixedRight - newWidth;
          break;
        case 'bottom':
          newHeight = Math.max(500, startSize.current.height + deltaY);
          newY = fixedTop;
          break;
        case 'top':
          newHeight = Math.max(500, startSize.current.height - deltaY);
          newY = fixedBottom - newHeight;
          break;
        case 'top-left':
          newWidth = Math.max(500, startSize.current.width - deltaX);
          newHeight = Math.max(500, startSize.current.height - deltaY);
          newX = fixedRight - newWidth;
          newY = fixedBottom - newHeight;
          break;
        case 'top-right':
          newWidth = Math.max(500, startSize.current.width + deltaX);
          newHeight = Math.max(500, startSize.current.height - deltaY);
          newX = fixedLeft;
          newY = fixedBottom - newHeight;
          break;
        case 'bottom-left':
          newWidth = Math.max(500, startSize.current.width - deltaX);
          newHeight = Math.max(500, startSize.current.height + deltaY);
          newX = fixedRight - newWidth;
          newY = fixedTop;
          break;
        case 'bottom-right':
          newWidth = Math.max(500, startSize.current.width + deltaX);
          newHeight = Math.max(500, startSize.current.height + deltaY);
          newX = fixedLeft;
          newY = fixedTop;
          break;
      }
      
      setWindowSize({ width: newWidth, height: newHeight });
      setWindowPosition({ x: newX, y: newY });
    }
  }, []);

  const handleMouseUp = useCallback(() => {
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
    const handleGlobalMouseMove = (e: MouseEvent) => {
      handleMouseMove(e);
    };
    
    const handleGlobalMouseUp = () => {
      handleMouseUp();
    };

    if (isDraggingState || isResizingState) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDraggingState, isResizingState, handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={windowRef}
      className={`fixed bg-white border border-gray-300 shadow-2xl transition-all duration-300 ease-out ${
        isClosing ? 'scale-75 opacity-0' : isAnimated ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
      } rounded-lg overflow-hidden`}
      style={{
        width: windowSize.width,
        height: windowSize.height,
        left: `50%`,
        top: `50%`,
        transform: `translate(calc(-50% + ${windowPosition.x}px), calc(-50% + ${windowPosition.y}px))`,
        zIndex: zIndex || 1000,
      }}
      onClick={() => onFocus?.()}
    >
      {/* Resize handles */}
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

      {/* Title Bar */}
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
            className="w-3 h-3 bg-green-500 rounded-full hover:bg-green-600 transition-colors cursor-pointer relative flex items-center justify-center"
            onMouseDown={(e) => e.stopPropagation()}
            onMouseEnter={() => setHoveredButton('maximize')}
            onMouseLeave={() => setHoveredButton(null)}
          >
            {hoveredButton === 'maximize' && (
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none" className="absolute">
                <path d="M4 1V7M1 4H7" stroke="black" strokeWidth="1" strokeLinecap="round"/>
              </svg>
            )}
          </button>
        </div>
        
        <div className="flex items-center gap-3 ml-6">
          <span className="font-medium text-gray-800">Send me an email</span>
        </div>
      </div>

      {/* Email Form Content */}
      <div className="flex-1 p-8 overflow-auto min-h-0">
        <div className="mb-6">
          <p className="text-gray-600 mb-6">
            Get in touch with me! Your message will be sent directly to <strong>kylemeng11@outlook.com</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 h-full flex flex-col">
          {/* Status Messages */}
          {submitStatus === 'success' && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-green-800 font-medium">Email sent successfully! Thank you for your message.</p>
              </div>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-red-800 font-medium">Failed to send email. Please try again later or send an email directly to kylemeng11@outlook.com</p>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              disabled={isSubmitting}
              className={`w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                isSubmitting ? 'bg-gray-50 cursor-not-allowed' : ''
              }`}
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              disabled={isSubmitting}
              className={`w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                isSubmitting ? 'bg-gray-50 cursor-not-allowed' : ''
              }`}
              required
            />
          </div>

          <div className="flex-1 flex flex-col">
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              disabled={isSubmitting}
              rows={8}
              className={`flex-1 w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none min-h-[200px] ${
                isSubmitting ? 'bg-gray-50 cursor-not-allowed' : ''
              }`}
              required
            />
          </div>

          <div className="flex justify-end pt-6 mt-auto">
            <button
              type="submit"
              disabled={isSubmitting || submitStatus === 'success'}
              className={`px-8 py-3 rounded-md font-medium transition-colors flex items-center ${
                isSubmitting || submitStatus === 'success'
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
            >
              {isSubmitting && (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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