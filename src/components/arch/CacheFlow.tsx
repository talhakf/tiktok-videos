import { interpolateColors, useCurrentFrame } from "remotion";
import { Icon } from "../../icons/Icons";
import { TX } from "../../layout";
import { C, easeInOut, easeOut, materialize, mono, prog, sans } from "../../theme";
import { AMBER, toneColors } from "../dev/card";
import { BLUE_TINT, CARD_SHADOW, GREEN, lerp, presence, RED, WIRE } from "../diagram/Node";
import { tint } from "../windows/MacWindow";

export type CacheTtlSpec = {
  from: number;
  at: number;
  key?: string;
  val?: string;
};

/**
 * Tiered Cache (Redis RAM vs Disk DB) flow visualizer (`caching-redis`).
 * - `missAt`: Request #1 hits Cache -> red `MISS` -> continues to Disk DB -> populates Cache with key/value.
 * - `hitAt`: Requests #2..N hit Cache -> green `HIT · 0.2 ms` bouncing straight back while Disk DB rests.
 * - `ttl`: Live TTL countdown bar + seconds badge on the cached item.
 */
export const CacheFlow: React.FC<{
  x?: number;
  y: number;
  w?: number;
  h?: number;
  at: number;
  until?: number;
  cacheLabel?: string;
  cacheLatency?: string;
  dbLabel?: string;
  dbLatency?: string;
  missAt?: number;
  hitAt?: number;
  ttl?: CacheTtlSpec;
}> = ({
  x = TX,
  y,
  w = 900,
  h = 700,
  at,
  until,
  cacheLabel = "Redis (RAM)",
  cacheLatency = "0.2 ms",
  dbLabel = "Postgres (Disk)",
  dbLatency = "185 ms",
  missAt,
  hitAt,
  ttl,
}) => {
  const frame = useCurrentFrame();
  const vis = presence(frame, at, until);
  if (vis === null) return null;

  const badTone = toneColors("bad");
  const goodTone = toneColors("good");
  const warnTone = toneColors("warn");

  // Phase timings for MISS flow
  const hasMiss = missAt !== undefined && frame >= missAt;
  const reqToCacheP = missAt !== undefined ? prog(frame, missAt, 10, easeInOut) : 0;
  const missBadgeP = missAt !== undefined ? prog(frame, missAt + 9, 8, easeOut) : 0;
  const cacheToDbP = missAt !== undefined ? prog(frame, missAt + 14, 14, easeInOut) : 0;
  const dbToCacheP = missAt !== undefined ? prog(frame, missAt + 30, 12, easeInOut) : 0;
  const cachePopulatedP =
    missAt !== undefined
      ? prog(frame, missAt + 40, 10, easeOut)
      : hitAt !== undefined
        ? prog(frame, hitAt, 8, easeOut)
        : ttl !== undefined
          ? prog(frame, ttl.at, 8, easeOut)
          : 0;

  // Phase timings for HIT flow
  const hasHit = hitAt !== undefined && frame >= hitAt;
  const hitP = hitAt !== undefined ? prog(frame, hitAt, 10, easeOut) : 0;

  // Determine current cache status state: "idle" | "miss" | "hit"
  const showHit = hasHit && hitP > 0;
  const showMiss = hasMiss && !showHit && missBadgeP > 0;

  // TTL countdown calculation
  const ttlActive = ttl !== undefined && frame >= ttl.at;
  const ttlProgress = ttl ? prog(frame, ttl.at, 90, easeInOut) : 0;
  const ttlRemaining = ttl
    ? Math.max(0, Math.ceil(ttl.from * (1 - ttlProgress * 0.65)))
    : 0;
  const ttlBarRatio = ttl ? Math.max(0.12, 1 - ttlProgress * 0.65) : 1;

  const itemKey = ttl?.key ?? "user:42";
  const itemVal = ttl?.val ?? '{ name: "Ada", pro: true }';

  // Node coordinates inside card
  const stageCy = 355;
  const appCx = 115;
  const appW = 166;
  const appH = 220;

  const cacheCx = 435;
  const cacheW = 310;
  const cacheH = 420;

  const dbCx = 768;
  const dbW = 196;
  const dbH = 300;

  const appRight = appCx + appW / 2;
  const cacheLeft = cacheCx - cacheW / 2;
  const cacheRight = cacheCx + cacheW / 2;
  const dbLeft = dbCx - dbW / 2;

  // Staggered hit bursts (#2, #3, #4)
  const hitBursts = [0, 14, 28].map((offset, idx) => {
    const startF = (hitAt ?? 99999) + offset;
    const outP = prog(frame, startF, 7, easeInOut);
    const backP = prog(frame, startF + 7, 7, easeInOut);
    const active = frame >= startF && frame <= startF + 15;
    return { idx: idx + 2, outP, backP, active };
  });

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
      {/* Header bar */}
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
              background: showHit ? goodTone.bg : showMiss ? badTone.bg : BLUE_TINT,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon
              name="bolt"
              size={22}
              color={showHit ? goodTone.fg : showMiss ? badTone.fg : C.accent}
              weight={2.2}
            />
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: C.ink, letterSpacing: "-0.02em" }}>
            Tiered cache lookup
          </div>
        </div>

        {/* Live status badge in header */}
        {showHit ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 18px",
              borderRadius: 999,
              background: goodTone.bg,
              border: `2px solid ${GREEN}`,
              fontFamily: mono,
              fontSize: 21,
              fontWeight: 700,
              color: goodTone.fg,
              ...materialize(hitP),
            }}
          >
            <Icon name="check" size={20} color={goodTone.fg} weight={2.5} />
            HIT · {cacheLatency}
          </div>
        ) : showMiss ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 18px",
              borderRadius: 999,
              background: badTone.bg,
              border: `2px solid ${RED}`,
              fontFamily: mono,
              fontSize: 21,
              fontWeight: 700,
              color: badTone.fg,
              ...materialize(missBadgeP),
            }}
          >
            <Icon name="cross" size={20} color={badTone.fg} weight={2.5} />
            MISS · fallback to disk ({dbLatency})
          </div>
        ) : (
          <div style={{ fontFamily: mono, fontSize: 20, fontWeight: 600, color: C.mute }}>
            RAM ({cacheLatency}) vs Disk ({dbLatency})
          </div>
        )}
      </div>

      {/* SVG Wires between App <-> Cache <-> Disk DB */}
      <svg
        width={w}
        height={h}
        style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "visible" }}
      >
        {/* App -> Cache upper wire (request) */}
        <line
          x1={appRight}
          y1={stageCy - 28}
          x2={cacheLeft}
          y2={stageCy - 28}
          stroke={showHit ? GREEN : hasMiss ? C.accent : WIRE}
          strokeWidth={3.5}
          strokeLinecap="round"
        />
        {/* Cache -> App lower wire (response) */}
        <line
          x1={cacheLeft}
          y1={stageCy + 28}
          x2={appRight}
          y2={stageCy + 28}
          stroke={showHit ? GREEN : WIRE}
          strokeWidth={showHit ? 4 : 2.5}
          strokeDasharray={showHit ? undefined : "6 6"}
          strokeLinecap="round"
        />

        {/* Cache -> DB upper wire (miss query) */}
        <line
          x1={cacheRight}
          y1={stageCy - 28}
          x2={dbLeft}
          y2={stageCy - 28}
          stroke={cacheToDbP > 0 && !showHit ? RED : WIRE}
          strokeWidth={cacheToDbP > 0 && !showHit ? 3.5 : 2.5}
          strokeDasharray={cacheToDbP > 0 && !showHit ? undefined : "6 6"}
          opacity={showHit ? 0.3 : 0.8}
        />
        {/* DB -> Cache lower wire (populate cache) */}
        <line
          x1={dbLeft}
          y1={stageCy + 28}
          x2={cacheRight}
          y2={stageCy + 28}
          stroke={dbToCacheP > 0 && !showHit ? C.accent : WIRE}
          strokeWidth={dbToCacheP > 0 && !showHit ? 3.5 : 2.5}
          strokeDasharray={dbToCacheP > 0 && !showHit ? undefined : "6 6"}
          opacity={showHit ? 0.3 : 0.8}
        />

        {/* Animated Packet: Request #1 (App -> Cache) */}
        {reqToCacheP > 0 && reqToCacheP < 1 ? (
          <circle
            cx={lerp(appRight, cacheLeft, reqToCacheP)}
            cy={stageCy - 28}
            r={9}
            fill={C.accent}
          />
        ) : null}

        {/* Animated Packet: Miss fallback (Cache -> DB) */}
        {cacheToDbP > 0 && cacheToDbP < 1 ? (
          <circle
            cx={lerp(cacheRight, dbLeft, cacheToDbP)}
            cy={stageCy - 28}
            r={9}
            fill={RED}
          />
        ) : null}

        {/* Animated Packet: DB populate response (DB -> Cache) */}
        {dbToCacheP > 0 && dbToCacheP < 1 ? (
          <circle
            cx={lerp(dbLeft, cacheRight, dbToCacheP)}
            cy={stageCy + 28}
            r={9}
            fill={C.accent}
          />
        ) : null}

        {/* Animated Packets: Hit bursts #2..N (App <-> Cache) */}
        {hitBursts.map((b) =>
          b.active ? (
            <circle
              key={b.idx}
              cx={
                b.backP > 0
                  ? lerp(cacheLeft, appRight, b.backP)
                  : lerp(appRight, cacheLeft, b.outP)
              }
              cy={b.backP > 0 ? stageCy + 28 : stageCy - 28}
              r={10}
              fill={GREEN}
            />
          ) : null,
        )}
      </svg>

      {/* Floating packet labels */}
      {reqToCacheP > 0 && cacheToDbP < 1 && !showHit ? (
        <div
          style={{
            position: "absolute",
            left: (appRight + cacheLeft) / 2,
            top: stageCy - 74,
            translate: "-50% 0",
            padding: "4px 12px",
            borderRadius: 999,
            background: BLUE_TINT,
            border: `1.5px solid ${C.accent}`,
            fontFamily: mono,
            fontSize: 17,
            fontWeight: 700,
            color: C.accent,
            whiteSpace: "nowrap",
          }}
        >
          req #1
        </div>
      ) : null}

      {showHit ? (
        <div
          style={{
            position: "absolute",
            left: (appRight + cacheLeft) / 2,
            top: stageCy + 44,
            translate: "-50% 0",
            padding: "5px 12px",
            borderRadius: 999,
            background: goodTone.bg,
            border: `1.5px solid ${GREEN}`,
            fontFamily: mono,
            fontSize: 17,
            fontWeight: 700,
            color: goodTone.fg,
            whiteSpace: "nowrap",
            ...materialize(hitP),
          }}
        >
          req #2..N
        </div>
      ) : null}

      {dbToCacheP > 0 && !showHit ? (
        <div
          style={{
            position: "absolute",
            left: (cacheRight + dbLeft) / 2,
            top: stageCy + 44,
            translate: "-50% 0",
            padding: "4px 10px",
            borderRadius: 999,
            background: BLUE_TINT,
            border: `1.5px solid ${C.accent}`,
            fontFamily: mono,
            fontSize: 16,
            fontWeight: 700,
            color: C.accent,
            whiteSpace: "nowrap",
            ...materialize(dbToCacheP),
          }}
        >
          SET key
        </div>
      ) : null}

      {/* Column 1: App / Client node */}
      <div
        style={{
          position: "absolute",
          left: appCx - appW / 2,
          top: stageCy - appH / 2,
          width: appW,
          height: appH,
          borderRadius: 24,
          background: C.white,
          border: `2.5px solid rgba(0,0,0,0.12)`,
          boxShadow: CARD_SHADOW,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          padding: 16,
          boxSizing: "border-box",
        }}
      >
        <Icon name="laptop" size={50} color={C.ink} weight={1.9} />
        <div style={{ fontSize: 24, fontWeight: 700, color: C.ink, letterSpacing: "-0.02em" }}>
          Client
        </div>
        <div
          style={{
            padding: "4px 10px",
            borderRadius: 8,
            background: "#F5F5F7",
            fontFamily: mono,
            fontSize: 16,
            fontWeight: 600,
            color: C.mute,
          }}
        >
          GET /{itemKey}
        </div>
      </div>

      {/* Column 2: Cache Tier (Redis RAM) */}
      <div
        style={{
          position: "absolute",
          left: cacheCx - cacheW / 2,
          top: stageCy - cacheH / 2,
          width: cacheW,
          height: cacheH,
          borderRadius: 26,
          background: showHit
            ? interpolateColors(hitP, [0, 1], [C.white, "#F4FBF6"])
            : showMiss && cachePopulatedP <= 0
              ? "#FFF8F7"
              : C.white,
          border: `3px solid ${
            showHit ? GREEN : showMiss && cachePopulatedP <= 0 ? RED : C.accent
          }`,
          boxShadow: CARD_SHADOW,
          padding: "22px 22px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* Cache header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Icon name="chip" size={30} color={ showHit ? "#248A3D" : C.accent } weight={2} />
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, color: C.ink, letterSpacing: "-0.02em" }}>
                {cacheLabel}
              </div>
              <div style={{ fontFamily: mono, fontSize: 17, fontWeight: 600, color: C.mute }}>
                in-memory key-value
              </div>
            </div>
          </div>
          <div
            style={{
              padding: "5px 12px",
              borderRadius: 999,
              background: goodTone.bg,
              fontFamily: mono,
              fontSize: 18,
              fontWeight: 700,
              color: goodTone.fg,
            }}
          >
            {cacheLatency}
          </div>
        </div>

        {/* Cache slot content: either empty/MISS or populated key/value */}
        {cachePopulatedP > 0 ? (
          <div
            style={{
              padding: "18px 18px",
              borderRadius: 18,
              background: C.white,
              border: `2px solid ${showHit ? GREEN : C.accent}`,
              display: "flex",
              flexDirection: "column",
              gap: 10,
              ...materialize(cachePopulatedP),
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontFamily: mono, fontSize: 20, fontWeight: 700, color: C.accent }}>
                "{itemKey}"
              </span>
              <span
                style={{
                  padding: "2px 8px",
                  borderRadius: 6,
                  background: BLUE_TINT,
                  fontFamily: mono,
                  fontSize: 15,
                  fontWeight: 700,
                  color: C.accent,
                }}
              >
                RAM
              </span>
            </div>
            <div
              style={{
                fontFamily: mono,
                fontSize: 17,
                fontWeight: 600,
                color: C.ink,
                background: "#F5F5F7",
                padding: "8px 10px",
                borderRadius: 10,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {itemVal}
            </div>

            {/* Live TTL countdown bar + seconds badge */}
            {ttlActive ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Icon name="clock" size={16} color={C.mute} weight={2.2} />
                    <span style={{ fontFamily: mono, fontSize: 16, fontWeight: 700, color: C.mute }}>
                      TTL expiry
                    </span>
                  </div>
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: 6,
                      background: warnTone.bg,
                      fontFamily: mono,
                      fontSize: 16,
                      fontWeight: 700,
                      color: warnTone.fg,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    TTL {ttlRemaining}s
                  </span>
                </div>
                <div
                  style={{
                    width: "100%",
                    height: 8,
                    borderRadius: 999,
                    background: "#E8E8ED",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${ttlBarRatio * 100}%`,
                      height: "100%",
                      borderRadius: 999,
                      background: AMBER,
                    }}
                  />
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <div
            style={{
              height: 150,
              borderRadius: 18,
              border: `2px dashed ${showMiss ? RED : "rgba(0,0,0,0.15)"}`,
              background: showMiss ? badTone.bg : "#FAFAFC",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <div
              style={{
                fontFamily: mono,
                fontSize: 26,
                fontWeight: 700,
                color: showMiss ? badTone.fg : C.mute,
              }}
            >
              {showMiss ? "CACHE MISS" : "empty slot"}
            </div>
            <div style={{ fontFamily: mono, fontSize: 18, color: showMiss ? badTone.fg : C.mute }}>
              key "{itemKey}" not in RAM
            </div>
          </div>
        )}

        {/* Bottom badge inside Cache card */}
        <div
          style={{
            padding: "10px 14px",
            borderRadius: 14,
            background: showHit ? goodTone.bg : showMiss && cachePopulatedP <= 0 ? badTone.bg : "#F5F5F7",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontFamily: mono,
              fontSize: 18,
              fontWeight: 700,
              color: showHit ? goodTone.fg : showMiss && cachePopulatedP <= 0 ? badTone.fg : C.mute,
            }}
          >
            {showHit
              ? "HIT · served from RAM"
              : cachePopulatedP > 0
                ? "Cached in RAM"
                : showMiss
                  ? "MISS · querying DB"
                  : "Waiting for request"}
          </span>
          <span
            style={{
              fontFamily: mono,
              fontSize: 18,
              fontWeight: 700,
              color: showHit ? goodTone.fg : C.ink,
            }}
          >
            {showHit ? cacheLatency : ""}
          </span>
        </div>
      </div>

      {/* Column 3: Disk DB Tier (Postgres Disk) */}
      <div
        style={{
          position: "absolute",
          left: dbCx - dbW / 2,
          top: stageCy - dbH / 2,
          width: dbW,
          height: dbH,
          borderRadius: 24,
          background: C.white,
          border: `2.5px solid ${
            cacheToDbP > 0 && !showHit ? AMBER : "rgba(0,0,0,0.12)"
          }`,
          boxShadow: CARD_SHADOW,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "22px 16px",
          boxSizing: "border-box",
          opacity: showHit ? lerp(1, 0.45, hitP) : 1,
        }}
      >
        <div
          style={{
            padding: "5px 12px",
            borderRadius: 999,
            background: warnTone.bg,
            fontFamily: mono,
            fontSize: 18,
            fontWeight: 700,
            color: warnTone.fg,
          }}
        >
          {dbLatency}
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <Icon
            name="database"
            size={54}
            color={cacheToDbP > 0 && !showHit ? AMBER : C.ink}
            weight={1.9}
          />
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: C.ink,
              letterSpacing: "-0.02em",
              textAlign: "center",
            }}
          >
            {dbLabel}
          </div>
        </div>

        <div
          style={{
            padding: "6px 12px",
            borderRadius: 10,
            background: "#F5F5F7",
            border: `1px solid ${tint(C.ink, 0.08)}`,
            fontFamily: mono,
            fontSize: 16,
            fontWeight: 600,
            color: C.mute,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Icon name={showHit ? "zzz" : "disk"} size={16} color={C.mute} weight={2} />
          {showHit ? "resting" : "disk I/O"}
        </div>
      </div>
    </div>
  );
};
