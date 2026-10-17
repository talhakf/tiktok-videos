import { Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Icon, IconName } from "../../icons/Icons";
import { TW, TX, TY } from "../../layout";
import { appleSpring, C, GLASS, mono, prog, sans, SHADOW_WINDOW } from "../../theme";

// "What we're talking about": a tool or product name set as a big wordmark on a card.

/**
 * White (or frosted, `glass`) rounded card with a tool name as a wordmark in Inter 700, an optional
 * small Icon or `src` image (e.g. a logo dropped in public/logos/) to its left and an optional mono
 * sub line ("github.com/…"). Pops in with a light spring (it is thrown in). Defaults to the content
 * column at the main stage (x 90, y 420, 900 wide); content is centred.
 */
export const LogoCard: React.FC<{
  name: string;
  at: number;
  until?: number;
  x?: number;
  y?: number;
  w?: number;
  sub?: string;
  icon?: IconName;
  iconColor?: string;
  src?: string;
  size?: number;
  glass?: boolean;
}> = ({ name, at, until, x = TX, y = TY, w = TW, sub, icon, iconColor = C.ink, src, size = 112, glass }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at) return null;
  const s = appleSpring(frame - at, fps, { response: 0.45, damping: 0.8 });
  const out = until !== undefined ? prog(frame, until, 8) : 0;
  if (out >= 1) return null;
  const mark = size * 0.92;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        padding: `${size * 0.5}px ${size * 0.5}px`,
        ...(glass ? GLASS : { background: C.white, borderRadius: 28, border: `1px solid ${C.line}`, boxShadow: SHADOW_WINDOW }),
        borderRadius: 40,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        scale: String(interpolate(s, [0, 1], [0.92, 1]) - 0.03 * out),
        opacity: Math.min(1, s * 1.6) * (1 - out),
        filter: out > 0 ? `blur(${out * 8}px)` : undefined,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: size * 0.32 }}>
        {src ? (
          <Img src={staticFile(src)} style={{ height: mark, width: "auto", display: "block" }} />
        ) : icon ? (
          <Icon name={icon} size={mark} color={iconColor} weight={2} draw={prog(frame, at + 2, 16)} />
        ) : null}
        <div style={{ fontFamily: sans, fontWeight: 700, fontSize: size, letterSpacing: "-0.045em", lineHeight: 1.05, color: C.ink, whiteSpace: "nowrap" }}>
          {name}
        </div>
      </div>
      {sub ? (
        <div style={{ fontFamily: mono, fontWeight: 500, fontSize: size * 0.27, color: C.mute, marginTop: size * 0.22 }}>{sub}</div>
      ) : null}
    </div>
  );
};
