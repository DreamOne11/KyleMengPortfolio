/* src/components/KeyboardLogoStacked.tsx */
import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useResponsive } from '../../utils/responsive';

/* ───────── 键帽排布 ───────── */
interface KeyInfo {
  letter: string;
  x: number;
  y: number;
  r: number;
  z: number;
}

/* 把尖端移出中心：正数 → 右下，负数 → 左上 */
const CURSOR_OFFSET = { dx: 12, dy: 12 };

const standardKeyLayout: KeyInfo[] = [
  { letter: 'K', x:   0, y:  -4, r: -12, z: 1 },
  { letter: 'Y', x:  70, y:  50, r: -12, z: 1 },
  { letter: 'L', x: 165, y:  20, r: -12, z: 2 },
  { letter: 'E', x: 255, y:   0, r: -12, z: 2 },
  { letter: 'M', x:  22, y: 160, r: -12, z: 1 },
  { letter: 'E', x: 115, y: 140, r: -12, z: 1 },
  { letter: 'N', x: 210, y: 108, r: -12, z: 2 },
  { letter: 'G', x: 280, y: 150, r: -12, z: 3 },
];

/* ───────── 组件 ───────── */
export default function KeyboardLogoStacked() {
  /* ① 响应式信息 */
  const responsive = useResponsive();

  /* ② 重要节点引用 */
  const divRef     = useRef<HTMLImageElement>(null);
  const noteRef    = useRef<HTMLImageElement>(null);
  const cursorRef  = useRef<HTMLImageElement>(null);
  const floatRef   = useRef<HTMLImageElement>(null);
  const audioRef   = useRef<HTMLAudioElement | null>(null);
  const animationsRef = useRef<gsap.core.Animation[]>([]);

  /* ③ 音效懒加载（首次交互时才创建） */
  const playSound = () => {
    if (!audioRef.current) {
      const audio = new Audio('/audio/key-press.mp3');
      audio.preload = 'auto';
      audio.volume = 0.5;
      audioRef.current = audio;
    }

    const snd = audioRef.current;
    snd.currentTime = 0;
    snd.play().catch(() => {/* 忽略自动播放拦截 */});
  };

  /* ④ 按键动画函数 */
  const press = (el: HTMLImageElement) => gsap.to(el, { y: 6, scale: .96, duration: .15, ease: 'power1.out' });
  const release = (el: HTMLImageElement) => gsap.to(el, { y: 0, scale: 1, duration: .20, ease: 'power1.in' });

  /* ⑤ 处理键帽事件 */
  const handleEnter = (e: React.PointerEvent<HTMLImageElement>) => {
    if (e.pointerType === 'mouse') {
      press(e.currentTarget);
      playSound();
    }
  };

  const handleLeave = (e: React.PointerEvent<HTMLImageElement>) => {
    if (e.pointerType === 'mouse') {
      release(e.currentTarget);
    }
  };

  /* ⑥ 装载持续动画 */
  useEffect(() => {
    // 清除旧动画
    animationsRef.current.forEach(a => a.kill());
    animationsRef.current = [];

    /* </> 脉冲 */
    if (divRef.current) {
      const pulse = gsap.to(divRef.current, {
        scale: 1.12,
        duration: 0.8,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });
      animationsRef.current.push(pulse);
    }

    /* 光标三角形巡游 */
    if (cursorRef.current) {
      const keySize = responsive.isMobile ? 32 : responsive.isTablet ? 40 : 56;
      const triangleCenters = ['M', 'L', 'G'].map(l => {
        const k = standardKeyLayout.find(i => i.letter === l)!;
        return { x: k.x + keySize, y: k.y + keySize };
      });

      const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.4 });
      [...triangleCenters, triangleCenters[0]].forEach(({ x, y }, idx) => {
        tl.to(
          cursorRef.current!,
          {
            left: x + CURSOR_OFFSET.dx,
            top: y + CURSOR_OFFSET.dy,
            duration: 0.8,
            ease: 'power2.inOut',
          },
          idx === 0 ? 0 : '>'
        );
      });
      animationsRef.current.push(tl);
    }

    /* 指针轻浮 */
    if (floatRef.current) {
      const floatAnim = gsap.to(floatRef.current, {
        y: -5,
        duration: 1.5,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });
      animationsRef.current.push(floatAnim);
    }

    return () => {
      animationsRef.current.forEach(a => a.kill());
    };
  }, [responsive.isMobile, responsive.isTablet]);

  /* ⑦ 获取元素位置 */
  const getPosition = (type: 'div' | 'note' | 'float') => {
    if (responsive.isMobile) {
      if (type === 'div') return { left: 90, top: -12 };
      if (type === 'note') return { left: 40, top: -80 };
      return { left: 165, top: 10 }; // float
    }
    if (responsive.isTablet) {
      if (type === 'div') return { left: 110, top: -15 };
      if (type === 'note') return { left: 50, top: -95 };
      return { left: 240, top: 15 }; // float
    }
    if (type === 'div') return { left: 140, top: -18 };
    if (type === 'note') return { left: 110, top: -43 };
    return { left: 320, top: 75 }; // float
  };

  /* ⑧ 获取元素尺寸 */
  const getSize = (type: 'key' | 'div' | 'note' | 'cursor' | 'float') => {
    if (responsive.isMobile) {
      if (type === 'key') return 'w-16';
      if (type === 'div') return 'w-10';
      if (type === 'note') return 'w-32';
      if (type === 'float') return 'w-8';
      return 'w-10'; // cursor
    }
    if (responsive.isTablet) {
      if (type === 'key') return 'w-28';
      if (type === 'div') return 'w-16';
      if (type === 'note') return 'w-32';
      if (type === 'float') return 'w-10';
      return 'w-12'; // cursor
    }
    if (type === 'key') return 'w-28';
    if (type === 'div') return 'w-16';
    if (type === 'note') return 'w-32';
    if (type === 'float') return 'w-20';
    return 'w-16'; // cursor
  };

  /* ⑨ 获取容器尺寸 */
  const getContainerSize = () => {
    if (responsive.isMobile) return 'w-[200px] h-[120px]';
    if (responsive.isTablet) return 'w-[280px] h-[170px]';
    return 'w-[440px] h-[260px]';
  };

  /* 渲染 */
  const keySize = responsive.isMobile ? 32 : responsive.isTablet ? 40 : 56;
  const initialCursorPos = {
    left: standardKeyLayout.find(k => k.letter === 'M')!.x + keySize + CURSOR_OFFSET.dx,
    top: standardKeyLayout.find(k => k.letter === 'M')!.y + keySize + CURSOR_OFFSET.dy
  };

  return (
    <div className={`relative ${getContainerSize()} select-none flex items-center justify-center mx-auto`}>
      {/* 键帽 */}
      {standardKeyLayout.map(({ letter, x, y, r, z }, index) => (
        <img
          key={`${letter}-${x}-${y}`}
          src={`/img/keys/key-${letter.toLowerCase()}.png`}
          alt={letter}
          draggable={false}
          className={`absolute ${getSize('key')} pointer-events-auto`}
          style={{ left: x, top: y, transform: `rotate(${r}deg)`, zIndex: z }}
          onPointerEnter={handleEnter}
          onPointerLeave={handleLeave}
        />
      ))}

      {/* </> 图标 */}
      <img
        ref={divRef}
        src="/img/icon/div.png"
        alt="div-icon"
        draggable={false}
        className={`absolute ${getSize('div')}`}
        style={{ ...getPosition('div'), zIndex: 1 }}
      />
      
      {/* 笔记图标 - 在移动设备上隐藏以节省空间 */}
      {!responsive.isMobile && (
        <img
          ref={noteRef}
          src="/img/icon/div_bg.png"
          alt="note-bg"
          draggable={false}
          className={`absolute ${getSize('note')}`}
          style={{ ...getPosition('note'), zIndex: 0 }}
        />
      )}
      
      {/* 指针图标 */}
      <img
        ref={floatRef}
        src="/img/icon/pointer.png"
        alt="pointer"
        draggable={false}
        className={`absolute ${getSize('float')}`}
        style={{ ...getPosition('float'), zIndex: 4, pointerEvents: 'none' }}
      />
      
      {/* 光标图标 */}
      <img
        ref={cursorRef}
        src="/img/icon/cursor.png"
        alt="cursor"
        draggable={false}
        className={`absolute ${getSize('cursor')}`}
        style={{
          left: initialCursorPos.left,
          top: initialCursorPos.top,
          zIndex: 5,
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
