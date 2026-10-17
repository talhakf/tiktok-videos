import { interpolateColors, useCurrentFrame } from "remotion";
import { AMBER, DevCard, TAB_H, toneColors } from "../dev/card";
import { GREEN, lerp, presence, RED } from "../diagram/Node";
import { Icon } from "../../icons/Icons";
import { Mark } from "../layouts/Mark";
import { TW, TX, TY } from "../../layout";
import { C, easeInOut, easeOut, materialize, mono, prog, sans, TERM } from "../../theme";
import { tint } from "../windows/MacWindow";

export type TestCase = {
  name: string;
  ms: number;
  status: "pass" | "fail" | "skip";
  at: number;
  expected?: string;
  received?: string;
};

/**
 * Automated Test Runner (Vitest / Jest / Pytest) card: lists test cases, animates a failure diff box,
 * and supports a `fixAt` cue where the failing test flips to green PASS and coverage hits 100%.
 */
export const TestRunnerCard: React.FC<{
  tests: TestCase[];
  runner?: "vitest" | "jest" | "pytest";
  suite?: string;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  at: number;
  until?: number;
  fixAt?: number;
  initialCoverage?: number;
  fixedCoverage?: number;
  filename?: string;
  right?: string;
  dark?: boolean;
  style?: React.CSSProperties;
}> = ({
  tests,
  runner = "vitest",
  suite = "src/auth/session.test.ts",
  x = TX,
  y = TY,
  w = TW,
  h,
  at,
  until,
  fixAt,
  initialCoverage = 84,
  fixedCoverage = 100,
  filename,
  right,
  dark = false,
  style,
}) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;

  const fixP = fixAt !== undefined ? prog(frame, fixAt, 14, easeInOut) : 0;
  const isFixed = fixP > 0.5;

  const failingTest = tests.find((t) => t.status === "fail" && (t.expected !== undefined || t.received !== undefined)) ?? tests.find((t) => t.status === "fail");
  const hasDiffBox = !!failingTest;

  const headH = 82;
  const rowH = 62;
  const diffH = hasDiffBox ? 156 : 0;
  const bodyH = headH + tests.length * rowH + diffH + 28;
  const tabName = filename ?? `${runner} · ${suite}`;
  const tabRight = right ?? (isFixed ? "watch · rerun #2" : "watch · run #1");
  const cardH = h ?? TAB_H + bodyH;

  // Count visible tests & statuses at current frame
  const visibleTests = tests.filter((t) => frame >= t.at);
  const passCount = visibleTests.filter((t) => t.status === "pass" || (t.status === "fail" && isFixed)).length;
  const failCount = visibleTests.filter((t) => t.status === "fail" && !isFixed).length;
  const skipCount = visibleTests.filter((t) => t.status === "skip").length;

  const firstFailAt = failingTest ? failingTest.at : Infinity;
  const showFailState = frame >= firstFailAt && !isFixed;
  const covReveal = prog(frame, at + 8, 18, easeOut);
  const coverage = Math.round(lerp(initialCoverage * covReveal, fixedCoverage, fixP));

  const goodTone = toneColors("good", dark);
  const badTone = toneColors("bad", dark);

  const badgeBg = showFailState
    ? interpolateColors(fixP, [0, 1], [RED, GREEN])
    : isFixed
      ? GREEN
      : visibleTests.length === tests.length && failCount === 0
        ? GREEN
        : C.accent;

  const badgeText = showFailState ? "FAIL" : visibleTests.length === tests.length || isFixed ? "PASS" : "RUNS";

  return (
    <DevCard x={x} y={y} w={w} h={cardH} p={p} dark={dark} filename={tabName} icon="checkCircle" right={tabRight} style={style}>
      {/* Summary bar */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: headH,
          padding: "0 32px",
          borderBottom: `1px solid ${dark ? "rgba(255,255,255,0.1)" : C.line}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontFamily: sans,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              padding: "6px 16px",
              borderRadius: 10,
              background: badgeBg,
              color: C.white,
              fontFamily: mono,
              fontWeight: 700,
              fontSize: 22,
              letterSpacing: "0.02em",
            }}
          >
            {badgeText}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, fontFamily: mono, fontSize: 22, fontWeight: 600 }}>
            <span style={{ color: GREEN }}>{passCount} passed</span>
            {failCount > 0 ? <span style={{ color: RED }}>· {failCount} failed</span> : null}
            {skipCount > 0 ? <span style={{ color: dark ? TERM.dim : C.mute }}>· {skipCount} skipped</span> : null}
          </div>
        </div>

        {/* Coverage pill + bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontFamily: mono, fontSize: 20, fontWeight: 500, color: dark ? TERM.dim : C.mute }}>coverage</span>
          <div
            style={{
              width: 130,
              height: 12,
              borderRadius: 6,
              background: dark ? "rgba(255,255,255,0.12)" : "#E5E5EA",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${coverage}%`,
                height: "100%",
                borderRadius: 6,
                background: coverage >= 100 ? GREEN : showFailState ? AMBER : C.accent,
              }}
            />
          </div>
          <span
            style={{
              fontFamily: mono,
              fontWeight: 700,
              fontSize: 22,
              color: coverage >= 100 ? GREEN : dark ? TERM.fg : C.ink,
              fontVariantNumeric: "tabular-nums",
              minWidth: 62,
              textAlign: "right",
            }}
          >
            {coverage}%
          </span>
        </div>
      </div>

      {/* Test case rows */}
      {tests.map((tc, i) => {
        const ep = prog(frame, tc.at, 9, easeOut);
        if (ep <= 0) return null;
        const rowTop = headH + i * rowH;
        const wasFail = tc.status === "fail";
        const curPass = tc.status === "pass" || (wasFail && isFixed);
        const curFail = wasFail && !isFixed;

        const rowBg = wasFail
          ? interpolateColors(fixP, [0, 1], [badTone.bg, tint(GREEN, dark ? 0.14 : 0.08)])
          : "transparent";
        const rowEdge = wasFail ? interpolateColors(fixP, [0, 1], [RED, GREEN]) : "transparent";

        const msVal = wasFail && isFixed ? Math.max(4, Math.round(tc.ms * 0.45)) : tc.ms;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: rowTop,
              height: rowH,
              padding: "0 32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: rowBg,
              borderLeft: wasFail ? `5px solid ${rowEdge}` : "5px solid transparent",
              boxSizing: "border-box",
              opacity: ep,
              translate: `${(1 - ep) * 14}px 0px`,
              fontFamily: mono,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16, minWidth: 0 }}>
              {tc.status === "skip" ? (
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    border: `2.5px solid ${dark ? TERM.dim : C.mute}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon name="minus" size={18} color={dark ? TERM.dim : C.mute} weight={2.6} />
                </div>
              ) : (
                <Mark
                  kind={curPass ? "check" : "cross"}
                  size={30}
                  color={curPass ? GREEN : RED}
                  draw={wasFail && isFixed ? prog(frame, fixAt!, 10) : prog(frame, tc.at + 2, 10)}
                />
              )}
              <span
                style={{
                  fontSize: 23,
                  fontWeight: wasFail ? 600 : 500,
                  color: tc.status === "skip" ? (dark ? TERM.dim : C.mute) : dark ? TERM.fg : C.ink,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {tc.name}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
              {wasFail ? (
                <span
                  style={{
                    padding: "3px 10px",
                    borderRadius: 8,
                    background: curFail ? badTone.bg : goodTone.bg,
                    color: curFail ? badTone.fg : goodTone.fg,
                    fontWeight: 700,
                    fontSize: 18,
                  }}
                >
                  {curFail ? "AssertionError" : "fixed"}
                </span>
              ) : null}
              <span
                style={{
                  fontSize: 20,
                  fontWeight: 500,
                  color: curFail ? badTone.fg : dark ? TERM.dim : C.mute,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {msVal} ms
              </span>
            </div>
          </div>
        );
      })}

      {/* Failure diff box / Fixed confirmation box */}
      {failingTest && frame >= failingTest.at + 4 ? (
        <div
          style={{
            position: "absolute",
            left: 32,
            right: 32,
            top: headH + tests.length * rowH + 12,
            height: diffH - 12,
            borderRadius: 18,
            background: interpolateColors(fixP, [0, 1], [badTone.bg, goodTone.bg]),
            border: `1.5px solid ${interpolateColors(fixP, [0, 1], [tint(RED, 0.35), tint(GREEN, 0.4)])}`,
            padding: "16px 24px",
            boxSizing: "border-box",
            fontFamily: mono,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 8,
            ...materialize(prog(frame, failingTest.at + 4, 10, easeOut), 0.96, 6),
          }}
        >
          {!isFixed ? (
            <>
              <div style={{ fontSize: 19, fontWeight: 700, color: badTone.fg, display: "flex", justifyContent: "space-between" }}>
                <span>FAIL · {failingTest.name}</span>
                <span>expect(received).toEqual(expected)</span>
              </div>
              <div style={{ fontSize: 22, fontWeight: 600, color: goodTone.fg, whiteSpace: "pre" }}>
                - Expected: {failingTest.expected ?? "200 OK"}
              </div>
              <div style={{ fontSize: 22, fontWeight: 600, color: badTone.fg, whiteSpace: "pre" }}>
                + Received: {failingTest.received ?? "undefined"}
              </div>
            </>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                ...materialize(prog(frame, fixAt!, 10, easeOut), 0.96, 4),
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <Mark kind="check" size={38} color={GREEN} draw={prog(frame, fixAt! + 2, 12)} />
                <div>
                  <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 25, color: dark ? TERM.fg : C.ink, letterSpacing: "-0.02em" }}>
                    All {tests.length} test suites passed
                  </div>
                  <div style={{ fontFamily: mono, fontWeight: 500, fontSize: 20, color: goodTone.fg, marginTop: 2 }}>
                    {failingTest.name} → expected {failingTest.expected ?? "value"} matched
                  </div>
                </div>
              </div>
              <div
                style={{
                  padding: "8px 16px",
                  borderRadius: 12,
                  background: GREEN,
                  color: C.white,
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize: 21,
                }}
              >
                100% cov
              </div>
            </div>
          )}
        </div>
      ) : null}
    </DevCard>
  );
};
