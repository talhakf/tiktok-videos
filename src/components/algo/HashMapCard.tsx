import { interpolateColors, useCurrentFrame } from "remotion";
import { Icon } from "../../icons/Icons";
import { TW, TX } from "../../layout";
import { C, easeInOut, easeOut, materialize, mono, prog, sans } from "../../theme";
import { AMBER } from "../dev/card";
import { BLUE_TINT, CARD_SHADOW, GREEN, presence, WIRE } from "../diagram/Node";
import { tint } from "../windows/MacWindow";

export type HashEntry = {
  key: string;
  value: string;
  bucket: number;
  at: number;
};

export type HashLookup = {
  key: string;
  bucket?: number;
  at: number;
};

const DEFAULT_ENTRIES: HashEntry[] = [
  { key: "pizza", value: "$12", bucket: 2, at: 14 },
  { key: "donut", value: "$4", bucket: 0, at: 34 },
  { key: "taco", value: "$9", bucket: 2, at: 56 },
  { key: "ramen", value: "$15", bucket: 4, at: 78 },
];

/**
 * Hash table bucket visualizer:
 * Left column of keys ("pizza", "donut", "taco"), middle `hash(k) % 6` pill,
 * right bucket slots `0..5` with chained value pills (`[key: val]`),
 * animating O(1) lookups and hash collision chaining.
 */
export const HashMapCard: React.FC<{
  x?: number;
  y: number;
  w?: number;
  h?: number;
  at: number;
  until?: number;
  buckets?: number;
  entries?: HashEntry[];
  lookup?: HashLookup;
  title?: string;
}> = ({
  x = TX,
  y,
  w = TW,
  h = 680,
  at,
  until,
  buckets = 6,
  entries = DEFAULT_ENTRIES,
  lookup,
  title = "hash table · O(1) buckets & chaining",
}) => {
  const frame = useCurrentFrame();
  const vis = presence(frame, at, until);
  if (vis === null) return null;

  const sortedEntries = [...entries].sort((a, b) => a.at - b.at);
  let activeIdx = -1;
  for (let i = 0; i < sortedEntries.length; i++) {
    if (sortedEntries[i].at <= frame) activeIdx = i;
  }

  const isLookupActive = lookup !== undefined && frame >= lookup.at;
  const lookupP = isLookupActive ? prog(frame, lookup.at, 12, easeInOut) : 0;

  const curEntry = activeIdx >= 0 ? sortedEntries[activeIdx] : null;
  const curEntryP = curEntry ? prog(frame, curEntry.at, 12, easeInOut) : 0;

  // Check if current active entry is a collision (an earlier entry already landed in the same bucket)
  const isCollisionStep =
    !isLookupActive &&
    activeIdx > 0 &&
    sortedEntries.slice(0, activeIdx).some((e) => e.bucket === sortedEntries[activeIdx].bucket);

  const lookupTargetEntry = lookup
    ? sortedEntries.find((e) => e.key === lookup.key) ?? {
        key: lookup.key,
        value: "",
        bucket: lookup.bucket ?? 0,
        at: lookup.at,
      }
    : null;

  const activeKeyName = isLookupActive ? lookup!.key : curEntry?.key ?? null;
  const activeBucket = isLookupActive ? (lookup!.bucket ?? lookupTargetEntry?.bucket ?? 0) : curEntry?.bucket ?? null;

  // Layout coordinates
  const headerH = 74;
  const col1X = 32;
  const col1W = 176;
  const hashX = 258;
  const hashW = 196;
  const hashH = 128;
  const hashY = headerH + (h - headerH - hashH) / 2;
  const col3X = 502;
  const col3W = w - col3X - 30;

  const keyCount = Math.max(1, entries.length);
  const keyH = 68;
  const keyGap = 18;
  const keysTotalH = keyCount * keyH + (keyCount - 1) * keyGap;
  const keysStartY = headerH + (h - headerH - keysTotalH) / 2;
  const keyCenterY = (i: number) => keysStartY + i * (keyH + keyGap) + keyH / 2;

  const bucketTop = headerH + 50;
  const bucketAvailH = h - bucketTop - 26;
  const bucketGap = 11;
  const bucketH = (bucketAvailH - bucketGap * (buckets - 1)) / buckets;
  const bucketCenterY = (b: number) => bucketTop + b * (bucketH + bucketGap) + bucketH / 2;

  // Group already-inserted entries by bucket index
  const bucketChains: HashEntry[][] = Array.from({ length: buckets }, () => []);
  sortedEntries.forEach((e) => {
    if (frame >= e.at && e.bucket >= 0 && e.bucket < buckets) {
      bucketChains[e.bucket].push(e);
    }
  });

  // Status badge tone
  const badgeTone = isLookupActive ? "good" : isCollisionStep ? "warn" : "accent";
  const badgeColors = {
    accent: { bg: BLUE_TINT, border: C.accent, fg: C.accent },
    warn: { bg: tint(AMBER, 0.15), border: AMBER, fg: "#A05A00" },
    good: { bg: "#EEFAF1", border: GREEN, fg: "#248A3D" },
  }[badgeTone];

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
      {/* Header strip */}
      <div
        style={{
          height: headerH,
          padding: "0 32px",
          background: "#FAFAFC",
          borderBottom: `1px solid ${C.line}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 11,
              background: badgeColors.bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="hash" size={21} color={badgeColors.fg} weight={2.2} />
          </div>
          <span style={{ fontFamily: mono, fontSize: 23, fontWeight: 600, color: C.ink }}>{title}</span>
        </div>

        {/* Dynamic status pill */}
        <div
          style={{
            padding: "7px 16px",
            borderRadius: 999,
            background: badgeColors.bg,
            border: `1.5px solid ${badgeColors.border}`,
            fontFamily: mono,
            fontSize: 19,
            fontWeight: 700,
            color: badgeColors.fg,
          }}
        >
          {isLookupActive
            ? `get("${lookup!.key}") → O(1) hit`
            : isCollisionStep
              ? `collision on [${activeBucket}] → chain`
              : activeBucket !== null
                ? `insert → bucket [${activeBucket}]`
                : `${buckets} buckets`}
        </div>
      </div>

      {/* Column labels */}
      <div
        style={{
          position: "absolute",
          left: col1X,
          top: headerH + 14,
          fontFamily: mono,
          fontSize: 18,
          fontWeight: 600,
          color: C.mute,
        }}
      >
        keys
      </div>
      <div
        style={{
          position: "absolute",
          left: col3X,
          top: headerH + 14,
          fontFamily: mono,
          fontSize: 18,
          fontWeight: 600,
          color: C.mute,
        }}
      >
        buckets [0..{buckets - 1}]
      </div>

      {/* SVG Connector Curves: Key -> Hash Pill -> Bucket */}
      <svg
        width={w}
        height={h}
        style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "visible" }}
      >
        {entries.map((e, idx) => {
          const inserted = frame >= e.at;
          if (!inserted) return null;

          const ky = keyCenterY(idx);
          const kx = col1X + col1W;
          const hxLeft = hashX;
          const hxRight = hashX + hashW;
          const hy = hashY + hashH / 2;
          const bx = col3X;
          const by = bucketCenterY(e.bucket);

          const d1 = `M ${kx} ${ky} C ${kx + 28} ${ky}, ${hxLeft - 28} ${hy}, ${hxLeft} ${hy}`;
          const d2 = `M ${hxRight} ${hy} C ${hxRight + 26} ${hy}, ${bx - 26} ${by}, ${bx} ${by}`;

          const isCurrent =
            (isLookupActive && e.key === lookup!.key) || (!isLookupActive && curEntry?.key === e.key && curEntry?.at === e.at);
          const wireColor = isLookupActive ? GREEN : isCollisionStep && isCurrent ? AMBER : C.accent;
          const drawP = isLookupActive ? lookupP : prog(frame, e.at, 12, easeInOut);

          return (
            <g key={`wire-${e.key}-${idx}`}>
              {/* Faint background trace for already-inserted entries */}
              <path d={d1} fill="none" stroke={WIRE} strokeWidth={2} strokeDasharray="5 5" opacity={0.3} />
              <path d={d2} fill="none" stroke={WIRE} strokeWidth={2} strokeDasharray="5 5" opacity={0.3} />

              {/* Highlighted active trace */}
              {isCurrent ? (
                <>
                  <path
                    d={d1}
                    fill="none"
                    stroke={wireColor}
                    strokeWidth={4}
                    strokeLinecap="round"
                    pathLength={1}
                    strokeDasharray={1}
                    strokeDashoffset={1 - drawP}
                  />
                  <path
                    d={d2}
                    fill="none"
                    stroke={wireColor}
                    strokeWidth={4}
                    strokeLinecap="round"
                    pathLength={1}
                    strokeDasharray={1}
                    strokeDashoffset={1 - drawP}
                  />
                  <circle cx={kx} cy={ky} r={5} fill={wireColor} opacity={drawP} />
                  <circle cx={bx} cy={by} r={5.5} fill={wireColor} opacity={drawP} />
                </>
              ) : null}
            </g>
          );
        })}
      </svg>

      {/* Left Column: Input Keys */}
      {entries.map((e, idx) => {
        const enterP = prog(frame, at + 2 + idx * 2, 10, easeOut);
        const isCurrent = activeKeyName === e.key;
        const inserted = frame >= e.at;
        const actP = isLookupActive && isCurrent ? lookupP : isCurrent ? curEntryP : 0;

        const targetBg = isLookupActive ? "#EEFAF1" : isCollisionStep && isCurrent ? tint(AMBER, 0.14) : BLUE_TINT;
        const targetBorder = isLookupActive ? GREEN : isCollisionStep && isCurrent ? AMBER : C.accent;
        const targetFg = isLookupActive ? "#248A3D" : isCollisionStep && isCurrent ? "#A05A00" : C.accent;

        return (
          <div
            key={`key-${e.key}-${idx}`}
            style={{
              position: "absolute",
              left: col1X,
              top: keysStartY + idx * (keyH + keyGap),
              width: col1W,
              height: keyH,
              borderRadius: 18,
              background: isCurrent ? interpolateColors(actP, [0, 1], [C.white, targetBg]) : inserted ? "#F8F8FA" : C.white,
              border: `2.5px solid ${
                isCurrent ? interpolateColors(actP, [0, 1], ["rgba(0,0,0,0.12)", targetBorder]) : "rgba(0,0,0,0.10)"
              }`,
              boxShadow: isCurrent ? CARD_SHADOW : undefined,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 16px",
              boxSizing: "border-box",
              ...materialize(enterP),
            }}
          >
            <span
              style={{
                fontFamily: mono,
                fontSize: 22,
                fontWeight: 700,
                color: isCurrent ? targetFg : C.ink,
              }}
            >
              "{e.key}"
            </span>
            <span
              style={{
                fontFamily: mono,
                fontSize: 17,
                fontWeight: 600,
                color: C.mute,
              }}
            >
              {e.value}
            </span>
          </div>
        );
      })}

      {/* Middle Column: hash(k) % N pill */}
      <div
        style={{
          position: "absolute",
          left: hashX,
          top: hashY,
          width: hashW,
          height: hashH,
          borderRadius: 24,
          background: badgeColors.bg,
          border: `3px solid ${badgeColors.border}`,
          boxShadow: CARD_SHADOW,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          padding: "0 14px",
          boxSizing: "border-box",
          ...materialize(prog(frame, at + 4, 10, easeOut)),
        }}
      >
        <div
          style={{
            fontFamily: mono,
            fontSize: 21,
            fontWeight: 700,
            color: badgeColors.fg,
            whiteSpace: "nowrap",
          }}
        >
          hash(k) % {buckets}
        </div>
        <div
          style={{
            padding: "4px 12px",
            borderRadius: 999,
            background: C.white,
            border: `1.5px solid ${C.line}`,
            fontFamily: mono,
            fontSize: 17,
            fontWeight: 700,
            color: C.ink,
            whiteSpace: "nowrap",
          }}
        >
          {activeKeyName ? `"${activeKeyName}" → [${activeBucket}]` : "ready"}
        </div>
      </div>

      {/* Right Column: Bucket Slots 0..buckets-1 with Chained Value Pills */}
      {Array.from({ length: buckets }, (_, b) => {
        const chain = bucketChains[b];
        const isTargetBucket = activeBucket === b;
        const enterP = prog(frame, at + 4 + b * 1.5, 10, easeOut);
        const hasCollision = chain.length > 1;

        const rowBorder =
          isLookupActive && isTargetBucket
            ? GREEN
            : isCollisionStep && isTargetBucket
              ? AMBER
              : isTargetBucket
                ? C.accent
                : "rgba(0,0,0,0.09)";

        const rowBg =
          isLookupActive && isTargetBucket
            ? "#EEFAF1"
            : isCollisionStep && isTargetBucket
              ? tint(AMBER, 0.08)
              : isTargetBucket
                ? "#F5FAFF"
                : "#F7F7FA";

        return (
          <div
            key={`bucket-${b}`}
            style={{
              position: "absolute",
              left: col3X,
              top: bucketTop + b * (bucketH + bucketGap),
              width: col3W,
              height: bucketH,
              borderRadius: 18,
              background: rowBg,
              border: `2px solid ${rowBorder}`,
              display: "flex",
              alignItems: "center",
              padding: "0 12px",
              gap: 10,
              boxSizing: "border-box",
              ...materialize(enterP),
            }}
          >
            {/* Bucket index badge */}
            <div
              style={{
                width: 44,
                height: bucketH - 18,
                borderRadius: 11,
                background: isTargetBucket ? badgeColors.bg : C.white,
                border: `1.5px solid ${isTargetBucket ? badgeColors.border : C.line}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: mono,
                fontSize: 19,
                fontWeight: 700,
                color: isTargetBucket ? badgeColors.fg : C.mute,
                flexShrink: 0,
              }}
            >
              {b}
            </div>

            {/* Chained value pills inside the bucket */}
            {chain.length === 0 ? (
              <span style={{ fontFamily: mono, fontSize: 18, color: C.mute, opacity: 0.45, marginLeft: 6 }}>
                null
              </span>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 6, overflow: "hidden" }}>
                {chain.map((item, cIdx) => {
                  const itemP = prog(frame, item.at + 4, 10, easeOut);
                  const isLookedUpItem = isLookupActive && item.key === lookup!.key;
                  const isChainedNode = cIdx > 0;

                  const pillBg = isLookedUpItem
                    ? GREEN
                    : isChainedNode
                      ? tint(AMBER, 0.16)
                      : BLUE_TINT;
                  const pillBorder = isLookedUpItem ? GREEN : isChainedNode ? AMBER : C.accent;
                  const pillFg = isLookedUpItem ? C.white : isChainedNode ? "#A05A00" : C.accent;

                  return (
                    <div
                      key={`chain-${item.key}-${cIdx}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        ...materialize(itemP, 0.9, 6),
                      }}
                    >
                      {cIdx > 0 ? (
                        <span
                          style={{
                            fontFamily: mono,
                            fontSize: 18,
                            fontWeight: 700,
                            color: hasCollision ? AMBER : C.mute,
                          }}
                        >
                          ──►
                        </span>
                      ) : null}
                      <div
                        style={{
                          padding: "6px 12px",
                          borderRadius: 11,
                          background: pillBg,
                          border: `2px solid ${pillBorder}`,
                          fontFamily: mono,
                          fontSize: 18,
                          fontWeight: 700,
                          color: pillFg,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.key}: {item.value}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
