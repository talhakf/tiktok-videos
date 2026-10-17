import { AbsoluteFill, Still } from "remotion";
import { BRAND } from "../brand/config";
import { C, GLASS, mono, sans } from "../theme";
import { Backdrop } from "./Backdrop";

// TikTok cover, uploaded in TikTok Studio (web): Edit cover → Upload cover. TikTok wants 3:4, so the cover is
// its own 1080×1440 design, not a frame of the video. Keep everything important between y 180 and 1260:
// some grids crop the cover to a centered square.
export const COVER_W = 1080;
export const COVER_H = 1440;
export const CX = 80; // left edge of the content column
export const CW = COVER_W - 2 * CX;

/** Register a video's cover next to its composition: <CoverStill id="Git3Cover" component={Git3Cover} />. */
export const CoverStill: React.FC<{ id: string; component: React.FC }> = ({ id, component }) => (
  <Still id={id} component={component} width={COVER_W} height={COVER_H} />
);

/**
 * Layout every cover shares: two-tone headline at the top, a visual slot (terminal, raccoon) in the middle,
 * glass chips naming what's inside, the handle at the bottom. Children are absolutely positioned on the canvas.
 */
export const Cover: React.FC<{ title: string; sub: string; chips?: string[]; size?: number; handle?: string; children?: React.ReactNode }> = ({
  title,
  sub,
  chips = [],
  size = 104,
  handle = BRAND.handle,
  children,
}) => (
  <AbsoluteFill style={{ fontFamily: sans }}>
    <Backdrop />
    <div
      style={{
        position: "absolute",
        left: CX,
        top: 190,
        width: CW,
        fontWeight: 700,
        fontSize: size,
        lineHeight: 1.0,
        letterSpacing: "-0.045em",
        color: C.ink,
      }}
    >
      {title}
      <br />
      <span style={{ color: C.mute }}>{sub}</span>
    </div>
    {children}
    {chips.length ? (
      <div style={{ position: "absolute", left: CX, top: 1130, width: CW, display: "flex", flexWrap: "wrap", gap: 16 }}>
        {chips.map((c) => (
          <div
            key={c}
            style={{
              ...GLASS,
              background: C.white,
              borderRadius: 999,
              padding: "14px 30px",
              fontFamily: mono,
              fontWeight: 500,
              fontSize: 38,
              color: C.ink,
            }}
          >
            {c}
          </div>
        ))}
      </div>
    ) : null}
    <div style={{ position: "absolute", left: CX, top: 1300, fontWeight: 600, fontSize: 34, color: C.mute }}>{handle}</div>
  </AbsoluteFill>
);
