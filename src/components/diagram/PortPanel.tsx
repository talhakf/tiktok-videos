import { interpolateColors, useCurrentFrame } from "remotion";
import { Icon, IconName } from "../../icons/Icons";
import { CARD_SHADOW, presence } from "./Node";
import { GREEN, RED } from "../layouts/Mark";
import { tint } from "../windows/MacWindow";
import { C, easeOut, materialize, mono, prog, sans } from "../../theme";

// One computer as a row of numbered doors: "localhost" on top, then one row per port with the app that
// listens there (green dot) or nothing (grey). `knocks` slide a request chip into a gutter left of the
// doors: it turns into a green check on an open port, a red cross + "connection refused" on a closed one. `clashes` show a second app
// trying to take a busy port ("address already in use"). Dev ports, SSH on 22, HTTPS on 443.

export type PortRow = { port: number; app?: string; at?: number; icon?: IconName; openAt?: number; closeAt?: number };
export type Knock = { port: number; at: number; label?: string }; // label: ≤ 4 chars ("GET"), default an arrow
export type Clash = { port: number; at: number; app: string; label?: string };

/** Port panel at (x, y), `w` wide. A row is open (listening) when it has an `app` and frame ≥ openAt, until closeAt. */
export const PortPanel: React.FC<{
  x: number;
  y: number;
  w?: number;
  at: number;
  until?: number;
  host?: string;
  sub?: string;
  ports: PortRow[];
  knocks?: Knock[];
  clashes?: Clash[];
  rowH?: number;
  size?: number;
}> = ({ x, y, w = 900, at, until, host = "localhost", sub = "127.0.0.1 · this computer", ports, knocks = [], clashes = [], rowH = 112, size = 36 }) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;
  const headH = 120;
  const gutter = knocks.length ? 140 : 0; // room left of the doors where request chips land

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: headH + ports.length * rowH,
        background: C.white,
        borderRadius: 30,
        border: `1px solid ${C.line}`,
        boxShadow: CARD_SHADOW,
        ...materialize(p),
      }}
    >
      <div style={{ height: headH, display: "flex", alignItems: "center", gap: 22, padding: "0 34px", borderBottom: `1px solid ${C.line}` }}>
        <Icon name="laptop" size={60} color={C.ink} weight={2} draw={prog(frame, at + 2, 14)} />
        <div>
          <div style={{ fontFamily: mono, fontWeight: 700, fontSize: size * 1.05, color: C.ink }}>{host}</div>
          <div style={{ fontFamily: sans, fontWeight: 600, fontSize: size * 0.62, color: C.mute }}>{sub}</div>
        </div>
      </div>

      {ports.map((r, i) => {
        const rp = prog(frame, r.at ?? at + 6 + i * 4, 8);
        const open = r.app !== undefined && frame >= (r.openAt ?? -Infinity) && frame < (r.closeAt ?? Infinity);
        const openP = r.app === undefined ? 0 : prog(frame, r.openAt ?? -100, 8) * (1 - (r.closeAt !== undefined ? prog(frame, r.closeAt, 8) : 0));
        const knock = [...knocks].filter((k) => k.port === r.port && frame >= k.at).pop();
        const clash = [...clashes].filter((c) => c.port === r.port && frame >= c.at).pop();
        // knock: chip glides in (12 frames), then the result shows
        const kIn = knock ? prog(frame, knock.at, 12, easeOut) : 0;
        const kRes = knock ? prog(frame, knock.at + 12, 8) : 0;
        const okKnock = knock ? open : false;
        const cIn = clash ? prog(frame, clash.at, 12, easeOut) : 0;
        const cRes = clash ? prog(frame, clash.at + 12, 8) : 0;
        const flash = Math.max(kRes, cRes);
        const bad = (knock && !okKnock && kRes > 0) || (clash && cRes > 0);
        const rowBg = flash > 0 ? interpolateColors(flash, [0, 1], [C.white, bad ? tint(RED, 0.1) : tint(GREEN, 0.12)]) : C.white;
        return (
          <div
            key={r.port}
            style={{
              position: "absolute",
              left: 0,
              top: headH + i * rowH,
              width: w,
              height: rowH,
              display: "flex",
              alignItems: "center",
              gap: 26,
              padding: `0 34px 0 ${34 + gutter}px`,
              boxSizing: "border-box",
              borderTop: i ? `1px solid ${C.line}` : undefined,
              background: rowBg,
              borderRadius: i === ports.length - 1 ? "0 0 30px 30px" : undefined,
              opacity: rp,
              translate: `${(1 - rp) * 24}px 0px`,
            }}
          >
            <Icon name="door" size={50} color={interpolateColors(openP, [0, 1], [C.mute, C.ink])} weight={2} />
            <span style={{ fontFamily: mono, fontWeight: 700, fontSize: size * 1.1, color: C.ink, width: size * 3.2, fontVariantNumeric: "tabular-nums" }}>{r.port}</span>
            <span style={{ fontFamily: sans, fontWeight: 600, fontSize: size, color: openP > 0.5 ? C.ink : C.mute, flex: 1, whiteSpace: "pre", overflow: "hidden" }}>
              {knock && !okKnock && kRes > 0.5 ? <span style={{ color: RED }}>connection refused</span> : r.app && openP > 0 ? r.app : "nothing here"}
            </span>
            {r.icon && openP > 0 ? <Icon name={r.icon} size={44} color={C.mute} weight={2} /> : null}
            <div style={{ width: 22, height: 22, borderRadius: 11, background: interpolateColors(openP, [0, 1], ["#D2D2D7", GREEN]), flexShrink: 0 }} />

            {/* request chip arriving from the left into the gutter; turns into a check or a cross */}
            {knock && kIn > 0 ? (
              <div
                style={{
                  position: "absolute",
                  left: 26 - (1 - kIn) * 220,
                  top: rowH / 2 - 32,
                  width: 96,
                  height: 64,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: kRes > 0.5 ? (okKnock ? GREEN : RED) : C.accent,
                  borderRadius: 32,
                  boxShadow: CARD_SHADOW,
                  opacity: kIn,
                }}
              >
                {knock.label && kRes <= 0.5 ? (
                  <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 24, color: C.white }}>{knock.label}</span>
                ) : (
                  <Icon name={kRes > 0.5 ? (okKnock ? "check" : "cross") : "arrowRight"} size={36} color={C.white} weight={2.8} />
                )}
              </div>
            ) : null}

            {/* a second app trying to take the same port */}
            {clash && cIn > 0 ? (
              <div
                style={{
                  position: "absolute",
                  right: 20,
                  top: rowH / 2 - 32,
                  height: 64,
                  padding: "0 24px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  background: C.white,
                  border: `3px solid ${cRes > 0.5 ? RED : C.accent}`,
                  borderRadius: 18,
                  fontFamily: sans,
                  fontWeight: 600,
                  fontSize: 26,
                  color: cRes > 0.5 ? RED : C.ink,
                  boxShadow: CARD_SHADOW,
                  opacity: cIn,
                  translate: `${(1 - cIn) * 200}px 0px`,
                  whiteSpace: "pre",
                }}
              >
                <Icon name={cRes > 0.5 ? "warning" : "plug"} size={34} color={cRes > 0.5 ? RED : C.accent} weight={2.2} />
                {cRes > 0.5 ? (clash.label ?? "address already in use") : clash.app}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};
