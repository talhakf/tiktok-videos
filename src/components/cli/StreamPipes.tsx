import { useCurrentFrame } from "remotion";
import { Icon } from "../../icons/Icons";
import { TX } from "../../layout";
import { C, easeInOut, easeOut, materialize, mono, prog, sans, TERM } from "../../theme";
import { AMBER, DevCard, TAB_H } from "../dev/card";
import { BLUE_TINT, GREEN, lerp, presence, RED, WIRE } from "../diagram/Node";
import { tint } from "../windows/MacWindow";

export type StreamOperator = ">" | ">>" | "2>&1" | "| tee";

const bezierPt = (p0: [number, number], p1: [number, number], p2: [number, number], p3: [number, number], t: number) => {
  const u = 1 - t;
  const x = u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0];
  const y = u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1];
  return { x, y };
};

export const StreamPipes: React.FC<{
  x?: number;
  y: number;
  w?: number;
  at: number;
  until?: number;
  command: string;
  operator?: StreamOperator;
  stdoutTarget?: string;
  stderrTarget?: string;
  flowAt: number;
  redirectAt?: number;
}> = ({
  x = TX,
  y,
  w = 900,
  at,
  until,
  command,
  operator,
  stdoutTarget = "out.txt",
  stderrTarget = "screen (leaked!)",
  flowAt,
  redirectAt,
}) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;

  const h = TAB_H + 382;
  const padX = 28;
  const innerW = w - padX * 2;

  const flowP = prog(frame, flowAt, 16, easeOut);
  const redirP = redirectAt !== undefined ? prog(frame, redirectAt, 16, easeInOut) : 0;

  // Coordinates inside the body (844 x 382)
  const stdinBox = { x: 28, y: 184, w: 148, h: 92 };
  const procBox = { x: 218, y: 122, w: 224, h: 216 };
  const targetX = 634;
  const targetW = w - 28 - targetX;
  const outBox = { x: targetX, y: 122, w: targetW, h: 96 };
  const errBox = { x: targetX, y: 242, w: targetW, h: 96 };

  const y1 = outBox.y + outBox.h / 2; // 170 (1 stdout)
  const y2 = errBox.y + errBox.h / 2; // 290 (2 stderr)
  const pipeStartX = procBox.x + procBox.w; // 442
  const pipeEndX = targetX; // 634

  // 2 stderr bends smoothly from y2 (290) to y1 + 14 (184) when redirectAt triggers
  const errEndY = lerp(y2, y1 + 14, redirP);
  const c1x = pipeStartX + (pipeEndX - pipeStartX) * 0.45;
  const c2x = pipeStartX + (pipeEndX - pipeStartX) * 0.58;

  const errPath = `M ${pipeStartX} ${y2} C ${c1x} ${y2}, ${c2x} ${errEndY}, ${pipeEndX} ${errEndY}`;
  const outPath = `M ${pipeStartX} ${y1} L ${pipeEndX} ${y1}`;

  // Animated stream packets once flowAt has started
  const packetT = frame >= flowAt ? ((frame - flowAt) % 28) / 28 : 0;
  const outPacketX = lerp(pipeStartX, pipeEndX, packetT);
  const errPacket = bezierPt([pipeStartX, y2], [c1x, y2], [c2x, errEndY], [pipeEndX, errEndY], packetT);

  const cmdExecutable = command.trim().split(/\s+/)[0] || "cmd";
  const show2to1 = operator === "2>&1" || redirectAt !== undefined;
  const activeOpText =
    operator === "2>&1"
      ? redirP > 0.1
        ? `> ${stdoutTarget} 2>&1`
        : `> ${stdoutTarget}`
      : operator
        ? `${operator} ${stdoutTarget}`
        : "";

  return (
    <DevCard
      x={x}
      y={y}
      w={w}
      h={h}
      p={p}
      filename="linux streams — fd 0, 1, 2"
      icon="terminal"
      right={operator ? `operator ${operator}` : "standard streams"}
    >
      {/* Top command preview bar */}
      <div
        style={{
          position: "absolute",
          left: padX,
          top: 22,
          width: innerW,
          height: 68,
          borderRadius: 18,
          background: TERM.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
        }}
      >
        <div
          style={{
            fontFamily: mono,
            fontWeight: 500,
            fontSize: 25,
            color: TERM.fg,
            display: "flex",
            alignItems: "center",
            gap: 10,
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ color: TERM.green, fontWeight: 700 }}>$</span>
          <span>{command}</span>
          {activeOpText ? (
            <span
              style={{
                color: redirP > 0.2 ? TERM.yellow : TERM.blue,
                fontWeight: 700,
                background: tint(redirP > 0.2 ? TERM.yellow : TERM.blue, 0.18),
                padding: "2px 10px",
                borderRadius: 8,
              }}
            >
              {activeOpText}
            </span>
          ) : null}
        </div>

        <div
          style={{
            fontFamily: mono,
            fontWeight: 700,
            fontSize: 18,
            color: redirP > 0.5 ? TERM.green : flowP > 0.5 ? TERM.yellow : TERM.dim,
          }}
        >
          {redirP > 0.5 ? "STDERR merged → STDOUT" : flowP > 0.5 ? "streams active" : "fd table"}
        </div>
      </div>

      {/* SVG pipes layer */}
      <svg
        width={w}
        height={h - TAB_H}
        viewBox={`0 0 ${w} ${h - TAB_H}`}
        style={{ position: "absolute", inset: 0, overflow: "visible" }}
      >
        {/* 0 STDIN -> Process connector */}
        <path
          d={`M ${stdinBox.x + stdinBox.w} ${stdinBox.y + stdinBox.h / 2} L ${procBox.x - 4} ${stdinBox.y + stdinBox.h / 2}`}
          fill="none"
          stroke={WIRE}
          strokeWidth={3}
          strokeLinecap="round"
        />
        <polygon
          points={`${procBox.x},${stdinBox.y + stdinBox.h / 2} ${procBox.x - 10},${stdinBox.y + stdinBox.h / 2 - 6} ${procBox.x - 10},${stdinBox.y + stdinBox.h / 2 + 6}`}
          fill={WIRE}
        />

        {/* Ghost un-redirected stderr line when redirected */}
        {redirP > 0.05 ? (
          <path
            d={`M ${pipeStartX} ${y2} L ${pipeEndX} ${y2}`}
            fill="none"
            stroke={RED}
            strokeWidth={2.5}
            strokeDasharray="7 7"
            opacity={0.22 * redirP}
          />
        ) : null}

        {/* 1 STDOUT pipe */}
        {flowP > 0 ? (
          <g>
            <path
              d={outPath}
              fill="none"
              stroke={C.accent}
              strokeWidth={4.5}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - flowP}
            />
            <polygon
              points={`${pipeEndX},${y1} ${pipeEndX - 12},${y1 - 7} ${pipeEndX - 12},${y1 + 7}`}
              fill={C.accent}
              opacity={flowP}
            />
            {flowP >= 0.95 ? <circle cx={outPacketX} cy={y1} r={6} fill={C.accent} /> : null}
          </g>
        ) : null}

        {/* 2 STDERR pipe (bends to 1 stdout target on redirectAt) */}
        {flowP > 0 ? (
          <g>
            <path
              d={errPath}
              fill="none"
              stroke={RED}
              strokeWidth={4.5}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - flowP}
            />
            <polygon
              points={`${pipeEndX},${errEndY} ${pipeEndX - 12},${errEndY - 7} ${pipeEndX - 12},${errEndY + 7}`}
              fill={RED}
              opacity={flowP}
            />
            {flowP >= 0.95 ? <circle cx={errPacket.x} cy={errPacket.y} r={6} fill={RED} /> : null}
          </g>
        ) : null}
      </svg>

      {/* Pipe labels & 2>&1 junction badge */}
      {flowP > 0.2 ? (
        <div
          style={{
            position: "absolute",
            left: pipeStartX + 34,
            top: y1 - 36,
            padding: "3px 10px",
            borderRadius: 8,
            background: BLUE_TINT,
            border: `1.5px solid ${C.accent}`,
            fontFamily: mono,
            fontWeight: 700,
            fontSize: 16,
            color: C.accent,
            opacity: flowP,
          }}
        >
          1 STDOUT
        </div>
      ) : null}

      {flowP > 0.2 ? (
        <div
          style={{
            position: "absolute",
            left: pipeStartX + 34,
            top: lerp(y2 + 10, y2 - 36, redirP),
            padding: "3px 10px",
            borderRadius: 8,
            background: "#FFF1F0",
            border: `1.5px solid ${RED}`,
            fontFamily: mono,
            fontWeight: 700,
            fontSize: 16,
            color: RED,
            opacity: flowP,
          }}
        >
          2 STDERR
        </div>
      ) : null}

      {show2to1 && redirP > 0.05 ? (
        <div
          style={{
            position: "absolute",
            left: (pipeStartX + pipeEndX) / 2 - 38,
            top: (y1 + y2) / 2 - 18,
            padding: "5px 14px",
            borderRadius: 12,
            background: C.white,
            border: `2.5px solid ${AMBER}`,
            boxShadow: "0 6px 16px rgba(0,0,0,0.10)",
            fontFamily: mono,
            fontWeight: 700,
            fontSize: 19,
            color: "#A05A00",
            ...materialize(redirP),
          }}
        >
          2&gt;&amp;1
        </div>
      ) : null}

      {operator === "| tee" && flowP > 0.4 ? (
        <div
          style={{
            position: "absolute",
            left: (pipeStartX + pipeEndX) / 2 - 42,
            top: y1 - 18,
            padding: "4px 12px",
            borderRadius: 10,
            background: C.white,
            border: `2px solid ${GREEN}`,
            fontFamily: mono,
            fontWeight: 700,
            fontSize: 17,
            color: "#248A3D",
            ...materialize(flowP),
          }}
        >
          | tee
        </div>
      ) : null}

      {/* 0 STDIN box */}
      <div
        style={{
          position: "absolute",
          left: stdinBox.x,
          top: stdinBox.y,
          width: stdinBox.w,
          height: stdinBox.h,
          borderRadius: 18,
          background: "#F5F5F7",
          border: `2px solid ${C.line}`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
          ...materialize(prog(frame, at + 3, 10, easeOut)),
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name="keyboard" size={24} color={C.ink} weight={2} />
          <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 19, color: C.ink }}>0 STDIN</span>
        </div>
        <span style={{ fontFamily: sans, fontWeight: 500, fontSize: 16, color: C.mute }}>keyboard / pipe</span>
      </div>

      {/* Central Process box */}
      <div
        style={{
          position: "absolute",
          left: procBox.x,
          top: procBox.y,
          width: procBox.w,
          height: procBox.h,
          borderRadius: 22,
          background: C.white,
          border: `3px solid ${C.ink}`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "20px 20px",
          ...materialize(prog(frame, at + 5, 10, easeOut)),
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Icon name="chip" size={28} color={C.ink} weight={2} />
          <div>
            <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 22, color: C.ink, lineHeight: 1.1 }}>
              Process
            </div>
            <div style={{ fontFamily: mono, fontWeight: 600, fontSize: 18, color: C.accent }}>
              {cmdExecutable}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "7px 12px",
              borderRadius: 10,
              background: BLUE_TINT,
              fontFamily: mono,
              fontWeight: 700,
              fontSize: 16,
              color: C.accent,
            }}
          >
            <span>fd 1</span>
            <span>stdout →</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "7px 12px",
              borderRadius: 10,
              background: "#FFF1F0",
              fontFamily: mono,
              fontWeight: 700,
              fontSize: 16,
              color: RED,
            }}
          >
            <span>fd 2</span>
            <span>stderr →</span>
          </div>
        </div>
      </div>

      {/* Upper target (stdoutTarget) */}
      <div
        style={{
          position: "absolute",
          left: outBox.x,
          top: outBox.y,
          width: outBox.w,
          height: outBox.h,
          borderRadius: 20,
          background: flowP > 0.3 ? BLUE_TINT : "#F5F5F7",
          border: `2.5px solid ${flowP > 0.3 ? C.accent : C.line}`,
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "0 18px",
          ...materialize(prog(frame, at + 7, 10, easeOut)),
        }}
      >
        <Icon name={stdoutTarget.includes(".") ? "file" : "window"} size={30} color={C.accent} weight={2} />
        <div style={{ minWidth: 0 }}>
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
            {stdoutTarget}
          </div>
          <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 16, color: redirP > 0.5 ? "#248A3D" : C.mute }}>
            {redirP > 0.5 ? "receives 1 + 2" : "receives 1 stdout"}
          </div>
        </div>
      </div>

      {/* Lower target (stderrTarget) */}
      <div
        style={{
          position: "absolute",
          left: errBox.x,
          top: errBox.y,
          width: errBox.w,
          height: errBox.h,
          borderRadius: 20,
          background: redirP > 0.5 ? "#F5F5F7" : flowP > 0.3 ? "#FFF1F0" : "#F5F5F7",
          border: `2.5px solid ${redirP > 0.5 ? C.line : flowP > 0.3 ? RED : C.line}`,
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "0 18px",
          ...materialize(prog(frame, at + 9, 10, easeOut)),
          opacity: prog(frame, at + 9, 10, easeOut) * lerp(1, 0.42, redirP),
        }}
      >
        <Icon name={redirP > 0.5 ? "checkCircle" : "warning"} size={30} color={redirP > 0.5 ? C.mute : RED} weight={2} />
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontFamily: mono,
              fontWeight: 700,
              fontSize: 20,
              color: redirP > 0.5 ? C.mute : RED,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {stderrTarget}
          </div>
          <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 16, color: C.mute }}>
            {redirP > 0.5 ? "quiet (redirected)" : "2 stderr destination"}
          </div>
        </div>
      </div>
    </DevCard>
  );
};
