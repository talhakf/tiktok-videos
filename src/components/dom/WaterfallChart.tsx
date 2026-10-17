import { useCurrentFrame } from "remotion";
import { TX, TW } from "../../layout";
import { C, materialize, mono, prog, sans } from "../../theme";
import { AMBER, Cue, DevCard, focusTrack, mixTone, TAB_H, Tone } from "../dev/card";
import { GREEN, lerp, presence, RED } from "../diagram/Node";
import { tint } from "../windows/MacWindow";

export type WaterfallRequest = {
  name: string;
  status?: number;
  type?: string;
  size?: string;
  startMs: number;
  dnsMs?: number;
  tcpMs?: number;
  ttfbMs: number;
  downloadMs: number;
};

export type WaterfallFocusCue = Cue & {
  index: number;
  tone?: Tone;
  label?: string;
};

const DNS_COLOR = "#32ADE6";
const TCP_COLOR = AMBER;
const TTFB_COLOR = GREEN;
const DL_COLOR = C.accent;

const PHASES = [
  { label: "DNS", color: DNS_COLOR },
  { label: "TCP/TLS", color: TCP_COLOR },
  { label: "Wait TTFB", color: TTFB_COLOR },
  { label: "Download", color: DL_COLOR },
];

/**
 * Browser DevTools Network Waterfall chart: rows of requests (`index.html`, `app.js`,
 * `styles.css`, `api/user`) with horizontal timing bars split into phases
 * (`DNS`, `TCP/TLS`, `Wait TTFB`, `Download`) and a total load time marker.
 */
export const WaterfallChart: React.FC<{
  x?: number;
  y: number;
  w?: number;
  h?: number;
  at: number;
  until?: number;
  requests: WaterfallRequest[];
  maxMs?: number;
  loadMs?: number;
  focus?: WaterfallFocusCue[];
  filename?: string;
  right?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({
  x = TX,
  y,
  w = TW,
  h,
  at,
  until,
  requests,
  maxMs,
  loadMs,
  focus = [],
  filename = "Network · Waterfall",
  right,
  style,
}) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;

  const computedLoad =
    loadMs ??
    Math.max(
      100,
      ...requests.map((r) => r.startMs + (r.dnsMs ?? 0) + (r.tcpMs ?? 0) + r.ttfbMs + r.downloadMs)
    );
  const scaleMax = maxMs ?? Math.ceil((computedLoad * 1.15) / 50) * 50;

  const padX = 26;
  const legendH = 62;
  const rulerH = 44;
  const rowH = 74;
  const footerH = 60;
  const rowsTop = legendH + rulerH;
  const totalRowsH = requests.length * rowH;
  const bodyH = rowsTop + totalRowsH + footerH;
  const cardH = h ?? (filename !== undefined ? TAB_H : 0) + bodyH;

  const nameColW = 310;
  const trackLeft = padX + nameColW;
  const trackRight = w - padX - 24;
  const trackW = trackRight - trackLeft;

  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(f * scaleMax));

  const ft = focusTrack(frame, focus);
  const bandY = ft
    ? rowsTop + (ft.prev ? lerp(ft.prev.index, ft.cur.index, ft.t) : ft.cur.index) * rowH
    : 0;
  const bandColors = ft ? mixTone(ft.prev?.tone ?? ft.cur.tone ?? "accent", ft.cur.tone ?? "accent", ft.t) : null;

  const loadX = trackLeft + (computedLoad / scaleMax) * trackW;
  const loadMarkerP = prog(frame, at + 18, 12);

  return (
    <DevCard
      x={x}
      y={y}
      w={w}
      h={cardH}
      p={p}
      filename={filename}
      icon="globe"
      right={right ?? `${requests.length} requests · ${computedLoad} ms`}
      style={style}
    >
      {/* Top phase legend strip */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: legendH,
          borderBottom: `1px solid ${C.line}`,
          padding: `0 ${padX}px`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#FAFAFC",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          {PHASES.map((ph) => (
            <div key={ph.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 16, height: 16, borderRadius: 4, background: ph.color }} />
              <span style={{ fontFamily: sans, fontWeight: 600, fontSize: 19, color: C.ink }}>{ph.label}</span>
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "4px 12px",
            borderRadius: 10,
            background: tint(RED, 0.11),
            fontFamily: mono,
            fontWeight: 700,
            fontSize: 18,
            color: "#C9281E",
          }}
        >
          <div style={{ width: 10, height: 10, borderRadius: 5, background: RED }} />
          Load: {computedLoad} ms
        </div>
      </div>

      {/* Column headers & timeline ruler */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: legendH,
          height: rulerH,
          borderBottom: `1px solid ${C.line}`,
          background: "#F5F5F7",
          fontFamily: mono,
          fontWeight: 600,
          fontSize: 17,
          color: C.mute,
        }}
      >
        <div style={{ position: "absolute", left: padX, top: 10 }}>Name / Status</div>
        {ticks.map((ms) => {
          const tx = trackLeft + (ms / scaleMax) * trackW;
          return (
            <div
              key={ms}
              style={{
                position: "absolute",
                left: tx,
                top: 10,
                translate: "-50% 0",
                whiteSpace: "nowrap",
              }}
            >
              {ms}ms
            </div>
          );
        })}
      </div>

      {/* Vertical grid lines in waterfall area */}
      {ticks.map((ms) => {
        const tx = trackLeft + (ms / scaleMax) * trackW;
        return (
          <div
            key={`grid-${ms}`}
            style={{
              position: "absolute",
              left: tx,
              top: rowsTop,
              height: totalRowsH,
              width: 1,
              background: "rgba(0,0,0,0.06)",
            }}
          />
        );
      })}

      {/* Gliding focus highlight band */}
      {ft && bandColors ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: bandY,
            height: rowH,
            background: bandColors.bg,
            borderLeft: `6px solid ${bandColors.edge}`,
            opacity: ft.o,
          }}
        />
      ) : null}

      {/* Request rows */}
      {requests.map((req, i) => {
        const rowTop = rowsTop + i * rowH;
        const status = req.status ?? 200;
        const isErr = status >= 400;
        const dns = req.dnsMs ?? 0;
        const tcp = req.tcpMs ?? 0;
        const ttfb = req.ttfbMs;
        const dl = req.downloadMs;
        const totalReqMs = dns + tcp + ttfb + dl;

        const barGrow = prog(frame, at + 6 + i * 4, 14);
        const startX = trackLeft + (req.startMs / scaleMax) * trackW;
        const dnsW = (dns / scaleMax) * trackW * barGrow;
        const tcpW = (tcp / scaleMax) * trackW * barGrow;
        const ttfbW = (ttfb / scaleMax) * trackW * barGrow;
        const dlW = (dl / scaleMax) * trackW * barGrow;
        const totalW = dnsW + tcpW + ttfbW + dlW;

        return (
          <div
            key={req.name}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: rowTop,
              height: rowH,
              borderBottom: `1px solid ${C.line}`,
              display: "flex",
              alignItems: "center",
            }}
          >
            {/* Left request info */}
            <div
              style={{
                width: nameColW,
                paddingLeft: padX,
                paddingRight: 14,
                display: "flex",
                alignItems: "center",
                gap: 12,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  padding: "3px 9px",
                  borderRadius: 8,
                  background: isErr ? tint(RED, 0.14) : tint(GREEN, 0.15),
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize: 17,
                  color: isErr ? "#C9281E" : "#1E7E34",
                }}
              >
                {status}
              </div>
              <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: mono,
                    fontWeight: 700,
                    fontSize: 21,
                    color: C.ink,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {req.name}
                </div>
                {req.type || req.size ? (
                  <div style={{ fontFamily: mono, fontSize: 15, color: C.mute }}>
                    {[req.type, req.size].filter(Boolean).join(" · ")}
                  </div>
                ) : null}
              </div>
            </div>

            {/* Segmented waterfall timing bar */}
            <div
              style={{
                position: "absolute",
                left: startX,
                top: (rowH - 28) / 2,
                width: Math.max(4, totalW),
                height: 28,
                borderRadius: 8,
                overflow: "hidden",
                display: "flex",
                boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.1)",
              }}
            >
              {dnsW > 0 ? <div style={{ width: dnsW, height: "100%", background: DNS_COLOR }} /> : null}
              {tcpW > 0 ? <div style={{ width: tcpW, height: "100%", background: TCP_COLOR }} /> : null}
              {ttfbW > 0 ? <div style={{ width: ttfbW, height: "100%", background: TTFB_COLOR }} /> : null}
              {dlW > 0 ? <div style={{ width: dlW, height: "100%", background: DL_COLOR }} /> : null}
            </div>

            {/* Duration label next to bar */}
            <div
              style={{
                position: "absolute",
                left: Math.min(startX + totalW + 10, w - 105),
                top: (rowH - 24) / 2,
                fontFamily: mono,
                fontWeight: 700,
                fontSize: 18,
                color: C.ink,
                opacity: barGrow,
                whiteSpace: "nowrap",
              }}
            >
              {totalReqMs} ms
            </div>
          </div>
        );
      })}

      {/* Total load time vertical marker */}
      <div
        style={{
          position: "absolute",
          left: loadX - 1.5,
          top: rowsTop - 6,
          height: totalRowsH + 12,
          width: 0,
          borderLeft: `3px dashed ${RED}`,
          opacity: loadMarkerP,
        }}
      />

      {/* Footer summary bar */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: footerH,
          padding: `0 ${padX}px`,
          background: "#FAFAFC",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontFamily: mono,
          fontWeight: 600,
          fontSize: 19,
          color: C.mute,
        }}
      >
        <div>{requests.length} requests · transferred over HTTP/2</div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {ft?.cur.label && bandColors ? (
            <span
              style={{
                padding: "4px 12px",
                borderRadius: 8,
                background: bandColors.bg,
                color: bandColors.fg,
                fontWeight: 700,
                ...materialize(ft.o),
              }}
            >
              {ft.cur.label}
            </span>
          ) : null}
          <span style={{ color: C.ink, fontWeight: 700 }}>Finish: {computedLoad} ms</span>
        </div>
      </div>
    </DevCard>
  );
};
