import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

/* ---------------- 键帽排布 ---------------- */
interface KeyInfo {
  letter: string;
  x: number;
  y: number;
  r: number;
  z: number;
}

/* 把尖端移出中心：正数 → 右下，负数 → 左上 */
const CURSOR_OFFSET = { dx: 12, dy: 12 };

const keyLayout: KeyInfo[] = [
  { letter: 'K', x:   0, y:  -4, r: -12, z: 1 },
  { letter: 'Y', x:  70, y:  50, r: -12, z: 1 },
  { letter: 'L', x: 165, y:  20, r: -12, z: 2 }, // triangle-B
  { letter: 'E', x: 255, y:   0, r: -12, z: 2 },
  { letter: 'M', x:  22, y: 160, r: -12, z: 1 }, // triangle-A
  { letter: 'E', x: 115, y: 140, r: -12, z: 1 },
  { letter: 'N', x: 210, y: 108, r: -12, z: 2 },
  { letter: 'G', x: 280, y: 150, r: -12, z: 3 }, // triangle-C
];

/* 三角形路径中心点（M → L → G） */
const triangleCenters = ['M', 'L', 'G'].map(l => {
  const k = keyLayout.find(i => i.letter === l)!;
  return { x: k.x + 56, y: k.y + 56 };   // 56 = 112/2
});

/* ---------------- 组件 ------------------- */
export default function KeyboardLogoStacked() {
  const cursorRef = useRef<HTMLImageElement>(null);
  const divRef    = useRef<HTMLImageElement>(null);
  const noteRef   = useRef<HTMLImageElement>(null);

  useEffect(() => {
    /* 1. 键帽悬停按压 */
    const inProps  = { y: 6, scale: 0.96, duration: .15, ease: 'power1.out' };
    const outProps = { y: 0, scale: 1,   duration: .20, ease: 'power1.in'  };
    const keys = document.querySelectorAll<HTMLImageElement>('.key');
    keys.forEach(k => {
      k.addEventListener('pointerenter', () => gsap.to(k, inProps));
      k.addEventListener('pointerleave', () => gsap.to(k, outProps));
    });

    /* 2. </> 图标脉冲 */
    if (divRef.current) {
      gsap.to(divRef.current, {
        scale: 1.12,
        duration: .8,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });
    }

    /* 3. 光标按三角形游走（left/top） */
    if (cursorRef.current) {
      const tl = gsap.timeline({ repeat: -1, repeatDelay: .4 });
      [...triangleCenters, triangleCenters[0]].forEach(({ x, y }, idx) => {
        tl.to(cursorRef.current!, {
          left: x + CURSOR_OFFSET.dx,
          top:  y + CURSOR_OFFSET.dy,
          duration: .8,
          ease: 'power2.inOut',
        }, idx === 0 ? 0 : '>');
      });
    }

    /* 清理监听器 */
    return () =>
      keys.forEach(k => {
        k.removeEventListener('pointerenter', () => gsap.to(k, inProps));
        k.removeEventListener('pointerleave', () => gsap.to(k, outProps));
      });
  }, []);

  return (
    <div className="relative w-[360px] h-[220px] select-none">
      {/* 键帽 */}
      {keyLayout.map(({ letter, x, y, r, z }) => (
        <img
          key={`${letter}-${x}-${y}`}
          src={`/img/keys/key-${letter.toLowerCase()}.png`}
          alt={letter}
          draggable={false}
          className="key absolute w-28"
          style={{ left: x, top: y, transform: `rotate(${r}deg)`, zIndex: z }}
        />
      ))}

      {/* </> 图标 */}
      <img
        ref={divRef}
        src="/img/icon/div.png"
        alt="code-icon"
        className="absolute w-16"
        style={{ left: 134, top: -18, zIndex: 1 }}
        draggable={false}
      />
    {/* </> 图标 */}
    <img
        ref={noteRef}
        src="/img/icon/note_bg.png"
        alt="note-icon"
        className="absolute w-56"
        style={{ left: 60, top: -115, zIndex: 0 }}
        draggable={false}
      />
      {/* 光标图标（起点 = M 键中心） */}
      <img
        ref={cursorRef}
        src="/img/icon/cursor.png"
        alt="cursor-icon"
        className="absolute w-16"
        style={{
          left: triangleCenters[0].x + CURSOR_OFFSET.dx,
          top:  triangleCenters[0].y + CURSOR_OFFSET.dy,
          zIndex: 5,
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }}
        draggable={false}
      />
    </div>
  );
}
