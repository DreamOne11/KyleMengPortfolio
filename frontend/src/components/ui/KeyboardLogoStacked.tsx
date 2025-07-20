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
  
  const noteRef    = useRef<HTMLImageElement>(null);
  const cursorRef  = useRef<HTMLImageElement>(null);
  const floatRef   = useRef<HTMLImageElement>(null);
  const mailRef    = useRef<HTMLImageElement>(null);
  const pencilRef  = useRef<HTMLImageElement>(null);
  const starLargeRef = useRef<HTMLImageElement>(null);
  const starSmallRef = useRef<HTMLImageElement>(null);
  const chatBubbleRef = useRef<HTMLImageElement>(null);
  const period1Ref = useRef<HTMLImageElement>(null);
  const period2Ref = useRef<HTMLImageElement>(null);
  const period3Ref = useRef<HTMLImageElement>(null);
  const leftBracketRef = useRef<SVGPathElement>(null);
  const slashRef = useRef<SVGPathElement>(null);
  const rightBracketRef = useRef<SVGPathElement>(null);
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

    /* </> 左右开合动画 */
    if (leftBracketRef.current && slashRef.current && rightBracketRef.current) {
      const openCloseAnimation = gsap.timeline({
        repeat: -1,
        yoyo: true,
        duration: 1.5,
        ease: 'sine.inOut',
      });
      
      openCloseAnimation
        .to(leftBracketRef.current, {
          x: -6,
          scaleX: 1.2,
        }, 0)
        .to(rightBracketRef.current, {
          x: 6,
          scaleX: 1.2,
        }, 0)
        .to(slashRef.current, {
          scaleX: 1.15,
        }, 0);
      
      animationsRef.current.push(openCloseAnimation);
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

    /* 星星相互浮动效果 */
    if (starLargeRef.current) {
      const starLargeFloat = gsap.to(starLargeRef.current, {
        y: -8,
        duration: 1.8,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });
      animationsRef.current.push(starLargeFloat);
    }

    if (starSmallRef.current) {
      const starSmallFloat = gsap.to(starSmallRef.current, {
        y: -6,
        duration: 2.2,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: 0.5, // 相位差
      });
      animationsRef.current.push(starSmallFloat);
    }

    /* mail 摇摆动画 */
    if (mailRef.current) {
      const mailSway = gsap.to(mailRef.current, {
        rotation: 5,
        duration: 2.5,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });
      animationsRef.current.push(mailSway);
    }

    /* pencil x轴左右移动动画 */
    if (pencilRef.current) {
      const pencilMove = gsap.to(pencilRef.current, {
        x: 6,
        duration: 2.8,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: 0.8, // 与mail不同步
      });
      animationsRef.current.push(pencilMove);
    }

    /* note x轴左右移动动画 */
    if (noteRef.current) {
      const noteMove = gsap.to(noteRef.current, {
        x: -4,
        duration: 3.2,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: 0.5,
      });
      animationsRef.current.push(noteMove);
    }

    /* chat bubble 上下左右浮动动画 */
    if (chatBubbleRef.current) {
      const chatBubbleFloat = gsap.timeline({ repeat: -1 });
      chatBubbleFloat
        .to(chatBubbleRef.current, {
          x: 3,
          y: -4,
          duration: 2,
          ease: 'sine.inOut',
        })
        .to(chatBubbleRef.current, {
          x: -2,
          y: 3,
          duration: 2.5,
          ease: 'sine.inOut',
        })
        .to(chatBubbleRef.current, {
          x: 2,
          y: -2,
          duration: 1.8,
          ease: 'sine.inOut',
        })
        .to(chatBubbleRef.current, {
          x: 0,
          y: 0,
          duration: 2.2,
          ease: 'sine.inOut',
                 });
       animationsRef.current.push(chatBubbleFloat);
     }

    /* 三个句号从左到右有序跳动动画 */
    if (period1Ref.current) {
      const period1Jump = gsap.to(period1Ref.current, {
        y: -8,
        duration: 0.6,
        ease: 'power2.inOut',
        yoyo: true,
        repeat: -1,
      });
      animationsRef.current.push(period1Jump);
    }

    if (period2Ref.current) {
      const period2Jump = gsap.to(period2Ref.current, {
        y: -8,
        duration: 0.6,
        ease: 'power2.inOut',
        yoyo: true,
        repeat: -1,
        delay: 0.2, // 延迟0.2秒
      });
      animationsRef.current.push(period2Jump);
    }

    if (period3Ref.current) {
      const period3Jump = gsap.to(period3Ref.current, {
        y: -8,
        duration: 0.6,
        ease: 'power2.inOut',
        yoyo: true,
        repeat: -1,
        delay: 0.4, // 延迟0.4秒
      });
      animationsRef.current.push(period3Jump);
    }

    return () => {
      animationsRef.current.forEach(a => a.kill());
    };
  }, [responsive.isMobile, responsive.isTablet]);

  /* ⑦ 获取元素位置 */
  const getPosition = (type: 'div' | 'note' | 'float' | 'mail' | 'pencil' | 'star-large' | 'star-small' | 'chat-bubble' | 'period-1' | 'period-2' | 'period-3') => {
    if (responsive.isMobile) {
      if (type === 'div') return { left: 90, top: -12 };
      if (type === 'note') return { left: 40, top: -80 };
      if (type === 'float') return { left: 165, top: 10 };
      if (type === 'mail') return { left: 200, top: -35 };
      if (type === 'pencil') return { left: 240, top: 120 };
      if (type === 'star-large') return { left: -15, top: -25 };
      if (type === 'star-small') return { left: -28, top: -12 };
      if (type === 'chat-bubble') return { left: 65, top: 165 };
      if (type === 'period-1') return { left: 70, top: 150 };
      if (type === 'period-2') return { left: 78, top: 150 };
      return { left: 86, top: 150 }; // period-3
    }
    if (responsive.isTablet) {
      if (type === 'div') return { left: 110, top: -15 };
      if (type === 'note') return { left: 50, top: -95 };
      if (type === 'float') return { left: 240, top: 15 };
      if (type === 'mail') return { left: 255, top: -40 };
      if (type === 'pencil') return { left: 320, top: 180 };
      if (type === 'star-large') return { left: -18, top: -30 };
      if (type === 'star-small') return { left: -32, top: -15 };
      if (type === 'chat-bubble') return { left: 68, top: 185 };
      if (type === 'period-1') return { left: 73, top: 170 };
      if (type === 'period-2') return { left: 82, top: 170 };
      return { left: 91, top: 170 }; // period-3
    }
    if (type === 'div') return { left: 136, top: -20 };
    if (type === 'note') return { left: 120, top: -40 };
    if (type === 'float') return { left: 320, top: 75 };
    if (type === 'mail') return { left: 300, top: -40 };
    if (type === 'pencil') return { left: 250, top: 255 };
    if (type === 'star-large') return { left: -20, top: -35 };
    if (type === 'star-small') return { left: 35, top: -55 };
    if (type === 'chat-bubble') return { left: -10, top: 260 };
    if (type === 'period-1') return { left: 15, top: 280 };
    if (type === 'period-2') return { left: 35, top: 280 };
    return { left: 55, top: 280 }; // period-3
  };

  /* ⑧ 获取元素尺寸 */
  const getSize = (type: 'key' | 'div' | 'note' | 'cursor' | 'float' | 'mail' | 'pencil' | 'star-large' | 'star-small' | 'chat-bubble' | 'period-1' | 'period-2' | 'period-3') => {
    if (responsive.isMobile) {
      if (type === 'key') return 'w-16';
      if (type === 'div') return 'w-10';
      if (type === 'note') return 'w-32';
      if (type === 'float') return 'w-8';
      if (type === 'cursor') return 'w-10';
      if (type === 'mail') return 'w-12';
      if (type === 'pencil') return 'w-12';
      if (type === 'star-large') return 'w-10';
      if (type === 'star-small') return 'w-8';
      if (type === 'chat-bubble') return 'w-14';
      if (type === 'period-1') return 'w-2';
      if (type === 'period-2') return 'w-2';
      return 'w-2'; // period-3
    }
    if (responsive.isTablet) {
      if (type === 'key') return 'w-28';
      if (type === 'div') return 'w-16';
      if (type === 'note') return 'w-32';
      if (type === 'float') return 'w-10';
      if (type === 'cursor') return 'w-12';
      if (type === 'mail') return 'w-14';
      if (type === 'pencil') return 'w-14';
      if (type === 'star-large') return 'w-12';
      if (type === 'star-small') return 'w-10';
      if (type === 'chat-bubble') return 'w-16';
      if (type === 'period-1') return 'w-3';
      if (type === 'period-2') return 'w-3';
      return 'w-3'; // period-3
    }
    if (type === 'key') return 'w-28';
    if (type === 'div') return 'w-12';
    if (type === 'note') return 'w-28';
    if (type === 'float') return 'w-20';
    if (type === 'cursor') return 'w-12';
    if (type === 'mail') return 'w-20';
    if (type === 'pencil') return 'w-40';
    if (type === 'star-large') return 'w-16';
    if (type === 'star-small') return 'w-8';
    if (type === 'chat-bubble') return 'w-40';
    if (type === 'period-1') return 'w-4';
    if (type === 'period-2') return 'w-4';
    return 'w-4'; // period-3
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

      {/* </> SVG 图标 */}
      <div
        className="absolute"
        style={{ 
          ...getPosition('div'), 
          zIndex: 1,
          transform: 'rotate(5deg)'
        }}
      >
        <svg
          width={responsive.isMobile ? 50 : responsive.isTablet ? 70 : 70}
          height={responsive.isMobile ? 32 : responsive.isTablet ? 45 : 45}
          viewBox="0 0 80 50"
          className="pointer-events-none"
          style={{ overflow: 'visible' }}
        >
          {/* 左尖括号 < */}
          <path
            ref={leftBracketRef}
            d="M24 10 L12 25 L24 40"
            stroke="#333"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          
          {/* 斜杠 / */}
          <path
            ref={slashRef}
            d="M34 8 L46 42"
            stroke="#333"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          
          {/* 右尖括号 > */}
          <path
            ref={rightBracketRef}
            d="M56 10 L68 25 L56 40"
            stroke="#333"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </div>
      
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
      
      {/* Mail 图标 */}
      <img
        ref={mailRef}
        src="/img/icon/mail.png"
        alt="mail"
        draggable={false}
        className={`absolute ${getSize('mail')}`}
        style={{ ...getPosition('mail'), zIndex: 3, pointerEvents: 'none' }}
      />
      
      {/* Pencil 图标 */}
      <img
        ref={pencilRef}
        src="/img/icon/pencil.png"
        alt="pencil"
        draggable={false}
        className={`absolute ${getSize('pencil')}`}
        style={{ ...getPosition('pencil'), zIndex: 3, pointerEvents: 'none' }}
      />
      
      {/* Star Large 图标 */}
      <img
        ref={starLargeRef}
        src="/img/icon/star_large.png"
        alt="star-large"
        draggable={false}
        className={`absolute ${getSize('star-large')}`}
        style={{ ...getPosition('star-large'), zIndex: 2, pointerEvents: 'none' }}
      />
      
      {/* Star Small 图标 */}
      <img
        ref={starSmallRef}
        src="/img/icon/star_small.png"
        alt="star-small"
        draggable={false}
        className={`absolute ${getSize('star-small')}`}
        style={{ ...getPosition('star-small'), zIndex: 2, pointerEvents: 'none' }}
      />
      
      {/* Chat Bubble 图标 */}
      <img
        ref={chatBubbleRef}
        src="/img/icon/chat_bubble.png"
        alt="chat-bubble"
        draggable={false}
        className={`absolute ${getSize('chat-bubble')}`}
        style={{ ...getPosition('chat-bubble'), zIndex: 2, pointerEvents: 'none' }}
      />
      
      {/* Period 1 图标 */}
      <img
        ref={period1Ref}
        src="/img/icon/period_1.png"
        alt="period-1"
        draggable={false}
        className={`absolute ${getSize('period-1')}`}
        style={{ ...getPosition('period-1'), zIndex: 3, pointerEvents: 'none' }}
      />
      
      {/* Period 2 图标 */}
      <img
        ref={period2Ref}
        src="/img/icon/period_2.png"
        alt="period-2"
        draggable={false}
        className={`absolute ${getSize('period-2')}`}
        style={{ ...getPosition('period-2'), zIndex: 3, pointerEvents: 'none' }}
      />
      
      {/* Period 3 图标 */}
      <img
        ref={period3Ref}
        src="/img/icon/period_3.png"
        alt="period-3"
        draggable={false}
        className={`absolute ${getSize('period-3')}`}
        style={{ ...getPosition('period-3'), zIndex: 3, pointerEvents: 'none' }}
      />
    </div>
  );
}
