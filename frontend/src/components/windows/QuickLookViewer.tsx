/* QuickLookViewer — macOS Quick Look 风格的照片查看器
   桌面端：浮窗 + 背景压暗，←/→ 切换，Esc/空格 关闭，侧边悬浮箭头；
   移动端：全屏呈现，左右滑动切换，下滑关闭。
   加载策略：先显示已缓存的 card 缩略图（模糊放大），-full.webp 加载完成后淡入；
   相邻照片自动预加载，方向键切换时几乎无等待。 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PhotoResponse } from '../../types/photography';
import { useResponsive } from '../../utils/responsive';

type Props = {
  photos: PhotoResponse[];
  initialIndex: number;
  onClose: () => void;
  zIndex?: number;
};

// 全尺寸展示图优先用 filePath（指向 -full.webp），缺失时回退缩略图
const getDisplaySrc = (photo: PhotoResponse): string =>
  photo.filePath || photo.thumbnailPath || '';

const isEditableTarget = (e: KeyboardEvent): boolean => {
  const target = e.target as HTMLElement | null;
  if (!target) return false;
  return target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
};

const QuickLookViewer: React.FC<Props> = ({ photos, initialIndex, onClose, zIndex = 5000 }) => {
  const responsive = useResponsive();
  const [index, setIndex] = useState(() =>
    Math.min(Math.max(initialIndex, 0), photos.length - 1)
  );
  const [loadedSrcs, setLoadedSrcs] = useState<Record<string, boolean>>({});
  const [failedSrcs, setFailedSrcs] = useState<Record<string, boolean>>({});
  const [isAnimated, setIsAnimated] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const touchStart = useRef({ x: 0, y: 0 });

  const photo = photos[index];
  const fullSrc = photo ? getDisplaySrc(photo) : '';
  // 大图加载失败时回退到缩略图
  const displaySrc = photo && failedSrcs[fullSrc] ? (photo.thumbnailPath || fullSrc) : fullSrc;
  const isLoaded = Boolean(loadedSrcs[displaySrc]);

  const hasPrev = index > 0;
  const hasNext = index < photos.length - 1;

  // 入场动画
  useEffect(() => {
    const raf = requestAnimationFrame(() => setIsAnimated(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(onClose, 200);
  }, [onClose]);

  const goPrev = useCallback(() => setIndex(i => Math.max(i - 1, 0)), []);
  const goNext = useCallback(() => setIndex(i => Math.min(i + 1, photos.length - 1)), [photos.length]);

  // 键盘：Esc/空格 关闭（与 macOS Quick Look 一致），←/→ 切换
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isEditableTarget(e)) return;
      switch (e.key) {
        case 'Escape':
        case ' ':
          e.preventDefault();
          handleClose();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          goPrev();
          break;
        case 'ArrowRight':
          e.preventDefault();
          goNext();
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleClose, goPrev, goNext]);

  // 预加载相邻照片，方向键切换时无需等待
  useEffect(() => {
    [index - 1, index + 1].forEach(i => {
      const neighbor = photos[i];
      if (!neighbor) return;
      const src = getDisplaySrc(neighbor);
      if (src && !loadedSrcs[src]) {
        const img = new Image();
        img.src = src;
      }
    });
  }, [index, photos, loadedSrcs]);

  const markLoaded = (src: string) =>
    setLoadedSrcs(prev => (prev[src] ? prev : { ...prev, [src]: true }));

  const markFailed = (src: string) =>
    setFailedSrcs(prev => (prev[src] ? prev : { ...prev, [src]: true }));

  // 移动端手势：水平滑动切换，下滑关闭
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 2) {
      if (dx < 0) goNext();
      else goPrev();
    } else if (dy > 80 && Math.abs(dy) > Math.abs(dx) * 2) {
      handleClose();
    }
  };

  if (!photo) return null;

  // 照片展示区：缩略图占位（模糊放大）+ 大图淡入
  const renderStage = () => (
    <>
      {!isLoaded && photo.thumbnailPath && (
        <img
          src={photo.thumbnailPath}
          alt=""
          aria-hidden="true"
          draggable={false}
          className="absolute inset-0 w-full h-full object-contain blur-lg scale-105 opacity-60"
        />
      )}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/70"></div>
        </div>
      )}
      <img
        key={displaySrc}
        src={displaySrc}
        alt={photo.title}
        draggable={false}
        onLoad={() => markLoaded(displaySrc)}
        onError={() => markFailed(displaySrc)}
        className={`relative max-w-full max-h-full object-contain transition-opacity duration-300 motion-reduce:transition-none ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </>
  );

  // 移动端：全屏查看
  if (responsive.isMobile) {
    return (
      <div
        className={`fixed inset-0 flex flex-col bg-black transition-opacity duration-200 motion-reduce:transition-none ${
          isAnimated && !isClosing ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ zIndex }}
      >
        {/* 顶栏：关闭 + 标题 + 计数 */}
        <div className="h-12 flex items-center px-3 gap-2 bg-black/80 text-white flex-shrink-0">
          <button
            onClick={handleClose}
            aria-label="Close photo viewer"
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 text-xl"
          >
            ×
          </button>
          <span className="flex-1 text-center text-sm font-medium truncate">{photo.title}</span>
          <span className="text-xs text-white/60 tabular-nums w-9 text-right">
            {index + 1}/{photos.length}
          </span>
        </div>

        {/* 照片区：滑动切换 */}
        <div
          className="relative flex-1 flex items-center justify-center overflow-hidden select-none"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {renderStage()}
        </div>
      </div>
    );
  }

  // 桌面端：Quick Look 浮窗
  return (
    <>
      {/* 背景遮罩，点击关闭 */}
      <div
        className={`fixed inset-0 bg-black/50 transition-opacity duration-200 motion-reduce:transition-none ${
          isAnimated && !isClosing ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ zIndex }}
        onClick={handleClose}
      />

      {/* 查看器面板 */}
      <div
        className={`fixed left-1/2 top-1/2 flex flex-col rounded-xl overflow-hidden shadow-2xl border border-gray-300 bg-[#1c1c1f] transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.1)] motion-reduce:transition-none ${
          isAnimated && !isClosing
            ? 'opacity-100 -translate-x-1/2 -translate-y-1/2 scale-100'
            : 'opacity-0 -translate-x-1/2 -translate-y-1/2 scale-[0.92]'
        }`}
        style={{ zIndex: zIndex + 1, width: 'min(1000px, 86%)', height: 'min(760px, 88%)' }}
        role="dialog"
        aria-label={`Photo viewer: ${photo.title}`}
      >
        {/* 标题栏，样式与其他窗口一致 */}
        <div className="h-10 md:h-12 bg-gray-100 border-b border-gray-300 flex items-center px-2 md:px-4 flex-shrink-0">
          <div className="w-24 flex items-center">
            <button
              onClick={handleClose}
              aria-label="Close photo viewer"
              className="group w-2.5 h-2.5 md:w-3 md:h-3 bg-red-500 rounded-full hover:bg-red-600 transition-colors cursor-pointer relative flex items-center justify-center"
            >
              <svg
                width="8" height="8" viewBox="0 0 8 8" fill="none"
                className="absolute opacity-0 group-hover:opacity-100"
              >
                <path d="M1 1L7 7M7 1L1 7" stroke="black" strokeWidth="1" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <span className="flex-1 text-center font-semibold text-gray-800 text-sm md:text-base truncate">
            {photo.title}
          </span>
          <div className="w-24 flex items-center justify-end">
            <span className="text-xs text-gray-500 tabular-nums">
              {index + 1} / {photos.length}
            </span>
          </div>
        </div>

        {/* 照片舞台 */}
        <div className="relative flex-1 flex items-center justify-center overflow-hidden select-none">
          {renderStage()}

          {/* 左右切换箭头 */}
          {hasPrev && (
            <button
              onClick={goPrev}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-black/35 hover:bg-black/60 text-white/90 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
          {hasNext && (
            <button
              onClick={goNext}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-black/35 hover:bg-black/60 text-white/90 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default QuickLookViewer;
