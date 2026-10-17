import { useCurrentFrame } from "remotion";
import { Icon } from "../../icons/Icons";
import { TW, TX } from "../../layout";
import { C, materialize, mono, prog, sans } from "../../theme";
import { CARD_SHADOW } from "../diagram/Node";
import { GREEN, Mark, outP } from "../layouts/Mark";
import { Marker } from "../text/Marker";

// "The official docs say": a white card that quotes the source, so a claim reads as checked, not as opinion.
// Source line = site name in ink + a small link icon + the URL path in grey mono; then the passage with a grey
// rule on its left, one phrase marked in blue at `highlightAt`, and an optional green "verified" tick.
// Quote real wording only (copy it from the page you cite).

/**
 * Docs quote card. `highlight` is a substring of `quote` (first match, must fit on one line);
 * `quote` breaks at "\n" or the card width. `verifiedAt` adds the green tick + `verifiedLabel`.
 */
export const DocsQuote: React.FC<{
  at: number;
  until?: number;
  site: string; // "Git docs", "MDN"
  url?: string; // "git-scm.com/docs/git-reset"
  quote: string;
  highlight?: string;
  highlightAt?: number;
  verifiedAt?: number;
  verifiedLabel?: string;
  x?: number;
  y?: number;
  w?: number;
  size?: number; // quote px
}> = ({ at, until, site, url, quote, highlight, highlightAt, verifiedAt, verifiedLabel = "verified", x = TX, y = 420, w = TW, size = 44 }) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const out = outP(frame, until);
  if (out >= 1) return null;
  const p = prog(frame, at, 10);
  const q = prog(frame, at + 5, 10); // the passage follows the source line

  const i = highlight ? quote.indexOf(highlight) : -1;
  const body =
    i < 0 || !highlight ? (
      quote
    ) : (
      <>
        {quote.slice(0, i)}
        {highlightAt !== undefined ? <Marker at={highlightAt}>{highlight}</Marker> : highlight}
        {quote.slice(i + highlight.length)}
      </>
    );

  const v = verifiedAt !== undefined ? prog(frame, verifiedAt, 8) : 0;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        boxSizing: "border-box",
        padding: "36px 44px 40px",
        borderRadius: 36,
        background: C.white,
        boxShadow: CARD_SHADOW,
        border: "1px solid rgba(0,0,0,0.06)",
        fontFamily: sans,
        ...materialize(p * (1 - out), 0.96, 8),
        translate: `0px ${(1 - p) * 24}px`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ width: 60, height: 60, borderRadius: 30, background: C.soft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon name="link" size={32} color={C.ink} weight={2} draw={prog(frame, at + 2, 12)} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 34, letterSpacing: "-0.02em", color: C.ink, lineHeight: 1.1 }}>{site}</div>
          {url ? (
            <div style={{ marginTop: 6, fontFamily: mono, fontWeight: 500, fontSize: 26, color: C.mute, whiteSpace: "pre", overflow: "hidden", textOverflow: "ellipsis" }}>
              {url}
            </div>
          ) : null}
        </div>
      </div>
      <div
        style={{
          marginTop: 30,
          paddingLeft: 30,
          borderLeft: `6px solid ${C.soft}`,
          fontWeight: 600,
          fontSize: size,
          lineHeight: 1.28,
          letterSpacing: "-0.02em",
          color: C.ink,
          whiteSpace: "pre-wrap",
          ...materialize(q, 1, 6),
        }}
      >
        {body}
      </div>
      {verifiedAt !== undefined ? ( // space is kept from the start, so the card never jumps
        <div style={{ marginTop: 28, display: "flex", alignItems: "center", gap: 14, ...materialize(v, 0.9, 6), transformOrigin: "0% 50%" }}>
          <Mark kind="check" size={44} color={GREEN} draw={prog(frame, verifiedAt + 2, 10)} />
          <span style={{ fontWeight: 600, fontSize: 30, letterSpacing: "-0.01em", color: "#248A3D" }}>{verifiedLabel}</span>
        </div>
      ) : null}
    </div>
  );
};
