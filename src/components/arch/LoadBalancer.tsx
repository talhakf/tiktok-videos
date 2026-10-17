import { interpolateColors, useCurrentFrame } from "remotion";
import { Icon } from "../../icons/Icons";
import { TX } from "../../layout";
import { C, easeInOut, easeOut, materialize, mono, prog, sans } from "../../theme";
import { toneColors } from "../dev/card";
import { BLUE_TINT, CARD_SHADOW, GREEN, lerp, presence, RED, WIRE } from "../diagram/Node";

export type BackendServer = {
  label: string;
  sub?: string;
  crashAt?: number;
  recoverAt?: number;
};

export type LoadBalancedRequest = {
  at: number;
  targetIndex: number;
  label?: string;
};

const DEFAULT_SERVERS: BackendServer[] = [
  { label: "app-01", sub: "10.0.1.11:8080" },
  { label: "app-02", sub: "10.0.1.12:8080" },
  { label: "app-03", sub: "10.0.1.13:8080" },
];

/**
 * Reverse Proxy & Load Balancer traffic distributor (`reverse-proxy-load-balancer`, `ddos`, `system-design-primer`).
 * Distributes incoming `requests` from the left through the central proxy (`proxyLabel`) out to `servers`.
 * Supports server `crashAt` (red offline state, traffic rerouted) and `recoverAt`.
 */
export const LoadBalancer: React.FC<{
  x?: number;
  y: number;
  w?: number;
  h?: number;
  at: number;
  until?: number;
  proxyLabel?: string;
  proxySub?: string;
  servers?: BackendServer[];
  requests?: LoadBalancedRequest[];
  algorithm?: string;
}> = ({
  x = TX,
  y,
  w = 900,
  h = 700,
  at,
  until,
  proxyLabel = "Nginx / Cloudflare",
  proxySub = ":443",
  servers = DEFAULT_SERVERS,
  requests = [],
  algorithm = "round-robin",
}) => {
  const frame = useCurrentFrame();
  const vis = presence(frame, at, until);
  if (vis === null) return null;

  const badTone = toneColors("bad");
  const goodTone = toneColors("good");

  // Layout coordinates inside the 900x700 card
  const stageCy = 385;
  const clientCx = 105;
  const clientW = 148;
  const clientH = 190;

  const proxyCx = 370;
  const proxyW = 236;
  const proxyH = 260;

  const srvCx = 730;
  const srvW = 268;
  const srvCount = Math.max(1, servers.length);
  const srvH = Math.min(144, Math.floor(470 / srvCount) - 18);
  const srvSpan = 480;
  const srvCenterY = (i: number) =>
    srvCount === 1
      ? stageCy
      : stageCy - srvSpan / 2 + ((i + 0.5) / srvCount) * srvSpan;

  const clientRight = clientCx + clientW / 2;
  const proxyLeft = proxyCx - proxyW / 2;
  const proxyRight = proxyCx + proxyW / 2;
  const srvLeft = srvCx - srvW / 2;

  // Evaluate server health and handled counts
  const serverStates = servers.map((srv, idx) => {
    const crashed =
      srv.crashAt !== undefined &&
      frame >= srv.crashAt &&
      (srv.recoverAt === undefined || frame < srv.recoverAt);
    const recovered = srv.recoverAt !== undefined && frame >= srv.recoverAt;
    const crashP = crashed
      ? prog(frame, srv.crashAt!, 8, easeOut)
      : recovered
        ? 1 - prog(frame, srv.recoverAt!, 8, easeOut)
        : 0;

    // Count completed requests delivered to this server
    const deliveredCount = requests.filter(
      (r) => r.targetIndex === idx && frame >= r.at + 20,
    ).length;

    // Is a request currently arriving at this server?
    const activeHitP = requests.reduce((max, r) => {
      if (r.targetIndex !== idx) return max;
      if (frame < r.at + 10 || frame > r.at + 28) return max;
      const enter = prog(frame, r.at + 10, 8, easeOut);
      const exit = prog(frame, r.at + 20, 8, easeOut);
      return Math.max(max, enter * (1 - exit));
    }, 0);

    return { srv, crashed, recovered, crashP, deliveredCount, activeHitP };
  });

  const healthyCount = serverStates.filter((s) => !s.crashed).length;

  // Evaluate active requests in flight
  const inFlight = requests
    .map((r, ri) => {
      const leg1P = prog(frame, r.at, 10, easeInOut);
      const leg2P = prog(frame, r.at + 10, 12, easeInOut);
      const visible = frame >= r.at && frame <= r.at + 23;
      const targetIdx = Math.max(0, Math.min(srvCount - 1, r.targetIndex));
      const targetY = srvCenterY(targetIdx);

      let px = clientRight;
      let py = stageCy;
      if (frame < r.at + 10) {
        px = lerp(clientRight, proxyLeft, leg1P);
        py = stageCy;
      } else {
        px = lerp(proxyRight, srvLeft, leg2P);
        // Smooth S-curve y interpolation
        py = lerp(stageCy, targetY, leg2P);
      }
      return { r, ri, leg1P, leg2P, visible, targetIdx, targetY, px, py };
    })
    .filter((item) => item.visible);

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        borderRadius: 28,
        background: C.white,
        border: `1px solid ${C.line}`,
        boxShadow: CARD_SHADOW,
        overflow: "hidden",
        fontFamily: sans,
        ...materialize(vis),
      }}
    >
      {/* Top header strip */}
      <div
        style={{
          height: 76,
          padding: "0 32px",
          borderBottom: `1px solid ${C.line}`,
          background: "#FAFAFC",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: BLUE_TINT,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="shield" size={22} color={C.accent} weight={2.2} />
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: C.ink, letterSpacing: "-0.02em" }}>
            Reverse proxy & load balancer
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "7px 14px",
              borderRadius: 999,
              background: BLUE_TINT,
              border: `1.5px solid ${C.accent}`,
              fontFamily: mono,
              fontSize: 18,
              fontWeight: 700,
              color: C.accent,
            }}
          >
            <Icon name="refresh" size={18} color={C.accent} weight={2.2} />
            {algorithm}
          </div>

          <div
            style={{
              padding: "7px 14px",
              borderRadius: 999,
              background: healthyCount === srvCount ? goodTone.bg : badTone.bg,
              fontFamily: mono,
              fontSize: 18,
              fontWeight: 700,
              color: healthyCount === srvCount ? goodTone.fg : badTone.fg,
            }}
          >
            {healthyCount}/{srvCount} healthy
          </div>
        </div>
      </div>

      {/* SVG connector wires */}
      <svg
        width={w}
        height={h}
        style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "visible" }}
      >
        {/* Client -> Proxy wire */}
        <line
          x1={clientRight}
          y1={stageCy}
          x2={proxyLeft}
          y2={stageCy}
          stroke={inFlight.some((f) => f.leg1P > 0 && f.leg1P < 1) ? C.accent : WIRE}
          strokeWidth={4}
          strokeLinecap="round"
        />

        {/* Proxy -> Backend Servers wires */}
        {serverStates.map((st, idx) => {
          const sy = srvCenterY(idx);
          const midX = (proxyRight + srvLeft) / 2;
          const d = `M ${proxyRight} ${stageCy} C ${midX} ${stageCy}, ${midX} ${sy}, ${srvLeft} ${sy}`;
          const activeOnWire = inFlight.some(
            (f) => f.targetIdx === idx && f.leg2P > 0 && f.leg2P < 1,
          );

          return (
            <g key={idx}>
              <path
                d={d}
                fill="none"
                stroke={st.crashed ? RED : activeOnWire ? C.accent : WIRE}
                strokeWidth={activeOnWire ? 4.5 : 2.5}
                strokeDasharray={st.crashed ? "7 7" : undefined}
                opacity={st.crashed ? 0.45 : activeOnWire ? 1 : 0.65}
              />
              <circle
                cx={srvLeft}
                cy={sy}
                r={5}
                fill={st.crashed ? RED : activeOnWire ? C.accent : WIRE}
                opacity={st.crashed ? 0.5 : 1}
              />
            </g>
          );
        })}
      </svg>

      {/* Column 1: Clients / Public Traffic */}
      <div
        style={{
          position: "absolute",
          left: clientCx - clientW / 2,
          top: stageCy - clientH / 2,
          width: clientW,
          height: clientH,
          borderRadius: 24,
          background: C.white,
          border: `2.5px solid rgba(0,0,0,0.12)`,
          boxShadow: CARD_SHADOW,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          padding: 14,
          boxSizing: "border-box",
        }}
      >
        <Icon name="globe" size={48} color={C.ink} weight={1.9} />
        <div style={{ fontSize: 22, fontWeight: 700, color: C.ink, letterSpacing: "-0.02em" }}>
          Clients
        </div>
        <div style={{ fontFamily: mono, fontSize: 16, fontWeight: 600, color: C.mute }}>
          public traffic
        </div>
      </div>

      {/* Column 2: Reverse Proxy / Load Balancer */}
      <div
        style={{
          position: "absolute",
          left: proxyCx - proxyW / 2,
          top: stageCy - proxyH / 2,
          width: proxyW,
          height: proxyH,
          borderRadius: 26,
          background: BLUE_TINT,
          border: `3px solid ${C.accent}`,
          boxShadow: CARD_SHADOW,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "22px 18px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            padding: "4px 12px",
            borderRadius: 999,
            background: C.white,
            fontFamily: mono,
            fontSize: 16,
            fontWeight: 700,
            color: C.accent,
          }}
        >
          reverse proxy
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <Icon name="router" size={50} color={C.accent} weight={2} />
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: C.ink,
              letterSpacing: "-0.02em",
              textAlign: "center",
            }}
          >
            {proxyLabel}
          </div>
          {proxySub ? (
            <div style={{ fontFamily: mono, fontSize: 18, fontWeight: 600, color: C.mute }}>
              {proxySub}
            </div>
          ) : null}
        </div>

        <div
          style={{
            fontFamily: mono,
            fontSize: 16,
            fontWeight: 600,
            color: C.accent,
          }}
        >
          health check: active
        </div>
      </div>

      {/* Column 3: Backend Server Pool */}
      {serverStates.map((st, idx) => {
        const sy = srvCenterY(idx);
        const borderCol = st.crashed
          ? RED
          : st.activeHitP > 0
            ? interpolateColors(st.activeHitP, [0, 1], ["rgba(0,0,0,0.12)", C.accent])
            : st.recovered
              ? GREEN
              : "rgba(0,0,0,0.12)";
        const bgCol = st.crashed
          ? "#FFF1F0"
          : st.activeHitP > 0
            ? interpolateColors(st.activeHitP, [0, 1], [C.white, BLUE_TINT])
            : C.white;

        return (
          <div
            key={idx}
            style={{
              position: "absolute",
              left: srvCx - srvW / 2,
              top: sy - srvH / 2,
              width: srvW,
              height: srvH,
              borderRadius: 22,
              background: bgCol,
              border: `3px solid ${borderCol}`,
              boxShadow: CARD_SHADOW,
              padding: "16px 20px",
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              opacity: st.crashed ? 0.85 : 1,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <Icon
                name={st.crashed ? "crossCircle" : "server"}
                size={36}
                color={st.crashed ? RED : st.activeHitP > 0 ? C.accent : C.ink}
                weight={2}
              />
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, color: C.ink, letterSpacing: "-0.02em" }}>
                  {st.srv.label}
                </div>
                <div style={{ fontFamily: mono, fontSize: 16, fontWeight: 600, color: C.mute }}>
                  {st.crashed ? "offline · skipped" : (st.srv.sub ?? "healthy")}
                </div>
              </div>
            </div>

            {/* Right status / request count pill */}
            <div
              style={{
                padding: "6px 12px",
                borderRadius: 10,
                background: st.crashed
                  ? badTone.bg
                  : st.deliveredCount > 0
                    ? goodTone.bg
                    : "#F5F5F7",
                fontFamily: mono,
                fontSize: 17,
                fontWeight: 700,
                color: st.crashed
                  ? badTone.fg
                  : st.deliveredCount > 0
                    ? goodTone.fg
                    : C.mute,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {st.crashed ? "DOWN" : `${st.deliveredCount} req`}
            </div>
          </div>
        );
      })}

      {/* Animated Request Chips in Flight */}
      {inFlight.map((item) => (
        <div
          key={item.ri}
          style={{
            position: "absolute",
            left: item.px,
            top: item.py,
            translate: "-50% -50%",
            padding: "6px 14px",
            borderRadius: 999,
            background: C.accent,
            color: C.white,
            boxShadow: "0 6px 16px rgba(0,113,227,0.28)",
            fontFamily: mono,
            fontSize: 17,
            fontWeight: 700,
            whiteSpace: "nowrap",
            pointerEvents: "none",
          }}
        >
          {item.r.label ?? `req #${item.ri + 1}`}
        </div>
      ))}
    </div>
  );
};
