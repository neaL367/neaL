'use client';

import { useEffect, useRef } from 'react';
import { HALF_SPAN, paintIsoCube, SPIN_RAD_PER_SEC } from '@/lib/iso-cube';

/**
 * The isometric cube on the page: a canvas painted from the shared renderer in
 * `lib/iso-cube`, spinning slowly behind the page text.
 *
 * This component owns only the browser concerns — sizing the canvas, reading
 * the theme colour, and deciding when to animate. The geometry and shading live
 * in the shared module so the favicon can draw the identical cube.
 */

const BOX_WIDTH = 200;
const BOX_HEIGHT = 240;
const RESTING_SPIN = Math.PI / 5;

/**
 * Upper bound for the page cube. rAF fires at the display's refresh rate —
 * 60Hz, 120Hz, 144Hz — so the cube draws at the display rate up to this cap.
 * On a 60Hz screen nothing can present more than 60 frames a second; on a
 * 120Hz screen it renders 120. The cap stops a 144Hz display from doing 144
 * full repaints of a cube that turns only 0.42 rad/s.
 */
const MAX_FPS = 120;

/** Tolerate rAF timestamp jitter so a true 120Hz frame is not skipped. */
const FRAME_TOLERANCE_MS = 1;

/** Foreground colour reduced to a single luminance value, so output is grayscale. */
function readGray(element: HTMLElement): number {
  const parts = getComputedStyle(element).color.match(/[\d.]+/g);
  if (!parts || parts.length < 3) return 136;

  const [r, g, b] = parts.map(Number);
  return Math.round(0.2126 * r + 0.7152 * g + 0.0722 * b);
}

export function IsoCube() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    // Cap the pixel ratio: past 2x the extra pixels buy nothing visible.
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(BOX_WIDTH * ratio);
    canvas.height = Math.round(BOX_HEIGHT * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);

    // Scratch layer for the outline, so alpha never compounds at shared corners.
    const scratchCanvas = document.createElement('canvas');
    scratchCanvas.width = canvas.width;
    scratchCanvas.height = canvas.height;
    const scratchContext = scratchCanvas.getContext('2d');
    if (scratchContext) scratchContext.setTransform(ratio, 0, 0, ratio, 0, 0);

    // The cube's original fixed scale: the box's half-width divided by the
    // model's half-span. Kept exactly as it was, so the page is unchanged by the
    // move to a shared renderer.
    const scale = BOX_WIDTH / 2 / HALF_SPAN;
    let gray = readGray(canvas);
    let spin = RESTING_SPIN;

    const render = () => {
      paintIsoCube(context, {
        spin,
        width: BOX_WIDTH,
        height: BOX_HEIGHT,
        gray,
        scale,
        scratch: scratchContext,
      });
    };

    const darkTheme = window.matchMedia('(prefers-color-scheme: dark)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Paint one frame before any loop or observer is involved. If rAF never
    // starts — background tab, a phone that never reports an intersection —
    // the canvas still holds a cube instead of staying blank.
    render();

    let frame = 0;
    let startedAt = 0;
    let previous = 0;
    let onScreen = true;
    const interval = 1000 / MAX_FPS;

    const paint = (time: number) => {
      frame = requestAnimationFrame(paint);
      if (startedAt === 0) startedAt = time;

      const elapsed = time - previous;
      if (elapsed < interval - FRAME_TOLERANCE_MS) return;
      // Keep the cadence anchored to the interval rather than to each late
      // callback, so a 144Hz display averages 120 renders instead of dropping
      // to 72 by skipping every other one.
      previous = time - (elapsed % interval);

      // Spin comes from elapsed time, never a fixed per-frame step: the cube
      // must turn at the same speed on 60Hz and 120Hz screens.
      spin = RESTING_SPIN + ((time - startedAt) / 1000) * SPIN_RAD_PER_SEC;
      render();
    };

    const start = () => {
      if (frame !== 0) return;
      startedAt = 0;
      previous = 0;
      frame = requestAnimationFrame(paint);
    };

    const stop = () => {
      if (frame === 0) return;
      cancelAnimationFrame(frame);
      frame = 0;
    };

    /**
     * Single source of truth for whether the loop should run. Pausing also
     * repaints, so a stopped cube keeps its last pose instead of a stale one.
     */
    const sync = () => {
      if (reducedMotion.matches || document.hidden || !onScreen) {
        stop();
        render();
      } else {
        start();
      }
    };

    const onVisibilityChange = () => sync();
    const onMotionChange = () => sync();
    const onThemeChange = () => {
      gray = readGray(canvas);
      render();
    };

    const observer = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      sync();
    });

    observer.observe(canvas);
    document.addEventListener('visibilitychange', onVisibilityChange);
    darkTheme.addEventListener('change', onThemeChange);
    reducedMotion.addEventListener('change', onMotionChange);

    // Start immediately rather than waiting for the observer to say the canvas
    // is visible. The observer's first callback can pause it just as easily;
    // relying on it to start is what left the cube frozen on phones that never
    // delivered that first intersection.
    start();

    return () => {
      stop();
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      darkTheme.removeEventListener('change', onThemeChange);
      reducedMotion.removeEventListener('change', onMotionChange);
    };
  }, []);

  return (
    <figure className="iso-cube-figure" aria-hidden="true">
      <canvas ref={canvasRef} className="iso-cube-canvas" />
    </figure>
  );
}
