import { interpolateColors, useCurrentFrame } from "remotion";
import { C, materialize, mono, prog } from "../../theme";

// A row of bit cells (two's complement, most significant bit first), wrapped into lines of `perRow`.
// When the value changes, the changed bits flip right to left like a carry rippling up, each one flashing
// blue for a moment. With `signed` the top bit is labelled "sign" and turns red while it is 1 (negative).

const RED = "#FF3B30";
const ZERO = "#AEAEB2";

const toBits = (v: number | string, n: number) => BigInt.asUintN(n, BigInt(v)).toString(2).padStart(n, "0");

/**
 * Bit cells for `value`, entering at `at`. `steps` change the value at frames (e.g. 2147483647 → -2147483648
 * flips all 32). `bits` (default 32) wide, `perRow` cells per line (default 16), grouped in bytes.
 * `value` takes a number or an integer string (for 64-bit values).
 */
export const BinaryRow: React.FC<{
  value: number | string;
  at: number;
  x: number;
  y: number;
  steps?: { at: number; value: number | string }[];
  bits?: number;
  perRow?: number;
  w?: number;
  signed?: boolean;
  stagger?: number; // frames between neighbouring bit flips (right to left)
  until?: number;
}> = ({ value, at, x, y, steps = [], bits = 32, perRow = 16, w = 900, signed = true, stagger = 0.7, until }) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const out = until !== undefined ? prog(frame, until, 8) : 0;
  if (out >= 1) return null;

  const gap = 8;
  const groupGap = 18;
  const groups = Math.ceil(perRow / 8);
  const cell = (w - (perRow - 1) * gap - (groups - 1) * (groupGap - gap)) / perRow;
  const cellH = cell * 1.3;
  const labelH = signed ? 34 : 0;
  const rowGap = 18;
  const states = [{ at: -Infinity, bits: toBits(value, bits) }, ...steps.map((s) => ({ at: s.at, bits: toBits(s.value, bits) }))];

  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, opacity: 1 - out }}>
      {[...Array(bits)].map((_, i) => {
        const delay = (bits - 1 - i) * stagger; // ripple from the least significant bit
        // Latest state this cell has already flipped to, and when it last changed.
        let k = 0;
        for (let s = 1; s < states.length; s++) if (frame >= states[s].at + delay) k = s;
        let changedAt = -Infinity;
        for (let s = k; s >= 1; s--) {
          if (states[s].bits[i] !== states[s - 1].bits[i]) {
            changedAt = states[s].at + delay;
            break;
          }
        }
        const bit = states[k].bits[i];
        const isSign = signed && i === 0;
        const flash = changedAt > -Infinity ? 1 - prog(frame, changedAt, 20) : 0;
        const settle = isSign && bit === "1" ? RED : C.white;
        const hot = isSign ? RED : C.accent;
        const bg = interpolateColors(flash, [0, 1], [settle, hot]);
        const onColor = settle === RED || flash > 0.4;
        const swap = changedAt > -Infinity ? prog(frame, changedAt, 7) : 1;

        const row = Math.floor(i / perRow);
        const col = i % perRow;
        const left = col * (cell + gap) + Math.floor(col / 8) * (groupGap - gap);
        const top = labelH + row * (cellH + rowGap);
        const enter = prog(frame, at + i * 0.4, 9);
        return (
          <div key={i}>
            {isSign ? (
              <div
                style={{
                  position: "absolute",
                  left,
                  top: 0,
                  width: cell,
                  textAlign: "center",
                  fontFamily: mono,
                  fontWeight: 500,
                  fontSize: 22,
                  color: bit === "1" ? RED : C.mute,
                  opacity: enter,
                }}
              >
                sign
              </div>
            ) : null}
            <div
              style={{
                position: "absolute",
                left,
                top,
                width: cell,
                height: cellH,
                borderRadius: cell * 0.2,
                background: bg,
                border: `1px solid ${onColor ? "transparent" : C.line}`,
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: mono,
                fontWeight: 700,
                fontSize: cell * 0.62,
                color: onColor ? C.white : bit === "1" ? C.ink : ZERO,
                ...materialize(enter, 0.9, 6),
              }}
            >
              <span style={{ ...materialize(swap, 0.8, 4) }}>{bit}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
