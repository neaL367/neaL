/**
 * Geometry and painting for the isometric cube, shared by the page canvas and
 * the animated favicon.
 *
 * There is no 3D library here on purpose: a cube is eight vertices, six faces
 * and one projection, so hand-rolling it costs less code than pulling in
 * three.js and keeps this site's JavaScript tiny.
 *
 * The rig is a true isometric camera — 45 degree yaw, 35.264 degree pitch
 * (atan(1 / sqrt(2))) — the angle that makes the three visible faces share
 * their foreshortening evenly. Projection is orthographic, so parallel edges
 * stay parallel and the silhouette never distorts as the cube spins.
 */

export type Vec3 = [number, number, number];

/** Half the cube's edge length, in model units. */
export const HALF_SPAN = 1.6;

/** One full revolution this many radians per second. */
export const SPIN_RAD_PER_SEC = 0.42;

const PITCH = Math.atan(1 / Math.SQRT2);
const YAW = Math.PI / 4;

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

/**
 * Toon ramp: five flat tones instead of a continuous gradient.
 *
 * A Lambert term is bucketed by threshold, and each bucket gets a fixed alpha.
 * Nothing blends, so every face reads as a single flat step — cel shading
 * rather than smooth shading.
 *
 * The thresholds are spread evenly across the range this rig can actually
 * produce. Sweeping the cube through a full revolution, a visible face lands
 * anywhere between 0 and 0.891, so five equal bands sit at 0.178 intervals.
 * Even spacing keeps the tonal response linear in light, which is what stops
 * the mid and dark ends from bunching together.
 */
const TONE_STEPS = [
  { max: 0.178, alpha: 0.03 }, // 1 - darkest
  { max: 0.356, alpha: 0.095 }, // 2
  { max: 0.534, alpha: 0.16 }, // 3
  { max: 0.712, alpha: 0.23 }, // 4
  { max: Infinity, alpha: 0.3 }, // 5 - brightest
] as const;

/**
 * Favicon palette: absolute greys rather than alpha over a page colour.
 *
 * The static icon in `public/icon-192.png` is a dark cube — faces around 17,
 * 31 and 79 with edges near 152 — on a transparent background. A tab strip is
 * not a page, so there is no theme colour to inherit; reproducing those values
 * means the animated frames match the still icon the browser shows before this
 * script has run, and the icon keeps its identity on light and dark chrome
 * alike.
 *
 * Five bands again, but on a fixed dark ramp, so the three visible faces stay
 * distinct even at 16px.
 */
/**
 * Favicon bands, matched to the three tones the static icon actually uses.
 *
 * At any spin exactly three faces are visible, and the isometric rig pins them
 * to predictable light values: the top face is always 0.8913, one side sits at
 * 0, and the other side sweeps 0 to 0.44. So only two thresholds are needed —
 * one that separates a shaded side (0) from a lit side (0.11 and up), and one
 * that separates both from the top. Splitting the range into five equal bands
 * instead put both side faces in the same bucket, which is what made the icon
 * read as a featureless blob.
 */
const ICON_FACE_STEPS = [
  { max: 0.055, luma: 17 },
  { max: 0.5, luma: 31 },
  { max: Infinity, luma: 79 },
] as const;

/** Edge ink for the favicon: light, so it separates from every face. */
const ICON_EDGE_LUMA = 152;

/**
 * Line weight for the favicon, in the pixels a tab actually shows it at.
 *
 * The icon is rastered large and then downscaled by the browser, so weight has
 * to be chosen for the final size rather than for the buffer. At 16px a heavy
 * contour turns the whole cube into a pale blob — the light ink swallows the
 * dark faces — so the outline stays deliberately thin and the faces carry the
 * shape.
 */
const ICON_EDGE_DISPLAY_PX = 0.6;

/** Raster size the favicon buffer is painted at, for the weight conversion. */
export const ICON_SIZE = 64;

function toneFor(lambert: number): number {
  return TONE_STEPS.find((step) => step.max > lambert)?.alpha ?? 0.03;
}

function iconLumaFor(lambert: number): number {
  return ICON_FACE_STEPS.find((step) => step.max > lambert)?.luma ?? 17;
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

/** Every stroke goes into the buffer fully opaque — see the note in paintIsoCube.
 *  Hierarchy is carried by line weight alone, never by alpha, because alpha is
 *  exactly what compounds at a shared vertex. */
const SEAM_WIDTH = 1;
const CONTOUR_WIDTH = 1.5;

/**
 * Largest half-extents the projected silhouette reaches over a full spin,
 * measured by sweeping the rig across every angle.
 *
 * The cube's vertices span [-1, 1] and `toCamera` works on those values
 * directly, so these are in the same vertex units — 1.4142 across and 1.6330
 * down. Sizing a box to one of them alone would clip the cube at some angles.
 */
const HALF_EXTENT_X = 1.4142;
const HALF_EXTENT_Y = 1.633;

/**
 * Pixels per model unit that keep the cube's whole sweep inside a box, leaving
 * a margin so the contour never touches an edge.
 *
 * This is for the favicon, which is clipped to a square and cannot afford the
 * cube to graze an edge at any angle. The page canvas uses its own fixed scale
 * instead — it has vertical room to spare, and sizing it to the worst-case
 * sweep would make the cube noticeably smaller than it has always been.
 */
export function fitScale(width: number, height: number, margin = 0.88): number {
  const halfWidth = (width / 2) * margin;
  const halfHeight = (height / 2) * margin;
  return Math.min(halfWidth / HALF_EXTENT_X, halfHeight / HALF_EXTENT_Y);
}

export type PaintOptions = {
  spin: number;
  width: number;
  height: number;
  /** Foreground colour reduced to one luminance value, so output is grayscale. */
  gray: number;
  /** Pixels per model unit. */
  scale: number;
  /** Optional isolated buffer used to composite the outline exactly once. */
  scratch?: CanvasRenderingContext2D | null;
  /**
   * Draw at favicon weight: opaque-ish faces, a solid disc behind them, and a
   * heavier contour. Defaults to the page rendering.
   */
  icon?: boolean;
};

/**
 * Paint one frame of the cube into `context`.
 *
 * The context is expected to already carry the device-pixel-ratio transform, so
 * every coordinate here is in CSS pixels of `width` x `height`.
 */
export function paintIsoCube(context: CanvasRenderingContext2D, options: PaintOptions): void {
  const { spin, width, height, gray, scale, scratch, icon = false } = options;

  const toScreen = (v: Vec3): [number, number] => {
    const [x, y] = v;
    return [width / 2 + x * scale, height / 2 - y * scale];
  };

  context.clearRect(0, 0, width, height);

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
    face.corners.forEach((corner, index) => {
      const [screenX, screenY] = toScreen(corner);
      if (index === 0) context.moveTo(screenX, screenY);
      else context.lineTo(screenX, screenY);
    });
    context.closePath();

    // The page composites translucent grey over its own background. The icon
    // paints opaque greys from the fixed tab-strip palette instead.
    if (icon) {
      const luma = iconLumaFor(lambert);
      context.fillStyle = `rgb(${luma}, ${luma}, ${luma})`;
    } else {
      const alpha = toneFor(lambert);
      context.fillStyle = `rgba(${gray}, ${gray}, ${gray}, ${alpha})`;
    }
    context.fill();
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
  if (scratch) {
    scratch.clearRect(0, 0, width, height);

    const ink = icon
      ? `rgb(${ICON_EDGE_LUMA}, ${ICON_EDGE_LUMA}, ${ICON_EDGE_LUMA})`
      : `rgb(${gray}, ${gray}, ${gray})`;

    const stroke = (keys: string[], lineWidth: number) => {
      scratch.beginPath();
      for (const key of keys) {
        const [a, b] = key.split(':').map(Number);
        const [ax, ay] = toScreen(projected[a]);
        const [bx, by] = toScreen(projected[b]);
        scratch.moveTo(ax, ay);
        scratch.lineTo(bx, by);
      }
      scratch.lineWidth = lineWidth;
      scratch.lineCap = 'round';
      scratch.lineJoin = 'round';
      scratch.strokeStyle = ink;
      scratch.stroke();
    };

    // Line weight is in CSS pixels of the canvas.
    //
    // The icon is rastered at 64px and shown at 16-32px, so the weight is
    // expressed in display pixels and scaled up by the raster factor; choosing
    // it against the 64px buffer would make it a third of a pixel on screen.
    const weight = icon
      ? (ICON_EDGE_DISPLAY_PX * ICON_SIZE) / 16
      : Math.max(1, Math.min(width, height) / 200);

    stroke(seams, SEAM_WIDTH * weight);
    stroke(silhouette, CONTOUR_WIDTH * weight);

    context.globalAlpha = icon ? 1 : OUTLINE_ALPHA;
    context.drawImage(
      scratch.canvas,
      0,
      0,
      scratch.canvas.width,
      scratch.canvas.height,
      0,
      0,
      width,
      height,
    );
    context.globalAlpha = 1;
  }
}
