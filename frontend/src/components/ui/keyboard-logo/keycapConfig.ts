/* keyboard-logo/keycapConfig.ts — 键盘 Logo 的全部静态数据与动效 tokens */

/** 舞台固定坐标系（桌面端尺寸，移动端整体 scale） */
export const STAGE = { w: 440, h: 260 };
export const MOBILE_SCALE = 0.76;

/** 键帽渲染宽度（px），与旧 PNG 的 w-28 一致 */
export const KEY_SIZE = 112;

/** SVG 局部坐标系 */
export const VIEWBOX = { w: 120, h: 136 };

/** 侧面挤出高度 = 按压行程上限（SVG 单位） */
export const EXTRUDE = 16;
/** 按压时顶面下沉距离（保留 3px 侧面可见） */
export const PRESS_DEPTH = 13;

export interface KeycapDef {
  id: string;
  letter: string;
  /** 顶面填充色（取色自原 PNG） */
  cap: string;
  /** 右侧渐变面三段色 [上, 中, 下] */
  facet: [string, string, string];
  x: number;
  y: number;
  /** 容器旋转角度 */
  r: number;
  z: number;
}

export const KEYS: KeycapDef[] = [
  { id: 'k',  letter: 'K', cap: '#F86F22', facet: ['#F86F22', '#5F88A9', '#165078'], x:   0, y:  -4, r: -12, z: 1 },
  { id: 'y',  letter: 'Y', cap: '#E6CFFD', facet: ['#E6CFFD', '#58ACFC', '#145A8E'], x:  70, y:  50, r: -12, z: 1 },
  { id: 'l',  letter: 'L', cap: '#7073F5', facet: ['#7073F5', '#F88A8D', '#8B495C'], x: 165, y:  20, r: -12, z: 2 },
  { id: 'e1', letter: 'E', cap: '#6BD69F', facet: ['#6BD69F', '#2AA6C5', '#0A5980'], x: 255, y:   0, r: -12, z: 2 },
  { id: 'm',  letter: 'M', cap: '#4CA5FB', facet: ['#4CA5FB', '#29A6C6', '#0A5880'], x:  22, y: 160, r: -12, z: 1 },
  { id: 'e2', letter: 'E', cap: '#6BD69F', facet: ['#6BD69F', '#2AA6C5', '#0A5980'], x: 115, y: 140, r: -12, z: 1 },
  { id: 'n',  letter: 'N', cap: '#FCD548', facet: ['#FCD548', '#98B052', '#415C30'], x: 210, y: 108, r: -12, z: 2 },
  { id: 'g',  letter: 'G', cap: '#FE4C50', facet: ['#FE4C50', '#FF67A4', '#8F3F6D'], x: 280, y: 150, r: -12, z: 3 },
];

/** 物理键盘联动：字母 → 键帽 id 列表 */
export const LETTER_TO_IDS: Record<string, string[]> = KEYS.reduce((acc, k) => {
  const letter = k.letter.toLowerCase();
  (acc[letter] ??= []).push(k.id);
  return acc;
}, {} as Record<string, string[]>);

/* ───────── 装饰元素 ───────── */

export type DecoLoop =
  | { kind: 'float'; y: number; dur: number; delay?: number }
  | { kind: 'sway'; rotation: number; dur: number; delay?: number }
  | { kind: 'driftX'; x: number; dur: number; delay?: number }
  | { kind: 'bounce'; y: number; dur: number; delay?: number }
  | { kind: 'wander'; path: { x: number; y: number; dur: number }[] };

/** 装饰图标的 SVG 组件类型 */
export type DecoKind = 'star' | 'mail' | 'window' | 'pencil' | 'hand' | 'bubble';

/** hover 互动特效类型（burst 只写内层 [data-burst]，与待机循环零冲突） */
export type DecoBurst = 'spin' | 'ring' | 'brackets' | 'scribble' | 'tap' | 'pop';

export interface DecorationDef {
  id: string;
  kind: DecoKind;
  width: number;
  left: number;
  top: number;
  z: number;
  rotate?: number;
  loop: DecoLoop;
  burst: DecoBurst;
}

/** 时长取 2.4 的黄金比例阶梯错相，避免同步脉冲 */
export const DECORATIONS: DecorationDef[] = [
  { id: 'window',     kind: 'window', width: 116, left: 118, top: -42, z: 1, rotate: 3,  loop: { kind: 'driftX', x: -4, dur: 3.9, delay: 0.5 }, burst: 'brackets' },
  { id: 'hand',       kind: 'hand',   width:  72, left: 326, top:  72, z: 4,             loop: { kind: 'float', y: -5, dur: 1.5 }, burst: 'tap' },
  { id: 'mail',       kind: 'mail',   width:  72, left: 304, top: -38, z: 3, rotate: 8,  loop: { kind: 'sway', rotation: 5, dur: 2.4 }, burst: 'ring' },
  { id: 'pencil',     kind: 'pencil', width: 168, left: 248, top: 258, z: 3, rotate: -4, loop: { kind: 'driftX', x: 6, dur: 3.0, delay: 0.8 }, burst: 'scribble' },
  { id: 'star-large', kind: 'star',   width:  60, left: -18, top: -33, z: 2, rotate: -8, loop: { kind: 'float', y: -8, dur: 1.9 }, burst: 'spin' },
  { id: 'star-small', kind: 'star',   width:  32, left:  38, top: -55, z: 2, rotate: 14, loop: { kind: 'float', y: -6, dur: 2.4, delay: 0.5 }, burst: 'spin' },
  { id: 'bubble',     kind: 'bubble', width: 164, left: -12, top: 256, z: 2,             loop: { kind: 'wander', path: [
    { x: 3, y: -4, dur: 2.0 }, { x: -2, y: 3, dur: 2.4 }, { x: 2, y: -2, dur: 1.9 }, { x: 0, y: 0, dur: 2.2 },
  ] }, burst: 'pop' },
];

/** 气泡内打字点的待机跳动参数 */
export const DOT_BOUNCE = { y: -7, dur: 0.5, stagger: 0.16, repeatDelay: 0.5 };

/** 光标巡游经过的键 */
export const CURSOR_PATROL_KEYS = ['m', 'l', 'g'];
export const CURSOR_OFFSET = { dx: 12, dy: 12 };

/* ───────── 统一动效 tokens ───────── */

export const MOTION = {
  ease: {
    ambient: 'sine.inOut',
    move: 'power2.inOut',
    pressIn: 'power3.out',
    release: 'elastic.out(1, 0.45)',
    pop: 'back.out(1.7)',
  },
  dur: {
    press: 0.09,
    release: 0.5,
    entrance: 0.6,
  },
} as const;

/* ───────── SVG 几何路径（脚本生成：圆角方形旋转 -28°，挤出 16px） ─────────
   生成参数：边长 94、圆角 26、中心 (60,56)、viewBox 0 0 120 136 */

/** 顶面轮廓（完整闭合） */
export const CAP_PATH =
  'M 8.6 59.5 L 7.9,58.0 7.2,56.4 6.7,54.8 6.3,53.2 5.9,51.5 5.7,49.8 5.6,48.1 5.6,46.4 5.7,44.7 6.0,43.0 6.3,41.4 6.7,39.7 7.3,38.1 7.9,36.5 8.7,35.0 9.5,33.5 10.5,32.1 11.5,30.8 12.7,29.5 13.9,28.3 15.1,27.2 16.5,26.1 17.9,25.2 19.4,24.4 56.5,4.6 58.0,3.9 59.6,3.2 61.2,2.7 62.8,2.3 64.5,1.9 66.2,1.7 67.9,1.6 69.6,1.6 71.3,1.7 73.0,2.0 74.6,2.3 76.3,2.7 77.9,3.3 79.5,3.9 81.0,4.7 82.5,5.5 83.9,6.5 85.2,7.5 86.5,8.7 87.7,9.9 88.8,11.1 89.9,12.5 90.8,13.9 91.6,15.4 111.4,52.5 112.1,54.0 112.8,55.6 113.3,57.2 113.7,58.8 114.1,60.5 114.3,62.2 114.4,63.9 114.4,65.6 114.3,67.3 114.0,69.0 113.7,70.6 113.3,72.3 112.7,73.9 112.1,75.5 111.3,77.0 110.5,78.5 109.5,79.9 108.5,81.2 107.3,82.5 106.1,83.7 104.9,84.8 103.5,85.9 102.1,86.8 100.6,87.6 63.5,107.4 62.0,108.1 60.4,108.8 58.8,109.3 57.2,109.7 55.5,110.1 53.8,110.3 52.1,110.4 50.4,110.4 48.7,110.3 47.0,110.0 45.4,109.7 43.7,109.3 42.1,108.7 40.5,108.1 39.0,107.3 37.5,106.5 36.1,105.5 34.8,104.5 33.5,103.3 32.3,102.1 31.2,100.9 30.1,99.5 29.2,98.1 28.4,96.6 Z';

/** 左下深色侧面（静态底座一部分；相对顶面内缩 5px，帽沿外悬，按压到底也不露边） */
export const WALL_DARK_PATH =
  'M 10.6 47.3 L 10.6,48.3 10.7,49.4 10.8,50.4 11.0,51.4 11.2,52.4 11.5,53.4 11.8,54.4 12.2,55.3 12.6,56.3 13.1,57.2 32.8,94.3 33.6,95.7 34.5,97.0 35.5,98.3 36.7,99.4 37.9,100.5 39.1,101.5 40.5,102.4 41.9,103.2 43.4,103.9 44.9,104.4 46.5,104.8 48.1,105.2 49.7,105.3 51.3,105.4 L 51.3 121.4 L 49.7,121.3 48.1,121.2 46.5,120.8 44.9,120.4 43.4,119.9 41.9,119.2 40.5,118.4 39.1,117.5 37.9,116.5 36.7,115.4 35.5,114.3 34.5,113.0 33.6,111.7 32.8,110.3 13.1,73.2 12.6,72.3 12.2,71.3 11.8,70.4 11.5,69.4 11.2,68.4 11.0,67.4 10.8,66.4 10.7,65.4 10.6,64.3 10.6,63.3 Z';

/** 右下渐变侧面（静态底座一部分） */
export const WALL_GRAD_PATH =
  'M 51.3 105.4 L 52.6,105.4 53.9,105.2 55.1,105.0 56.4,104.8 57.6,104.4 58.8,104.0 60.0,103.5 61.2,102.9 98.3,83.2 99.7,82.4 101.0,81.5 102.3,80.5 103.4,79.3 104.5,78.1 105.5,76.9 106.4,75.5 107.2,74.1 107.9,72.6 108.4,71.1 108.8,69.5 109.2,67.9 109.3,66.3 109.4,64.7 L 109.4 80.7 L 109.3,82.3 109.2,83.9 108.8,85.5 108.4,87.1 107.9,88.6 107.2,90.1 106.4,91.5 105.5,92.9 104.5,94.1 103.4,95.3 102.3,96.5 101.0,97.5 99.7,98.4 98.3,99.2 61.2,118.9 60.0,119.5 58.8,120.0 57.6,120.4 56.4,120.8 55.1,121.0 53.9,121.2 52.6,121.4 51.3,121.4 Z';

/** 外轮廓描边（左右竖边 + 底部轮廓，开放路径） */
export const SILHOUETTE_PATH =
  'M 10.6 47.3 L 10.6 63.3 L 10.6,64.3 10.7,65.4 10.8,66.4 11.0,67.4 11.2,68.4 11.5,69.4 11.8,70.4 12.2,71.3 12.6,72.3 13.1,73.2 32.8,110.3 33.6,111.7 34.5,113.0 35.5,114.3 36.7,115.4 37.9,116.5 39.1,117.5 40.5,118.4 41.9,119.2 43.4,119.9 44.9,120.4 46.5,120.8 48.1,121.2 49.7,121.3 51.3,121.4 52.6,121.4 53.9,121.2 55.1,121.0 56.4,120.8 57.6,120.4 58.8,120.0 60.0,119.5 61.2,118.9 98.3,99.2 99.7,98.4 101.0,97.5 102.3,96.5 103.4,95.3 104.5,94.1 105.5,92.9 106.4,91.5 107.2,90.1 107.9,88.6 108.4,87.1 108.8,85.5 109.2,83.9 109.3,82.3 109.4,80.7 L 109.4 64.7';
