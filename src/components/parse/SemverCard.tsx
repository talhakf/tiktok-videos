import { useCurrentFrame } from "remotion";
import { Icon } from "../../icons/Icons";
import { DevCard, TAB_H } from "../dev/card";
import { GREEN, presence, RED } from "../diagram/Node";
import { tint } from "../windows/MacWindow";
import { C, easeOut, materialize, mono, prog, sans, TERM } from "../../theme";

// Semantic Versioning (`MAJOR.MINOR.PATCH`) & range (`^` vs `~`) explainer card:
// Splits `2.14.3` into `2 (breaking)` · `14 (feature)` · `3 (bugfix)` and shows
// which candidate versions pass or fail `^2.14.3` vs `~2.14.3`.

export type SemverCandidate = {
  version: string;
  note?: string;
  caret?: boolean;
  tilde?: boolean;
  at?: number;
};

const parseSemver = (v: string): [number, number, number] => {
  const clean = v.replace(/^[v^~]/, "").split("-")[0];
  const [maj = 0, min = 0, pat = 0] = clean.split(".").map((n) => parseInt(n, 10) || 0);
  return [maj, min, pat];
};

const evalCaret = (base: [number, number, number], cand: [number, number, number]): boolean => {
  if (cand[0] !== base[0]) return false;
  if (cand[1] > base[1]) return true;
  if (cand[1] < base[1]) return false;
  return cand[2] >= base[2];
};

const evalTilde = (base: [number, number, number], cand: [number, number, number]): boolean => {
  if (cand[0] !== base[0] || cand[1] !== base[1]) return false;
  return cand[2] >= base[2];
};

const DEFAULT_CANDIDATES: SemverCandidate[] = [
  { version: "2.14.9", note: "patch bugfix" },
  { version: "2.15.0", note: "minor feature" },
  { version: "3.0.0", note: "major breaking" },
  { version: "2.14.1", note: "older patch" },
];

export const SemverCard: React.FC<{
  x?: number;
  y: number;
  w?: number;
  h?: number;
  at?: number;
  until?: number;
  version?: string;
  splitAt?: number;
  rangeAt?: number;
  candidates?: SemverCandidate[];
  dark?: boolean;
  filename?: string;
  right?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({
  x = 90,
  y,
  w = 900,
  h,
  at = 0,
  until,
  version = "2.14.3",
  splitAt,
  rangeAt,
  candidates = DEFAULT_CANDIDATES,
  dark = false,
  filename = "package.json",
  right,
  style,
}) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;

  const base = parseSemver(version);
  const [maj, min, pat] = base;
  const sAt = splitAt ?? at + 8;
  const rAt = rangeAt ?? sAt + 22;

  const fg = dark ? TERM.fg : C.ink;
  const mute = dark ? TERM.dim : C.mute;
  const subBg = dark ? "rgba(255,255,255,0.05)" : "#F6F6F9";
  const borderCol = dark ? "rgba(255,255,255,0.1)" : C.line;

  const segments = [
    {
      num: String(maj),
      role: "major",
      tag: "breaking",
      desc: "incompatible API changes",
      color: dark ? TERM.red : RED,
    },
    {
      num: String(min),
      role: "minor",
      tag: "feature",
      desc: "backwards-safe features",
      color: dark ? TERM.blue : C.accent,
    },
    {
      num: String(pat),
      role: "patch",
      tag: "bugfix",
      desc: "backwards-safe bugfixes",
      color: dark ? TERM.green : "#248A3D",
    },
  ];

  const rowH = 74;
  const bodyH = 260 + 132 + 52 + candidates.length * rowH + 24;
  const cardH = h ?? (filename !== undefined ? TAB_H : 0) + bodyH;

  return (
    <DevCard
      x={x}
      y={y}
      w={w}
      h={cardH}
      p={p}
      dark={dark}
      filename={filename}
      icon="box"
      right={right ?? `semver ${version}`}
      style={style}
    >
      {/* 1. Top Section: MAJOR.MINOR.PATCH Split Anatomy */}
      <div
        style={{
          padding: "22px 28px 20px",
          borderBottom: `1px solid ${borderCol}`,
          display: "flex",
          flexDirection: "column",
          gap: 16,
          height: 260,
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: mono, fontSize: 19, fontWeight: 600, color: mute }}>
            major.minor.patch breakdown
          </span>
          <span style={{ fontFamily: mono, fontSize: 20, fontWeight: 700, color: fg }}>
            {maj} (breaking) · {min} (feature) · {pat} (bugfix)
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "stretch", gap: 12, flex: 1 }}>
          {segments.map((seg, i) => {
            const segP = prog(frame, sAt + i * 5, 11, easeOut);
            return (
              <div key={seg.role} style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
                <div
                  style={{
                    flex: 1,
                    height: "100%",
                    borderRadius: 20,
                    background: tint(seg.color, dark ? 0.16 : 0.08),
                    border: `2px solid ${tint(seg.color, 0.38)}`,
                    padding: "14px 18px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    boxSizing: "border-box",
                    ...materialize(segP),
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span
                      style={{
                        fontFamily: mono,
                        fontWeight: 700,
                        fontSize: 44,
                        color: seg.color,
                        lineHeight: 1,
                      }}
                    >
                      {seg.num}
                    </span>
                    <span
                      style={{
                        padding: "4px 12px",
                        borderRadius: 999,
                        background: seg.color,
                        color: C.white,
                        fontFamily: mono,
                        fontWeight: 700,
                        fontSize: 18,
                      }}
                    >
                      {seg.tag}
                    </span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 20, color: fg }}>
                      {seg.role} ({seg.tag})
                    </span>
                    <span style={{ fontFamily: sans, fontWeight: 500, fontSize: 17, color: mute }}>
                      {seg.desc}
                    </span>
                  </div>
                </div>

                {i < 2 ? (
                  <span
                    style={{
                      fontFamily: mono,
                      fontWeight: 700,
                      fontSize: 42,
                      color: mute,
                      flexShrink: 0,
                    }}
                  >
                    .
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Middle Section: Caret (^) vs Tilde (~) Range Rules */}
      <div
        style={{
          height: 132,
          padding: "18px 28px",
          borderBottom: `1px solid ${borderCol}`,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          boxSizing: "border-box",
        }}
      >
        {[
          {
            sym: `^${version}`,
            title: "caret range",
            rule: `>=${version} <${maj + 1}.0.0`,
            desc: "allows minor + patch",
            col: C.accent,
            delay: 0,
          },
          {
            sym: `~${version}`,
            title: "tilde range",
            rule: `>=${version} <${maj}.${min + 1}.0`,
            desc: "allows patch only",
            col: "#8E3CCB",
            delay: 5,
          },
        ].map((rng) => {
          const rp = prog(frame, rAt + rng.delay, 10, easeOut);
          return (
            <div
              key={rng.sym}
              style={{
                borderRadius: 16,
                background: subBg,
                border: `1.5px solid ${borderCol}`,
                padding: "12px 18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                ...materialize(rp),
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span
                  style={{
                    padding: "6px 14px",
                    borderRadius: 11,
                    background: tint(rng.col, dark ? 0.22 : 0.12),
                    border: `1.5px solid ${tint(rng.col, 0.35)}`,
                    fontFamily: mono,
                    fontWeight: 700,
                    fontSize: 25,
                    color: rng.col,
                  }}
                >
                  {rng.sym}
                </span>
                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <span style={{ fontFamily: sans, fontWeight: 600, fontSize: 20, color: fg }}>
                    {rng.desc}
                  </span>
                  <span style={{ fontFamily: mono, fontWeight: 500, fontSize: 17, color: mute }}>
                    {rng.rule}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Bottom Section: Candidate Versions Matrix */}
      <div style={{ padding: "12px 28px 20px" }}>
        <div
          style={{
            height: 40,
            display: "grid",
            gridTemplateColumns: "1.5fr 1fr 1fr",
            alignItems: "center",
            padding: "0 14px",
            fontFamily: mono,
            fontSize: 19,
            fontWeight: 600,
            color: mute,
          }}
        >
          <span>candidate version</span>
          <span style={{ textAlign: "center" }}>^{version} (minor + patch)</span>
          <span style={{ textAlign: "center" }}>~{version} (patch only)</span>
        </div>

        {candidates.map((c, i) => {
          const parsed = parseSemver(c.version);
          const passCaret = c.caret ?? evalCaret(base, parsed);
          const passTilde = c.tilde ?? evalTilde(base, parsed);
          const cAt = c.at ?? rAt + 10 + i * 6;
          const cp = prog(frame, cAt, 10, easeOut);

          const renderBadge = (pass: boolean) => (
            <div
              style={{
                justifySelf: "center",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 18px 6px 12px",
                borderRadius: 999,
                background: pass ? tint(GREEN, dark ? 0.2 : 0.13) : tint(RED, dark ? 0.2 : 0.11),
                border: `1.5px solid ${pass ? tint(GREEN, 0.4) : tint(RED, 0.35)}`,
                fontFamily: mono,
                fontWeight: 700,
                fontSize: 20,
                color: pass ? (dark ? TERM.green : "#248A3D") : RED,
              }}
            >
              <Icon
                name={pass ? "check" : "cross"}
                size={22}
                color={pass ? (dark ? TERM.green : "#248A3D") : RED}
                weight={2.4}
              />
              {pass ? "pass" : "fail"}
            </div>
          );

          return (
            <div
              key={c.version}
              style={{
                height: rowH,
                display: "grid",
                gridTemplateColumns: "1.5fr 1fr 1fr",
                alignItems: "center",
                padding: "0 14px",
                borderRadius: 14,
                background: i % 2 === 0 ? subBg : "transparent",
                ...materialize(cp),
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 26, color: fg }}>
                  {c.version}
                </span>
                {c.note ? (
                  <span
                    style={{
                      padding: "3px 10px",
                      borderRadius: 8,
                      background: dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)",
                      fontFamily: sans,
                      fontWeight: 500,
                      fontSize: 18,
                      color: mute,
                    }}
                  >
                    {c.note}
                  </span>
                ) : null}
              </div>

              {renderBadge(passCaret)}
              {renderBadge(passTilde)}
            </div>
          );
        })}
      </div>
    </DevCard>
  );
};
