'use client';

import { useEffect } from 'react';
import { fitScale, ICON_SIZE, paintIsoCube, SPIN_RAD_PER_SEC } from '@/lib/iso-cube';

/**
 * Animates the favicon with the same isometric cube the page draws.
 *
 * A favicon cannot be animated directly: browsers render one static image per
 * link element, and an animated SVG is not honoured by any of the major ones.
 * So the cube is painted offscreen and the `href` of a `<link rel="icon">` is
 * swapped for a new PNG data URL each frame.
 *
 * That is expensive relative to drawing, so the loop is deliberately throttled
 * well below the display refresh rate. A favicon is 16-32px on screen; nothing
 * is gained by re-encoding it 60 times a second, and the encode cost would show
 * up as jank on the page itself.
 *
 * If anything goes wrong — no canvas, no data URL, reduced motion — the effect
 * leaves the static icons from `app/layout.tsx` untouched, so the tab still has
 * a cube in it.
 */

/** Frames per second for the favicon. 12 reads as smooth for a 32px icon. */
const FPS = 12;

/** Same resting angle as the page cube, so the two are not out of phase. */
const RESTING_SPIN = Math.PI / 5;

export function FaviconCube() {
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = ICON_SIZE;
    canvas.height = ICON_SIZE;

    const context = canvas.getContext('2d');
    if (!context) return;

    const scratchCanvas = document.createElement('canvas');
    scratchCanvas.width = ICON_SIZE;
    scratchCanvas.height = ICON_SIZE;
    const scratch = scratchCanvas.getContext('2d');
    if (!scratch) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Own link element, so the static icons stay in place as the fallback for
    // browsers that never run this. `sizes="any"` stops the browser preferring
    // a larger declared icon over the frame we are actively swapping.
    const link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/png';
    link.sizes = 'any';

    const scale = fitScale(ICON_SIZE, ICON_SIZE, 0.94);
    let spin = RESTING_SPIN;
    let href: string | null = null;

    // The icon paints from a fixed palette rather than the page theme, so the
    // `gray` argument only feeds the page renderer; any value is unused here.
    const render = () => {
      paintIsoCube(context, {
        spin,
        width: ICON_SIZE,
        height: ICON_SIZE,
        gray: 24,
        scale,
        scratch,
        icon: true,
      });
    };

    const commit = () => {
      const next = canvas.toDataURL('image/png');
      // Re-assigning an identical href would make some browsers re-decode it.
      if (next === href) return;
      href = next;
      link.href = next;
    };

    render();
    commit();
    document.head.appendChild(link);

    let timer = 0;
    const interval = 1000 / FPS;

    const start = () => {
      if (timer !== 0) return;
      timer = window.setTimeout(tick, interval);
    };

    const stop = () => {
      if (timer === 0) return;
      window.clearTimeout(timer);
      timer = 0;
    };

    /**
     * A timeout, not rAF: rAF wakes 60 times a second just to check whether
     * enough time has passed, which is pure overhead on a phone. Timing from
     * `performance.now()` keeps the icon in phase with the page cube.
     */
    const tick = () => {
      timer = 0;
      if (document.hidden || reducedMotion.matches) return;
      spin = RESTING_SPIN + (performance.now() / 1000) * SPIN_RAD_PER_SEC;
      render();
      commit();
      start();
    };

    const sync = () => {
      if (document.hidden || reducedMotion.matches) {
        stop();
        // Keep the resting cube as the still icon.
        spin = RESTING_SPIN;
        render();
        commit();
      } else {
        start();
      }
    };

    const onVisibilityChange = () => sync();

    document.addEventListener('visibilitychange', onVisibilityChange);
    reducedMotion.addEventListener('change', sync);
    sync();

    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      reducedMotion.removeEventListener('change', sync);
      link.remove();
    };
  }, []);

  return null;
}
