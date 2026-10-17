import { useCurrentFrame } from "remotion";
import { Icon } from "../../icons/Icons";
import { TW, TX } from "../../layout";
import { C, easeInOut, easeOut, materialize, mono, prog, sans, TERM } from "../../theme";
import { AMBER, toneColors } from "../dev/card";
import { BLUE_TINT, CARD_SHADOW, GREEN, lerp, presence, RED, WIRE } from "../diagram/Node";
import { tint } from "../windows/MacWindow";

export type RestTripSpec = {
  path: string;
  latency: string;
  size: string;
  kept: string;
  overfetched: string[];
};

const DEFAULT_REST_TRIPS: RestTripSpec[] = [
  {
    path: "GET /users/1",
    latency: "110 ms",
    size: "6.4 KB",
    kept: '"name": "sudo"',
    overfetched: ['"bio_html": "..."', '"settings_blob": {...}', '"oauth_tokens": [...]'],
  },
  {
    path: "GET /users/1/posts",
    latency: "135 ms",
    size: "5.8 KB",
    kept: '"title": "Why gRPC?"',
    overfetched: ['"raw_markdown": "..."', '"edit_history": [...]', '"seo_meta": {...}'],
  },
  {
    path: "GET /users/1/followers",
    latency: "95 ms",
    size: "2.6 KB",
    kept: '"count": 1420',
    overfetched: ['"avatars_base64": [...]', '"geo_ookup": {...}'],
  },
];

/**
 * REST vs GraphQL comparison card:
 * Top section shows REST making 3 sequential round-trips (`GET /users/1`, `GET /users/1/posts`,
 * `GET /users/1/followers`) with greyed-out over-fetched fields, while bottom section shows
 * GraphQL fetching the exact nested fields in `1 request · 1.2 KB`.
 */
export const RestVsGraphql: React.FC<{
  x?: number;
  y: number;
  w?: number;
  h?: number;
  at: number;
  until?: number;
  restAt?: number;
  graphqlAt?: number;
  restTrips?: RestTripSpec[];
  restSummary?: string;
  graphqlSummary?: string;
}> = ({
  x = TX,
  y,
  w = TW,
  h = 880,
  at,
  until,
  restAt,
  graphqlAt,
  restTrips = DEFAULT_REST_TRIPS,
  restSummary = "3 round-trips · 340 ms · 14.8 KB",
  graphqlSummary = "1 request · 42 ms · 1.2 KB",
}) => {
  const frame = useCurrentFrame();
  const vis = presence(frame, at, until);
  if (vis === null) return null;

  const badTone = toneColors("bad");
  const warnTone = toneColors("warn");
  const goodTone = toneColors("good");

  const rStart = restAt ?? at + 6;
  const gStart = graphqlAt ?? at + 44;

  const gqlP = prog(frame, gStart, 12, easeOut);
  const gqlPacketP = prog(frame, gStart + 4, 14, easeInOut);
  const gqlDoneP = prog(frame, gStart + 16, 10, easeOut);

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
      {/* Card Header */}
      <div
        style={{
          height: 74,
          padding: "0 30px",
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
              background: gqlDoneP > 0.2 ? goodTone.bg : BLUE_TINT,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon
              name="sitemap"
              size={22}
              color={gqlDoneP > 0.2 ? goodTone.fg : C.accent}
              weight={2.1}
            />
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: C.ink, letterSpacing: "-0.02em" }}>
            REST waterfall vs GraphQL query
          </div>
        </div>

        <div
          style={{
            padding: "6px 14px",
            borderRadius: 999,
            background: gqlDoneP > 0.2 ? goodTone.bg : warnTone.bg,
            border: `1.5px solid ${gqlDoneP > 0.2 ? GREEN : AMBER}`,
            fontFamily: mono,
            fontSize: 18,
            fontWeight: 700,
            color: gqlDoneP > 0.2 ? goodTone.fg : warnTone.fg,
          }}
        >
          {gqlDoneP > 0.2 ? "92% less payload · 1 RTT" : "N+1 over-fetching"}
        </div>
      </div>

      <div style={{ padding: "22px 28px", display: "flex", flexDirection: "column", gap: 22 }}>
        {/* TOP SECTION: REST (3 Sequential Round-Trips + Over-fetched fields) */}
        <div
          style={{
            borderRadius: 22,
            background: "#FAFAFC",
            border: `1.5px solid ${tint(RED, 0.28)}`,
            padding: "18px 22px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: 8,
                  background: badTone.bg,
                  fontFamily: mono,
                  fontSize: 16,
                  fontWeight: 700,
                  color: badTone.fg,
                }}
              >
                REST API
              </span>
              <span style={{ fontSize: 20, fontWeight: 600, color: C.ink, letterSpacing: "-0.01em" }}>
                3 sequential round-trips + unused fields
              </span>
            </div>
            <span
              style={{
                fontFamily: mono,
                fontSize: 17,
                fontWeight: 700,
                color: badTone.fg,
                background: badTone.bg,
                padding: "4px 12px",
                borderRadius: 999,
              }}
            >
              {restSummary}
            </span>
          </div>

          {/* 3 Sequential Round-trip Rows */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {restTrips.map((trip, i) => {
              const rowStart = rStart + i * 11;
              const rowP = prog(frame, rowStart, 10, easeOut);
              const barP = prog(frame, rowStart + 2, 10, easeInOut);
              return (
                <div
                  key={trip.path}
                  style={{
                    borderRadius: 16,
                    background: C.white,
                    border: `1px solid ${C.line}`,
                    padding: "12px 16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    ...materialize(rowP),
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: 999,
                          background: warnTone.bg,
                          color: warnTone.fg,
                          fontFamily: mono,
                          fontSize: 15,
                          fontWeight: 700,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        #{i + 1}
                      </span>
                      <span style={{ fontFamily: mono, fontSize: 18, fontWeight: 700, color: C.ink }}>
                        {trip.path}
                      </span>
                    </div>

                    {/* Waterfall timing bar */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div
                        style={{
                          width: 170,
                          height: 10,
                          borderRadius: 999,
                          background: "#ECECEF",
                          position: "relative",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            left: `${i * 30}%`,
                            width: `${barP * 34}%`,
                            height: "100%",
                            borderRadius: 999,
                            background: AMBER,
                          }}
                        />
                      </div>
                      <span style={{ fontFamily: mono, fontSize: 16, fontWeight: 600, color: C.mute }}>
                        {trip.latency} · {trip.size}
                      </span>
                    </div>
                  </div>

                  {/* JSON fields: 1 kept field + greyed-out over-fetched fields */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      flexWrap: "nowrap",
                      overflow: "hidden",
                      fontFamily: mono,
                      fontSize: 15,
                    }}
                  >
                    <span
                      style={{
                        padding: "3px 9px",
                        borderRadius: 6,
                        background: BLUE_TINT,
                        color: C.accent,
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {trip.kept}
                    </span>
                    {trip.overfetched.map((ofField) => (
                      <span
                        key={ofField}
                        style={{
                          padding: "3px 8px",
                          borderRadius: 6,
                          background: "#F2F2F4",
                          color: "#9A9AA0",
                          textDecoration: "line-through",
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                        }}
                      >
                        {ofField}
                      </span>
                    ))}
                    <span
                      style={{
                        marginLeft: "auto",
                        fontSize: 14,
                        fontWeight: 700,
                        color: badTone.fg,
                        flexShrink: 0,
                      }}
                    >
                      over-fetched
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* BOTTOM SECTION: GraphQL (Single Request, Exact Nested Fields) */}
        <div
          style={{
            borderRadius: 22,
            background: "#F6FBF7",
            border: `2px solid ${GREEN}`,
            padding: "18px 22px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
            ...materialize(gqlP),
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: 8,
                  background: goodTone.bg,
                  fontFamily: mono,
                  fontSize: 16,
                  fontWeight: 700,
                  color: goodTone.fg,
                }}
              >
                GraphQL
              </span>
              <span style={{ fontSize: 20, fontWeight: 700, color: C.ink, letterSpacing: "-0.01em" }}>
                Exact nested fields in 1 round-trip
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "5px 14px",
                borderRadius: 999,
                background: goodTone.bg,
                border: `1.5px solid ${GREEN}`,
                fontFamily: mono,
                fontSize: 18,
                fontWeight: 700,
                color: goodTone.fg,
              }}
            >
              <Icon name="check" size={18} color={goodTone.fg} weight={2.5} />
              {graphqlSummary}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 116px 1fr", alignItems: "center", gap: 12 }}>
            {/* Left: GraphQL Query */}
            <div
              style={{
                borderRadius: 16,
                background: TERM.bg,
                padding: "14px 18px",
                fontFamily: mono,
                fontSize: 15,
                lineHeight: 1.48,
                color: TERM.fg,
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)",
              }}
            >
              <div style={{ color: TERM.dim, marginBottom: 4, fontSize: 14 }}>POST /graphql</div>
              <div>
                <span style={{ color: TERM.purple, fontWeight: 700 }}>query</span> {"{"}
              </div>
              <div style={{ paddingLeft: 16 }}>
                <span style={{ color: TERM.blue }}>user</span>(id: <span style={{ color: TERM.yellow }}>1</span>) {"{"}
              </div>
              <div style={{ paddingLeft: 32, color: TERM.green, fontWeight: 700 }}>name</div>
              <div style={{ paddingLeft: 32 }}>
                <span style={{ color: TERM.blue }}>posts</span> {"{ "}
                <span style={{ color: TERM.green, fontWeight: 700 }}>title</span>
                {" }"}
              </div>
              <div style={{ paddingLeft: 32 }}>
                <span style={{ color: TERM.blue }}>followers</span> {"{ "}
                <span style={{ color: TERM.green, fontWeight: 700 }}>count</span>
                {" }"}
              </div>
              <div style={{ paddingLeft: 16 }}>{"}"}</div>
              <div>{"}"}</div>
            </div>

            {/* Middle: Single request wire + animated packet */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  padding: "4px 10px",
                  borderRadius: 999,
                  background: goodTone.bg,
                  fontFamily: mono,
                  fontSize: 14,
                  fontWeight: 700,
                  color: goodTone.fg,
                  whiteSpace: "nowrap",
                }}
              >
                1 request
              </div>
              <svg width={108} height={36} style={{ overflow: "visible" }}>
                <line
                  x1={6}
                  y1={18}
                  x2={102}
                  y2={18}
                  stroke={gqlPacketP > 0 ? GREEN : WIRE}
                  strokeWidth={3.5}
                  strokeLinecap="round"
                />
                <path
                  d="M92 10 L102 18 L92 26"
                  fill="none"
                  stroke={gqlPacketP > 0 ? GREEN : WIRE}
                  strokeWidth={3.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {gqlPacketP > 0 && gqlPacketP < 1 ? (
                  <circle cx={lerp(8, 98, gqlPacketP)} cy={18} r={8} fill={GREEN} />
                ) : null}
              </svg>
              <div style={{ fontFamily: mono, fontSize: 14, fontWeight: 700, color: C.mute }}>
                1.2 KB
              </div>
            </div>

            {/* Right: Exact JSON response */}
            <div
              style={{
                borderRadius: 16,
                background: C.white,
                border: `2px solid ${GREEN}`,
                padding: "14px 18px",
                fontFamily: mono,
                fontSize: 15,
                lineHeight: 1.48,
                color: C.ink,
                ...materialize(Math.max(0.25, gqlDoneP)),
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 4,
                  fontSize: 14,
                  color: goodTone.fg,
                  fontWeight: 700,
                }}
              >
                <span>200 OK · exact match</span>
                <span>0 wasted bytes</span>
              </div>
              <div>{"{"}</div>
              <div style={{ paddingLeft: 16 }}>
                "user": {"{"}
              </div>
              <div style={{ paddingLeft: 32, color: "#248A3D", fontWeight: 700 }}>
                "name": "sudo",
              </div>
              <div style={{ paddingLeft: 32, color: "#248A3D", fontWeight: 700 }}>
                "posts": [{"{"} "title": "Why gRPC?" {"}"}],
              </div>
              <div style={{ paddingLeft: 32, color: "#248A3D", fontWeight: 700 }}>
                "followers": {"{"} "count": 1420 {"}"}
              </div>
              <div style={{ paddingLeft: 16 }}>{"}"}</div>
              <div>{"}"}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
