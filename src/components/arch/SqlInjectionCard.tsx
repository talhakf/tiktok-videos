import { useCurrentFrame } from "remotion";
import { Icon } from "../../icons/Icons";
import { TX } from "../../layout";
import { C, easeInOut, easeOut, materialize, mono, prog, sans } from "../../theme";
import { AMBER, DevCard, toneColors } from "../dev/card";
import { BLUE_TINT, GREEN, lerp, presence, RED } from "../diagram/Node";
import { tint } from "../windows/MacWindow";

/**
 * Interactive SQL query & injection anatomy card (`sql-injection`).
 * - Types `input` (default `"' OR 1=1 --"`) starting at `typeAt` (`fpc` frames per char).
 * - At `explainAt`, splits and highlights the 3 parts of the injection:
 *   1) closing quote `'`, 2) green `OR 1=1 → always true`, 3) struck-through/dimmed `-- AND pass = '...'` comment.
 * - At `paramAt`, switches to the safe Parameterized Query view (`SELECT * FROM users WHERE user = ?` +
 *   locked literal parameter box `$1 = "' OR 1=1 --"` -> green badge `"Treated as plain text · 0 rows"`).
 */
export const SqlInjectionCard: React.FC<{
  x?: number;
  y: number;
  w?: number;
  h?: number;
  at: number;
  until?: number;
  input?: string;
  typeAt: number;
  fpc?: number;
  explainAt?: number;
  paramAt?: number;
}> = ({
  x = TX,
  y,
  w = 900,
  h = 680,
  at,
  until,
  input = "' OR 1=1 --",
  typeAt,
  fpc = 2,
  explainAt,
  paramAt,
}) => {
  const frame = useCurrentFrame();
  const vis = presence(frame, at, until);
  if (vis === null) return null;

  const charsTyped =
    frame < typeAt
      ? 0
      : Math.min(input.length, Math.floor((frame - typeAt) / Math.max(0.5, fpc)) + 1);
  const typed = input.slice(0, charsTyped);
  const typingDone = charsTyped >= input.length;

  const expP = explainAt !== undefined ? prog(frame, explainAt, 12, easeOut) : 0;
  const paramP = paramAt !== undefined ? prog(frame, paramAt, 14, easeInOut) : 0;

  const badTone = toneColors("bad");
  const goodTone = toneColors("good");
  const warnTone = toneColors("warn");

  const isParam = paramP > 0.5;

  return (
    <DevCard
      x={x}
      y={y}
      w={w}
      h={h}
      p={vis}
      filename="login.sql"
      icon="database"
      right={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 14px",
            borderRadius: 999,
            background: isParam ? goodTone.bg : badTone.bg,
            color: isParam ? goodTone.fg : badTone.fg,
            fontFamily: mono,
            fontSize: 19,
            fontWeight: 700,
          }}
        >
          <Icon name={isParam ? "shieldCheck" : "warning"} size={18} color={isParam ? goodTone.fg : badTone.fg} weight={2.2} />
          {isParam ? "parameterized query" : "string concatenation"}
        </div>
      }
    >
      <div
        style={{
          padding: "28px 34px",
          display: "flex",
          flexDirection: "column",
          gap: 22,
          height: "100%",
          boxSizing: "border-box",
          fontFamily: sans,
        }}
      >
        {/* 1. User input field */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            padding: "16px 22px",
            borderRadius: 18,
            background: "#F5F5F7",
            border: `2px solid ${frame >= typeAt && !typingDone ? C.accent : "rgba(0,0,0,0.08)"}`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontFamily: sans,
              fontSize: 22,
              fontWeight: 600,
              color: C.mute,
              minWidth: 155,
            }}
          >
            <Icon name="user" size={22} color={C.mute} weight={2} />
            username
          </div>
          <div
            style={{
              flex: 1,
              fontFamily: mono,
              fontSize: 26,
              fontWeight: 700,
              color: C.ink,
              display: "flex",
              alignItems: "center",
              minHeight: 34,
            }}
          >
            <span>{typed}</span>
            {frame >= typeAt && !isParam ? (
              <span
                style={{
                  display: "inline-block",
                  width: 3,
                  height: 28,
                  marginLeft: 3,
                  background: C.accent,
                  opacity: typingDone ? 0 : 1,
                }}
              />
            ) : null}
          </div>
          <div
            style={{
              padding: "5px 12px",
              borderRadius: 8,
              background: C.white,
              border: `1px solid ${C.line}`,
              fontFamily: mono,
              fontSize: 18,
              fontWeight: 600,
              color: C.mute,
            }}
          >
            POST /login
          </div>
        </div>

        {/* 2. Unsafe String Concatenation & Injection Anatomy View */}
        {paramP < 1 ? (
          <div
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              gap: 20,
              opacity: 1 - paramP,
              transform: `translateY(${-12 * paramP}px)`,
            }}
          >
            {/* SQL Query Box */}
            <div
              style={{
                padding: "22px 26px",
                borderRadius: 20,
                background: "#FAFAFC",
                border: `2px solid ${expP > 0 ? tint(RED, 0.35) : C.line}`,
                fontFamily: mono,
                fontSize: 25,
                lineHeight: 1.55,
                color: C.ink,
              }}
            >
              <div>
                <span style={{ color: C.accent, fontWeight: 700 }}>SELECT</span> *{" "}
                <span style={{ color: C.accent, fontWeight: 700 }}>FROM</span> users
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 4 }}>
                <span>
                  <span style={{ color: C.accent, fontWeight: 700 }}>WHERE</span> user ={" "}
                  <span style={{ color: "#C9281E", fontWeight: 700 }}>'</span>
                </span>

                {/* Before explainAt: raw typed string; at explainAt: split into 3 highlighted segments */}
                {expP <= 0 ? (
                  <>
                    <span
                      style={{
                        background: charsTyped > 0 ? warnTone.bg : "transparent",
                        color: "#A05A00",
                        fontWeight: 700,
                        padding: charsTyped > 0 ? "2px 6px" : 0,
                        borderRadius: 6,
                      }}
                    >
                      {typed}
                    </span>
                    <span>
                      <span style={{ color: "#C9281E", fontWeight: 700 }}>'</span>{" "}
                      <span style={{ color: C.accent, fontWeight: 700 }}>AND</span> pass ={" "}
                      <span style={{ color: "#248A3D" }}>'•••'</span>
                    </span>
                  </>
                ) : (
                  <>
                    {/* Part 1: Closing quote ' */}
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: 8,
                        background: badTone.bg,
                        border: `1.5px solid ${RED}`,
                        color: badTone.fg,
                        fontWeight: 700,
                      }}
                    >
                      '
                    </span>

                    {/* Part 2: OR 1=1 */}
                    <span
                      style={{
                        padding: "2px 10px",
                        borderRadius: 8,
                        background: goodTone.bg,
                        border: `1.5px solid ${GREEN}`,
                        color: goodTone.fg,
                        fontWeight: 700,
                      }}
                    >
                      OR 1=1
                    </span>

                    {/* Part 3: -- AND pass = '...' */}
                    <span
                      style={{
                        padding: "2px 10px",
                        borderRadius: 8,
                        background: "rgba(0,0,0,0.05)",
                        color: C.mute,
                        opacity: lerp(1, 0.45, expP),
                        textDecoration: "line-through",
                        fontWeight: 500,
                      }}
                    >
                      -- ' AND pass = '•••'
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* 3-Part Anatomy Breakdown Cards (appear at explainAt) */}
            {expP > 0 ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1.35fr 1.45fr",
                  gap: 14,
                  ...materialize(expP),
                }}
              >
                {/* Part 1 */}
                <div
                  style={{
                    padding: "16px 18px",
                    borderRadius: 18,
                    background: badTone.bg,
                    border: `1.5px solid ${tint(RED, 0.35)}`,
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}
                >
                  <div style={{ fontFamily: mono, fontSize: 23, fontWeight: 700, color: badTone.fg }}>
                    ' <span style={{ fontSize: 18, fontWeight: 600 }}>(quote)</span>
                  </div>
                  <div style={{ fontSize: 19, fontWeight: 600, color: C.ink }}>
                    Closes <span style={{ fontFamily: mono }}>user</span> string early
                  </div>
                </div>

                {/* Part 2 */}
                <div
                  style={{
                    padding: "16px 18px",
                    borderRadius: 18,
                    background: goodTone.bg,
                    border: `1.5px solid ${tint(GREEN, 0.4)}`,
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}
                >
                  <div style={{ fontFamily: mono, fontSize: 22, fontWeight: 700, color: goodTone.fg }}>
                    OR 1=1 → always true
                  </div>
                  <div style={{ fontSize: 19, fontWeight: 600, color: C.ink }}>
                    Every row in table matches
                  </div>
                </div>

                {/* Part 3 */}
                <div
                  style={{
                    padding: "16px 18px",
                    borderRadius: 18,
                    background: "#F2F2F4",
                    border: `1.5px solid ${C.line}`,
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}
                >
                  <div
                    style={{
                      fontFamily: mono,
                      fontSize: 22,
                      fontWeight: 700,
                      color: C.mute,
                      textDecoration: "line-through",
                    }}
                  >
                    -- AND pass = '...'
                  </div>
                  <div style={{ fontSize: 19, fontWeight: 600, color: C.mute }}>
                    Comments out password check
                  </div>
                </div>
              </div>
            ) : null}

            {/* Bottom status bar for unsafe query */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 22px",
                borderRadius: 16,
                background: typingDone ? badTone.bg : warnTone.bg,
                border: `1.5px solid ${typingDone ? tint(RED, 0.35) : tint(AMBER, 0.35)}`,
                ...materialize(prog(frame, typeAt + 2, 10)),
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Icon
                  name="warning"
                  size={24}
                  color={typingDone ? badTone.fg : warnTone.fg}
                  weight={2.2}
                />
                <span
                  style={{
                    fontSize: 21,
                    fontWeight: 700,
                    color: typingDone ? badTone.fg : warnTone.fg,
                  }}
                >
                  {typingDone
                    ? "Data becomes SQL code · returns all rows (admin logged in)"
                    : "Concatenating raw user input into SQL command..."}
                </span>
              </div>
            </div>
          </div>
        ) : null}

        {/* 3. Safe Parameterized Query View (appears at paramAt) */}
        {paramP > 0 ? (
          <div
            style={{
              position: paramP < 1 ? "absolute" : "relative",
              left: paramP < 1 ? 34 : 0,
              right: paramP < 1 ? 34 : 0,
              top: paramP < 1 ? 116 : 0,
              display: "flex",
              flexDirection: "column",
              gap: 18,
              ...materialize(paramP),
            }}
          >
            {/* Prepared statement template */}
            <div
              style={{
                padding: "20px 26px",
                borderRadius: 20,
                background: BLUE_TINT,
                border: `2px solid ${C.accent}`,
                fontFamily: mono,
                fontSize: 25,
                lineHeight: 1.5,
                color: C.ink,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div>
                  <span style={{ color: C.accent, fontWeight: 700 }}>SELECT</span> *{" "}
                  <span style={{ color: C.accent, fontWeight: 700 }}>FROM</span> users
                </div>
                <div>
                  <span style={{ color: C.accent, fontWeight: 700 }}>WHERE</span> user ={" "}
                  <span
                    style={{
                      display: "inline-block",
                      padding: "2px 12px",
                      borderRadius: 8,
                      background: C.accent,
                      color: C.white,
                      fontWeight: 700,
                    }}
                  >
                    ?
                  </span>
                </div>
              </div>
              <div
                style={{
                  padding: "8px 16px",
                  borderRadius: 12,
                  background: C.white,
                  border: `1px solid ${ tint(C.accent, 0.25) }`,
                  fontFamily: sans,
                  fontSize: 19,
                  fontWeight: 600,
                  color: C.accent,
                }}
              >
                Compiled query plan locked
              </div>
            </div>

            {/* Locked literal parameter box */}
            <div
              style={{
                padding: "18px 24px",
                borderRadius: 18,
                background: "#FAFAFC",
                border: `2px solid ${C.line}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    background: "#EEFAF1",
                    border: `1.5px solid ${GREEN}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon name="lock" size={22} color="#248A3D" weight={2.2} />
                </div>
                <div style={{ fontFamily: mono, fontSize: 24, fontWeight: 700, color: C.ink }}>
                  <span style={{ color: C.accent }}>$1</span> ={" "}
                  <span style={{ color: "#248A3D" }}>"{input}"</span>
                </div>
              </div>
              <div
                style={{
                  fontFamily: mono,
                  fontSize: 19,
                  fontWeight: 600,
                  color: C.mute,
                }}
              >
                literal string value
              </div>
            </div>

            {/* Safe green badge */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 24px",
                borderRadius: 16,
                background: goodTone.bg,
                border: `2px solid ${GREEN}`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Icon name="checkCircle" size={26} color={goodTone.fg} weight={2.2} />
                <span style={{ fontSize: 23, fontWeight: 700, color: goodTone.fg }}>
                  Treated as plain text · 0 rows
                </span>
              </div>
              <span style={{ fontFamily: mono, fontSize: 19, fontWeight: 600, color: goodTone.fg }}>
                SQL injection blocked
              </span>
            </div>
          </div>
        ) : null}
      </div>
    </DevCard>
  );
};
