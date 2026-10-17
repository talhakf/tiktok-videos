import { useCurrentFrame } from "remotion";
import { easeInOut, H, prog, W } from "../../theme";

// A camera over a whole stage: the children are laid out on the normal 1080×1920 page, and the camera glides
// (ease-in-out) to frame a rect of it on cue, so "zoom into this terminal line" is one key with that line's box
// (`termRing(...)` gives one). The rect is fitted inside the screen and centred; the default is the full canvas.
// Keep the headline, captions and stickers that should not zoom outside the Camera.

export type CamRect = { x: number; y: number; w: number; h: number };
export type CamKey = CamRect & { at: number; dur?: number };

/** The full canvas: a key with this rect zooms back out. */
export const FULL_FRAME: CamRect = { x: 0, y: 0, w: W, h: H };

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Rect the camera frames at `frame`: starts at `start`, glides (`dur` frames, easeInOut) to each key in turn. */
export const cameraRect = (frame: number, keys: CamKey[], dur = 16, start: CamRect = FULL_FRAME): CamRect => {
  let r = start;
  for (const k of [...keys].sort((a, b) => a.at - b.at)) {
    if (frame < k.at) break;
    const t = prog(frame, k.at, k.dur ?? dur, easeInOut);
    r = { x: lerp(r.x, k.x, t), y: lerp(r.y, k.y, t), w: lerp(r.w, k.w, t), h: lerp(r.h, k.h, t) };
  }
  return r;
};

/**
 * Zooms and pans its children (page-positioned, full canvas) to `keys: {at, x, y, w, h, dur?}[]` in page px.
 * `pad` = breathing room around every rect, `dur` = default glide (16 frames). Children render unchanged
 * until the first key.
 */
export const Camera: React.FC<{
  keys: CamKey[];
  dur?: number;
  pad?: number;
  start?: CamRect;
  children: React.ReactNode;
}> = ({ keys, dur = 16, pad = 40, start = FULL_FRAME, children }) => {
  const frame = useCurrentFrame();
  // Pad each key rect (not the glide), so the zoom stays continuous; full-canvas keys keep scale 1.
  const padded = keys.map((k) => (k.w >= W && k.h >= H ? k : { ...k, x: k.x - pad, y: k.y - pad, w: k.w + pad * 2, h: k.h + pad * 2 }));
  const r = cameraRect(frame, padded, dur, start);
  const s = Math.min(W / r.w, H / r.h);
  const cx = r.x + r.w / 2;
  const cy = r.y + r.h / 2;
  const tx = W / 2 - cx * s;
  const ty = H / 2 - cy * s;
  const idle = Math.abs(s - 1) < 1e-4 && Math.abs(tx) < 0.01 && Math.abs(ty) < 0.01;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: W,
          height: H,
          transformOrigin: "0 0",
          transform: idle ? undefined : `translate(${tx}px, ${ty}px) scale(${s})`,
        }}
      >
        {children}
      </div>
    </div>
  );
};
