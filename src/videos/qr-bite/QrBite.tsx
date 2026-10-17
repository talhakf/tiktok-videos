import type { Caption } from "@remotion/captions";
import { Audio } from "@remotion/media";
import QRCode from "qrcode";
import { useMemo } from "react";
import { AbsoluteFill, Composition, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Backdrop } from "../../components/Backdrop";
import { Captions } from "../../components/Captions";
import { Cover, CoverStill, CX } from "../../components/Cover";
import { DataTable } from "../../components/data/DataTable";
import { Badge } from "../../components/diagram/Badge";
import { CARD_SHADOW } from "../../components/diagram/Node";
import { Circle, Note, Sticker } from "../../components/Doodles";
import { EndCard } from "../../components/EndCard";
import { Headline } from "../../components/Headline";
import { GREEN, RED } from "../../components/layouts/Mark";
import { cheatLines, SaveOutro } from "../../components/SaveOutro";
import { Callout } from "../../components/social/Callout";
import { Reaction } from "../../components/social/PunchWord";
import { ThoughtBubble } from "../../components/social/ThoughtBubble";
import { Terminal, termRing } from "../../components/Terminal";
import { QrCode, qrTerminalRows } from "../../components/text/QrCode";
import { NotificationBanner, PhoneFrame } from "../../components/windows/PhoneFrame";
import { UrlBar } from "../../components/windows/UrlBar";
import { Icon, type IconName } from "../../icons/Icons";
import { TW, TX, TY } from "../../layout";
import { makeCues } from "../../lib/cues";
import { durationFromCaptions, Sfx, Win } from "../../lib/timing";
import { C, easeInOut, H, materialize, mono, prog, sans, W } from "../../theme";
import captionsJson from "../../../public/qr-bite/captions.json";

// Sudo bit a QR code and it still scans (ISO/IEC 18004 Reed–Solomon Level H, finder patterns, qrencode).
// Verified locally with zbarimg 0.23.93: Version 4-H ("https://tiktok.com/@sudoraccoon", 33×33 = 1,089 modules)
// with a 3-tooth scalloped bite in the bottom-right corner removing 145 modules (13.3%) decodes cleanly.

const captions = captionsJson as Caption[];
const FPS = 30;
const DURATION = durationFromCaptions(captions, FPS);

const QR_URL = "https://tiktok.com/@sudoraccoon";
const SNACK_TEXT = "snacks";
const SNACK_CMD = 'qrencode -l H -t ansiutf8 "snacks"';
const SNACK_ROWS = qrTerminalRows(SNACK_TEXT, { quiet: 1, ecl: "H" });

export const QrBiteComposition = () => (
  <>
    <Composition id="QrBite" component={QrBite} durationInFrames={DURATION} fps={FPS} width={W} height={H} />
    <CoverStill id="QrBiteCover" component={QrBiteCover} />
  </>
);

const useT = () => {
  const { fps } = useVideoConfig();
  return useMemo(() => {
    const { at, last, end } = makeCues(captions, fps);
    return {
      // Beat 1: Hook
      chunk: at("chunk"),
      camera: at("camera"),
      scans: at("scans"),
      // Beat 2: Story (3 a.m. pixel cracker)
      story: at("3"),
      cracker: at("cracker"),
      bite: at("bite"),
      corner: at("corner"),
      over: at("over"),
      n13: at("13"),
      gone: at("gone"),
      why: at("why"),
      breakWord: at("break"),
      // Beat 3: Anatomy 1 — Finder patterns
      first: at("first"),
      squares: at("squares"),
      finder: at("finder"),
      three2: at("three", 2),
      up: at("up"),
      tilted: at("tilted"),
      never: at("never"),
      // Beat 4: Anatomy 2 — Reed–Solomon error correction
      second: at("second"),
      rest: at("rest"),
      link: at("link"),
      reed: at("reedsolomon"),
      nasa: at("nasa"),
      probes: at("probes"),
      survive: at("survive"),
      staticWord: at("static"),
      // Beat 5: The 4 backup levels (L, M, Q, H)
      every: at("every"),
      four2: at("four", 2),
      levelL: at("l"),
      n7: at("7"),
      levelM: at("m"),
      n15: at("15"),
      levelQ: at("q"),
      n25: at("25"),
      levelH: at("h"),
      n30: at("30"),
      scratched: at("scratched"),
      logo: at("logo"),
      bitten: at("bitten"),
      reconstructs: at("reconstructs"),
      // Beat 6: Terminal — qrencode -l H -t ansiutf8 "snacks"
      make: at("make"),
      qrencode: at("qrencode"),
      lh: at("-lh"),
      ansi: at("-tansiutf8"),
      snacks: at("snacks"),
      prints: at("prints"),
      terminal: at("terminal"),
      // Beat 7: Security reminder + CTA
      because: at("because"),
      always: at("always"),
      url: at("url"),
      preview: at("preview"),
      tap: at("tap"),
      // Beat 8: Save + EndCard
      save: at("save"),
      follow: last("follow"),
      comment: last("comment"),
      end,
    };
  }, [fps]);
};
type Cues = ReturnType<typeof useT>;

const termH = (rows: number, fs: number) => Math.ceil(rows * fs * 1.38 + 150);

const IconNote: React.FC<{
  icon: IconName;
  at: number;
  until?: number;
  x?: number;
  y: number;
  size?: number;
  tint?: string;
  children: React.ReactNode;
}> = ({ icon, at, until, x = TX, y, size = 36, tint = C.accent, children }) => {
  const frame = useCurrentFrame();
  return (
    <Note at={at} until={until} x={x} y={y} size={size}>
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <Icon name={icon} size={44} color={tint} weight={2.2} draw={prog(frame, at + 2, 14)} />
        <span>{children}</span>
      </div>
    </Note>
  );
};

// ---------------- Precomputed Version 4-H QR grid + scalloped 3-tooth bite ----------------
const QR_MOD = (() => {
  const m = QRCode.create(QR_URL, { errorCorrectionLevel: "H" }).modules;
  const n = m.size; // 33
  const rMod = 13.5; // removes 145 / 1,089 modules (13.3%), verified with zbarimg
  const teeth = [
    { cx: n - 0.5, cy: n - 0.5, r: rMod * 0.85 },
    { cx: n - rMod * 0.45, cy: n + 0.5, r: rMod * 0.65 },
    { cx: n + 0.5, cy: n - rMod * 0.45, r: rMod * 0.65 },
  ];
  const isBitten = (r: number, c: number) =>
    teeth.some((t) => Math.hypot(c + 0.5 - t.cx, r + 0.5 - t.cy) < t.r);
  const isFinder = (r: number, c: number) =>
    (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7);
  const isTiming = (r: number, c: number) =>
    !isFinder(r, c) && (r === 6 || c === 6);
  const dark = (r: number, c: number) => m.data[r * n + c] === 1;
  return { n, teeth, isBitten, isFinder, isTiming, dark };
})();

/**
 * Real scannable Level-H QR code card with a scalloped raccoon bite in the bottom-right corner.
 * Keeping the 4-module white quiet zone intact on the top/left/bottom-left/top-right and only biting
 * the bottom-right corner lets `zbarimg` and phone cameras decode `https://tiktok.com/@sudoraccoon` directly!
 */
const BittenQrCard: React.FC<{
  x: number;
  y: number;
  size: number;
  at?: number;
  until?: number;
  biteProgress?: number; // 0 = intact, 1 = bitten off
  highlightFinders?: number; // 0..1 tints the 3 7x7 finder patterns in system blue
  showEccZones?: number; // 0..1 tints backup vs data modules
  reconstruct?: number; // 0..1 rebuilds missing bitten modules in green
  tiltDeg?: number;
  maskId?: string;
}> = ({
  x,
  y,
  size,
  at = -100,
  until,
  biteProgress = 1,
  highlightFinders = 0,
  showEccZones = 0,
  reconstruct = 0,
  tiltDeg = 0,
  maskId = "qr-bite-mask",
}) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const inP = at <= 0 ? 1 : prog(frame, at, 10);
  const outP = until !== undefined ? prog(frame, until, 8) : 0;
  if (outP >= 1) return null;

  const { n, teeth, isBitten, isFinder, dark } = QR_MOD;
  const q = 4; // standard 4-module quiet zone
  const N = n + q * 2; // 41

  // Build SVG paths by module category for crisp rendering
  let normalPath = "";
  let finderPath = "";
  let eccPath = "";
  let bittenPath = "";

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (!dark(r, c)) continue;
      const cell = `M${c + q} ${r + q}h1v1h-1z`;
      if (isBitten(r, c)) {
        bittenPath += cell;
      } else if (isFinder(r, c)) {
        finderPath += cell;
      } else if ((r + c) % 2 === 0) {
        eccPath += cell;
      } else {
        normalPath += cell;
      }
    }
  }

  const baseDim = highlightFinders > 0 ? 1 - highlightFinders * 0.55 : 1;
  const finderColor = highlightFinders > 0.3 ? C.accent : C.ink;
  const eccColor = showEccZones > 0.3 ? GREEN : C.ink;

  // Scale teeth radii with biteProgress
  const bp = Math.max(0, Math.min(1, biteProgress));

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size,
        ...materialize(inP * (1 - outP), 0.96, 8),
        transform: tiltDeg !== 0 ? `rotate(${tiltDeg}deg)` : undefined,
        transformOrigin: "50% 50%",
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          background: C.white,
          borderRadius: 32,
          border: `2px solid ${C.line}`,
          boxShadow: CARD_SHADOW,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <svg width={size} height={size} viewBox={`0 0 ${N} ${N}`} shapeRendering="crispEdges" style={{ display: "block" }}>
          <defs>
            <mask id={maskId}>
              <rect x={0} y={0} width={N} height={N} fill="white" />
              {bp > 0 &&
                teeth.map((t, i) => (
                  <circle key={i} cx={t.cx + q} cy={t.cy + q} r={t.r * bp * 0.92} fill="black" shapeRendering="geometricPrecision" />
                ))}
            </mask>
          </defs>

          {/* Normal + ECC + Finder modules */}
          <path d={normalPath} fill={C.ink} opacity={baseDim} />
          <path d={eccPath} fill={eccColor} opacity={baseDim} />
          <path d={finderPath} fill={finderColor} />

          {/* Intact modules before the bite */}
          {bp < 1 ? <path d={bittenPath} fill={C.ink} opacity={1 - bp} /> : null}

          {/* Reconstructed modules inside the bite when demonstrating Reed–Solomon recovery */}
          {reconstruct > 0 ? <path d={bittenPath} fill={GREEN} opacity={reconstruct} /> : null}

          {/* Visual bite mark in the bottom-right corner */}
          {bp > 0 && reconstruct < 0.5 ? (
            <g shapeRendering="geometricPrecision">
              {teeth.map((t, i) => (
                <circle
                  key={`bg-${i}`}
                  cx={t.cx + q + 1.2}
                  cy={t.cy + q + 1.2}
                  r={t.r * bp * 0.96}
                  fill={C.paper}
                />
              ))}
              {teeth.map((t, i) => (
                <circle
                  key={`rim-${i}`}
                  cx={t.cx + q + 1.2}
                  cy={t.cy + q + 1.2}
                  r={t.r * bp * 0.96}
                  fill="none"
                  stroke={C.line}
                  strokeWidth={0.35}
                  strokeDasharray="0.9 0.6"
                />
              ))}
            </g>
          ) : null}

          {/* Finder pattern highlight rings when explaining anatomy */}
          {highlightFinders > 0 ? (
            <g shapeRendering="geometricPrecision" opacity={highlightFinders}>
              {[
                { fx: q - 0.4, fy: q - 0.4 },
                { fx: q + n - 7 - 0.4, fy: q - 0.4 },
                { fx: q - 0.4, fy: q + n - 7 - 0.4 },
              ].map((pos, idx) => (
                <rect
                  key={idx}
                  x={pos.fx}
                  y={pos.fy}
                  width={7.8}
                  height={7.8}
                  rx={1.2}
                  fill="none"
                  stroke={C.accent}
                  strokeWidth={0.55}
                />
              ))}
            </g>
          ) : null}
        </svg>
      </div>
    </div>
  );
};

// ---------------- Beat 1: Hook (0 – T.story) ----------------
const Hook: React.FC<{ T: Cues }> = ({ T }) => {
  const frame = useCurrentFrame();
  const QR_X = TX + 30;
  const QR_Y = 430;
  const QR_S = 510;
  const scanned = frame >= T.scans - 2;
  return (
    <>
      <Headline a="Sudo bit this QR code." b="Scan it — it still works." until={T.story} size={76} />
      <BittenQrCard x={QR_X} y={QR_Y} size={QR_S} biteProgress={1} maskId="hook-qr" />
      <Callout
        at={T.chunk}
        x={QR_X + QR_S + 36}
        y={QR_Y + 355}
        x2={QR_X + QR_S - 68}
        y2={QR_Y + QR_S - 68}
        side="right"
        text={"13.3% bitten\noff by Sudo"}
        size={32}
      />
      <Sticker src="raccoon/night-snack.png" at={-100} x={TX + 565} y={450} w={330} fadeBottom={60} />
      {!scanned ? (
        <IconNote icon="phone" at={-100} until={T.scans - 2} y={1000}>
          {"Point your phone camera at it →"}
        </IconNote>
      ) : (
        <IconNote icon="checkCircle" tint={GREEN} at={T.scans - 2} y={1000}>
          {"Still scans: tiktok.com/@sudoraccoon"}
        </IconNote>
      )}
    </>
  );
};

// ---------------- Beat 2: Story — 3 a.m. Pixel Cracker (T.story – T.first) ----------------
const Story: React.FC<{ T: Cues }> = ({ T }) => {
  const frame = useCurrentFrame();
  const QR_X = TX + 30;
  const QR_Y = 430;
  const QR_S = 500;
  const biteP = prog(frame, T.bite - 2, 8);
  return (
    <>
      <Headline a="3 a.m. A pixel cracker?" b="Why didn't the link break?" at={T.story} bAt={T.why - 4} size={76} />
      <BittenQrCard x={QR_X} y={QR_Y} size={QR_S} at={T.story} biteProgress={biteP} maskId="story-qr" />
      <ThoughtBubble
        at={T.cracker - 10}
        until={T.over}
        x={TX + 555}
        y={445}
        w={335}
        tx={TX + 710}
        ty={650}
        text={"3 a.m. pixel\ncracker!"}
        size={34}
      />
      <Sticker src="raccoon/night-snack.png" at={T.story + 6} x={TX + 555} y={630} w={340} fadeBottom={70} />
      <Circle at={T.corner - 4} x={QR_X + 315} y={QR_Y + 315} w={195} h={195} />
      <IconNote icon="warning" tint={RED} at={T.over} until={T.why} y={990}>
        {"145 of 1,089 modules gone (13.3%)"}
      </IconNote>
      <IconNote icon="question" tint={C.accent} at={T.why} y={990}>
        {"Why does your camera still read it?"}
      </IconNote>
      <Reaction at={T.breakWord} x={TX + 800} y={560} glyph="?" size={110} />
    </>
  );
};

// ---------------- Beat 3: Anatomy 1 — Finder patterns (T.first – T.second) ----------------
const FinderAnatomy: React.FC<{ T: Cues }> = ({ T }) => {
  const frame = useCurrentFrame();
  const QR_X = TX + 30;
  const QR_Y = 430;
  const QR_S = 500;
  const hi = prog(frame, T.squares - 4, 12);
  // Smooth tilt and return at "even if the code is tilted"
  const tiltIn = prog(frame, T.tilted - 8, 12, easeInOut);
  const tiltOut = prog(frame, T.never - 6, 12, easeInOut);
  const tiltDeg = (tiltIn - tiltOut) * 14;

  return (
    <>
      <Headline a="1/2 Finder patterns" b="Never cover the 3 corners." at={T.first} bAt={T.never - 4} size={76} />
      <BittenQrCard
        x={QR_X}
        y={QR_Y}
        size={QR_S}
        at={T.first}
        biteProgress={1}
        highlightFinders={hi}
        tiltDeg={tiltDeg}
        maskId="finder-qr"
      />
      {/* 3 finder badges on the 3 corners */}
      <Badge x={QR_X + 42} y={QR_Y + 42} icon="check" tone="blue" size={46} at={T.finder} />
      <Badge x={QR_X + QR_S - 42} y={QR_Y + 42} icon="check" tone="blue" size={46} at={T.finder + 4} />
      <Badge x={QR_X + 42} y={QR_Y + QR_S - 42} icon="check" tone="blue" size={46} at={T.finder + 8} />

      <Callout
        at={T.finder}
        until={T.three2}
        x={QR_X + QR_S + 36}
        y={QR_Y + 130}
        x2={QR_X + QR_S - 90}
        y2={QR_Y + 90}
        side="right"
        text={"3 finder squares\n(7×7 modules)"}
        size={32}
      />
      <Callout
        at={T.three2}
        x={QR_X + QR_S + 36}
        y={QR_Y + 130}
        x2={QR_X + QR_S - 70}
        y2={QR_Y + QR_S - 70}
        side="right"
        color={GREEN}
        text={"No 4th square!\nSafe to bite"}
        size={32}
      />
      <Sticker src="raccoon/pointing.png" at={T.finder + 6} x={TX + 615} y={640} w={250} flip />

      <IconNote icon="qr" at={T.squares} until={T.up} y={995}>
        {"3 corners tell the camera which way is up"}
      </IconNote>
      <IconNote icon="refresh" at={T.up} until={T.never} y={995}>
        {"Scans upside down or tilted at any angle"}
      </IconNote>
      <IconNote icon="shieldCheck" tint={RED} at={T.never} y={995}>
        {"Cover a finder corner → scan fails"}
      </IconNote>
    </>
  );
};

// ---------------- Beat 4: Anatomy 2 — Reed–Solomon Error Correction (T.second – T.every) ----------------
const ReedSolomonAnatomy: React.FC<{ T: Cues }> = ({ T }) => {
  const frame = useCurrentFrame();
  const QR_X = TX + 20;
  const QR_Y = 435;
  const QR_S = 470;
  const showEcc = prog(frame, T.reed - 4, 14);
  const rebuild = prog(frame, T.survive - 4, 18);

  const cardIn = (t: number) => materialize(prog(frame, t, 10));

  return (
    <>
      <Headline a="2/2 Reed–Solomon math" b="Backup bytes in the grid." at={T.second} bAt={T.reed - 6} size={74} />
      <BittenQrCard
        x={QR_X}
        y={QR_Y}
        size={QR_S}
        at={T.second}
        biteProgress={1}
        showEccZones={showEcc}
        reconstruct={rebuild}
        maskId="ecc-qr"
      />

      {/* Right column: Payload vs Backup + NASA Voyager card */}
      <div
        style={{
          position: "absolute",
          left: TX + 515,
          top: 435,
          width: 385,
          padding: "22px 26px",
          borderRadius: 26,
          background: C.white,
          border: `1px solid ${C.line}`,
          boxShadow: CARD_SHADOW,
          ...cardIn(T.link - 6),
        }}
      >
        <div style={{ fontSize: 24, fontWeight: 700, color: C.mute, marginBottom: 6 }}>Data modules</div>
        <div style={{ fontSize: 34, fontWeight: 700, color: C.ink, letterSpacing: "-0.02em" }}>Your text or URL</div>
        <div style={{ fontFamily: mono, fontSize: 24, color: C.accent, marginTop: 6 }}>36 data bytes</div>
      </div>

      <div
        style={{
          position: "absolute",
          left: TX + 515,
          top: 615,
          width: 385,
          padding: "22px 26px",
          borderRadius: 26,
          background: "#EAF9EE",
          border: `2px solid ${GREEN}`,
          boxShadow: CARD_SHADOW,
          ...cardIn(T.reed - 4),
        }}
      >
        <div style={{ fontSize: 24, fontWeight: 700, color: "#248A3D", marginBottom: 6 }}>Reed–Solomon backup</div>
        <div style={{ fontSize: 34, fontWeight: 700, color: C.ink, letterSpacing: "-0.02em" }}>+64 backup bytes</div>
        <div style={{ fontSize: 25, fontWeight: 600, color: "#248A3D", marginTop: 6 }}>Rebuilds missing squares</div>
      </div>

      <div
        style={{
          position: "absolute",
          left: TX + 515,
          top: 805,
          width: 385,
          padding: "20px 26px",
          borderRadius: 26,
          background: C.white,
          border: `1px solid ${C.line}`,
          boxShadow: CARD_SHADOW,
          display: "flex",
          alignItems: "center",
          gap: 18,
          ...cardIn(T.nasa - 4),
        }}
      >
        <Icon name="globe" size={50} color={C.accent} weight={2.2} draw={prog(frame, T.nasa, 14)} />
        <div>
          <div style={{ fontSize: 30, fontWeight: 700, color: C.ink, letterSpacing: "-0.02em" }}>NASA Voyager</div>
          <div style={{ fontSize: 24, fontWeight: 600, color: C.mute }}>Survives deep-space static</div>
        </div>
      </div>

      <IconNote icon="shieldCheck" tint={C.accent} at={T.rest} until={T.survive} y={965}>
        {"Every block carries algebraic backup bytes"}
      </IconNote>
      <IconNote icon="checkCircle" tint={GREEN} at={T.survive} y={965}>
        {"145 missing modules rebuilt from backup"}
      </IconNote>
    </>
  );
};

// ---------------- Beat 5: The 4 Error-Correction Levels L / M / Q / H (T.every – T.make) ----------------
const DAMAGE_CARDS: { title: string; sub: string; icon: IconName; key: "scratched" | "logo" | "bitten" }[] = [
  { title: "Scratched", sub: "Outdoor wear", icon: "bolt", key: "scratched" },
  { title: "Center logo", sub: "Brand icon in middle", icon: "star", key: "logo" },
  { title: "Raccoon bite", sub: "13.3% corner gone", icon: "pizza", key: "bitten" },
];

const FourLevels: React.FC<{ T: Cues }> = ({ T }) => {
  const frame = useCurrentFrame();
  return (
    <>
      <Headline a="4 backup levels: L, M, Q, H" b="Up to 30% backup data." at={T.every} bAt={T.levelH - 4} size={74} />
      <DataTable
        x={TX}
        y={420}
        w={TW}
        at={T.every + 4}
        rowH={80}
        size={30}
        header={["Level", "Restores", "Flag", "What it handles"]}
        widths={[0.15, 0.2, 0.19, 0.46]}
        monoCols={[0, 1, 2]}
        rowAt={[T.levelL - 4, T.levelM - 4, T.levelQ - 4, T.levelH - 4]}
        focus={[
          { at: T.levelL, row: 0 },
          { at: T.levelM, row: 1 },
          { at: T.levelQ, row: 2 },
          { at: T.levelH, row: 3 },
        ]}
        rows={[
          [{ t: "L", b: true }, "~7%", "-l L", "Clean screens (default)"],
          [{ t: "M", b: true }, "~15%", "-l M", "Everyday links & Wi-Fi"],
          [{ t: "Q", b: true }, "~25%", "-l Q", "Printed stickers"],
          [
            { t: "H", tone: "accent", b: true },
            { t: "~30%", tone: "good", b: true },
            { t: "-l H", tone: "accent", b: true },
            { t: "Logo or raccoon bite", tone: "good", b: true },
          ],
        ]}
      />

      {/* 3 damage-survival cards entering at "scratched", "logo", "bitten" */}
      {DAMAGE_CARDS.map((c, i) => {
        const startAt = T[c.key] - 2;
        if (frame < startAt) return null;
        const p = prog(frame, startAt, 10);
        return (
          <div
            key={c.key}
            style={{
              position: "absolute",
              left: TX + i * 306,
              top: 850,
              width: 288,
              height: 170,
              padding: "20px 22px",
              borderRadius: 26,
              background: C.white,
              border: `1px solid ${C.line}`,
              boxShadow: CARD_SHADOW,
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              ...materialize(p),
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Icon name={c.icon} size={42} color={C.accent} weight={2.2} draw={prog(frame, startAt + 2, 12)} />
              <span style={{ fontSize: 24, fontWeight: 700, color: GREEN }}>✓ scans</span>
            </div>
            <div>
              <div style={{ fontSize: 30, fontWeight: 700, color: C.ink, letterSpacing: "-0.02em" }}>{c.title}</div>
              <div style={{ fontSize: 22, fontWeight: 600, color: C.mute, marginTop: 2 }}>{c.sub}</div>
            </div>
          </div>
        );
      })}

      <IconNote icon="shield" at={T.levelL} until={T.reconstructs - 4} y={1060}>
        {"64 of 100 bytes are backup math"}
      </IconNote>
      <IconNote icon="checkCircle" tint={GREEN} at={T.reconstructs - 4} y={1060}>
        {"Rebuilds every single byte"}
      </IconNote>
      <Sticker src="raccoon/celebrate.png" at={T.bitten + 4} x={TX + 685} y={1025} w={205} fadeBottom={60} />
    </>
  );
};

// ---------------- Beat 6: Terminal — qrencode -l H -t ansiutf8 "snacks" (T.make – T.because) ----------------
const TERM_FS = 15;
const TERM_H = termH(25, TERM_FS); // 668 px
const TerminalBeat: React.FC<{ T: Cues }> = ({ T }) => {
  const tf = Math.max(24, T.snacks - T.qrencode + 12);
  return (
    <>
      <Headline a="Make one in the terminal" b="Run qrencode with -l H." at={T.make} bAt={T.lh - 4} size={74} />
      <Terminal
        x={TX}
        y={TY}
        w={TW}
        h={TERM_H}
        fontSize={TERM_FS}
        enterAt={T.make}
        blocks={[
          {
            at: T.qrencode - 4,
            cmd: SNACK_CMD,
            typeFrames: tf,
            outDelay: 4,
            out: SNACK_ROWS,
          },
        ]}
      />
      {/* Highlight "-l H" in the typed command */}
      <Circle at={T.lh} until={T.prints} {...termRing(TX, TY, TERM_FS, 0, "qrencode ".length, "-l H".length)} />

      {/* Crisp scannable QR card next to the terminal blocks when it prints */}
      <QrCode
        text={SNACK_TEXT}
        ecl="H"
        at={T.prints - 2}
        x={TX + TW - 340 - 36}
        y={TY + 110}
        size={340}
        mode="sweep"
        dur={18}
        label='"snacks" (Level H)'
      />

      <IconNote icon="terminal" at={T.qrencode} until={T.prints} y={TY + TERM_H + 28}>
        {"-l H = 30% backup · -t ansiutf8 = terminal blocks"}
      </IconNote>
      <IconNote icon="check" tint={GREEN} at={T.prints} y={TY + TERM_H + 28}>
        {'Scans right off the terminal → "snacks"'}
      </IconNote>
    </>
  );
};

// ---------------- Beat 7: Security Reminder (T.because – T.save) ----------------
const SecurityBeat: React.FC<{ T: Cues }> = ({ T }) => {
  const frame = useCurrentFrame();
  const PH_W = 400;
  const PH_H = 560;
  return (
    <>
      <Headline a="Anyone can print a QR." b="Read the URL preview." at={T.because} bAt={T.always - 4} size={74} />
      <PhoneFrame x={TX + 10} y={430} w={PH_W} h={PH_H} at={T.because} time="9:41">
        {/* Camera viewfinder inside the phone */}
        <div
          style={{
            position: "absolute",
            left: 75,
            top: 210,
            width: 230,
            height: 230,
            borderRadius: 28,
            border: `4px dashed ${C.accent}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#F5F5F7",
          }}
        >
          <Icon name="qr" size={130} color={C.ink} weight={2} draw={prog(frame, T.because + 4, 14)} />
        </div>
        <NotificationBanner
          x={10}
          y={56}
          w={358}
          at={T.preview - 8}
          app="Camera"
          title="Website QR Code"
          body='Open "tiktok.com" in Safari'
          icon="qr"
          tint="#FF9F0A"
        />
      </PhoneFrame>

      {/* Safe vs Danger URL preview comparison on the right */}
      <UrlBar
        url="https://tiktok.com/@sudoraccoon"
        x={TX + 435}
        y={470}
        w={465}
        size={24}
        parts="domain"
        state="safe"
        stateAt={T.preview}
        at={T.always}
      />
      <UrlBar
        url="https://login-tiktok.ru/free"
        x={TX + 435}
        y={560}
        w={465}
        size={24}
        parts="domain"
        state="danger"
        stateAt={T.tap - 8}
        at={T.preview + 4}
      />
      <Sticker src="raccoon/side-eye.png" at={T.always + 6} x={TX + 490} y={655} w={390} fadeBottom={70} />

      <IconNote icon="shieldCheck" tint={GREEN} at={T.because} y={1025}>
        {"Check the domain before you tap"}
      </IconNote>
    </>
  );
};

// ---------------- Main Video Composition ----------------
export const QrBite: React.FC = () => {
  const T = useT();
  const outroAt = T.save - 8;
  return (
    <AbsoluteFill style={{ fontFamily: sans }}>
      <Backdrop />

      <Win from={0} to={T.story}>
        <Hook T={T} />
      </Win>
      <Win from={T.story} to={T.first}>
        <Story T={T} />
      </Win>
      <Win from={T.first} to={T.second}>
        <FinderAnatomy T={T} />
      </Win>
      <Win from={T.second} to={T.every}>
        <ReedSolomonAnatomy T={T} />
      </Win>
      <Win from={T.every} to={T.make}>
        <FourLevels T={T} />
      </Win>
      <Win from={T.make} to={T.because}>
        <TerminalBeat T={T} />
      </Win>
      <Win from={T.because} to={outroAt}>
        <SecurityBeat T={T} />
      </Win>

      <SaveOutro
        at={outroAt}
        questionAt={outroAt + 8}
        h={termH(4, 24)}
        fontSize={24}
        lines={cheatLines(
          [
            ["qrencode -l H -t ansiutf8", "30% backup QR"],
            ["Level L / M / Q / H", "7 / 15 / 25 / 30%"],
            ["3 corner squares", "finder patterns"],
            ["Camera URL banner", "check before tap"],
          ],
          28,
        )}
        sub="brew install qrencode · apt install qrencode"
        question={"Did the bitten QR\ncode scan for you?"}
      />
      <EndCard
        at={T.follow}
        comment={T.comment}
        question="Did the bitten QR code scan for you?"
        line="Follow for more terminal tricks."
      />

      <Captions captions={captions} top={1340} />

      <Audio src={staticFile("qr-bite/voice.mp3")} />
      <Sfx name="whoosh" at={[T.story, T.first, T.second, T.every, T.make, T.because, outroAt, T.follow]} />
      <Sfx name="mouse-click" at={[T.bite, T.finder, T.reed, T.levelL, T.levelM, T.levelQ, T.levelH, T.qrencode]} />
      <Sfx name="ding" at={[T.scans, T.survive, T.reconstructs, T.prints]} />
    </AbsoluteFill>
  );
};

// ---------------- Cover (1080×1440) ----------------
export const QrBiteCover: React.FC = () => (
  <Cover
    title="Sudo bit this QR code."
    sub="Scan it — it still works."
    size={88}
    chips={["Level H · 30%", "finder squares", "qrencode"]}
  >
    <BittenQrCard x={CX + 20} y={535} size={490} biteProgress={1} maskId="cover-qr" />
    <Callout
      at={-100}
      x={CX + 545}
      y={875}
      x2={CX + 20 + 490 - 65}
      y2={535 + 490 - 65}
      side="right"
      text={"13.3% bitten\noff by Sudo"}
      size={32}
    />
    <Sticker src="raccoon/night-snack.png" at={-100} x={CX + 540} y={515} w={350} fadeBottom={65} />
  </Cover>
);
