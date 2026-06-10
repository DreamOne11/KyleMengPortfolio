/* keyboard-logo/DecoIcons.tsx — 装饰图标 SVG 重绘
   统一风格（与键帽一致）：奶油色顶面 + 黑描边 + 向下挤出的深色侧壁 + 单侧渐变亮边。
   每个图标根节点是 <svg data-deco-inner>（待机循环写它），内层 <g data-burst>（hover 互动写它），
   两层 transform 互不冲突。painted 区域才响应指针，透明部分不挡键帽。 */
import React from 'react';

export const CREAM = '#F4EFE5';
export const OUTLINE = '#131316';

interface ExtrudedProps {
  d: string;
  depth: number;
  gradId: string;
  accent: [string, string];
  /** 左右最宽点的竖向连接描边（上端点坐标） */
  sides?: [number, number][];
  face?: string;
  children?: React.ReactNode;
}

/** 通用「平面伪 3D 挤出」：底层副本(渐变填充+描边) + 中间副本填缝 + 顶面 */
function Extruded({ d, depth, gradId, accent, sides = [], face = CREAM, children }: ExtrudedProps) {
  return (
    <>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={OUTLINE} />
          <stop offset="52%" stopColor={OUTLINE} />
          <stop offset="74%" stopColor={accent[0]} />
          <stop offset="100%" stopColor={accent[1]} />
        </linearGradient>
      </defs>
      <path d={d} transform={`translate(0 ${depth})`} fill={`url(#${gradId})`} stroke={OUTLINE} strokeWidth="3" strokeLinejoin="round" />
      <path d={d} transform={`translate(0 ${depth * 0.66})`} fill={`url(#${gradId})`} />
      <path d={d} transform={`translate(0 ${depth * 0.33})`} fill={`url(#${gradId})`} />
      {sides.map(([x, y], i) => (
        <line key={i} x1={x} y1={y} x2={x} y2={y + depth} stroke={OUTLINE} strokeWidth="3" strokeLinecap="round" />
      ))}
      <path d={d} fill={face} stroke={OUTLINE} strokeWidth="3" strokeLinejoin="round" />
      {children}
    </>
  );
}

const svgProps = {
  'data-deco-inner': true,
  className: 'w-full block',
  style: {
    overflow: 'visible' as const,
    pointerEvents: 'none' as const,
    /* 投射阴影：装饰浮在键帽上方，影子落在被遮挡的键帽表面上（光源右上 → 影子偏左下） */
    filter: 'drop-shadow(-6px 9px 7px rgba(19, 19, 22, 0.30))',
  },
};
const burstProps = {
  'data-burst': true,
  style: { pointerEvents: 'visiblePainted' as const },
};

/* ───────── 四角星（闪光） ───────── */
const STAR_D = 'M 50 2 C 54 28 72 46 98 50 C 72 54 54 72 50 98 C 46 72 28 54 2 50 C 28 46 46 28 50 2 Z';

export function TwinkleStar({ id }: { id: string }) {
  return (
    <svg {...svgProps} viewBox="0 0 100 112">
      <g {...burstProps}>
        <Extruded d={STAR_D} depth={10} gradId={`deco-star-${id}`} accent={['#FF8A3D', '#FF5FA8']} sides={[[2, 50], [98, 50]]} />
      </g>
    </svg>
  );
}

/* ───────── 信封方块 ───────── */
const MAIL_D = 'M 24 2 L 76 2 C 88 2 98 12 98 24 L 98 76 C 98 88 88 98 76 98 L 24 98 C 12 98 2 88 2 76 L 2 24 C 2 12 12 2 24 2 Z';

export function MailTile() {
  return (
    <svg {...svgProps} viewBox="0 0 100 112">
      <g {...burstProps}>
        <Extruded d={MAIL_D} depth={10} gradId="deco-mail" accent={['#C66BF0', '#FF5FA8']} sides={[[2, 50], [98, 50]]}>
          <rect x="27" y="36" width="46" height="30" rx="5" fill="none" stroke={OUTLINE} strokeWidth="3" />
          <path d="M 30 41 L 50 56 L 70 41" fill="none" stroke={OUTLINE} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </Extruded>
      </g>
    </svg>
  );
}

/* ───────── 代码窗口（含开合的 </>） ───────── */
const WINDOW_D = 'M 12 2 L 138 2 C 144 2 148 6 148 12 L 148 94 C 148 100 144 104 138 104 L 12 104 C 6 104 2 100 2 94 L 2 12 C 2 6 6 2 12 2 Z';

export interface BracketRefs {
  l: React.Ref<SVGPathElement>;
  s: React.Ref<SVGPathElement>;
  r: React.Ref<SVGPathElement>;
}

export function CodeWindow({ brackets }: { brackets: BracketRefs }) {
  return (
    <svg {...svgProps} viewBox="0 0 150 116">
      <g {...burstProps}>
        <Extruded d={WINDOW_D} depth={9} gradId="deco-window" accent={['#3FCB7E', '#2AA6C5']} sides={[[2, 60], [148, 60]]}>
          <path d="M 2 26 L 148 26" stroke={OUTLINE} strokeWidth="3" />
          <circle cx="14" cy="14" r="3" fill={OUTLINE} />
          <circle cx="26" cy="14" r="3" fill={OUTLINE} />
          {/* </> 开合动画目标（外层 g 供 hover burst，path 供待机循环） */}
          <g transform="translate(35 38)">
            <g data-bracket-g="l">
              <path ref={brackets.l} d="M24 10 L12 25 L24 40" stroke={OUTLINE} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </g>
            <g data-bracket-g="s">
              <path ref={brackets.s} d="M34 8 L46 42" stroke={OUTLINE} strokeWidth="4" strokeLinecap="round" fill="none" />
            </g>
            <g data-bracket-g="r">
              <path ref={brackets.r} d="M56 10 L68 25 L56 40" stroke={OUTLINE} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </g>
          </g>
        </Extruded>
      </g>
    </svg>
  );
}

/* ───────── 铅笔 ───────── */
const PENCIL_D = 'M 10 14 L 168 14 L 212 33 L 212 35 L 168 54 L 10 54 C 5 54 2 51 2 46 L 2 22 C 2 17 5 14 10 14 Z';

export function Pencil() {
  return (
    <svg {...svgProps} viewBox="0 0 220 72">
      <g {...burstProps}>
        <defs>
          <linearGradient id="deco-pencil-tip" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF8A3D" />
            <stop offset="100%" stopColor="#FF5FA8" />
          </linearGradient>
        </defs>
        <Extruded d={PENCIL_D} depth={8} gradId="deco-pencil" accent={['#C66BF0', '#FF5FA8']} sides={[[2, 46], [212, 35]]}>
          <path d="M 12 27 L 164 27" stroke="#DCD5C6" strokeWidth="2.5" />
          <path d="M 12 41 L 164 41" stroke="#DCD5C6" strokeWidth="2.5" />
          <path d="M 168 14 L 212 33 L 212 35 L 168 54 Z" fill="url(#deco-pencil-tip)" stroke={OUTLINE} strokeWidth="3" strokeLinejoin="round" />
          <path d="M 196 26 L 212 33 L 212 35 L 196 42 Z" fill={OUTLINE} />
        </Extruded>
      </g>
    </svg>
  );
}

/* ───────── 指点的手 ───────── */
const HAND_D =
  'M 30 52 L 30 13 C 30 4 44 4 44 13 L 44 44 C 49 41 56 41 58 45 C 63 42 70 42 72 46 C 78 44 84 47 84 53 L 84 76 C 84 92 72 102 56 102 L 44 102 C 30 102 20 92 20 78 L 20 62 C 20 55 25 52 30 52 Z';

export function HandPointer() {
  return (
    <svg {...svgProps} viewBox="0 0 90 112">
      <g {...burstProps}>
        <Extruded d={HAND_D} depth={8} gradId="deco-hand" accent={['#C66BF0', '#FF5FA8']} sides={[[20, 74], [84, 70]]}>
          <path d="M 58 45 L 58 56" stroke={OUTLINE} strokeWidth="3" strokeLinecap="round" />
          <path d="M 72 46 L 72 57" stroke={OUTLINE} strokeWidth="3" strokeLinecap="round" />
        </Extruded>
      </g>
    </svg>
  );
}

/* ───────── 聊天气泡（含三个打字点） ───────── */
const BUBBLE_D =
  'M 38 2 L 126 2 C 146 2 160 14 160 30 C 160 46 146 58 126 58 L 46 58 L 16 76 L 27 56 C 15 51 8 41 8 30 C 8 14 22 2 38 2 Z';

export function ChatBubble() {
  return (
    <svg {...svgProps} viewBox="0 0 170 88">
      <g {...burstProps}>
        <Extruded d={BUBBLE_D} depth={9} gradId="deco-bubble" accent={['#8A5CF6', '#C66BF0']} sides={[[8, 38], [160, 38]]}>
          {[0, 1, 2].map(i => (
            <circle
              key={i}
              data-dot={i + 1}
              cx={60 + i * 24}
              cy="30"
              r="7"
              fill="#FFFFFF"
              stroke={OUTLINE}
              strokeWidth="2.5"
            />
          ))}
        </Extruded>
      </g>
    </svg>
  );
}

/* ───────── 巡游箭头光标（扁平，无挤出；浮得最高 → 影子最远最散） ───────── */
export function CursorArrow() {
  return (
    <svg
      {...svgProps}
      viewBox="0 0 56 80"
      style={{ ...svgProps.style, filter: 'drop-shadow(-8px 13px 9px rgba(19, 19, 22, 0.32))' }}
    >
      <path
        d="M 5 2 L 5 62 L 19 49 L 29 72 L 40 67 L 31 45 L 49 43 Z"
        fill={CREAM}
        stroke={OUTLINE}
        strokeWidth="4"
        strokeLinejoin="round"
      />
    </svg>
  );
}
