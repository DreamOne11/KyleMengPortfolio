import React, { useEffect } from 'react';
import { gsap } from 'gsap';

interface KeyInfo {
  letter: string;
  x: number;   // px
  y: number;   // px
  r: number;   // deg
  z: number;   // stacking order
}

/* 手动排布坐标、角度、层级 */
const keyLayout: KeyInfo[] = [
  /* 上排  K Y L E */
  { letter: 'K', x:   0, y:  -4, r: -12, z: 1 },
  { letter: 'Y', x:  70, y:  50, r: -12, z: 1 },
  { letter: 'L', x: 165, y:  20, r: -12, z: 2 },
  { letter: 'E', x: 255, y:   0, r: -12, z: 2 },

  /* 下排  M E N G */
  { letter: 'M', x:  22, y: 160, r: -12, z: 1 },
  { letter: 'E', x: 115, y: 140, r: -12, z: 1 },
  { letter: 'N', x: 210, y: 108, r: -12, z: 2 },
  { letter: 'G', x: 280, y: 150, r: -12, z: 3 },
];

export default function KeyboardLogoStacked() {
  /* 悬停动画：压下 & 弹起 */
  useEffect(() => {
    const inProps  = { y: 6,   scale: 0.96, duration: 0.15, ease: 'power1.out' };
    const outProps = { y: 0,   scale: 1,    duration: 0.20, ease: 'power1.in'  };

    const keys = document.querySelectorAll<HTMLImageElement>('.key');

    keys.forEach(k => {
      k.addEventListener('pointerenter', () => gsap.to(k, inProps));
      k.addEventListener('pointerleave', () => gsap.to(k, outProps));
    });

    /* 清理事件监听 */
    return () =>
      keys.forEach(k => {
        k.removeEventListener('pointerenter', () => gsap.to(k, inProps));
        k.removeEventListener('pointerleave', () => gsap.to(k, outProps));
      });
  }, []);

  return (
    <div className="relative w-[360px] h-[220px]">
      {keyLayout.map(({ letter, x, y, r, z }) => (
        <img
          key={`${letter}-${x}-${y}`}
          src={`/img/keys/key-${letter.toLowerCase()}.png`}
          alt={letter}
          draggable={false}
          className="key absolute w-28"
          style={{
            left: x,
            top: y,
            transform: `rotate(${r}deg)`,
            zIndex: z,
          }}
        />
      ))}
    </div>
  );
}
