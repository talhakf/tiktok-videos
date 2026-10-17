import { useCurrentFrame } from "remotion";
import { Icon } from "../../icons/Icons";
import { TX, TW } from "../../layout";
import { C, materialize, mono, prog, sans } from "../../theme";
import { AMBER, Cue, DevCard, focusTrack, mixTone, TAB_H, Tone } from "../dev/card";
import { BLUE_TINT, GREEN, lerp, presence, RED } from "../diagram/Node";
import { tint } from "../windows/MacWindow";

export type StorageKind = "Cookies" | "LocalStorage" | "SessionStorage";
export type SameSiteMode = "Strict" | "Lax" | "None";

export type StorageRow = {
  key: string;
  value: string;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: SameSiteMode;
  size?: string;
  expires?: string;
  at?: number;
};

export type StorageFocusCue = Cue & {
  index: number;
  tone?: Tone;
  label?: string;
};

const TABS: StorageKind[] = ["Cookies", "LocalStorage", "SessionStorage"];

const sameSiteBadge = (mode?: SameSiteMode) => {
  if (mode === "Strict") return { bg: tint(GREEN, 0.15), fg: "#1E7E34", text: "Strict" };
  if (mode === "Lax") return { bg: BLUE_TINT, fg: C.accent, text: "Lax" };
  if (mode === "None") return { bg: tint(AMBER, 0.16), fg: "#A05A00", text: "None" };
  return { bg: "#F2F2F4", fg: C.mute, text: "—" };
};

/**
 * Browser DevTools Storage Inspector (`Cookies` / `LocalStorage` / `SessionStorage`):
 * shows key-value rows with `HttpOnly`, `Secure`, `SameSite`, `Size`, and `Expires` columns,
 * plus gliding focus/highlight cues.
 */
export const StorageTable: React.FC<{
  x?: number;
  y: number;
  w?: number;
  h?: number;
  at: number;
  until?: number;
  kind?: StorageKind;
  origin?: string;
  rows: StorageRow[];
  focus?: StorageFocusCue[];
  filename?: string;
  right?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({
  x = TX,
  y,
  w = TW,
  h,
  at,
  until,
  kind = "Cookies",
  origin = "https://app.example.com",
  rows,
  focus = [],
  filename = "Application · Storage",
  right,
  style,
}) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;

  const padX = 24;
  const switcherH = 66;
  const headerH = 48;
  const rowH = 74;
  const footerH = 62;
  const rowsTop = switcherH + headerH;
  const totalRowsH = rows.length * rowH;
  const bodyH = rowsTop + totalRowsH + footerH;
  const cardH = h ?? (filename !== undefined ? TAB_H : 0) + bodyH;

  const ft = focusTrack(frame, focus);
  const bandY = ft
    ? rowsTop + (ft.prev ? lerp(ft.prev.index, ft.cur.index, ft.t) : ft.cur.index) * rowH
    : 0;
  const bandColors = ft ? mixTone(ft.prev?.tone ?? ft.cur.tone ?? "accent", ft.cur.tone ?? "accent", ft.t) : null;

  // Column widths inside w = 900 (padX = 24 each side => 852 inner width)
  const COLS = {
    key: 176,
    value: 220,
    httpOnly: 98,
    secure: 86,
    sameSite: 104,
    size: 76,
    expires: 92,
  };

  return (
    <DevCard
      x={x}
      y={y}
      w={w}
      h={cardH}
      p={p}
      filename={filename}
      icon="database"
      right={right ?? origin}
      style={style}
    >
      {/* Storage kind tabs bar */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: switcherH,
          borderBottom: `1px solid ${C.line}`,
          background: "#FAFAFC",
          padding: `0 ${padX}px`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {TABS.map((t) => {
            const active = t === kind;
            return (
              <div
                key={t}
                style={{
                  padding: "8px 18px",
                  borderRadius: 12,
                  background: active ? BLUE_TINT : "transparent",
                  border: `1.5px solid ${active ? C.accent : "transparent"}`,
                  fontFamily: sans,
                  fontWeight: active ? 700 : 600,
                  fontSize: 20,
                  color: active ? C.accent : C.mute,
                }}
              >
                {t}
              </div>
            );
          })}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontFamily: mono,
            fontWeight: 600,
            fontSize: 18,
            color: C.mute,
          }}
        >
          <Icon name="lock" size={20} color={GREEN} weight={2.2} />
          {origin}
        </div>
      </div>

      {/* Table column headers */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: switcherH,
          height: headerH,
          borderBottom: `1px solid ${C.line}`,
          background: "#F5F5F7",
          padding: `0 ${padX}px`,
          display: "flex",
          alignItems: "center",
          fontFamily: mono,
          fontWeight: 700,
          fontSize: 16,
          color: C.mute,
        }}
      >
        <div style={{ width: COLS.key }}>Name</div>
        <div style={{ width: COLS.value }}>Value</div>
        <div style={{ width: COLS.httpOnly, textAlign: "center" }}>HttpOnly</div>
        <div style={{ width: COLS.secure, textAlign: "center" }}>Secure</div>
        <div style={{ width: COLS.sameSite, textAlign: "center" }}>SameSite</div>
        <div style={{ width: COLS.size, textAlign: "right" }}>Size</div>
        <div style={{ width: COLS.expires, textAlign: "right" }}>Expires</div>
      </div>

      {/* Gliding focus highlight band */}
      {ft && bandColors ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: bandY,
            height: rowH,
            background: bandColors.bg,
            borderLeft: `6px solid ${bandColors.edge}`,
            opacity: ft.o,
          }}
        />
      ) : null}

      {/* Storage rows */}
      {rows.map((r, i) => {
        const rowEnter = prog(frame, r.at ?? at + 5 + i * 4, 10);
        const ss = sameSiteBadge(r.sameSite);
        return (
          <div
            key={r.key}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: rowsTop + i * rowH,
              height: rowH,
              borderBottom: `1px solid ${C.line}`,
              padding: `0 ${padX}px`,
              display: "flex",
              alignItems: "center",
              fontFamily: mono,
              fontSize: 20,
              ...materialize(rowEnter),
            }}
          >
            {/* Key */}
            <div
              style={{
                width: COLS.key,
                fontWeight: 700,
                color: C.ink,
                paddingRight: 12,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {r.key}
            </div>

            {/* Value */}
            <div
              style={{
                width: COLS.value,
                fontWeight: 500,
                color: C.mute,
                paddingRight: 14,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {r.value}
            </div>

            {/* HttpOnly */}
            <div style={{ width: COLS.httpOnly, display: "flex", justifyContent: "center" }}>
              {r.httpOnly ? (
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background: tint(GREEN, 0.15),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon name="check" size={22} color="#1E7E34" weight={2.4} />
                </div>
              ) : (
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background: tint(RED, 0.1),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon name="cross" size={18} color="#C9281E" weight={2.2} />
                </div>
              )}
            </div>

            {/* Secure */}
            <div style={{ width: COLS.secure, display: "flex", justifyContent: "center" }}>
              {r.secure ? (
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background: tint(GREEN, 0.15),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon name="check" size={22} color="#1E7E34" weight={2.4} />
                </div>
              ) : (
                <span style={{ color: C.mute, fontWeight: 600 }}>—</span>
              )}
            </div>

            {/* SameSite */}
            <div style={{ width: COLS.sameSite, display: "flex", justifyContent: "center" }}>
              <span
                style={{
                  padding: "4px 12px",
                  borderRadius: 8,
                  background: ss.bg,
                  color: ss.fg,
                  fontWeight: 700,
                  fontSize: 17,
                }}
              >
                {ss.text}
              </span>
            </div>

            {/* Size */}
            <div
              style={{
                width: COLS.size,
                textAlign: "right",
                fontWeight: 600,
                fontSize: 18,
                color: C.ink,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {r.size ?? `${r.key.length + r.value.length} B`}
            </div>

            {/* Expires */}
            <div
              style={{
                width: COLS.expires,
                textAlign: "right",
                fontWeight: 600,
                fontSize: 17,
                color: C.mute,
                whiteSpace: "nowrap",
              }}
            >
              {r.expires ?? "Session"}
            </div>
          </div>
        );
      })}

      {/* Bottom status / focus callout bar */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: footerH,
          padding: `0 ${padX}px`,
          background: "#FAFAFC",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontFamily: mono,
          fontSize: 18,
          fontWeight: 600,
          color: C.mute,
        }}
      >
        <div>
          {rows.length} {kind.toLowerCase()} entries · {rows.filter((r) => r.httpOnly).length} HttpOnly
        </div>
        {ft?.cur.label && bandColors ? (
          <div
            style={{
              padding: "5px 14px",
              borderRadius: 10,
              background: bandColors.bg,
              border: `1.5px solid ${bandColors.edge}`,
              color: bandColors.fg,
              fontWeight: 700,
              ...materialize(ft.o),
            }}
          >
            {ft.cur.label}
          </div>
        ) : (
          <div>document.cookie hides HttpOnly</div>
        )}
      </div>
    </DevCard>
  );
};
