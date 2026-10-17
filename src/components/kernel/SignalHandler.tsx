import { useCurrentFrame } from "remotion";
import { Icon, IconName } from "../../icons/Icons";
import { TW, TX, TY } from "../../layout";
import { C, easeInOut, materialize, mono, prog, sans, TERM } from "../../theme";
import { DevCard, toneColors } from "../dev/card";
import { CARD_SHADOW, GREEN, presence, RED } from "../diagram/Node";
import { tint } from "../windows/MacWindow";

// POSIX Signals explainer card (SIGINT (2) · Ctrl+C, SIGTERM (15) · polite stop, SIGKILL (9) · kernel termination):
// shows SIGTERM entering the process's `trap / cleanup()` handler gracefully, while SIGKILL (kill -9)
// bypasses user space entirely and terminates the PID at the kernel level.

export type SignalHandlerProps = {
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  at: number;
  until?: number;
  sigintAt?: number;
  sigtermAt?: number;
  sigkillAt?: number;
  filename?: string;
  right?: string;
};

export const SignalHandler: React.FC<SignalHandlerProps> = ({
  x = TX,
  y = TY,
  w = TW,
  h = 900,
  at,
  until,
  sigintAt,
  sigtermAt,
  sigkillAt,
  filename = "posix-signals.sh",
  right = "PID 1337 · signal delivery",
}) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;

  const tInt = sigintAt ?? at + 10;
  const tTerm = sigtermAt ?? at + 34;
  const tKill = sigkillAt ?? at + 64;

  const pInt = prog(frame, tInt, 14, easeInOut);
  const pTerm = prog(frame, tTerm, 16, easeInOut);
  const pKill = prog(frame, tKill, 16, easeInOut);

  const badTone = toneColors("bad");
  const goodTone = toneColors("good");

  return (
    <DevCard x={x} y={y} w={w} h={h} p={p} filename={filename} icon="bolt" right={right}>
      <div
        style={{
          padding: "22px 30px",
          height: "100%",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* Column Headers: Signal Source -> Kernel Ring 0 -> User Space Ring 3 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 10px 6px",
            borderBottom: `1.5px solid ${C.line}`,
          }}
        >
          <div style={{ width: 230 }}>
            <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 21, color: C.ink }}>1. signal & sender</div>
            <div style={{ fontFamily: mono, fontSize: 16, color: C.mute }}>CLI / tty / kernel</div>
          </div>
          <div style={{ width: 220 }}>
            <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 21, color: C.ink }}>2. kernel (ring 0)</div>
            <div style={{ fontFamily: mono, fontSize: 16, color: C.mute }}>task_struct dispatch</div>
          </div>
          <div style={{ width: 340 }}>
            <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 21, color: C.ink }}>3. user process (ring 3)</div>
            <div style={{ fontFamily: mono, fontSize: 16, color: C.mute }}>trap / sigaction() handler</div>
          </div>
        </div>

        {/* ---------------- LANE 1: SIGINT (2) · Ctrl+C ---------------- */}
        <SignalRow
          appear={prog(frame, at + 4, 10)}
          active={pInt}
          sigName="SIGINT (2)"
          cmd="Ctrl + C (tty)"
          sub="interactive interrupt"
          tone="accent"
          icon="keyboard"
          kernelAction="deliver to handler"
          kernelSub="catchable signal"
          userEntered={pInt > 0.4}
          userTitle="sigaction(SIGINT, on_int)"
          userSteps={["abort current op", "flush stdout → exit(130)"]}
          badge="caught in user space"
        />

        {/* ---------------- LANE 2: SIGTERM (15) · Polite Stop ---------------- */}
        <SignalRow
          appear={prog(frame, at + 8, 10)}
          active={pTerm}
          sigName="SIGTERM (15)"
          cmd="kill 1337"
          sub="default polite stop"
          tone="good"
          icon="checkCircle"
          kernelAction="deliver to handler"
          kernelSub="graceful request"
          userEntered={pTerm > 0.4}
          userTitle="trap cleanup() SIGTERM"
          userSteps={["1. stop accepting reqs", "2. drain active sockets", "3. close DB → exit(0) ✓"]}
          badge="graceful cleanup ✓"
        />

        {/* ---------------- LANE 3: SIGKILL (9) · Unconditional Kernel Kill ---------------- */}
        <div
          style={{
            height: 224,
            borderRadius: 22,
            background: pKill > 0 ? badTone.bg : "#F8F8FA",
            border: `2.5px solid ${pKill > 0 ? RED : C.line}`,
            padding: "18px 20px",
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "relative",
            ...materialize(prog(frame, at + 12, 10)),
          }}
        >
          {/* Left: Signal badge */}
          <div style={{ width: 220, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  padding: "6px 12px",
                  borderRadius: 10,
                  background: RED,
                  color: C.white,
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize: 19,
                }}
              >
                SIGKILL (9)
              </div>
            </div>
            <div style={{ fontFamily: mono, fontWeight: 700, fontSize: 20, color: C.ink }}>
              kill -9 1337
            </div>
            <div style={{ fontFamily: sans, fontWeight: 500, fontSize: 18, color: badTone.fg }}>
              hard kill · uncatchable
            </div>
          </div>

          <Icon name="arrowRight" size={26} color={pKill > 0 ? RED : C.mute} />

          {/* Middle: Kernel Ring 0 direct termination */}
          <div
            style={{
              width: 224,
              height: 176,
              borderRadius: 18,
              background: TERM.bg,
              border: `2px solid ${pKill > 0 ? RED : "rgba(255,255,255,0.15)"}`,
              padding: "14px 16px",
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 16, color: TERM.red }}>
                ring 0 · do_exit()
              </span>
              <Icon name="bolt" size={20} color={TERM.red} />
            </div>
            <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 20, color: TERM.fg }}>
              reaps PID directly
            </div>
            <div
              style={{
                padding: "6px 10px",
                borderRadius: 8,
                background: tint(RED, 0.22),
                color: TERM.red,
                fontFamily: mono,
                fontWeight: 700,
                fontSize: 15,
              }}
            >
              exit code 137 (128+9)
            </div>
          </div>

          {/* Blocked barrier before User Space */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <Icon name="crossCircle" size={32} color={RED} />
            <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 14, color: RED }}>
              BYPASSED
            </span>
          </div>

          {/* Right: User Space never reached */}
          <div
            style={{
              width: 310,
              height: 176,
              borderRadius: 18,
              background: C.white,
              border: `2px dashed ${RED}`,
              padding: "14px 18px",
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              opacity: pKill > 0.3 ? 0.78 : 0.5,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span
                style={{
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize: 17,
                  color: badTone.fg,
                  textDecoration: "line-through",
                }}
              >
                trap cleanup() SIGKILL
              </span>
              <Icon name="lock" size={20} color={RED} />
            </div>

            <div style={{ fontFamily: mono, fontSize: 16, color: badTone.fg, lineHeight: 1.45 }}>
              <div>✗ cannot be caught or ignored</div>
              <div>✗ cleanup() never executes</div>
              <div>✗ lockfiles & buffers left dirty</div>
            </div>

            <div
              style={{
                alignSelf: "flex-start",
                padding: "4px 10px",
                borderRadius: 8,
                background: badTone.bg,
                color: badTone.fg,
                fontFamily: mono,
                fontWeight: 700,
                fontSize: 15,
              }}
            >
              bypasses user space !
            </div>
          </div>
        </div>

        {/* Bottom Rule-of-Thumb Bar */}
        <div
          style={{
            height: 58,
            borderRadius: 16,
            background: "#F2F2F4",
            border: `1px solid ${C.line}`,
            padding: "0 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontFamily: mono,
            fontSize: 18,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: goodTone.fg, fontWeight: 700 }}>kill &lt;pid&gt;</span>
            <span style={{ color: C.mute }}>= SIGTERM (15 · polite)</span>
          </div>
          <div style={{ width: 1, height: 26, background: C.line }} />
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: badTone.fg, fontWeight: 700 }}>kill -9 &lt;pid&gt;</span>
            <span style={{ color: C.mute }}>= SIGKILL (9 · last resort only)</span>
          </div>
        </div>
      </div>
    </DevCard>
  );
};

const SignalRow: React.FC<{
  appear: number;
  active: number;
  sigName: string;
  cmd: string;
  sub: string;
  tone: "accent" | "good";
  icon: IconName;
  kernelAction: string;
  kernelSub: string;
  userEntered: boolean;
  userTitle: string;
  userSteps: string[];
  badge: string;
}> = ({
  appear,
  active,
  sigName,
  cmd,
  sub,
  tone,
  icon,
  kernelAction,
  kernelSub,
  userEntered,
  userTitle,
  userSteps,
  badge,
}) => {
  const tc = toneColors(tone);
  const mainCol = tone === "good" ? GREEN : C.accent;

  return (
    <div
      style={{
        height: 204,
        borderRadius: 22,
        background: active > 0 ? tc.bg : "#F8F8FA",
        border: `2.5px solid ${active > 0 ? mainCol : C.line}`,
        padding: "16px 20px",
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        ...materialize(appear),
      }}
    >
      {/* Col 1: Signal & Command */}
      <div style={{ width: 220, display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              padding: "5px 12px",
              borderRadius: 10,
              background: mainCol,
              color: C.white,
              fontFamily: mono,
              fontWeight: 700,
              fontSize: 18,
            }}
          >
            {sigName}
          </div>
        </div>
        <div style={{ fontFamily: mono, fontWeight: 700, fontSize: 20, color: C.ink }}>{cmd}</div>
        <div style={{ fontFamily: sans, fontWeight: 500, fontSize: 18, color: C.mute }}>{sub}</div>
      </div>

      <Icon name="arrowRight" size={26} color={active > 0 ? mainCol : C.mute} />

      {/* Col 2: Kernel Dispatch */}
      <div
        style={{
          width: 224,
          height: 162,
          borderRadius: 18,
          background: C.white,
          border: `2px solid ${active > 0 ? mainCol : C.line}`,
          boxShadow: CARD_SHADOW,
          padding: "14px 16px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 16, color: tc.fg }}>
            ring 0 · signal queue
          </span>
          <Icon name={icon} size={20} color={mainCol} />
        </div>
        <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 20, color: C.ink }}>{kernelAction}</div>
        <div style={{ fontFamily: mono, fontSize: 16, color: C.mute }}>{kernelSub}</div>
      </div>

      <Icon name="arrowRight" size={26} color={userEntered ? mainCol : C.mute} />

      {/* Col 3: User Space Handler */}
      <div
        style={{
          width: 310,
          height: 162,
          borderRadius: 18,
          background: C.white,
          border: `2px solid ${userEntered ? mainCol : C.line}`,
          boxShadow: CARD_SHADOW,
          padding: "12px 16px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div style={{ fontFamily: mono, fontWeight: 700, fontSize: 17, color: tc.fg }}>{userTitle}</div>
        <div style={{ fontFamily: mono, fontSize: 15.5, color: C.ink, lineHeight: 1.42 }}>
          {userSteps.map((s) => (
            <div key={s}>{s}</div>
          ))}
        </div>
        <div
          style={{
            alignSelf: "flex-start",
            padding: "3px 10px",
            borderRadius: 8,
            background: tc.bg,
            color: tc.fg,
            fontFamily: mono,
            fontWeight: 700,
            fontSize: 14.5,
          }}
        >
          {badge}
        </div>
      </div>
    </div>
  );
};
