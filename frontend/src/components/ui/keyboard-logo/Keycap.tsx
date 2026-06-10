/* keyboard-logo/Keycap.tsx — 单个分层 SVG 键帽
   分层结构（互不抢写 transform）：
   - 外层 div：静态布局（left/top/rotate/z），入场动画写这里
   - proximity div：仅鼠标接近感应 (quickTo x/y/rotation) 写这里
   - svg 内 capRef：仅按压/释放写 y；baseRef（底座+侧面）与阴影固定 */
import React, { useImperativeHandle, useRef } from 'react';
import { gsap } from 'gsap';
import {
  KeycapDef, KEY_SIZE, VIEWBOX, PRESS_DEPTH, MOTION,
  CAP_PATH, WALL_DARK_PATH, WALL_GRAD_PATH, SILHOUETTE_PATH,
} from './keycapConfig';

export interface KeycapHandle {
  press(): void;
  release(): void;
  /** proximity wrapper，供 quickTo 和 rect 测量 */
  el: HTMLDivElement | null;
}

interface KeycapProps {
  def: KeycapDef;
  onSound?: () => void;
  ref?: React.Ref<KeycapHandle>;
}

const OUTLINE = '#131316';
const SIDE_DARK = '#0c0c0f';

export default function Keycap({ def, onSound, ref }: KeycapProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const proximityRef = useRef<HTMLDivElement>(null);
  const capRef = useRef<SVGGElement>(null);
  const shadowRef = useRef<SVGEllipseElement>(null);

  const press = () => {
    if (!capRef.current || !shadowRef.current) return;
    gsap.to(capRef.current, {
      y: PRESS_DEPTH,
      duration: MOTION.dur.press,
      ease: MOTION.ease.pressIn,
      overwrite: 'auto',
    });
    gsap.to(shadowRef.current, {
      scale: 0.88,
      opacity: 0.85,
      transformOrigin: 'center',
      duration: MOTION.dur.press,
      ease: MOTION.ease.pressIn,
      overwrite: 'auto',
    });
  };

  const release = () => {
    if (!capRef.current || !shadowRef.current) return;
    gsap.to(capRef.current, {
      y: 0,
      duration: MOTION.dur.release,
      ease: MOTION.ease.release,
      overwrite: 'auto',
    });
    gsap.to(shadowRef.current, {
      scale: 1,
      opacity: 0.7,
      transformOrigin: 'center',
      duration: MOTION.dur.release,
      ease: MOTION.ease.release,
      overwrite: 'auto',
    });
  };

  useImperativeHandle(ref, () => ({ press, release, get el() { return proximityRef.current; } }));

  const handleEnter = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    press();
    onSound?.();
  };

  const handleLeave = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    release();
  };

  const gradId = `kb-facet-${def.id}`;
  const shadowId = `kb-shadow-${def.id}`;
  const height = (KEY_SIZE * VIEWBOX.h) / VIEWBOX.w;

  return (
    <div
      ref={wrapperRef}
      data-keycap={def.id}
      className="absolute pointer-events-auto cursor-pointer"
      style={{
        left: def.x,
        top: def.y,
        width: KEY_SIZE,
        height,
        transform: `rotate(${def.r}deg)`,
        zIndex: def.z,
      }}
      onPointerEnter={handleEnter}
      onPointerLeave={handleLeave}
    >
      <div ref={proximityRef} data-keycap-proximity className="w-full h-full">
        <svg
          viewBox={`0 0 ${VIEWBOX.w} ${VIEWBOX.h}`}
          width={KEY_SIZE}
          height={height}
          style={{
            overflow: 'visible',
            display: 'block',
            /* 投射阴影：落在下层相邻键帽上，表达堆叠关系（光源右上 → 影子偏左下） */
            filter: 'drop-shadow(-4px 6px 5px rgba(19, 19, 22, 0.22))',
          }}
          aria-label={`keycap ${def.letter}`}
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0.4" y2="1">
              <stop offset="0%" stopColor={def.facet[0]} />
              <stop offset="45%" stopColor={def.facet[1]} />
              <stop offset="100%" stopColor={def.facet[2]} />
            </linearGradient>
            <radialGradient id={shadowId}>
              <stop offset="0%" stopColor="#000" stopOpacity="0.28" />
              <stop offset="70%" stopColor="#000" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#000" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* 地面阴影（按压时收缩加深） */}
          <ellipse
            ref={shadowRef}
            cx="60"
            cy="127"
            rx="54"
            ry="11"
            fill={`url(#${shadowId})`}
            opacity="0.7"
          />

          {/* 底座：深色侧面 + 渐变侧面 + 外轮廓描边（永不移动） */}
          <g data-keycap-base>
            <path d={WALL_DARK_PATH} fill={SIDE_DARK} />
            <path d={WALL_GRAD_PATH} fill={`url(#${gradId})`} />
            <path
              d={SILHOUETTE_PATH}
              fill="none"
              stroke={OUTLINE}
              strokeWidth="3"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </g>

          {/* 顶面 + 字母（按压时整组下沉） */}
          <g ref={capRef}>
            <path
              d={CAP_PATH}
              fill={def.cap}
              stroke={OUTLINE}
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <text
              x="60"
              y="57"
              textAnchor="middle"
              dominantBaseline="central"
              fontFamily="Georgia, 'Iowan Old Style', 'Times New Roman', serif"
              fontSize="46"
              fontWeight="500"
              fill="#131316"
              transform="rotate(-10 60 56)"
              style={{ userSelect: 'none' }}
            >
              {def.letter}
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
}
