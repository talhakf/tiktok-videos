import { interpolateColors, useCurrentFrame } from "remotion";
import { Icon } from "../../icons/Icons";
import { C, easeInOut, easeOut, materialize, mono, prog, sans, TERM } from "../../theme";
import { DevCard, TAB_H } from "../dev/card";
import { BLUE_TINT, CARD_SHADOW, GREEN, lerp, presence, RED, WIRE } from "../diagram/Node";
import { tint } from "../windows/MacWindow";

export type K8sPod = {
  name: string;
  version: string;
  at?: number;
  crashAt?: number;
  healAt?: number;
  cpu?: string;
  mem?: string;
};

export const DEFAULT_K8S_PODS: K8sPod[] = [
  { name: "api-7f8b9-x2k", version: "v2.4.0", cpu: "140m", mem: "248Mi" },
  { name: "api-7f8b9-m9p", version: "v2.4.0", cpu: "165m", mem: "264Mi", crashAt: 32, healAt: 68 },
  { name: "api-7f8b9-q4v", version: "v2.4.0", cpu: "120m", mem: "230Mi" },
  { name: "api-7f8b9-z8n", version: "v2.4.0", cpu: "110m", mem: "212Mi", at: 82 },
];

/**
 * Kubernetes / Container Orchestrator pod grid.
 * Shows Ingress/Service routing to a grid of Pod cards, animating pod crashes (`CrashLoopBackOff` in red),
 * self-healing replacement (`Running` in green), and horizontal pod autoscaling (`at`).
 */
export const K8sCluster: React.FC<{
  pods?: K8sPod[];
  x: number;
  y: number;
  w?: number;
  at?: number;
  until?: number;
  serviceName?: string;
  servicePort?: string;
  filename?: string;
  dark?: boolean;
  style?: React.CSSProperties;
}> = ({
  pods = DEFAULT_K8S_PODS,
  x,
  y,
  w = 900,
  at = 0,
  until,
  serviceName = "Ingress · api-svc",
  servicePort = ":443 → :8080",
  filename = "k8s · namespace/prod",
  dark = false,
  style,
}) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;

  const cols = 2;
  const rows = Math.ceil(pods.length / cols);
  const padX = 32;
  const gapX = 28;
  const gapY = 24;
  const podW = (w - padX * 2 - gapX) / 2;
  const podH = 168;

  const svcY = 24;
  const svcH = 84;
  const svcW = 540;
  const svcX = (w - svcW) / 2;

  const gridTop = svcY + svcH + 74;
  const bodyH = gridTop + rows * podH + (rows - 1) * gapY + 28;
  const h = (filename ? TAB_H : 0) + bodyH;

  // Count ready vs total spawned pods at current frame
  let spawned = 0;
  let ready = 0;
  for (let i = 0; i < pods.length; i++) {
    const pod = pods[i];
    const podAt = pod.at ?? at + 4 + i * 3;
    if (frame >= podAt) {
      spawned++;
      const crashed =
        pod.crashAt !== undefined &&
        frame >= pod.crashAt &&
        (pod.healAt === undefined || frame < pod.healAt);
      if (!crashed) ready++;
    }
  }

  const allReady = spawned > 0 && ready === spawned;
  const rightStatus = `${ready}/${spawned} Ready`;

  return (
    <DevCard
      x={x}
      y={y}
      w={w}
      h={h}
      p={p}
      dark={dark}
      filename={filename}
      icon="sitemap"
      right={rightStatus}
      style={style}
    >
      {/* Routing wires from Service to each Pod */}
      <svg
        width={w}
        height={bodyH}
        viewBox={`0 0 ${w} ${bodyH}`}
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      >
        {pods.map((pod, i) => {
          const podAt = pod.at ?? at + 4 + i * 3;
          const podP = prog(frame, podAt, 10, easeOut);
          if (podP <= 0) return null;

          const col = i % cols;
          const row = Math.floor(i / cols);
          const px = padX + col * (podW + gapX) + podW / 2;
          const py = gridTop + row * (podH + gapY);

          const sx = w / 2 + (col === 0 ? -70 : 70);
          const sy = svcY + svcH;
          const midY = (sy + py) / 2;
          const d = `M ${sx} ${sy} C ${sx} ${midY}, ${px} ${midY}, ${px} ${py}`;

          const isCrashed =
            pod.crashAt !== undefined &&
            frame >= pod.crashAt &&
            (pod.healAt === undefined || frame < pod.healAt);
          const isHealed = pod.healAt !== undefined && frame >= pod.healAt;

          const wireColor = isCrashed
            ? RED
            : isHealed
              ? GREEN
              : C.accent;

          // Animated packet position 0..1 along cubic bezier
          const t = ((frame * 0.035 + i * 0.27) % 1 + 1) % 1;
          const mt = 1 - t;
          const dotX =
            mt * mt * mt * sx +
            3 * mt * mt * t * sx +
            3 * mt * t * t * px +
            t * t * t * px;
          const dotY =
            mt * mt * mt * sy +
            3 * mt * mt * t * midY +
            3 * mt * t * t * midY +
            t * t * t * py;

          return (
            <g key={i} opacity={podP}>
              <path
                d={d}
                fill="none"
                stroke={isCrashed ? tint(RED, 0.45) : dark ? "rgba(255,255,255,0.16)" : tint(WIRE, 0.35)}
                strokeWidth={3}
                strokeDasharray={isCrashed ? "8 8" : undefined}
              />
              {!isCrashed ? (
                <path
                  d={d}
                  fill="none"
                  stroke={wireColor}
                  strokeWidth={3}
                  strokeLinecap="round"
                  pathLength={1}
                  strokeDasharray={1}
                  strokeDashoffset={1 - podP}
                  opacity={0.75}
                />
              ) : null}
              {!isCrashed && podP > 0.7 ? (
                <circle cx={dotX} cy={dotY} r={5.5} fill={wireColor} />
              ) : null}
            </g>
          );
        })}
      </svg>

      {/* Ingress / Service LoadBalancer node */}
      <div
        style={{
          position: "absolute",
          left: svcX,
          top: svcY,
          width: svcW,
          height: svcH,
          borderRadius: 20,
          background: dark ? "#262629" : BLUE_TINT,
          border: `2.5px solid ${C.accent}`,
          boxShadow: CARD_SHADOW,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          ...materialize(prog(frame, at + 2, 10, easeOut), 0.95, 6),
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: tint(C.accent, 0.14),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="router" size={28} color={C.accent} weight={2} />
          </div>
          <div>
            <div
              style={{
                fontFamily: sans,
                fontWeight: 700,
                fontSize: 24,
                letterSpacing: "-0.02em",
                color: dark ? TERM.fg : C.ink,
              }}
            >
              {serviceName}
            </div>
            <div style={{ fontFamily: mono, fontWeight: 500, fontSize: 18, color: C.mute }}>
              kube-proxy · round-robin {servicePort}
            </div>
          </div>
        </div>

        <div
          style={{
            padding: "6px 14px",
            borderRadius: 999,
            background: allReady ? tint(GREEN, 0.16) : tint(RED, 0.14),
            color: allReady ? "#248A3D" : "#C9281E",
            fontFamily: mono,
            fontWeight: 700,
            fontSize: 18,
          }}
        >
          {allReady ? "Healthy" : "Degraded"}
        </div>
      </div>

      {/* Pod Grid */}
      {pods.map((pod, i) => {
        const podAt = pod.at ?? at + 4 + i * 3;
        const podP = prog(frame, podAt, 10, easeOut);
        if (podP <= 0) return null;

        const isScaledReplica = pod.at !== undefined && pod.at > at + 15;
        const col = i % cols;
        const row = Math.floor(i / cols);
        const left = padX + col * (podW + gapX);
        const top = gridTop + row * (podH + gapY);

        const crashP = pod.crashAt !== undefined ? prog(frame, pod.crashAt, 8, easeInOut) : 0;
        const healP = pod.healAt !== undefined ? prog(frame, pod.healAt, 10, easeInOut) : 0;

        // Effective error weight (0 -> 1 on crash, 1 -> 0 on heal)
        const errW = crashP * (1 - healP);
        const okBoost = healP > 0 ? healP : isScaledReplica ? prog(frame, podAt, 12, easeOut) : 0;

        const baseBg = dark ? "#262629" : C.white;
        const errBg = dark ? tint(RED, 0.18) : "#FFF1F0";
        const okBg = dark ? tint(GREEN, 0.16) : "#EEFAF1";

        const midBg = interpolateColors(errW, [0, 1], [baseBg, errBg]);
        const cardBg = interpolateColors(okBoost, [0, 1], [midBg, okBg]);

        const baseBorder = dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.10)";
        const midBorder = interpolateColors(errW, [0, 1], [baseBorder, RED]);
        const cardBorder = interpolateColors(okBoost, [0, 1], [midBorder, GREEN]);

        const isCrashing = errW > 0.45;
        const isHealed = healP > 0.45;

        const podDisplayName = isHealed
          ? `${pod.name.slice(0, -3)}r4h`
          : pod.name;

        const statusLabel = isCrashing
          ? "CrashLoopBackOff"
          : isHealed
            ? "Running · Healed"
            : isScaledReplica
              ? "Running · Scaled +1"
              : "Running";

        const statusColor = isCrashing ? "#C9281E" : "#248A3D";
        const statusBg = isCrashing ? tint(RED, 0.16) : tint(GREEN, 0.16);
        const dotColor = isCrashing ? RED : GREEN;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left,
              top,
              width: podW,
              height: podH,
              ...materialize(podP, 0.94, 8),
            }}
          >
            {/* Outer error lock-on ring */}
            {errW > 0.02 ? (
              <div
                style={{
                  position: "absolute",
                  inset: -8,
                  borderRadius: 28,
                  border: `3.5px solid ${RED}`,
                  opacity: errW,
                  scale: String(lerp(1.05, 1, crashP)),
                }}
              />
            ) : null}

            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: 22,
                background: cardBg,
                border: `2.5px solid ${cardBorder}`,
                boxShadow: CARD_SHADOW,
                padding: "18px 22px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              {/* Top row: Pod icon + name + version pill */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                  <Icon
                    name={isCrashing ? "warning" : "box"}
                    size={28}
                    color={isCrashing ? RED : isHealed ? "#248A3D" : C.accent}
                    weight={2.1}
                  />
                  <div
                    style={{
                      fontFamily: mono,
                      fontWeight: 700,
                      fontSize: 22,
                      color: dark ? TERM.fg : C.ink,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {podDisplayName}
                  </div>
                </div>

                <div
                  style={{
                    padding: "4px 12px",
                    borderRadius: 8,
                    background: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
                    fontFamily: mono,
                    fontWeight: 600,
                    fontSize: 17,
                    color: dark ? TERM.dim : C.mute,
                    flexShrink: 0,
                  }}
                >
                  {pod.version}
                </div>
              </div>

              {/* Middle row: Status badge */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "6px 14px",
                    borderRadius: 10,
                    background: statusBg,
                    color: statusColor,
                    fontFamily: mono,
                    fontWeight: 700,
                    fontSize: 19,
                  }}
                >
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      background: dotColor,
                    }}
                  />
                  {statusLabel}
                </div>

                <div
                  style={{
                    fontFamily: mono,
                    fontWeight: 600,
                    fontSize: 17,
                    color: isCrashing ? "#C9281E" : C.mute,
                  }}
                >
                  {isCrashing ? "exit 137" : isHealed ? "restarts: 0" : "ready 1/1"}
                </div>
              </div>

              {/* Bottom row: CPU / Memory mini metrics */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: 8,
                  borderTop: `1px solid ${dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)"}`,
                  fontFamily: mono,
                  fontSize: 17,
                  color: dark ? TERM.dim : C.mute,
                }}
              >
                <span>CPU {isCrashing ? "0m" : pod.cpu ?? "125m"}</span>
                <span>MEM {isCrashing ? "OOMKilled" : pod.mem ?? "240Mi"}</span>
              </div>
            </div>
          </div>
        );
      })}
    </DevCard>
  );
};
