/* keyboard-logo/KeyboardLogo.tsx — 编排器
   单一 440×260 桌面坐标系 stage，移动端整体 scale(0.76)；
   单个 gsap.context + matchMedia 管理全部动画（入场、环境循环、reduced-motion）。
   装饰图标：待机循环写 [data-deco-inner]，hover burst 写 [data-burst]，互不冲突。 */
import React, { useCallback, useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useResponsive } from '../../../utils/responsive';
import Keycap, { KeycapHandle } from './Keycap';
import { useKeyboardLinkage, useProximity, playKeySound } from './hooks';
import {
  TwinkleStar, MailTile, CodeWindow, Pencil, HandPointer, ChatBubble, CursorArrow,
} from './DecoIcons';
import {
  KEYS, DECORATIONS, STAGE, MOBILE_SCALE, KEY_SIZE, DOT_BOUNCE,
  CURSOR_PATROL_KEYS, CURSOR_OFFSET, MOTION, DecorationDef, DecoBurst,
} from './keycapConfig';

function createDecoLoop(inner: Element, def: DecorationDef): gsap.core.Animation | null {
  const loop = def.loop;
  switch (loop.kind) {
    case 'float':
      return gsap.to(inner, {
        y: loop.y, duration: loop.dur, delay: loop.delay ?? 0,
        ease: MOTION.ease.ambient, yoyo: true, repeat: -1, paused: true,
      });
    case 'sway':
      return gsap.to(inner, {
        rotation: loop.rotation, duration: loop.dur, delay: loop.delay ?? 0,
        ease: MOTION.ease.ambient, yoyo: true, repeat: -1, paused: true,
        transformOrigin: '50% 50%',
      });
    case 'driftX':
      return gsap.to(inner, {
        x: loop.x, duration: loop.dur, delay: loop.delay ?? 0,
        ease: MOTION.ease.ambient, yoyo: true, repeat: -1, paused: true,
      });
    case 'bounce':
      return gsap.to(inner, {
        y: loop.y, duration: loop.dur, delay: loop.delay ?? 0,
        ease: 'power2.inOut', yoyo: true, repeat: -1, paused: true,
      });
    case 'wander': {
      const tl = gsap.timeline({ repeat: -1, paused: true });
      loop.path.forEach(p => tl.to(inner, { x: p.x, y: p.y, duration: p.dur, ease: MOTION.ease.ambient }));
      return tl;
    }
  }
}

/** hover 互动特效（一次性，带 reduced-motion 与重入守卫） */
function playBurst(burst: DecoBurst, wrapper: HTMLElement) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (burst === 'brackets') {
    const l = wrapper.querySelector('[data-bracket-g="l"]');
    const s = wrapper.querySelector('[data-bracket-g="s"]');
    const r = wrapper.querySelector('[data-bracket-g="r"]');
    if (!l || !s || !r || gsap.isTweening(l)) return;
    gsap.timeline()
      .to(l, { x: -9, duration: 0.16, ease: 'power2.out' }, 0)
      .to(r, { x: 9, duration: 0.16, ease: 'power2.out' }, 0)
      .to(s, { scaleX: 1.35, transformOrigin: '50% 50%', duration: 0.16, ease: 'power2.out' }, 0)
      .to([l, r, s], { x: 0, scaleX: 1, duration: 0.55, ease: 'elastic.out(1, 0.5)' });
    return;
  }
  const t = wrapper.querySelector('[data-burst]');
  if (!t || gsap.isTweening(t)) return;
  switch (burst) {
    case 'spin':
      gsap.to(t, { rotation: '+=180', duration: 0.7, ease: 'back.out(1.8)', transformOrigin: '50% 50%' });
      break;
    case 'ring':
      gsap.to(t, { keyframes: { rotation: [0, -10, 9, -7, 5, 0] }, duration: 0.6, ease: 'power1.inOut', transformOrigin: '50% 50%' });
      break;
    case 'scribble':
      gsap.to(t, { keyframes: { rotation: [0, -3, 3, -2, 2, 0] }, duration: 0.45, ease: 'power1.inOut', transformOrigin: '15% 50%' });
      break;
    case 'tap':
      gsap.timeline()
        .to(t, { y: 7, rotation: -6, duration: 0.12, ease: 'power2.out', transformOrigin: '50% 80%' })
        .to(t, { y: 0, rotation: 0, duration: 0.4, ease: 'elastic.out(1, 0.5)' });
      break;
    case 'pop':
      gsap.timeline()
        .to(t, { scale: 1.08, duration: 0.14, ease: 'power2.out', transformOrigin: '50% 100%' })
        .to(t, { scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.45)' });
      break;
  }
}

export default function KeyboardLogo() {
  const responsive = useResponsive();
  const stageRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const leftBracketRef = useRef<SVGPathElement>(null);
  const slashRef = useRef<SVGPathElement>(null);
  const rightBracketRef = useRef<SVGPathElement>(null);
  const handlesRef = useRef<Map<string, KeycapHandle>>(new Map());

  const setHandle = (id: string) => (h: KeycapHandle | null) => {
    if (h) handlesRef.current.set(id, h);
    else handlesRef.current.delete(id);
  };

  const getHandle = useCallback((id: string) => handlesRef.current.get(id) ?? null, []);
  const getProximityEls = useCallback(
    () => [...handlesRef.current.values()].map(h => h.el).filter((el): el is HTMLDivElement => !!el),
    []
  );

  useKeyboardLinkage(getHandle);
  useProximity(getProximityEls, true);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const mm = gsap.matchMedia(stage);
    mm.add(
      { reduced: '(prefers-reduced-motion: reduce)', normal: '(prefers-reduced-motion: no-preference)' },
      ctx => {
        if (ctx.conditions?.reduced) return; // 全部保持静态可见

        const keycaps = gsap.utils.toArray<HTMLElement>('[data-keycap]', stage);
        const decos = gsap.utils.toArray<HTMLElement>('[data-deco]', stage);
        const loops: (gsap.core.Animation | null)[] = [];

        /* 环境循环（入场结束后启动） */
        DECORATIONS.forEach(def => {
          const inner = stage.querySelector(`[data-deco="${def.id}"] [data-deco-inner]`);
          if (inner) loops.push(createDecoLoop(inner, def));
        });

        /* 气泡内打字点：依次跳动 */
        gsap.utils.toArray<Element>('[data-dot]', stage).forEach((dot, i) => {
          const tl = gsap.timeline({ repeat: -1, repeatDelay: DOT_BOUNCE.repeatDelay, delay: i * DOT_BOUNCE.stagger, paused: true });
          tl.to(dot, { y: DOT_BOUNCE.y, duration: DOT_BOUNCE.dur, ease: 'power2.out' })
            .to(dot, { y: 0, duration: DOT_BOUNCE.dur * 0.85, ease: 'power2.in' });
          loops.push(tl);
        });

        /* </> 开合 */
        if (leftBracketRef.current && slashRef.current && rightBracketRef.current) {
          const tl = gsap.timeline({ repeat: -1, yoyo: true, paused: true });
          tl.to(leftBracketRef.current, { x: -6, scaleX: 1.2, duration: 1.5, ease: MOTION.ease.ambient }, 0)
            .to(rightBracketRef.current, { x: 6, scaleX: 1.2, duration: 1.5, ease: MOTION.ease.ambient }, 0)
            .to(slashRef.current, { scaleX: 1.15, duration: 1.5, ease: MOTION.ease.ambient }, 0);
          loops.push(tl);
        }

        /* 光标巡游 M → L → G → M，到达时"点按"该键 */
        if (cursorRef.current) {
          const stops = CURSOR_PATROL_KEYS.map(id => {
            const k = KEYS.find(i => i.id === id)!;
            return { id, left: k.x + KEY_SIZE / 2 + CURSOR_OFFSET.dx, top: k.y + KEY_SIZE / 2 + CURSOR_OFFSET.dy };
          });
          const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.4, paused: true });
          [...stops.slice(1), stops[0]].forEach(stop => {
            tl.to(cursorRef.current!, { left: stop.left, top: stop.top, duration: 0.8, ease: MOTION.ease.move })
              .call(() => {
                const h = getHandle(stop.id);
                if (!h) return;
                h.press();
                gsap.delayedCall(0.18, () => h.release());
              })
              .to({}, { duration: 0.35 }); // 点按停顿
          });
          loops.push(tl);
        }

        /* 入场：键帽按阅读顺序弹跳落下，装饰随后浮现，落定后环境循环启动 */
        const entrance = gsap.timeline({
          onComplete: () => loops.forEach(l => l?.play()),
        });
        entrance
          .from(keycaps, {
            y: -36,
            autoAlpha: 0,
            duration: MOTION.dur.entrance,
            ease: MOTION.ease.pop,
            stagger: 0.07,
          })
          .from(decos, {
            autoAlpha: 0,
            scale: 0.6,
            duration: 0.4,
            ease: MOTION.ease.pop,
            stagger: 0.05,
          }, '-=0.35');

        return () => loops.forEach(l => l?.kill());
      }
    );

    return () => mm.revert();
  }, [getHandle]);

  /* 光标初始位置 = M 键中心 + 偏移 */
  const mKey = KEYS.find(k => k.id === CURSOR_PATROL_KEYS[0])!;
  const cursorInit = {
    left: mKey.x + KEY_SIZE / 2 + CURSOR_OFFSET.dx,
    top: mKey.y + KEY_SIZE / 2 + CURSOR_OFFSET.dy,
  };

  const renderDeco = (def: DecorationDef) => {
    switch (def.kind) {
      case 'star': return <TwinkleStar id={def.id} />;
      case 'mail': return <MailTile />;
      case 'window': return <CodeWindow brackets={{ l: leftBracketRef, s: slashRef, r: rightBracketRef }} />;
      case 'pencil': return <Pencil />;
      case 'hand': return <HandPointer />;
      case 'bubble': return <ChatBubble />;
    }
  };

  const isMobile = responsive.isMobile;

  return (
    <div
      className={`relative select-none mx-auto ${isMobile ? 'w-[290px] h-[235px]' : 'w-[440px] h-[260px]'}`}
    >
      <div
        ref={stageRef}
        className="relative origin-top-left"
        style={{
          width: STAGE.w,
          height: STAGE.h,
          transform: isMobile ? `scale(${MOBILE_SCALE})` : undefined,
        }}
      >
        {/* 键帽 */}
        {KEYS.map(def => (
          <Keycap key={def.id} def={def} onSound={playKeySound} ref={setHandle(def.id)} />
        ))}

        {/* 装饰图标（外层 span 给入场动画；指针事件只在 painted 区域响应，不挡键帽） */}
        {DECORATIONS.map(def => (
          <span
            key={def.id}
            data-deco={def.id}
            className="absolute block"
            style={{
              left: def.left,
              top: def.top,
              width: def.width,
              zIndex: def.z,
              pointerEvents: 'none',
              transform: def.rotate ? `rotate(${def.rotate}deg)` : undefined,
            }}
            onPointerEnter={e => playBurst(def.burst, e.currentTarget)}
          >
            {renderDeco(def)}
          </span>
        ))}

        {/* 巡游光标 */}
        <div
          ref={cursorRef}
          className="absolute w-10"
          style={{
            left: cursorInit.left,
            top: cursorInit.top,
            zIndex: 5,
            transform: 'translate(-30%, -25%)',
            pointerEvents: 'none',
          }}
        >
          <CursorArrow />
        </div>
      </div>
    </div>
  );
}
