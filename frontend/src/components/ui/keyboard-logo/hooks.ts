/* keyboard-logo/hooks.ts — 音效池、物理键盘联动、鼠标接近感应 */
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { LETTER_TO_IDS } from './keycapConfig';
import type { KeycapHandle } from './Keycap';

/* ───────── 音效：3 实例轮换池，避免快速触发互相掐断 ───────── */

const POOL_SIZE = 3;
let pool: HTMLAudioElement[] | null = null;
let poolIdx = 0;

export function playKeySound() {
  if (!pool) {
    pool = Array.from({ length: POOL_SIZE }, () => {
      const a = new Audio('/audio/key-press.mp3');
      a.preload = 'auto';
      a.volume = 0.5;
      return a;
    });
  }
  const snd = pool[poolIdx];
  poolIdx = (poolIdx + 1) % POOL_SIZE;
  snd.currentTime = 0;
  snd.play().catch(() => {/* 忽略自动播放拦截 */});
}

/* ───────── 物理键盘联动 ───────── */

function isEditableTarget(target: EventTarget | null): boolean {
  return !!(target as HTMLElement | null)?.closest?.(
    'input, textarea, select, [contenteditable="true"]'
  );
}

/**
 * 敲物理 K/Y/L/E/M/N/G 键时，对应屏幕键帽同步按下。
 * keydown 按下（带 repeat 守卫），keyup 释放；window blur 释放全部防卡键。
 */
export function useKeyboardLinkage(getHandle: (id: string) => KeycapHandle | null) {
  const heldRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const releaseAll = () => {
      heldRef.current.forEach(letter => {
        LETTER_TO_IDS[letter]?.forEach(id => getHandle(id)?.release());
      });
      heldRef.current.clear();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
      if (isEditableTarget(e.target)) return;
      const letter = e.key.toLowerCase();
      const ids = LETTER_TO_IDS[letter];
      if (!ids || heldRef.current.has(letter)) return;
      heldRef.current.add(letter);
      ids.forEach(id => getHandle(id)?.press());
      playKeySound();
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const letter = e.key.toLowerCase();
      if (!heldRef.current.has(letter)) return;
      heldRef.current.delete(letter);
      LETTER_TO_IDS[letter]?.forEach(id => getHandle(id)?.release());
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', releaseAll);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', releaseAll);
      releaseAll();
    };
  }, [getHandle]);
}

/* ───────── 鼠标接近感应（磁吸视差） ───────── */

const PROXIMITY_RADIUS = 140; // 屏幕 px（rect 已含页面缩放）
const MAX_LIFT = 6;
const MAX_TILT = 2;

interface ProximityTarget {
  el: HTMLDivElement;
  toX: (v: number) => void;
  toY: (v: number) => void;
  toR: (v: number) => void;
  cx: number;
  cy: number;
}

/**
 * 鼠标靠近（未悬停）时键帽轻微浮向光标。
 * 只写 proximity wrapper 的 transform，与按压（写 SVG 内层）零冲突。
 * 监听挂 window：桌面挂载点外层是 pointer-events-none。
 */
export function useProximity(getEls: () => HTMLDivElement[], enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    // 仅精确指针设备启用
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let targets: ProximityTarget[] = [];
    let rafId = 0;
    let pending: { x: number; y: number } | null = null;

    const measure = () => {
      targets = getEls().map(el => {
        const rect = el.getBoundingClientRect();
        return {
          el,
          toX: gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3.out' }),
          toY: gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' }),
          toR: gsap.quickTo(el, 'rotation', { duration: 0.4, ease: 'power3.out' }),
          cx: rect.left + rect.width / 2,
          cy: rect.top + rect.height / 2,
        };
      });
    };

    const apply = () => {
      rafId = 0;
      if (!pending) return;
      const { x, y } = pending;
      for (const t of targets) {
        const dx = t.cx - x;
        const dy = t.cy - y;
        const dist = Math.hypot(dx, dy);
        if (dist < PROXIMITY_RADIUS && dist > 1) {
          const falloff = 1 - dist / PROXIMITY_RADIUS;
          const scale = (MAX_LIFT * falloff) / dist;
          t.toX(-dx * scale);
          t.toY(-dy * scale);
          t.toR((dx > 0 ? -1 : 1) * MAX_TILT * falloff);
        } else {
          t.toX(0);
          t.toY(0);
          t.toR(0);
        }
      }
    };

    const onMove = (e: PointerEvent) => {
      pending = { x: e.clientX, y: e.clientY };
      if (!rafId) rafId = requestAnimationFrame(apply);
    };

    // 入场动画结束后再测量（避免量到动画中的位置）
    const measureTimer = setTimeout(measure, 1600);
    const onResize = () => measure();

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      clearTimeout(measureTimer);
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('resize', onResize);
      targets.forEach(t => { t.toX(0); t.toY(0); t.toR(0); });
    };
  }, [getEls, enabled]);
}
