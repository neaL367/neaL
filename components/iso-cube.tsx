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

    if (reducedMotion.matches) {
      render();

      const onThemeChange = () => {
        gray = readGray(canvas);
        render();
      };

      darkTheme.addEventListener('change', onThemeChange);
      return () => darkTheme.removeEventListener('change', onThemeChange);
    }

    let frame = 0;
    let startedAt = 0;

    const paint = (time: number) => {
      frame = requestAnimationFrame(paint);
      if (startedAt === 0) startedAt = time;

      spin = RESTING_SPIN + ((time - startedAt) / 1000) * SPIN_RAD_PER_SEC;
      render();
    };

    const start = () => {
      if (frame === 0) {
        startedAt = 0;
        frame = requestAnimationFrame(paint);
      }
    };

    const stop = () => {
      if (frame !== 0) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    };

    const onVisibilityChange = () => {
      if (document.hidden) stop();
      else start();
    };

    const onThemeChange = () => {
      gray = readGray(canvas);
      if (frame === 0) render();
    };

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) start();
      else stop();
    });

    observer.observe(canvas);
    document.addEventListener('visibilitychange', onVisibilityChange);
    darkTheme.addEventListener('change', onThemeChange);

    return () => {
      stop();
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      darkTheme.removeEventListener('change', onThemeChange);
    };
  }, []);

  return (
    <figure className="iso-cube-figure" aria-hidden="true">
      <canvas ref={canvasRef} className="iso-cube-canvas" />
    </figure>
  );
}
