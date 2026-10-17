import QRCode from "qrcode";
import { useCurrentFrame } from "remotion";
import { C, easeInOut, materialize, prog, sans, TERM } from "../../theme";
import type { Seg } from "../Terminal";

// A real, scannable QR code (qrcode lib): crisp square modules, dark #1D1D1F on a white card with the
// standard 4-module quiet zone. Modules build in row by row, or behind a blue scan line (`mode="sweep"`).
// `qrTerminalLines` prints the same code with half-block characters for a Terminal window.

type Ecl = "L" | "M" | "Q" | "H";

const modules = (text: string, ecl: Ecl) => {
  const m = QRCode.create(text, { errorCorrectionLevel: ecl }).modules;
  return { n: m.size, dark: (r: number, c: number) => r >= 0 && c >= 0 && r < m.size && c < m.size && m.data[r * m.size + c] === 1 };
};

/**
 * QR code for `text` on a white card `size` px square at x / y, building in at `at` over `dur` frames.
 * `label` goes under the card (e.g. the network name). Error correction "M" by default.
 */
export const QrCode: React.FC<{
  text: string;
  at: number;
  x: number;
  y: number;
  size?: number;
  mode?: "rows" | "sweep";
  dur?: number;
  ecl?: Ecl;
  label?: string;
  until?: number;
}> = ({ text, at, x, y, size = 420, mode = "rows", dur = 24, ecl = "M", label, until }) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const inP = prog(frame, at, 10);
  const out = until !== undefined ? prog(frame, until, 8) : 0;
  if (out >= 1) return null;

  const { n, dark } = modules(text, ecl);
  const q = 4;
  const N = n + q * 2;
  const start = at + 6;
  const sweep = prog(frame, start, dur, easeInOut); // 0..1 down the code
  const rows = [...Array(n)].map((_, r) => {
    let d = "";
    for (let c = 0; c < n; c++) if (dark(r, c)) d += `M${c + q} ${r + q}h1v1h-1z`;
    const o =
      mode === "sweep"
        ? Math.max(0, Math.min(1, (sweep * (n + 2) - r) / 1.5))
        : prog(frame, start + (r * dur) / n, 5);
    return d && o > 0 ? <path key={r} d={d} fill={C.ink} opacity={o} /> : null;
  });
  const lineY = q + sweep * (n + 2) - 1;
  const lineO = mode === "sweep" ? prog(frame, start, 4) * (1 - prog(frame, start + dur, 8)) : 0;

  return (
    <div style={{ position: "absolute", left: x, top: y, width: size, ...materialize(inP * (1 - out), 0.95, 8) }}>
      <div
        style={{
          width: size,
          height: size,
          background: C.white,
          borderRadius: 28,
          border: `1px solid ${C.line}`,
          boxShadow: "0 24px 50px rgba(0,0,0,0.12), 0 6px 14px rgba(0,0,0,0.06)",
          overflow: "hidden",
        }}
      >
        <svg width={size} height={size} viewBox={`0 0 ${N} ${N}`} shapeRendering="crispEdges" style={{ display: "block" }}>
          {rows}
          {lineO > 0 ? <rect x={q - 1} y={lineY - 0.15} width={n + 2} height={0.3} rx={0.15} fill={C.accent} opacity={lineO} shapeRendering="auto" /> : null}
        </svg>
      </div>
      {label ? (
        <div
          style={{
            marginTop: 22,
            textAlign: "center",
            fontFamily: sans,
            fontWeight: 600,
            fontSize: 34,
            letterSpacing: "-0.01em",
            color: C.mute,
            opacity: prog(frame, start + dur * 0.6, 10),
          }}
        >
          {label}
        </div>
      ) : null}
    </div>
  );
};

/**
 * The same QR as text lines for `Terminal` output: two modules per character with ▀ ▄ █. Terminals draw light
 * text on dark, so light modules (and the quiet zone) are the drawn blocks and dark modules are spaces. That
 * keeps dark-on-light polarity, which every reader scans. `quiet` = light border in modules (default 2).
 */
export const qrTerminalLines = (text: string, { quiet = 2, ecl = "M" as Ecl } = {}): string[] => {
  const { n, dark } = modules(text, ecl);
  const lo = -quiet;
  const hi = n + quiet; // exclusive
  const light = (r: number, c: number) => r < hi && !dark(r, c);
  const lines: string[] = [];
  for (let r = lo; r < hi; r += 2) {
    let s = "";
    for (let c = lo; c < hi; c++) {
      const top = light(r, c);
      const bot = light(r + 1, c);
      s += top && bot ? "█" : top ? "▀" : bot ? "▄" : " ";
    }
    lines.push(s);
  }
  return lines;
};

/**
 * The same QR as `Terminal` output rows that render seamlessly in the browser: one row per module, two
 * spaces per module, light modules painted with a light background (the way `qrencode -t ansi` draws it).
 * Use this in videos; `qrTerminalLines` is the copy-paste text version.
 */
export const qrTerminalRows = (text: string, { quiet = 2, ecl = "M" as Ecl } = {}): Seg[][] => {
  const { n, dark } = modules(text, ecl);
  const rows: Seg[][] = [];
  for (let r = -quiet; r < n + quiet; r++) {
    const segs: Seg[] = [];
    for (let c = -quiet; c < n + quiet; c++) {
      const bg = dark(r, c) ? undefined : TERM.fg;
      const last = segs[segs.length - 1];
      if (last && last.bg === bg) last.t += "  ";
      else segs.push({ t: "  ", bg, square: true });
    }
    rows.push(segs);
  }
  return rows;
};
