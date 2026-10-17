import { useCurrentFrame } from "remotion";
import { Icon, IconName } from "../../icons/Icons";
import { TW, TX, TY } from "../../layout";
import { C, easeInOut, materialize, mono, prog, sans, TERM } from "../../theme";
import { DevCard, TAB_H, toneColors } from "../dev/card";
import { BLUE_TINT, CARD_SHADOW, GREEN, lerp, presence } from "../diagram/Node";
import { tint } from "../windows/MacWindow";

// User Space (Ring 3 · unprivileged) vs Kernel Space (Ring 0 · privileged) boundary card:
// animates an app calling `read(fd, buf, 4096)` → trapping across the horizontal privilege boundary
// via `syscall` → Kernel VFS / NVMe driver → returning bytes back to User Space.

export type SyscallBoundaryProps = {
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  at: number;
  until?: number;
  call?: string;
  syscallName?: string;
  returnLabel?: string;
  trapAt?: number;
  kernelAt?: number;
  returnAt?: number;
  filename?: string;
  right?: string;
};

const KERNEL_STEPS: { icon: IconName; title: string; sub: string; detail: string }[] = [
  { icon: "hash", title: "syscall table", sub: "rax = 0 → sys_read", detail: "fd 3 → struct file*" },
  { icon: "layers", title: "VFS & page cache", sub: "vfs_read()", detail: "ext4_file_read_iter" },
  { icon: "disk", title: "NVMe block driver", sub: "DMA → page cache", detail: "copy_to_user(buf)" },
];

export const SyscallBoundary: React.FC<SyscallBoundaryProps> = ({
  x = TX,
  y = TY,
  w = TW,
  h = 880,
  at,
  until,
  call = "read(fd, buf, 4096)",
  syscallName = "syscall #0 · sys_read",
  returnLabel = "4096 B · rax = 4096",
  trapAt,
  kernelAt,
  returnAt,
  filename = "syscall-boundary.c",
  right = "x86_64 · ring 3 ↔ ring 0",
}) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;

  const tTrap = trapAt ?? at + 16;
  const tKern = kernelAt ?? at + 34;
  const tRet = returnAt ?? at + 68;

  const trapP = prog(frame, tTrap, 16, easeInOut);
  const retP = prog(frame, tRet, 16, easeInOut);
  const doneP = prog(frame, tRet + 12, 10);
  const inKernel = frame >= tTrap + 8 && frame < tRet + 8;

  const bodyH = h - TAB_H;
  const splitY = 345;
  const goodTone = toneColors("good");
  const accentTone = toneColors("accent");

  return (
    <DevCard x={x} y={y} w={w} h={h} p={p} filename={filename} icon="cpu" right={right}>
      {/* ---------------- TOP HALF: USER SPACE (RING 3) ---------------- */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: w,
          height: splitY,
          background: C.white,
          padding: "24px 32px",
          boxSizing: "border-box",
        }}
      >
        {/* Header row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                height: 40,
                padding: "0 16px",
                borderRadius: 20,
                background: BLUE_TINT,
                border: `1.5px solid ${tint(C.accent, 0.35)}`,
                color: C.accent,
                fontFamily: mono,
                fontWeight: 700,
                fontSize: 20,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Icon name="user" size={20} color={C.accent} />
              ring 3 · user space
            </div>
            <span style={{ fontFamily: sans, fontWeight: 500, fontSize: 22, color: C.mute }}>
              unprivileged · virtual memory only
            </span>
          </div>

          {/* CPU privilege mode indicator */}
          <div
            style={{
              height: 40,
              padding: "0 16px",
              borderRadius: 12,
              background: inKernel ? TERM.bg : "#F2F2F4",
              color: inKernel ? TERM.yellow : C.ink,
              fontFamily: mono,
              fontWeight: 700,
              fontSize: 19,
              display: "flex",
              alignItems: "center",
              gap: 10,
              border: `1px solid ${C.line}`,
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                background: inKernel ? TERM.yellow : C.accent,
              }}
            />
            {inKernel ? "CPU mode: ring 0 (kernel)" : "CPU mode: ring 3 (user)"}
          </div>
        </div>

        {/* User space boxes: App process (left) and User buffer (right) */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28, gap: 28 }}>
          {/* Left: App process calling read() */}
          <div
            style={{
              width: 400,
              height: 196,
              borderRadius: 22,
              background: frame >= at + 8 && frame < tKern ? BLUE_TINT : "#F8F8FA",
              border: `2.5px solid ${frame >= at + 8 && frame < tKern ? C.accent : C.line}`,
              boxShadow: CARD_SHADOW,
              padding: "20px 24px",
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Icon name="terminal" size={30} color={C.accent} />
                <div>
                  <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 25, color: C.ink, letterSpacing: "-0.02em" }}>
                    app process
                  </div>
                  <div style={{ fontFamily: mono, fontWeight: 500, fontSize: 18, color: C.mute }}>
                    pid 4821 · libc wrapper
                  </div>
                </div>
              </div>
              <div
                style={{
                  padding: "4px 12px",
                  borderRadius: 10,
                  background: tint(C.accent, 0.12),
                  color: C.accent,
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize: 18,
                }}
              >
                caller
              </div>
            </div>

            <div
              style={{
                height: 64,
                borderRadius: 14,
                background: C.white,
                border: `1.5px solid ${C.line}`,
                padding: "0 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontFamily: mono,
                fontWeight: 700,
                fontSize: 21,
                color: C.ink,
              }}
            >
              <span>{call}</span>
              <Icon name="arrowDown" size={24} color={C.accent} />
            </div>
          </div>

          {/* Right: User space buffer receiving bytes */}
          <div
            style={{
              width: 400,
              height: 196,
              borderRadius: 22,
              background: doneP > 0 ? goodTone.bg : "#F8F8FA",
              border: `2.5px solid ${doneP > 0 ? GREEN : C.line}`,
              boxShadow: CARD_SHADOW,
              padding: "20px 24px",
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Icon name="ram" size={30} color={doneP > 0 ? goodTone.fg : C.mute} />
                <div>
                  <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 25, color: C.ink, letterSpacing: "-0.02em" }}>
                    user buffer
                  </div>
                  <div style={{ fontFamily: mono, fontWeight: 500, fontSize: 18, color: C.mute }}>
                    char buf[4096] · 0x7ffc...
                  </div>
                </div>
              </div>
              <div
                style={{
                  padding: "4px 12px",
                  borderRadius: 10,
                  background: doneP > 0 ? tint(GREEN, 0.2) : "#E8E8ED",
                  color: doneP > 0 ? goodTone.fg : C.mute,
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize: 18,
                }}
              >
                {doneP > 0 ? "filled ✓" : "waiting"}
              </div>
            </div>

            <div
              style={{
                height: 64,
                borderRadius: 14,
                background: C.white,
                border: `1.5px solid ${doneP > 0 ? GREEN : C.line}`,
                padding: "0 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontFamily: mono,
                fontWeight: 700,
                fontSize: 20,
                color: doneP > 0 ? goodTone.fg : C.mute,
              }}
            >
              <span>{doneP > 0 ? returnLabel : "0 / 4096 B · blocked"}</span>
              {doneP > 0 ? <Icon name="checkCircle" size={26} color={GREEN} /> : <Icon name="hourglass" size={22} color={C.mute} />}
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- BOTTOM HALF: KERNEL SPACE (RING 0) ---------------- */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: splitY,
          width: w,
          height: bodyH - splitY,
          background: TERM.bg,
          padding: "42px 32px 24px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* Kernel Space header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                height: 40,
                padding: "0 16px",
                borderRadius: 20,
                background: tint(TERM.yellow, 0.16),
                border: `1.5px solid ${tint(TERM.yellow, 0.45)}`,
                color: TERM.yellow,
                fontFamily: mono,
                fontWeight: 700,
                fontSize: 20,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Icon name="shield" size={20} color={TERM.yellow} />
              ring 0 · kernel space
            </div>
            <span style={{ fontFamily: sans, fontWeight: 500, fontSize: 22, color: TERM.dim }}>
              privileged · direct hardware & page table access
            </span>
          </div>
        </div>

        {/* 3 Kernel Pipeline Stages */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          {KERNEL_STEPS.map((s, i) => {
            const stepAt = tKern + i * 10;
            const activeP = prog(frame, stepAt, 8);
            const isCurrent = frame >= stepAt && frame < stepAt + 14;
            const edgeCol = isCurrent ? TERM.blue : activeP > 0 ? TERM.green : "rgba(255,255,255,0.14)";
            const bgCol = isCurrent ? tint(TERM.blue, 0.18) : activeP > 0 ? tint(TERM.green, 0.12) : TERM.bar;

            return (
              <div key={s.title} style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
                <div
                  style={{
                    flex: 1,
                    height: 210,
                    borderRadius: 20,
                    background: bgCol,
                    border: `2px solid ${edgeCol}`,
                    padding: "20px 20px",
                    boxSizing: "border-box",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    ...materialize(prog(frame, at + 6 + i * 3, 10)),
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: "rgba(255,255,255,0.08)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon name={s.icon} size={26} color={activeP > 0 ? TERM.fg : TERM.dim} />
                    </div>
                    <div
                      style={{
                        fontFamily: mono,
                        fontWeight: 700,
                        fontSize: 18,
                        color: isCurrent ? TERM.blue : activeP > 0 ? TERM.green : TERM.dim,
                      }}
                    >
                      0{i + 1}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 23, color: TERM.fg, letterSpacing: "-0.01em" }}>
                      {s.title}
                    </div>
                    <div style={{ fontFamily: mono, fontWeight: 600, fontSize: 18, color: TERM.blue, marginTop: 4 }}>
                      {s.sub}
                    </div>
                    <div style={{ fontFamily: mono, fontWeight: 500, fontSize: 17, color: TERM.dim, marginTop: 4 }}>
                      {s.detail}
                    </div>
                  </div>
                </div>

                {i < KERNEL_STEPS.length - 1 ? (
                  <Icon
                    name="arrowRight"
                    size={26}
                    color={prog(frame, stepAt + 6, 6) > 0 ? TERM.green : "rgba(255,255,255,0.22)"}
                  />
                ) : null}
              </div>
            );
          })}
        </div>

        {/* Bottom Kernel Status Bar */}
        <div
          style={{
            height: 62,
            borderRadius: 16,
            background: TERM.bar,
            border: "1px solid rgba(255,255,255,0.1)",
            padding: "0 22px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontFamily: mono,
            fontSize: 20,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, color: TERM.fg }}>
            <Icon name="chip" size={24} color={TERM.cyan} />
            <span style={{ color: TERM.dim }}>status:</span>
            <span style={{ fontWeight: 700, color: doneP > 0 ? TERM.green : inKernel ? TERM.yellow : TERM.blue }}>
              {doneP > 0
                ? "sysret → restored ring 3 · 4096 B copied to user space"
                : inKernel
                  ? "executing in ring 0 · VFS → NVMe DMA transfer"
                  : "user space ring 3 · preparing syscall registers"}
            </span>
          </div>
          <span style={{ color: TERM.dim, fontWeight: 600 }}>~120 ns trap</span>
        </div>
      </div>

      {/* ---------------- PRIVILEGE BOUNDARY LINE & CROSSING ARROWS ---------------- */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: splitY - 2,
          height: 4,
          borderTop: `3px dashed ${inKernel ? AMBER_HEX : C.accent}`,
          opacity: 0.85,
        }}
      />

      {/* Center Privilege Boundary Pill */}
      <div
        style={{
          position: "absolute",
          left: w / 2,
          top: splitY,
          translate: "-50% -50%",
          height: 44,
          padding: "0 22px",
          borderRadius: 22,
          background: C.white,
          border: `2px solid ${C.accent}`,
          boxShadow: CARD_SHADOW,
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontFamily: mono,
          fontWeight: 700,
          fontSize: 19,
          color: C.ink,
        }}
      >
        <Icon name="lock" size={20} color={C.accent} />
        hardware privilege boundary
      </div>

      {/* Left vertical trap wire (App → Kernel) */}
      {trapP > 0 ? (
        <>
          <div
            style={{
              position: "absolute",
              left: 170,
              top: 286,
              width: 4,
              height: lerp(0, 128, trapP),
              background: C.accent,
              borderRadius: 2,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 44,
              top: lerp(278, 368, trapP),
              height: 40,
              padding: "0 14px",
              borderRadius: 20,
              background: accentTone.bg,
              border: `2px solid ${C.accent}`,
              color: C.accent,
              fontFamily: mono,
              fontWeight: 700,
              fontSize: 18,
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: CARD_SHADOW,
              ...materialize(prog(frame, tTrap, 8)),
            }}
          >
            <Icon name="bolt" size={18} color={C.accent} />
            {syscallName}
          </div>
        </>
      ) : null}

      {/* Right vertical return wire (Kernel → User buffer) */}
      {retP > 0 ? (
        <>
          <div
            style={{
              position: "absolute",
              left: 726,
              top: lerp(414, 286, retP),
              width: 4,
              height: lerp(0, 128, retP),
              background: GREEN,
              borderRadius: 2,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 618,
              top: lerp(368, 278, retP),
              height: 40,
              padding: "0 14px",
              borderRadius: 20,
              background: goodTone.bg,
              border: `2px solid ${GREEN}`,
              color: goodTone.fg,
              fontFamily: mono,
              fontWeight: 700,
              fontSize: 18,
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: CARD_SHADOW,
              ...materialize(prog(frame, tRet, 8)),
            }}
          >
            <Icon name="check" size={18} color={GREEN} />
            sysret · 4096 B
          </div>
        </>
      ) : null}
    </DevCard>
  );
};

const AMBER_HEX = "#FF9F0A";
