import { Img, staticFile, useCurrentFrame } from "remotion";
import { Icon } from "../../icons/Icons";
import { C, easeInOut, materialize, prog, sans } from "../../theme";
import { MacWindow, NavChevrons } from "./MacWindow";

// Safari-like browser window: unified toolbar with a URL field, a page body (children or a screenshot)
// that can slowly scroll or zoom, URL typing and a thin blue loading bar.

/** Split a URL into protocol, host and the rest (path, query, hash). */
export const splitUrl = (url: string) => {
  const m = url.match(/^([a-z]+:\/\/)?([^/?#]*)(.*)$/i);
  return { proto: m?.[1] ?? "", host: m?.[2] ?? url, rest: m?.[3] ?? "" };
};

const glide = (frame: number, m?: { from?: number; to: number; at: number; dur?: number }, base = 0) =>
  m ? (m.from ?? base) + (m.to - (m.from ?? base)) * prog(frame, m.at, m.dur ?? 60, easeInOut) : base;

/**
 * Safari-style browser. `url` like "github.com/raccoon/dotfiles": padlock + domain in ink, path in grey.
 * Body = `children` or `src` (screenshot in public/, full width, top-aligned). `scroll` slides the page up
 * by px, `zoom` scales it (from the top centre). `typeAt` types the URL into an empty field first;
 * `loadAt` runs the loading bar and reveals the page. `private` = dark Private Browsing toolbar.
 */
export const BrowserWindow: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  url: string;
  at?: number;
  until?: number;
  src?: string;
  children?: React.ReactNode;
  scroll?: { from?: number; to: number; at: number; dur?: number };
  zoom?: { from?: number; to: number; at: number; dur?: number };
  typeAt?: number;
  typeFrames?: number;
  loadAt?: number;
  loadDur?: number;
  private?: boolean;
  secure?: boolean; // false: "not secure" warning instead of the padlock
  pageColor?: string;
  style?: React.CSSProperties;
}> = ({
  x,
  y,
  w,
  h,
  url,
  at = 0,
  until,
  src,
  children,
  scroll,
  zoom,
  typeAt,
  typeFrames,
  loadAt,
  loadDur = 30,
  private: priv,
  secure = true,
  pageColor = C.white,
  style,
}) => {
  const frame = useCurrentFrame();
  const fs = 26;
  const ink = priv ? "#F5F5F7" : C.ink;
  const grey = priv ? "#8E8E93" : C.mute;
  const { host, rest } = splitUrl(url);
  const shown = url.replace(/^[a-z]+:\/\//i, "");

  // Typing: the field is empty before typeAt, shows the typed text left-aligned, then settles into the
  // centred "domain + path" display when the page starts loading (or shortly after typing ends).
  const tf = typeFrames ?? Math.min(36, Math.max(8, Math.round(shown.length * 1.3)));
  const typedEnd = typeAt !== undefined ? typeAt + tf : -Infinity;
  const settleAt = typeAt === undefined ? -Infinity : loadAt !== undefined && loadAt >= typedEnd ? loadAt : typedEnd + 4;
  const nTyped = typeAt === undefined ? shown.length : Math.max(0, Math.min(shown.length, Math.floor(((frame - typeAt) / tf) * shown.length)));
  // Sequential swap (typed text out in 3 frames, then the display state in), never both at once.
  const settle = typeAt === undefined ? 1 : prog(frame, settleAt + 3, 6);
  const typedOut = typeAt === undefined ? 1 : prog(frame, settleAt, 3);
  const editing = typeAt !== undefined && frame < settleAt + 3;

  // Loading bar and page reveal.
  const load = loadAt !== undefined ? prog(frame, loadAt, loadDur) : 1;
  const barOut = loadAt !== undefined ? prog(frame, loadAt + loadDur, 6) : 1;
  const reveal = loadAt !== undefined ? prog(frame, loadAt + loadDur * 0.35, 10) : 1;

  const field = (
    <div
      style={{
        flex: 1,
        height: 50,
        borderRadius: 14,
        background: priv ? "#3A3A3C" : "rgba(0,0,0,0.055)",
        position: "relative",
        fontFamily: sans,
        fontWeight: 500,
        fontSize: fs,
        letterSpacing: "-0.01em",
        whiteSpace: "nowrap",
        overflow: "hidden",
      }}
    >
      {editing ? (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", padding: "0 20px", opacity: 1 - typedOut }}>
          {frame < (typeAt ?? 0) ? (
            <span style={{ color: grey }}>Search or enter website name</span>
          ) : (
            <>
              <span style={{ color: ink }}>{shown.slice(0, nTyped)}</span>
              <span style={{ width: 2.5, height: fs * 1.15, background: C.accent, marginLeft: 1 }} />
            </>
          )}
        </div>
      ) : null}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          padding: "0 20px",
          opacity: settle,
        }}
      >
        {secure ? (
          <Icon name="lock" size={24} color={grey} weight={2.2} />
        ) : (
          <>
            <Icon name="warning" size={24} color="#FF3B30" weight={2.2} />
            <span style={{ color: "#FF3B30" }}>Not secure</span>
            <span style={{ color: grey }}>—</span>
          </>
        )}
        <span style={{ color: ink }}>{host}</span>
        <span style={{ color: grey, marginLeft: -10, overflow: "hidden", textOverflow: "ellipsis" }}>{rest}</span>
      </div>
    </div>
  );

  const toolbar = (
    <>
      <NavChevrons color={grey} />
      {field}
      {priv ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, fontFamily: sans, fontWeight: 600, fontSize: 22, color: grey }}>
          <Icon name="mask" size={28} color={grey} weight={2} />
          Private
        </div>
      ) : (
        <div style={{ width: 62, flexShrink: 0, display: "flex", justifyContent: "flex-end" }}>
          <Icon name="plus" size={28} color={grey} weight={2} />
        </div>
      )}
      {loadAt !== undefined && frame >= loadAt && barOut < 1 ? (
        <div style={{ position: "absolute", left: 0, bottom: -1, height: 4, width: `${load * 100}%`, background: C.accent, opacity: 1 - barOut }} />
      ) : null}
    </>
  );

  const sy = glide(frame, scroll, 0);
  const z = glide(frame, zoom, 1);

  return (
    <MacWindow
      x={x}
      y={y}
      w={w}
      h={h}
      at={at}
      until={until}
      toolbar={toolbar}
      barHeight={84}
      dark={priv}
      style={style}
      bodyStyle={{ background: pageColor }}
    >
      <div style={{ position: "absolute", inset: 0, ...materialize(reveal, 1, 6) }}>
        <div style={{ position: "relative", height: "100%", translate: `0px ${-sy}px`, scale: String(z), transformOrigin: "50% 0%" }}>
          {src ? <Img src={staticFile(src)} style={{ width: "100%", display: "block" }} /> : children}
        </div>
      </div>
    </MacWindow>
  );
};
