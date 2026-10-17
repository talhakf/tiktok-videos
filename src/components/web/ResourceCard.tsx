import { useCurrentFrame } from "remotion";
import { Icon } from "../../icons/Icons";
import { TX } from "../../layout";
import { C, easeOut, materialize, mono, prog, sans } from "../../theme";
import { BLUE_TINT, CARD_SHADOW, GREEN, presence } from "../diagram/Node";
import { tint, TrafficLights } from "../windows/MacWindow";

export type ResourceStep = {
  label: string;
  code?: string;
  result?: string;
  ok?: boolean;
  at: number;
};

export type ResourceCardProps = {
  x?: number;
  y: number;
  w?: number;
  at: number;
  until?: number;
  url: string;
  title: string;
  category: string;
  badge?: string;
  steps: ResourceStep[];
};

/**
 * Interactive web resource / coding game / security lab showcase card.
 * Features a compact browser address bar, category & free/no-login badge,
 * and an animated step-by-step recipe / challenge pipeline.
 */
export const ResourceCard: React.FC<ResourceCardProps> = ({
  x = TX,
  y,
  w = 900,
  at,
  until,
  url,
  title,
  category,
  badge,
  steps,
}) => {
  const frame = useCurrentFrame();
  const vis = presence(frame, at, until);
  if (vis === null) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        borderRadius: 28,
        background: C.white,
        border: `1px solid ${C.line}`,
        boxShadow: CARD_SHADOW,
        overflow: "hidden",
        fontFamily: sans,
        ...materialize(vis),
      }}
    >
      {/* Top browser bar with traffic lights, URL pill, and category */}
      <div
        style={{
          height: 68,
          background: "#F2F2F4",
          borderBottom: `1px solid ${C.line}`,
          display: "flex",
          alignItems: "center",
          padding: "0 26px",
          gap: 20,
        }}
      >
        <TrafficLights />
        <div
          style={{
            flex: 1,
            minWidth: 0,
            height: 44,
            borderRadius: 12,
            background: C.white,
            border: `1px solid ${C.line}`,
            display: "flex",
            alignItems: "center",
            padding: "0 16px",
            gap: 10,
          }}
        >
          <Icon name="globe" size={22} color={C.accent} />
          <span
            style={{
              fontFamily: mono,
              fontSize: 22,
              fontWeight: 500,
              color: C.ink,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {url}
          </span>
        </div>
        <span
          style={{
            padding: "6px 18px",
            borderRadius: 999,
            background: BLUE_TINT,
            color: C.accent,
            fontSize: 22,
            fontWeight: 600,
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          {category}
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: "28px 34px 32px", display: "flex", flexDirection: "column", gap: 22 }}>
        {/* Title & badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              fontSize: 38,
              fontWeight: 700,
              color: C.ink,
              letterSpacing: "-0.025em",
              lineHeight: 1.15,
              flex: 1,
              minWidth: 0,
            }}
          >
            {title}
          </div>
          {badge ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 20px",
                borderRadius: 999,
                background: tint(GREEN, 0.13),
                color: "#248A3D",
                fontSize: 23,
                fontWeight: 700,
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              <Icon name="check" size={22} color="#248A3D" />
              {badge}
            </div>
          ) : null}
        </div>

        {/* Interactive recipe / challenge steps */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {steps.map((step, i) => {
            const sp = prog(frame, step.at, 10, easeOut);
            if (sp <= 0) return null;
            const isOk = Boolean(step.ok);
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "16px 22px",
                  borderRadius: 20,
                  background: isOk ? tint(GREEN, 0.09) : C.paper,
                  border: `1.5px solid ${isOk ? tint(GREEN, 0.4) : C.line}`,
                  ...materialize(sp, 0.97, 5),
                }}
              >
                {/* Step index or check badge */}
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    background: isOk ? tint(GREEN, 0.2) : BLUE_TINT,
                    color: isOk ? "#248A3D" : C.accent,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: mono,
                    fontSize: 22,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {isOk ? <Icon name="check" size={24} color="#248A3D" draw={prog(frame, step.at + 2, 10)} /> : i + 1}
                </div>

                {/* Step label */}
                <span style={{ fontSize: 26, fontWeight: 600, color: C.ink, whiteSpace: "nowrap" }}>{step.label}</span>

                {/* Optional code / input snippet */}
                {step.code ? (
                  <span
                    style={{
                      fontFamily: mono,
                      fontSize: 22,
                      fontWeight: 500,
                      padding: "6px 14px",
                      borderRadius: 10,
                      background: C.white,
                      border: `1px solid ${C.line}`,
                      color: C.mute,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: 340,
                    }}
                  >
                    {step.code}
                  </span>
                ) : null}

                {/* Optional result output */}
                {step.result ? (
                  <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                    <Icon name="arrowRight" size={22} color={isOk ? "#248A3D" : C.accent} />
                    <span
                      style={{
                        fontFamily: mono,
                        fontSize: 23,
                        fontWeight: 700,
                        padding: "6px 16px",
                        borderRadius: 12,
                        background: isOk ? tint(GREEN, 0.16) : BLUE_TINT,
                        color: isOk ? "#248A3D" : C.accent,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {step.result}
                    </span>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
