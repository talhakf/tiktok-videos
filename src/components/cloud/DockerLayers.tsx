import { interpolateColors, useCurrentFrame } from "remotion";
import { Icon } from "../../icons/Icons";
import { C, easeInOut, easeOut, materialize, mono, prog, sans, TERM } from "../../theme";
import { AMBER, DevCard, TAB_H, toneColors } from "../dev/card";
import { CARD_SHADOW, GREEN, presence, RED } from "../diagram/Node";
import { tint } from "../windows/MacWindow";

export type DockerLayer = {
  instruction: string;
  args?: string;
  size: string;
  buildTime: string;
  at?: number;
};

export const DEFAULT_DOCKER_LAYERS: DockerLayer[] = [
  { instruction: "FROM node:22-alpine", size: "48.2 MB", buildTime: "1.8s" },
  { instruction: "WORKDIR /app", size: "0 B", buildTime: "0.1s" },
  { instruction: "COPY package*.json ./", size: "4.1 KB", buildTime: "0.2s" },
  { instruction: "RUN npm ci", size: "142 MB", buildTime: "14.6s" },
  { instruction: "COPY . .", size: "1.9 MB", buildTime: "0.3s" },
  { instruction: 'CMD ["node", "server.js"]', size: "0 B", buildTime: "0.1s" },
];

const splitInstruction = (layer: DockerLayer): { kw: string; rest: string } => {
  if (layer.args !== undefined) {
    return { kw: layer.instruction, rest: layer.args };
  }
  const idx = layer.instruction.indexOf(" ");
  if (idx === -1) return { kw: layer.instruction, rest: "" };
  return {
    kw: layer.instruction.slice(0, idx),
    rest: layer.instruction.slice(idx + 1),
  };
};

/**
 * Dockerfile image layer cache visualizer.
 * Shows stacked image layers with size & build-time pills.
 * - `cacheHitAt`: layers flash green `CACHED · 0.0s`
 * - `invalidateFrom`: marks layer `index` and all subsequent layers built on top of it (`i >= index`) amber/red `REBUILD`
 */
export const DockerLayers: React.FC<{
  layers?: DockerLayer[];
  x: number;
  y: number;
  w?: number;
  at?: number;
  until?: number;
  cacheHitAt?: number;
  invalidateFrom?: { index: number; at: number };
  filename?: string;
  dark?: boolean;
  style?: React.CSSProperties;
}> = ({
  layers = DEFAULT_DOCKER_LAYERS,
  x,
  y,
  w = 900,
  at = 0,
  until,
  cacheHitAt,
  invalidateFrom,
  filename = "Dockerfile",
  dark = false,
  style,
}) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;

  const rowH = 82;
  const gap = 12;
  const padY = 24;
  const footerH = 72;
  const bodyH = padY * 2 + layers.length * rowH + (layers.length - 1) * gap + footerH;
  const h = (filename ? TAB_H : 0) + bodyH;

  const invActive = invalidateFrom !== undefined && frame >= invalidateFrom.at;
  const invP = invalidateFrom !== undefined ? prog(frame, invalidateFrom.at, 10, easeOut) : 0;
  const hitActive = cacheHitAt !== undefined && frame >= cacheHitAt;

  const rebuiltCount = invActive ? Math.max(0, layers.length - invalidateFrom.index) : 0;
  const rightLabel = invActive
    ? `${rebuiltCount}/${layers.length} layers rebuild`
    : hitActive
      ? `${layers.length}/${layers.length} layers cached`
      : `${layers.length} image layers`;

  return (
    <DevCard
      x={x}
      y={y}
      w={w}
      h={h}
      p={p}
      dark={dark}
      filename={filename}
      icon="layers"
      right={rightLabel}
      style={style}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: `${padY}px 28px`,
          display: "flex",
          flexDirection: "column",
          gap,
        }}
      >
        {layers.map((layer, i) => {
          const enterFrame = layer.at ?? at + 4 + i * 3;
          const rowP = prog(frame, enterFrame, 10, easeOut);
          const { kw, rest } = splitInstruction(layer);

          const hitStart = cacheHitAt !== undefined ? cacheHitAt + i * 2 : Infinity;
          const hitProg = prog(frame, hitStart, 10, easeInOut);

          const isInvalidated = invalidateFrom !== undefined && i >= invalidateFrom.index;
          const isTriggerLayer = invalidateFrom !== undefined && i === invalidateFrom.index;
          const invStart =
            isInvalidated && invalidateFrom !== undefined
              ? invalidateFrom.at + (i - invalidateFrom.index) * 3
              : Infinity;
          const rowInvProg = prog(frame, invStart, 10, easeInOut);

          const neutralBg = dark ? "#262629" : "#F7F7FA";
          const neutralBorder = dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";

          const goodTone = toneColors("good", dark);
          const warnTone = toneColors("warn", dark);
          const badTone = toneColors("bad", dark);
          const targetInvTone = isTriggerLayer ? warnTone : badTone;

          const cachedBg = interpolateColors(hitProg, [0, 1], [neutralBg, goodTone.bg]);
          const cachedBorder = interpolateColors(hitProg, [0, 1], [neutralBorder, goodTone.edge]);

          const rowBg = interpolateColors(rowInvProg, [0, 1], [cachedBg, targetInvTone.bg]);
          const rowBorder = interpolateColors(rowInvProg, [0, 1], [cachedBorder, targetInvTone.edge]);

          const statusState: "build" | "cached" | "rebuild" =
            rowInvProg > 0.3 ? "rebuild" : hitProg > 0.3 ? "cached" : "build";

          const pillBg =
            statusState === "rebuild"
              ? isTriggerLayer
                ? tint(AMBER, 0.2)
                : tint(RED, 0.16)
              : statusState === "cached"
                ? tint(GREEN, 0.18)
                : dark
                  ? "rgba(255,255,255,0.08)"
                  : "#EAEAEF";

          const pillColor =
            statusState === "rebuild"
              ? targetInvTone.fg
              : statusState === "cached"
                ? goodTone.fg
                : dark
                  ? TERM.dim
                  : C.mute;

          const pillText =
            statusState === "rebuild"
              ? isTriggerLayer
                ? `CHANGED · REBUILD`
                : `REBUILD · ${layer.buildTime}`
              : statusState === "cached"
                ? "CACHED · 0.0s"
                : `BUILT · ${layer.buildTime}`;

          return (
            <div
              key={i}
              style={{
                height: rowH,
                borderRadius: 18,
                background: rowBg,
                border: `2px solid ${rowBorder}`,
                boxShadow: rowInvProg > 0.5 ? CARD_SHADOW : undefined,
                display: "flex",
                alignItems: "center",
                padding: "0 20px",
                gap: 16,
                ...materialize(rowP, 0.96, 6),
                translate: `${(1 - rowP) * 12}px 0px`,
              }}
            >
              {/* Layer index pill */}
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background:
                    statusState === "rebuild"
                      ? targetInvTone.edge
                      : statusState === "cached"
                        ? GREEN
                        : dark
                          ? "#343438"
                          : "#E5E5EA",
                  color:
                    statusState === "rebuild" || statusState === "cached"
                      ? C.white
                      : dark
                        ? TERM.fg
                        : C.mute,
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize: 20,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                L{i}
              </div>

              {/* Instruction text */}
              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  fontFamily: mono,
                  fontSize: 23,
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                <span
                  style={{
                    fontWeight: 700,
                    color:
                      statusState === "rebuild"
                        ? targetInvTone.fg
                        : dark
                          ? TERM.blue
                          : C.accent,
                  }}
                >
                  {kw}
                </span>
                {rest ? (
                  <span style={{ color: dark ? TERM.fg : C.ink }}> {rest}</span>
                ) : null}
              </div>

              {/* Layer size pill */}
              <div
                style={{
                  padding: "6px 14px",
                  borderRadius: 10,
                  background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
                  fontFamily: mono,
                  fontWeight: 600,
                  fontSize: 19,
                  color: dark ? TERM.dim : C.mute,
                  whiteSpace: "nowrap",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {layer.size}
              </div>

              {/* Build / Cache / Rebuild status pill */}
              <div
                style={{
                  height: 44,
                  padding: "0 16px",
                  borderRadius: 12,
                  background: pillBg,
                  color: pillColor,
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize: 19,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  whiteSpace: "nowrap",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                <Icon
                  name={
                    statusState === "rebuild"
                      ? isTriggerLayer
                        ? "warning"
                        : "refresh"
                      : statusState === "cached"
                        ? "check"
                        : "clock"
                  }
                  size={22}
                  color={pillColor}
                  weight={2.3}
                />
                {pillText}
              </div>
            </div>
          );
        })}

        {/* Summary footer */}
        <div
          style={{
            marginTop: 4,
            height: footerH - 8,
            borderRadius: 16,
            background: invActive
              ? tint(RED, 0.08)
              : hitActive
                ? tint(GREEN, 0.1)
                : dark
                  ? "#262629"
                  : "#F2F2F7",
            border: `1px solid ${
              invActive
                ? tint(RED, 0.28)
                : hitActive
                  ? tint(GREEN, 0.3)
                  : C.line
            }`,
            padding: "0 22px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontFamily: sans,
            fontSize: 22,
            fontWeight: 600,
            color: dark ? TERM.fg : C.ink,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Icon
              name={invActive ? "warning" : hitActive ? "bolt" : "box"}
              size={26}
              color={invActive ? RED : hitActive ? "#248A3D" : C.accent}
              weight={2.2}
            />
            <span>
              {invActive
                ? `Layer L${invalidateFrom.index} changed — downstream cache invalidated`
                : hitActive
                  ? "All layers served from local buildkit cache"
                  : "Building container image layers"}
            </span>
          </div>
          <div
            style={{
              fontFamily: mono,
              fontWeight: 700,
              fontSize: 22,
              color: invActive ? "#C9281E" : hitActive ? "#248A3D" : C.mute,
              opacity: invActive ? invP : 1,
            }}
          >
            {invActive ? "rebuild 15.2s" : hitActive ? "total 0.0s" : "total 17.1s"}
          </div>
        </div>
      </div>
    </DevCard>
  );
};
