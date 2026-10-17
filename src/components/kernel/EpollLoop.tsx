import { useCurrentFrame } from "remotion";
import { Icon } from "../../icons/Icons";
import { TW, TX, TY } from "../../layout";
import { C, materialize, mono, prog, sans } from "../../theme";
import { AMBER, DevCard, toneColors } from "../dev/card";
import { BLUE_TINT, CARD_SHADOW, GREEN, presence, RED } from "../diagram/Node";
import { tint } from "../windows/MacWindow";

// C10K Blocking Thread-per-Connection (10,000 threads · context-switch thrashing)
// vs Non-blocking `epoll / kqueue` Event Loop (1 worker thread · O(active) ready events)
// side-by-side comparison card.

export type EpollLoopProps = {
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  at: number;
  until?: number;
  epollAt?: number;
  filename?: string;
  right?: string;
};

const BLOCKING_THREADS = [
  { id: "thread #1", fd: "fd 10", state: "blocked on recv()", active: false },
  { id: "thread #2", fd: "fd 11", state: "blocked on recv()", active: false },
  { id: "thread #42", fd: "fd 42", state: "running (24 B)", active: true },
  { id: "thread #43", fd: "fd 43", state: "blocked on recv()", active: false },
  { id: "thread #9,999", fd: "fd 9999", state: "blocked on recv()", active: false },
  { id: "thread #10,000", fd: "fd 10000", state: "blocked on recv()", active: false },
];

const READY_FDS = [
  { fd: "fd 42", event: "EPOLLIN · 1.2 KiB", handler: "read() → parse HTTP" },
  { fd: "fd 819", event: "EPOLLIN · 512 B", handler: "read() → JSON reply" },
  { fd: "fd 4012", event: "EPOLLOUT · ready", handler: "write() → flush TLS" },
];

export const EpollLoop: React.FC<EpollLoopProps> = ({
  x = TX,
  y = TY,
  w = TW,
  h = 890,
  at,
  until,
  epollAt,
  filename = "c10k-io-multiplexing",
  right = "10,000 concurrent connections",
}) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;

  const tEpoll = epollAt ?? at + 18;
  const leftP = prog(frame, at + 4, 12);
  const rightP = prog(frame, tEpoll, 12);

  const badTone = toneColors("bad");
  const goodTone = toneColors("good");
  const warnTone = toneColors("warn");

  const activeReadyIdx = Math.max(0, Math.floor((frame - tEpoll) / 14)) % READY_FDS.length;
  const colW = (w - 30 * 2 - 24) / 2; // 408px each

  return (
    <DevCard x={x} y={y} w={w} h={h} p={p} filename={filename} icon="server" right={right}>
      <div
        style={{
          display: "flex",
          gap: 24,
          padding: "24px 30px",
          height: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* ---------------- LEFT COLUMN: BLOCKING THREAD-PER-CONNECTION ---------------- */}
        <div
          style={{
            width: colW,
            borderRadius: 24,
            background: "#F9F9FB",
            border: `2.5px solid ${RED}`,
            padding: "20px 20px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            ...materialize(leftP),
          }}
        >
          {/* Header */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div
                style={{
                  padding: "5px 12px",
                  borderRadius: 12,
                  background: badTone.bg,
                  color: badTone.fg,
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize: 17,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Icon name="crossCircle" size={18} color={RED} />
                blocking I/O
              </div>
              <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 17, color: badTone.fg }}>
                10,000 threads
              </span>
            </div>

            <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 25, color: C.ink, marginTop: 10, letterSpacing: "-0.02em" }}>
              thread-per-connection
            </div>
            <div style={{ fontFamily: mono, fontSize: 16, color: C.mute, marginTop: 2 }}>
              9,997 sleeping · scheduler thrashing
            </div>
          </div>

          {/* Stacked Thread List */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {BLOCKING_THREADS.map((t, i) => (
              <div
                key={t.id}
                style={{
                  height: 52,
                  borderRadius: 12,
                  background: t.active ? BLUE_TINT : C.white,
                  border: `1.5px solid ${t.active ? C.accent : C.line}`,
                  padding: "0 12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontFamily: mono,
                  fontSize: 16,
                  ...materialize(prog(frame, at + 8 + i * 2, 8)),
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Icon name={t.active ? "cpu" : "zzz"} size={18} color={t.active ? C.accent : C.mute} />
                  <span style={{ fontWeight: 700, color: C.ink }}>{t.id}</span>
                </div>
                <span
                  style={{
                    color: t.active ? C.accent : warnTone.fg,
                    fontWeight: 600,
                    fontSize: 15,
                  }}
                >
                  {t.state}
                </span>
              </div>
            ))}
          </div>

          {/* CPU Context Switch Thrashing Bar */}
          <div
            style={{
              borderRadius: 14,
              background: badTone.bg,
              border: `1.5px solid ${tint(RED, 0.4)}`,
              padding: "12px 14px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: mono, fontSize: 16, fontWeight: 700 }}>
              <span style={{ color: badTone.fg }}>CPU context switches</span>
              <span style={{ color: RED }}>78% overhead</span>
            </div>
            <div
              style={{
                height: 12,
                borderRadius: 6,
                background: C.white,
                marginTop: 8,
                overflow: "hidden",
                display: "flex",
              }}
            >
              <div style={{ width: "78%", background: RED }} />
              <div style={{ width: "22%", background: C.accent }} />
            </div>
          </div>

          {/* Bottom Cost Summary */}
          <div
            style={{
              borderRadius: 16,
              background: C.white,
              border: `1.5px solid ${C.line}`,
              padding: "12px 14px",
              display: "flex",
              flexDirection: "column",
              gap: 6,
              fontFamily: mono,
              fontSize: 16,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: C.mute }}>stack RAM (8 MiB × 10k):</span>
              <span style={{ fontWeight: 700, color: badTone.fg }}>~80 GiB</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: C.mute }}>wakeup complexity:</span>
              <span style={{ fontWeight: 700, color: badTone.fg }}>O(N) scan</span>
            </div>
          </div>
        </div>

        {/* ---------------- RIGHT COLUMN: NON-BLOCKING EPOLL / KQUEUE ---------------- */}
        <div
          style={{
            width: colW,
            borderRadius: 24,
            background: "#F9F9FB",
            border: `2.5px solid ${GREEN}`,
            padding: "20px 20px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            ...materialize(rightP),
          }}
        >
          {/* Header */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div
                style={{
                  padding: "5px 12px",
                  borderRadius: 12,
                  background: goodTone.bg,
                  color: goodTone.fg,
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize: 17,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Icon name="checkCircle" size={18} color={GREEN} />
                epoll / kqueue
              </div>
              <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 17, color: goodTone.fg }}>
                1 worker thread
              </span>
            </div>

            <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 25, color: C.ink, marginTop: 10, letterSpacing: "-0.02em" }}>
              non-blocking event loop
            </div>
            <div style={{ fontFamily: mono, fontSize: 16, color: C.mute, marginTop: 2 }}>
              kernel pushes only ready fds · O(active)
            </div>
          </div>

          {/* Step 1: Kernel epoll instance watching 10,000 fds */}
          <div
            style={{
              borderRadius: 16,
              background: C.white,
              border: `1.5px solid ${C.line}`,
              padding: "12px 14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Icon name="sitemap" size={26} color={C.accent} />
              <div>
                <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 19, color: C.ink }}>
                  kernel epoll RB-tree
                </div>
                <div style={{ fontFamily: mono, fontSize: 15, color: C.mute }}>
                  watches 10,000 non-blocking sockets
                </div>
              </div>
            </div>
            <span
              style={{
                padding: "4px 8px",
                borderRadius: 8,
                background: BLUE_TINT,
                color: C.accent,
                fontFamily: mono,
                fontWeight: 700,
                fontSize: 15,
              }}
            >
              0 threads
            </span>
          </div>

          {/* Step 2: Ready List (Only the 3 active sockets!) */}
          <div
            style={{
              borderRadius: 18,
              background: C.white,
              border: `2px solid ${GREEN}`,
              boxShadow: CARD_SHADOW,
              padding: "14px 14px",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 16, color: goodTone.fg }}>
                epoll_wait() → 3 ready events
              </span>
              <Icon name="bolt" size={20} color={GREEN} />
            </div>

            {READY_FDS.map((item, idx) => {
              const isCurrent = idx === activeReadyIdx && frame >= tEpoll + 10;
              return (
                <div
                  key={item.fd}
                  style={{
                    height: 50,
                    borderRadius: 12,
                    background: isCurrent ? goodTone.bg : "#F4F4F6",
                    border: `1.5px solid ${isCurrent ? GREEN : C.line}`,
                    padding: "0 12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontFamily: mono,
                    fontSize: 15,
                  }}
                >
                  <span style={{ fontWeight: 700, color: C.ink }}>{item.fd}</span>
                  <span style={{ color: isCurrent ? goodTone.fg : C.mute, fontWeight: 600 }}>
                    {isCurrent ? item.handler : item.event}
                  </span>
                </div>
              );
            })}
          </div>

          {/* CPU Utilization Bar (99% App Logic) */}
          <div
            style={{
              borderRadius: 14,
              background: goodTone.bg,
              border: `1.5px solid ${tint(GREEN, 0.4)}`,
              padding: "12px 14px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: mono, fontSize: 16, fontWeight: 700 }}>
              <span style={{ color: goodTone.fg }}>1 worker thread loop</span>
              <span style={{ color: goodTone.fg }}>99% app work</span>
            </div>
            <div
              style={{
                height: 12,
                borderRadius: 6,
                background: C.white,
                marginTop: 8,
                overflow: "hidden",
                display: "flex",
              }}
            >
              <div style={{ width: "96%", background: GREEN }} />
              <div style={{ width: "4%", background: AMBER }} />
            </div>
          </div>

          {/* Bottom Cost Summary */}
          <div
            style={{
              borderRadius: 16,
              background: C.white,
              border: `1.5px solid ${C.line}`,
              padding: "12px 14px",
              display: "flex",
              flexDirection: "column",
              gap: 6,
              fontFamily: mono,
              fontSize: 16,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: C.mute }}>total memory overhead:</span>
              <span style={{ fontWeight: 700, color: goodTone.fg }}>~12 MiB</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: C.mute }}>wakeup complexity:</span>
              <span style={{ fontWeight: 700, color: goodTone.fg }}>O(active) ready</span>
            </div>
          </div>
        </div>
      </div>
    </DevCard>
  );
};
