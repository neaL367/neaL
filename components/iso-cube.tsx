'use client';

import { useEffect, useRef } from 'react';

/**
 * An isometric cube, turned in three dimensions and drawn to a transparent
 * canvas behind the page text.
 *
 * There is no 3D library here on purpose: a cube is eight vertices, six faces
 * and one projection, so hand-rolling it costs less code than pulling in
 * three.js and keeps this page's JavaScript tiny.
 *
 * The rig is a true isometric camera — 45 degree yaw, 35.264 degree pitch
 * (atan(1 / sqrt(2))) — the angle that makes the three visible faces share
 * their foreshortening evenly. Projection is orthographic, so parallel edges
 * stay parallel and the silhouette never distorts as the cube spins.
 *
 * Everything is painted in the theme's foreground luminance, so the cube is
 * pure grayscale and flips correctly between the light and dark themes.
 */

const BOX_WIDTH = 200;
const BOX_HEIGHT = 240;
const HALF_SPAN = 1.6;
const SCALE = BOX_WIDTH / 2 / HALF_SPAN;
const SPIN_RAD_PER_SEC = 0.42;
const PITCH = Math.atan(1 / Math.SQRT2);
const YAW = Math.PI / 4;
const RESTING_SPIN = Math.PI / 5;

type Vec3 = [number, number, number];

function normalize([x, y, z]: Vec3): Vec3 {
  const length = Math.hypot(x, y, z) || 1;
  return [x / length, y / length, z / length];
}

/** Where the light sits, in camera space. Keeps the three faces distinct. */
const LIGHT = normalize([-0.45, 0.7, 0.55]);

const VERTICES: Vec3[] = [
  [-1, -1, -1],
  [1, -1, -1],
  [1, 1, -1],
  [-1, 1, -1],
  [-1, -1, 1],
  [1, -1, 1],
  [1, 1, 1],
  [-1, 1, 1],
];

/** Faces paired with their outward normal, so culling never guesses winding. */
const FACES: { normal: Vec3; corners: [number, number, number, number] }[] = [
  { normal: [0, 0, 1], corners: [4, 5, 6, 7] },
  { normal: [0, 0, -1], corners: [1, 0, 3, 2] },
  { normal: [1, 0, 0], corners: [5, 1, 2, 6] },
  { normal: [-1, 0, 0], corners: [0, 4, 7, 3] },
  { normal: [0, 1, 0], corners: [7, 6, 2, 3] },
  { normal: [0, -1, 0], corners: [0, 1, 5, 4] },
];

/** Every one of the twelve edges, as vertex index pairs. */
const EDGES: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 0],
  [4, 5],
  [5, 6],
  [6, 7],
  [7, 4],
  [0, 4],
  [1, 5],
  [2, 6],
  [3, 7],
];

/** Model space to camera space: spin about Y, then the isometric rig. */
function toCamera([x, y, z]: Vec3, spin: number): Vec3 {
  const spinCos = Math.cos(spin);
  const spinSin = Math.sin(spin);
  const x1 = x * spinCos + z * spinSin;
  const z1 = z * spinCos - x * spinSin;

  const yawCos = Math.cos(YAW);
  const yawSin = Math.sin(YAW);
  const x2 = x1 * yawCos + z1 * yawSin;
  const z2 = z1 * yawCos - x1 * yawSin;

  const pitchCos = Math.cos(PITCH);
  const pitchSin = Math.sin(PITCH);

  return [x2, y * pitchCos - z2 * pitchSin, y * pitchSin + z2 * pitchCos];
}

/** Foreground colour reduced to a single luminance value, so output is grayscale. */
function readGray(element: HTMLElement): number {
  const parts = getComputedStyle(element).color.match(/[\d.]+/g);
  if (!parts || parts.length < 3) return 136;

  const [r, g, b] = parts.map(Number);
  return Math.round(0.2126 * r + 0.7152 * g + 0.0722 * b);
}

/**
 * Toon ramp: five steps, each rendered as a dithered screen rather than a flat
 * wash.
 *
 * `coverage` is the fraction of cells in the dither tile that receive ink. A
 * solid alpha fill smooths into whatever is behind it; a stipple keeps the
 * grain visible, so the faces read like halftone print instead of grey paint.
 *
 * The thresholds are spread evenly across the range this rig can actually
 * produce. Sweeping the cube through a full revolution, a visible face lands
 * anywhere between 0 and 0.891, so five equal bands sit at 0.178 intervals.
 */
const TONE_STEPS = [
  { max: 0.178, coverage: 0.04 }, // 1 - darkest
  { max: 0.356, coverage: 0.11 }, // 2
  { max: 0.534, coverage: 0.2 }, // 3
  { max: 0.712, coverage: 0.32 }, // 4
  { max: Infinity, coverage: 0.48 }, // 5 - brightest
] as const;

function coverageFor(lambert: number): number {
  return TONE_STEPS.find((step) => lambert < step.max)?.coverage ?? 0.05;
}

/**
 * Ordered dither matrix (Bayer 8x8).
 *
 * Values are the order in which cells switch on as coverage rises, so any
 * coverage produces an even, evenly-spread dot pattern that stays stable as
 * the cube turns. This is what stops the midtones from banding the way two
 * flat alpha fills next to each other do.
 */
const BAYER_8 = [
  0, 32, 8, 40, 2, 34, 10, 42,
  48, 16, 56, 24, 50, 18, 58, 26,
  12, 44, 4, 36, 14, 46, 6, 38,
  60, 28, 52, 20, 62, 30, 54, 22,
  3, 35, 11, 43, 1, 33, 9, 41,
  51, 19, 59, 27, 49, 17, 57, 25,
  15, 47, 7, 39, 13, 45, 5, 37,
  63, 31, 55, 23, 61, 29, 53, 21,
];

/** Size of one dither cell, in CSS pixels. Two keeps the grain legible at
 *  this canvas size without turning into visible blocks. */
const DITHER_CELL = 2;
const DITHER_TILE = 8 * DITHER_CELL;

type DitherTile = { canvas: HTMLCanvasElement; pattern: CanvasPattern | null };

/**
 * Tiles are rebuilt only when the ink colour or pixel ratio changes, so the
 * per-frame cost is one `fillRect` per visible face.
 */
const ditherCache = new Map<string, DitherTile>();

function getDitherTile(
  context: CanvasRenderingContext2D,
  gray: number,
  coverage: number,
): DitherTile | null {
  const key = `${gray}|${coverage}`;
  const cached = ditherCache.get(key);
  if (cached) return cached;

  if (typeof document === 'undefined') return null;

  const canvas = document.createElement('canvas');
  canvas.width = DITHER_TILE;
  canvas.height = DITHER_TILE;

  const tileContext = canvas.getContext('2d');
  if (!tileContext) return null;

  tileContext.fillStyle = `rgb(${gray}, ${gray}, ${gray})`;

  const total = BAYER_8.length;
  for (let cell = 0; cell < total; cell++) {
    // +0.5 biases each cell to its own centre, so a coverage of exactly n/64
    // lights n cells instead of rounding unpredictably at the boundary.
    if (coverage <= (BAYER_8[cell] + 0.5) / total) continue;

    const column = cell % 8;
    const row = Math.floor(cell / 8);
    tileContext.fillRect(column * DITHER_CELL, row * DITHER_CELL, DITHER_CELL, DITHER_CELL);
  }

  const tile = { canvas, pattern: context.createPattern(canvas, 'repeat') };
  ditherCache.set(key, tile);
  return tile;
}

/** Camera space to canvas space. Y is flipped because canvas Y grows downward. */
function toScreen([x, y]: Vec3): [number, number] {
  return [BOX_WIDTH / 2 + x * SCALE, BOX_HEIGHT / 2 - y * SCALE];
}

function edgeKey(a: number, b: number): string {
  return a < b ? `${a}:${b}` : `${b}:${a}`;
}

/**
 * Strength of the finished outline once it is composited over the faces.
 * The edge ink is drawn at full opacity offscreen and multiplied by this once,
 * so the number here is the outline's true opacity — no double application.
 */
const OUTLINE_ALPHA = 0.9;

/** Opacity of the dither ink itself. Kept below 1 so the stipple stays a
 *  texture rather than a hard black, matching the outline's weight. */
const INK_OPACITY = 0.85;

/** Every stroke goes into the buffer fully opaque — see the note in drawFrame.
 *  Hierarchy is carried by line weight alone, never by alpha, because alpha is
 *  exactly what compounds at a shared vertex. */
const SEAM_WIDTH = 1;
const CONTOUR_WIDTH = 1.5;

/**
 * Scratch layer for the outline.
 *
 * Stroking the contour and the seams directly onto the visible canvas lets
 * their round caps overlap at each vertex, so the alpha stacks and the corners
 * come out darker than the edges running into them. Drawing the ink into this
 * buffer at full strength and compositing it once means every edge and every
 * corner resolves to exactly one colour.
 */
let outlineCanvas: HTMLCanvasElement | null = null;
let outlineRatio = 0;

function getOutlineContext(ratio: number): CanvasRenderingContext2D | null {
  if (typeof document === 'undefined') return null;

  if (!outlineCanvas) outlineCanvas = document.createElement('canvas');

  if (outlineRatio !== ratio) {
    outlineRatio = ratio;
    outlineCanvas.width = Math.round(BOX_WIDTH * ratio);
    outlineCanvas.height = Math.round(BOX_HEIGHT * ratio);
  }

  const context = outlineCanvas.getContext('2d');
  if (!context) return null;

  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  return context;
}

function drawFrame(
  context: CanvasRenderingContext2D,
  spin: number,
  gray: number,
  ratio: number,
): void {
  context.clearRect(0, 0, BOX_WIDTH, BOX_HEIGHT);

  const projected = VERTICES.map((vertex) => toCamera(vertex, spin));

  const visible = FACES.map((face) => {
    const corners = face.corners.map((index) => projected[index]);
    const depth = corners.reduce((sum, [, , z]) => sum + z, 0) / corners.length;
    return { normal: toCamera(face.normal, spin), indices: face.corners, corners, depth };
  })
    .filter((face) => face.normal[2] > 0)
    .sort((a, b) => a.depth - b.depth);

  // --- Faces: fill only, flat. Stroking each face separately would double-draw
  // the seams between them, which reads as a blurry double line.
  for (const face of visible) {
    const lambert = Math.max(
      0,
      face.normal[0] * LIGHT[0] + face.normal[1] * LIGHT[1] + face.normal[2] * LIGHT[2],
    );

    context.beginPath();
    face.corners.forEach(([x, y], index) => {
      const [screenX, screenY] = toScreen([x, y, 0]);
      if (index === 0) context.moveTo(screenX, screenY);
      else context.lineTo(screenX, screenY);
    });
    context.closePath();

    // Fill through the stipple tile instead of a flat alpha. The pattern is
    // anchored to the canvas origin, so the grain stays put while the faces
    // turn over it rather than crawling with the geometry.
    const tile = getDitherTile(context, gray, coverageFor(lambert));
    if (!tile?.pattern) continue;

    context.globalAlpha = INK_OPACITY;
    context.fillStyle = tile.pattern;
    context.fill();
    context.globalAlpha = 1;
  }

  // --- Outline: work out which edges are contour and which are internal.
  // An edge shared by one visible face is on the silhouette; an edge shared by
  // two visible faces is one of the three seams meeting at the near corner.
  const visibleEdgeUse = new Map<string, number>();
  for (const face of visible) {
    for (let i = 0; i < 4; i++) {
      const key = edgeKey(face.indices[i], face.indices[(i + 1) % 4]);
      visibleEdgeUse.set(key, (visibleEdgeUse.get(key) ?? 0) + 1);
    }
  }

  const silhouette: string[] = [];
  const seams: string[] = [];
  for (const [a, b] of EDGES) {
    const key = edgeKey(a, b);
    const uses = visibleEdgeUse.get(key) ?? 0;
    if (uses === 1) silhouette.push(key);
    else if (uses === 2) seams.push(key);
  }

  // --- Outline, built in an isolated buffer ---------------------------------
  //
  // Two things used to darken the corners:
  //
  //   1. Round caps at a shared vertex overlap, and overlapping alpha
  //      compounds — two 0.9 strokes crossing read as ~0.99.
  //   2. Seams were stroked at 0.35, so the three of them converging on the
  //      near corner stacked to ~0.58 while the edges leading in stayed at
  //      0.35.
  //
  // Both are the same bug: alpha accumulating where lines meet. So the ink is
  // drawn into this buffer fully opaque — overlaps then simply resolve to the
  // same value instead of summing — and the whole layer is composited onto the
  // canvas exactly once. Corners and edges therefore end up identical, and the
  // only variation left is line weight.
  const buffer = getOutlineContext(ratio);

  if (buffer) {
    buffer.clearRect(0, 0, BOX_WIDTH, BOX_HEIGHT);

    const ink = `rgb(${gray}, ${gray}, ${gray})`;

    const stroke = (keys: string[], width: number) => {
      buffer.beginPath();
      for (const key of keys) {
        const [a, b] = key.split(':').map(Number);
        const [ax, ay] = toScreen(projected[a]);
        const [bx, by] = toScreen(projected[b]);
        buffer.moveTo(ax, ay);
        buffer.lineTo(bx, by);
      }
      buffer.lineWidth = width;
      buffer.lineCap = 'round';
      buffer.lineJoin = 'round';
      buffer.strokeStyle = ink;
      buffer.stroke();
    };

    stroke(seams, SEAM_WIDTH);
    stroke(silhouette, CONTOUR_WIDTH);

    context.globalAlpha = OUTLINE_ALPHA;
    context.drawImage(
      buffer.canvas,
      0,
      0,
      buffer.canvas.width,
      buffer.canvas.height,
      0,
      0,
      BOX_WIDTH,
      BOX_HEIGHT,
    );
    context.globalAlpha = 1;
  }
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

    let gray = readGray(canvas);
    let spin = RESTING_SPIN;

    const render = () => drawFrame(context, spin, gray, ratio);

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

      spin = ((time - startedAt) / 1000) * SPIN_RAD_PER_SEC;
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
