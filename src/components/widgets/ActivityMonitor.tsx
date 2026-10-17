import { interpolateColors, useCurrentFrame, useVideoConfig } from "remotion";
import { Icon, IconName } from "../../icons/Icons";
import { TX, TW, TY } from "../../layout";
import { C, easeInOut, easeOut, mono, prog, sans } from "../../theme";
import { alpha, BLUE_TINT, GREEN, lerp, RED } from "../diagram/Node";
import { glide, IndexCue, pressDepth } from "../ui/shared";
import { MacWindow, tint } from "../windows/MacWindow";

export type ActivityTab = "CPU" | "Memory" | "Energy" | "Network";

export type ActivityProcess = {
  pid: number;
  name: string;
  cpu: number;
  mem: string;
  user?: string;
  hog?: boolean;
  icon?: IconName;
};

const TABS: ActivityTab[] = ["CPU", "Memory", "Energy", "Network"];

const DEFAULT_PROCESSES: ActivityProcess[] = [
  { pid: 412, name: "WindowServer", cpu: 1.8, mem: "340 MB", user: "root", icon: "window" },
  { pid: 8841, name: "node (webpack --watch)", cpu: 94.6, mem: "2.48 GB", user: "raccoon", hog: true, icon: "flame" },
  { pid: 1094, name: "zsh", cpu: 0.7, mem: "42 MB", user: "raccoon", icon: "terminal" },
  { pid: 620, name: "Finder", cpu: 0.4, mem: "118 MB", user: "raccoon", icon: "folder" },
  { pid: 309, name: " mds_stores", cpu: 1.1, mem: "210 MB", user: "root", icon: "search" },
];

/**
 * macOS Activity Monitor window (`MacWindow`):
 * - Top tab pills (`CPU`, `Memory`, `Energy`, `Network`)
 * - Top-left `⊗ Quit Process` toolbar button
 * - Process rows (`pid, name, cpu, mem, user, hog?: boolean`) with gliding selection
 * - At `killAt`, `⊗ Quit Process` presses, the runaway (`hog`) row collapses to 0 height,
 *   and total CPU drops from `cpuBefore` (default 99%) to `cpuAfter` (default 4%).
 */
export const ActivityMonitor: React.FC<{
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  at?: number;
  until?: number;
  activeTab?: ActivityTab;
  processes?: ActivityProcess[];
  initialSelect?: number;
  select?: IndexCue[];
  selectHogAt?: number;
  killAt?: number;
  cpuBefore?: number;
  cpuAfter?: number;
}> = ({
  x = TX,
  y = TY,
  w = TW,
  h = 640,
  at = 0,
  until,
  activeTab = "CPU",
  processes = DEFAULT_PROCESSES,
  initialSelect = 0,
  select,
  selectHogAt,
  killAt,
  cpuBefore = 99,
  cpuAfter = 4,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const hogIndex = Math.max(
    0,
    processes.findIndex((p) => p.hog),
  );
  const cues: IndexCue[] = select ?? [{ index: hogIndex, at: selectHogAt ?? at + 16 }];
  const selectedFloat = glide(frame, initialSelect, cues, 12);

  // Kill animation progress: button press at killAt, row collapse from killAt + 4 over 14 frames
  const quitDown = pressDepth(frame, fps, killAt, 3);
  const killP = killAt !== undefined ? prog(frame, killAt + 4, 14, easeInOut) : 0;
  const cpuDropP = killAt !== undefined ? prog(frame, killAt + 6, 20, easeOut) : 0;

  // Live subtle jitter before kill so CPU feels alive
  const liveWave = Math.sin((frame - at) * 0.35) * 0.4;
  const totalCpu = Math.round(lerp(cpuBefore, cpuAfter, cpuDropP));
  const sysCpu = Math.round(lerp(24, 2, cpuDropP));
  const userCpu = Math.max(1, totalCpu - sysCpu);
  const idleCpu = Math.max(0, 100 - totalCpu);

  const hogSelected = Math.abs(selectedFloat - hogIndex) < 0.35 && killP < 0.95;
  const barH = 82;
  const headerH = 50;
  const footerH = 124;
  const rowH = 68;

  const toolbar = (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", marginLeft: 8 }}>
      {/* Left: Quit Process button */}
      <div
        style={{
          height: 50,
          padding: "0 18px",
          borderRadius: 13,
          background:
            quitDown > 0
              ? interpolateColors(quitDown, [0, 1], [tint(RED, 0.14), tint(RED, 0.28)])
              : hogSelected
                ? C.white
                : "rgba(0,0,0,0.04)",
          border: `1.5px solid ${quitDown > 0 ? RED : hogSelected ? "rgba(0,0,0,0.14)" : C.line}`,
          boxShadow: hogSelected ? "0 2px 6px rgba(0,0,0,0.06)" : undefined,
          scale: String(1 - 0.04 * quitDown),
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontFamily: sans,
          fontSize: 21,
          fontWeight: 600,
          color: quitDown > 0 ? RED : hogSelected ? C.ink : C.mute,
        }}
      >
        <Icon name="crossCircle" size={26} color={quitDown > 0 || hogSelected ? RED : C.mute} weight={2.1} />
        <span>Quit process</span>
      </div>

      {/* Right: CPU / Memory / Energy / Network segmented pills */}
      <div
        style={{
          display: "flex",
          padding: 4,
          borderRadius: 14,
          background: "#E3E3E8",
          gap: 2,
        }}
      >
        {TABS.map((tab) => {
          const active = tab === activeTab;
          return (
            <div
              key={tab}
              style={{
                padding: "8px 18px",
                borderRadius: 10,
                background: active ? C.white : "transparent",
                boxShadow: active ? "0 2px 6px rgba(0,0,0,0.1)" : undefined,
                fontFamily: sans,
                fontSize: 20,
                fontWeight: active ? 600 : 500,
                color: active ? C.ink : C.mute,
              }}
            >
              {tab}
            </div>
          );
        })}
      </div>
    </div>
  );

  // Compute vertical positions of each row so collapsing the hog row smoothly pulls up subsequent rows
  let accY = 0;
  const rowLayout = processes.map((proc, i) => {
    const isHog = i === hogIndex;
    const collapse = isHog ? killP : 0;
    const curH = rowH * (1 - collapse);
    const top = accY;
    accY += curH;
    return { proc, i, isHog, collapse, curH, top };
  });

  // Selection band top & height (tracks selectedFloat, and after kill settles cleanly on row 0)
  const rawSelTop = selectedFloat * rowH;
  const selOpacity = 1 - killP;

  return (
    <MacWindow x={x} y={y} w={w} h={h} at={at} until={until} barHeight={barH} toolbar={toolbar}>
      {/* Column header row */}
      <div
        style={{
          height: headerH,
          padding: "0 28px",
          background: "#F8F8FA",
          borderBottom: `1px solid ${C.line}`,
          display: "flex",
          alignItems: "center",
          fontFamily: sans,
          fontSize: 19,
          fontWeight: 600,
          color: C.mute,
          letterSpacing: "-0.01em",
        }}
      >
        <div style={{ flex: 2.3 }}>Process name</div>
        <div style={{ width: 190, textAlign: "right", paddingRight: 18 }}>% CPU</div>
        <div style={{ width: 150, textAlign: "right" }}>Memory</div>
        <div style={{ width: 110, textAlign: "right" }}>PID</div>
        <div style={{ width: 130, textAlign: "right" }}>User</div>
      </div>

      {/* Process table body */}
      <div style={{ position: "relative", height: h - barH - headerH - footerH - 1, overflow: "hidden" }}>
        {/* Gliding selection highlight bar */}
        {selOpacity > 0.01 ? (
          <div
            style={{
              position: "absolute",
              left: 12,
              right: 12,
              top: rawSelTop + 4,
              height: rowH * (1 - (Math.abs(selectedFloat - hogIndex) < 0.5 ? killP : 0)) - 8,
              borderRadius: 14,
              background: quitDown > 0 ? tint(RED, 0.16) : hogSelected ? tint(RED, 0.1) : BLUE_TINT,
              border: `2px solid ${hogSelected ? RED : C.accent}`,
              opacity: selOpacity,
              pointerEvents: "none",
            }}
          />
        ) : null}

        {rowLayout.map(({ proc, i, isHog, collapse, curH, top }) => {
          if (curH < 1) return null;
          const rowUnder = Math.max(0, 1 - Math.abs(selectedFloat - i)) * (1 - collapse);
          const cpuVal = isHog ? Math.max(0, proc.cpu + liveWave) * (1 - collapse * 0.9) : proc.cpu;
          const cpuColor = isHog ? RED : C.ink;

          return (
            <div
              key={proc.pid}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top,
                height: curH,
                padding: "0 28px",
                display: "flex",
                alignItems: "center",
                borderBottom: `1px solid rgba(0,0,0,0.05)`,
                opacity: 1 - collapse,
                transform: isHog && collapse > 0 ? `scale(${1 - 0.04 * collapse})` : undefined,
                overflow: "hidden",
                fontFamily: sans,
              }}
            >
              {/* Process Name + icon */}
              <div style={{ flex: 2.3, display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: isHog ? tint(RED, 0.14) : C.paper,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon name={proc.icon ?? (isHog ? "flame" : "terminal")} size={22} color={isHog ? RED : C.ink} weight={2} />
                </div>
                <div
                  style={{
                    fontSize: 23,
                    fontWeight: isHog || rowUnder > 0.5 ? 700 : 500,
                    color: isHog ? RED : C.ink,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {proc.name}
                </div>
                {isHog ? (
                  <div
                    style={{
                      padding: "3px 10px",
                      borderRadius: 8,
                      background: tint(RED, 0.14),
                      color: RED,
                      fontFamily: mono,
                      fontSize: 16,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    runaway
                  </div>
                ) : null}
              </div>

              {/* % CPU + mini bar */}
              <div
                style={{
                  width: 190,
                  paddingRight: 18,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  gap: 12,
                }}
              >
                <div style={{ width: 64, height: 10, borderRadius: 5, background: C.soft, overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${Math.min(100, cpuVal)}%`,
                      height: "100%",
                      borderRadius: 5,
                      background: isHog ? RED : C.accent,
                    }}
                  />
                </div>
                <span
                  style={{
                    fontFamily: mono,
                    fontSize: 22,
                    fontWeight: isHog ? 700 : 600,
                    color: cpuColor,
                    fontVariantNumeric: "tabular-nums",
                    width: 82,
                    textAlign: "right",
                  }}
                >
                  {cpuVal.toFixed(1)}%
                </span>
              </div>

              {/* Memory */}
              <div
                style={{
                  width: 150,
                  textAlign: "right",
                  fontFamily: mono,
                  fontSize: 21,
                  fontWeight: 500,
                  color: C.ink,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {proc.mem}
              </div>

              {/* PID */}
              <div
                style={{
                  width: 110,
                  textAlign: "right",
                  fontFamily: mono,
                  fontSize: 21,
                  fontWeight: 500,
                  color: C.mute,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {proc.pid}
              </div>

              {/* User */}
              <div
                style={{
                  width: 130,
                  textAlign: "right",
                  fontFamily: mono,
                  fontSize: 21,
                  fontWeight: 500,
                  color: C.mute,
                }}
              >
                {proc.user ?? "root"}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom CPU Load Summary Footer */}
      <div
        style={{
          height: footerH,
          padding: "0 28px",
          background: "#F5F5F7",
          borderTop: `1px solid ${C.line}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
          fontFamily: sans,
        }}
      >
        {/* System / User / Idle breakdown */}
        <div style={{ display: "flex", gap: 28 }}>
          {[
            { label: "System", val: `${sysCpu}%`, c: RED },
            { label: "User", val: `${userCpu}%`, c: C.accent },
            { label: "Idle", val: `${idleCpu}%`, c: GREEN },
          ].map((st) => (
            <div key={st.label} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 18, fontWeight: 600, color: C.mute }}>{st.label}</span>
              <span style={{ fontFamily: mono, fontSize: 25, fontWeight: 700, color: st.c, fontVariantNumeric: "tabular-nums" }}>
                {st.val}
              </span>
            </div>
          ))}
        </div>

        {/* Mini CPU Load history bars */}
        <div
          style={{
            flex: 1,
            height: 76,
            padding: "10px 14px",
            borderRadius: 14,
            background: C.white,
            border: `1px solid ${C.line}`,
            display: "flex",
            alignItems: "flex-end",
            gap: 5,
          }}
        >
          {Array.from({ length: 28 }, (_, b) => {
            // Bars on the right reflect post-kill drop once killAt is reached
            const isRecent = b >= 18;
            const barDrop = isRecent ? prog(frame, (killAt ?? 9999) + (b - 18) * 1.2, 8, easeOut) : 0;
            const highH = 0.78 + 0.18 * Math.sin(b * 1.3 + frame * 0.15);
            const lowH = 0.08 + 0.04 * Math.cos(b * 0.9);
            const frac = lerp(highH, lowH, barDrop);
            const barCol = interpolateColors(barDrop, [0, 1], [RED, GREEN]);
            return (
              <div
                key={b}
                style={{
                  flex: 1,
                  height: `${Math.round(frac * 100)}%`,
                  borderRadius: 3,
                  background: barCol,
                }}
              />
            );
          })}
        </div>

        {/* Total CPU load badge */}
        <div
          style={{
            padding: "12px 22px",
            borderRadius: 16,
            background: interpolateColors(cpuDropP, [0, 1], [alpha(RED, 0.12), alpha(GREEN, 0.14)]),
            border: `2px solid ${interpolateColors(cpuDropP, [0, 1], [RED, GREEN])}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            minWidth: 165,
          }}
        >
          <span style={{ fontSize: 17, fontWeight: 600, color: C.mute }}>Total CPU</span>
          <span
            style={{
              fontFamily: mono,
              fontSize: 34,
              fontWeight: 700,
              color: interpolateColors(cpuDropP, [0, 1], [RED, "#248A3D"]),
              fontVariantNumeric: "tabular-nums",
              lineHeight: 1.1,
            }}
          >
            {totalCpu}%
          </span>
        </div>
      </div>
    </MacWindow>
  );
};
