import React from "react";
import { useCurrentFrame } from "remotion";
import { Icon } from "../../icons/Icons";
import { AMBER, DevCard, TAB_H, toneColors } from "../dev/card";
import { BLUE_TINT, GREEN, lerp, presence, RED } from "../diagram/Node";
import { tint } from "../windows/MacWindow";
import { TX } from "../../layout";
import { C, materialize, mono, prog, sans } from "../../theme";

/**
 * InodeMap visualizes how filesystem deletion (`rm` / `unlink`) vs `shred` actually works:
 * Directory Entry (filename) -> Inode (#metadata + link count + optional /proc fd) -> Disk Data Blocks.
 */
export const InodeMap: React.FC<{
  x?: number;
  y: number;
  w?: number;
  at: number;
  until?: number;
  filename: string;
  inode: string | number;
  size?: string;
  blocks: string[];
  unlinkAt?: number;
  fdProc?: { path: string; at: number };
  shredAt?: number;
  style?: React.CSSProperties;
}> = ({
  x = TX,
  y,
  w = 900,
  at,
  until,
  filename,
  inode,
  size = "4.0 KB",
  blocks,
  unlinkAt,
  fdProc,
  shredAt,
  style,
}) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;

  const unlinkP = unlinkAt !== undefined ? prog(frame, unlinkAt, 10) : 0;
  const isUnlinked = unlinkP > 0.01;
  const shredP = shredAt !== undefined ? prog(frame, shredAt, 12) : 0;
  const isShredded = shredP > 0.01;
  const fdVis = fdProc ? presence(frame, fdProc.at, undefined, 9, 6) : null;

  const dirEnter = prog(frame, at + 4, 10);
  const arrowEnter = prog(frame, at + 8, 10);
  const inodeEnter = prog(frame, at + 10, 10);
  const blocksEnter = prog(frame, at + 15, 10);

  const cardH = TAB_H + 474;

  const rightLabel = isShredded
    ? "shred -u · blocks zeroed"
    : isUnlinked
      ? "unlink() · pointer cut"
      : "ext4 / APFS inode tree";

  const warnColors = toneColors("warn", false);
  const badColors = toneColors("bad", false);
  const goodColors = toneColors("good", false);

  return (
    <DevCard
      x={x}
      y={y}
      w={w}
      h={cardH}
      p={p}
      filename={`fs · ${filename}`}
      icon="disk"
      right={rightLabel}
      style={style}
    >
      <div style={{ padding: "26px 28px", display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Top Row: Directory Entry  --->  Inode Metadata */}
        <div style={{ display: "flex", alignItems: "stretch", height: 168 }}>
          {/* 1. Directory Entry Box */}
          <div
            style={{
              width: 280,
              borderRadius: 22,
              background: isUnlinked ? "#FFF5F5" : "#F5F5F7",
              border: `2.5px solid ${isUnlinked ? RED : C.line}`,
              padding: "18px 22px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              flexShrink: 0,
              ...materialize(dirEnter, 0.95, 6),
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Icon name="folder" size={28} color={isUnlinked ? RED : C.accent} />
                <span style={{ fontFamily: sans, fontWeight: 600, fontSize: 21, color: C.mute }}>dir entry</span>
              </div>
              {isUnlinked ? (
                <span
                  style={{
                    padding: "2px 10px",
                    borderRadius: 8,
                    background: badColors.bg,
                    color: badColors.fg,
                    fontFamily: mono,
                    fontWeight: 700,
                    fontSize: 17,
                    ...materialize(unlinkP, 0.9, 4),
                  }}
                >
                  unlinked
                </span>
              ) : null}
            </div>

            <div style={{ position: "relative", alignSelf: "flex-start" }}>
              <span
                style={{
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize: 30,
                  color: isUnlinked ? C.mute : C.ink,
                }}
              >
                {filename}
              </span>
              {isUnlinked ? (
                <div
                  style={{
                    position: "absolute",
                    left: -4,
                    right: -4,
                    top: "52%",
                    height: 3.5,
                    borderRadius: 2,
                    background: RED,
                    width: `${unlinkP * 106}%`,
                  }}
                />
              ) : null}
            </div>

            <div style={{ fontFamily: mono, fontSize: 19, color: C.mute }}>
              d_ino → #{inode}
            </div>
          </div>

          {/* 2. Connector Arrow (Dir Entry -> Inode) */}
          <div
            style={{
              width: 132,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              flexShrink: 0,
              opacity: arrowEnter,
            }}
          >
            <svg width={124} height={54} viewBox="0 0 124 54" style={{ overflow: "visible" }}>
              <line
                x1={8}
                y1={27}
                x2={108}
                y2={27}
                stroke={isUnlinked ? RED : C.accent}
                strokeWidth={3.5}
                strokeLinecap="round"
                strokeDasharray={isUnlinked ? "8 8" : undefined}
                opacity={isUnlinked ? 0.45 : 1}
              />
              <path
                d="M98 17 L112 27 L98 37"
                fill="none"
                stroke={isUnlinked ? RED : C.accent}
                strokeWidth={3.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={isUnlinked ? 0.45 : 1}
              />
            </svg>
            {isUnlinked ? (
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  translate: "-50% -50%",
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  background: "#FFF1F0",
                  border: `2.5px solid ${RED}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  ...materialize(unlinkP, 0.85, 4),
                }}
              >
                <Icon name="cross" size={26} color={RED} weight={2.6} />
              </div>
            ) : (
              <div style={{ fontFamily: mono, fontSize: 17, color: C.mute, marginTop: -4 }}>hard link</div>
            )}
          </div>

          {/* 3. Inode Metadata Card */}
          <div
            style={{
              flex: 1,
              borderRadius: 22,
              background: fdVis ? BLUE_TINT : C.white,
              border: `2.5px solid ${fdVis ? C.accent : isUnlinked ? AMBER : C.accent}`,
              padding: "16px 22px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              ...materialize(inodeEnter, 0.95, 6),
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Icon name="chip" size={28} color={C.accent} />
                <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 25, color: C.ink }}>
                  inode #{inode}
                </span>
              </div>
              {/* Link count badge */}
              <div
                style={{
                  padding: "4px 14px",
                  borderRadius: 10,
                  background: isUnlinked ? badColors.bg : tint(C.accent, 0.1),
                  border: `1.5px solid ${isUnlinked ? RED : C.accent}`,
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize: 21,
                  color: isUnlinked ? badColors.fg : C.accent,
                }}
              >
                links: {isUnlinked ? "1 → 0" : "1"}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 18, fontFamily: mono, fontSize: 20, color: C.mute }}>
              <span>size: {size}</span>
              <span>·</span>
              <span>mode: -rw-r--r--</span>
            </div>

            {/* Optional open FD recovery pill */}
            {fdProc && fdVis !== null ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "6px 14px",
                  borderRadius: 10,
                  background: goodColors.bg,
                  border: `1.5px solid ${GREEN}`,
                  ...materialize(fdVis, 0.92, 4),
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Icon name="link" size={22} color={goodColors.fg} />
                  <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 19, color: goodColors.fg }}>
                    {fdProc.path}
                  </span>
                </div>
                <span style={{ fontFamily: sans, fontWeight: 600, fontSize: 18, color: goodColors.fg }}>
                  open fd alive!
                </span>
              </div>
            ) : (
              <div style={{ fontFamily: mono, fontSize: 19, color: C.mute }}>
                extents → {blocks.length} data blocks on disk
              </div>
            )}
          </div>
        </div>

        {/* Middle Connector Bar: Inode -> Disk Data Blocks */}
        <div
          style={{
            height: 46,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 12px",
            opacity: blocksEnter,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Icon name="arrowDown" size={26} color={isShredded ? GREEN : isUnlinked ? AMBER : C.accent} />
            <span style={{ fontFamily: mono, fontWeight: 600, fontSize: 21, color: C.mute }}>
              disk data blocks (LBA 0x4A0..0x4A{Math.max(0, blocks.length - 1)})
            </span>
          </div>

          {/* Status Callout Pill */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "6px 16px",
              borderRadius: 999,
              background: isShredded ? goodColors.bg : isUnlinked ? warnColors.bg : "#F2F2F4",
              border: `2px solid ${isShredded ? GREEN : isUnlinked ? AMBER : C.line}`,
            }}
          >
            <Icon
              name={isShredded ? "check" : isUnlinked ? "warning" : "disk"}
              size={22}
              color={isShredded ? goodColors.fg : isUnlinked ? warnColors.fg : C.mute}
            />
            <span
              style={{
                fontFamily: sans,
                fontWeight: 700,
                fontSize: 21,
                color: isShredded ? goodColors.fg : isUnlinked ? warnColors.fg : C.ink,
                letterSpacing: "-0.01em",
              }}
            >
              {isShredded
                ? "wiped · overwritten with zeros"
                : isUnlinked
                  ? "marked free · bytes still here!"
                  : "allocated · in use"}
            </span>
          </div>
        </div>

        {/* Bottom Row: Disk Data Blocks Grid */}
        <div style={{ display: "flex", gap: 16, height: 162 }}>
          {blocks.map((blk, i) => {
            const bEnter = prog(frame, at + 16 + i * 3, 9);
            const bShred = shredAt !== undefined ? prog(frame, shredAt + i * 3, 8) : 0;
            const wiped = bShred > 0.5;

            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  borderRadius: 20,
                  background: wiped ? "#EEFAF1" : isUnlinked ? "rgba(255,159,10,0.09)" : "#F5F5F7",
                  border: `2.5px ${isUnlinked && !wiped ? "dashed" : "solid"} ${
                    wiped ? GREEN : isUnlinked ? AMBER : C.line
                  }`,
                  padding: "14px 18px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  position: "relative",
                  ...materialize(bEnter, 0.94, 5),
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: mono, fontWeight: 500, fontSize: 18, color: C.mute }}>
                    blk #{i}
                  </span>
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: 6,
                      background: wiped ? goodColors.bg : isUnlinked ? warnColors.bg : C.white,
                      fontFamily: mono,
                      fontWeight: 700,
                      fontSize: 16,
                      color: wiped ? goodColors.fg : isUnlinked ? warnColors.fg : C.mute,
                    }}
                  >
                    {wiped ? "0x00" : isUnlinked ? "FREE" : "USED"}
                  </span>
                </div>

                {/* Block payload text */}
                <div
                  style={{
                    fontFamily: mono,
                    fontWeight: 700,
                    fontSize: 28,
                    color: wiped ? goodColors.fg : C.ink,
                    textAlign: "center",
                    letterSpacing: "-0.02em",
                    opacity: isUnlinked && !wiped ? lerp(1, 0.88, unlinkP) : 1,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {wiped ? "00 00 00" : JSON.stringify(blk)}
                </div>

                <div
                  style={{
                    fontFamily: sans,
                    fontWeight: 600,
                    fontSize: 17,
                    color: wiped ? goodColors.fg : isUnlinked ? warnColors.fg : C.mute,
                    textAlign: "center",
                  }}
                >
                  {wiped ? "wiped" : isUnlinked ? "unallocated · readable" : "4096 B sector"}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DevCard>
  );
};
