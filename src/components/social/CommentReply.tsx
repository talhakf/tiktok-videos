import { useCurrentFrame } from "remotion";
import { Icon } from "../../icons/Icons";
import { TW, TX } from "../../layout";
import { C, easeInOut, materialize, prog, sans } from "../../theme";
import { CARD_SHADOW, lerp } from "../diagram/Node";
import { outP } from "../layouts/Mark";

// "Replying to a viewer's comment": the hook card short-form explainers open on. Generic and unbranded
// (no app logo or colours): a white card with an initial avatar, the handle, the comment and a small heart count.
// It materializes at the top as the hook, then can glide (easeInOut) into a small corner badge at `dockAt`
// so the answer gets the stage while the question stays in view.

/** First letter of a handle for the avatar ("@sleepy_dev" → "s"), kept in its own case. */
const initial = (handle: string) => handle.replace(/^@/, "").charAt(0) || "?";

/**
 * Viewer comment card. `text` breaks only at "\n" or at the card width. `dock` (with `dockAt`) is the badge's
 * top-left and scale (default: the top-left of the content column at 0.6, the smallest that keeps the text ≥ 26 px). `label` is the grey line above the
 * comment ("replying to", "asked"), off when empty.
 */
export const CommentReply: React.FC<{
  handle: string;
  text: string;
  at: number;
  until?: number;
  likes?: string; // "1,204": shown as text, never zero-padded
  meta?: string; // grey after the handle, e.g. "2h"
  label?: string;
  x?: number;
  y?: number;
  w?: number;
  size?: number; // comment text px
  dockAt?: number;
  dock?: { x: number; y: number; scale?: number };
}> = ({ handle, text, at, until, likes, meta, label = "replying to", x = TX, y = 300, w = TW, size = 46, dockAt, dock }) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const out = outP(frame, until);
  if (out >= 1) return null;
  const p = prog(frame, at, 10);
  const d = dockAt !== undefined ? prog(frame, dockAt, 16, easeInOut) : 0;
  const to = { x: dock?.x ?? TX, y: dock?.y ?? 200, scale: dock?.scale ?? 0.6 };
  const avatar = Math.round(size * 1.6);
  return (
    <div
      style={{
        position: "absolute",
        left: lerp(x, to.x, d),
        top: lerp(y, to.y, d),
        width: w,
        boxSizing: "border-box",
        padding: "34px 38px 36px",
        borderRadius: 36,
        background: C.white,
        boxShadow: CARD_SHADOW,
        border: "1px solid rgba(0,0,0,0.06)",
        transformOrigin: "0% 0%",
        fontFamily: sans,
        ...materialize(p * (1 - out), 0.95, 8),
        scale: String((0.95 + 0.05 * p) * lerp(1, to.scale, d)),
        translate: `0px ${(1 - p) * -24}px`,
      }}
    >
      {label ? (
        <div style={{ fontWeight: 600, fontSize: 28, color: C.mute, letterSpacing: "-0.01em", marginBottom: 20 }}>{label}</div>
      ) : null}
      <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
        <div
          style={{
            width: avatar,
            height: avatar,
            borderRadius: avatar / 2,
            background: C.soft,
            color: C.ink,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: avatar * 0.46,
            letterSpacing: "-0.02em",
            flexShrink: 0,
          }}
        >
          {initial(handle)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 30, color: C.mute, letterSpacing: "-0.01em", whiteSpace: "pre" }}>
            {handle}
            {meta ? <span style={{ color: "#AEAEB2" }}>{`  ·  ${meta}`}</span> : null}
          </div>
          <div style={{ marginTop: 8, fontWeight: 600, fontSize: size, lineHeight: 1.2, letterSpacing: "-0.025em", color: C.ink, whiteSpace: "pre-wrap" }}>
            {text}
          </div>
        </div>
        {likes !== undefined ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, paddingTop: 6, flexShrink: 0 }}>
            <Icon name="heart" size={40} color={C.mute} weight={2} />
            <span style={{ fontWeight: 600, fontSize: 26, color: C.mute, fontVariantNumeric: "tabular-nums" }}>{likes}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
};
