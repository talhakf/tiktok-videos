import { Audio } from "@remotion/media";
import { Img, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BRAND } from "../brand/config";
import { appleSpring, C, easeInOut, GLASS, materialize, prog, sans, SHADOW_WINDOW, UNIT } from "../theme";

// Closing call to action, the last ~3s of every video: follow, save, comment.
// The follow button is the TikTok avatar badge (a plus under the profile picture that turns into a checkmark
// when tapped); Instagram viewers read it the same way. A fingertip taps it (ka-ching, public/sfx/kaching.wav from
// scripts/sfx.py), then Save and Comment light up.
// Everything sits between y 330 and 1300, clear of TikTok's UI and of the captions.

const CX = 540; // centre column
const AV = 280; // avatar diameter
const AV_TOP = 360;
const BADGE = 88;

const Plus: React.FC<{ p: number }> = ({ p }) => (
  <svg width={44} height={44} viewBox="0 0 44 44" style={{ position: "absolute", ...materialize(1 - p, 1, 6), rotate: `${p * 90}deg` }}>
    <path d="M22 8 V36 M8 22 H36" stroke={C.white} strokeWidth={7} strokeLinecap="round" />
  </svg>
);

/** Checkmark drawn stroke by stroke (dash offset), p 0→1. */
const Check: React.FC<{ p: number; color?: string; size?: number }> = ({ p, color = C.white, size = 44 }) => (
  <svg width={size} height={size} viewBox="0 0 44 44" style={{ position: "absolute" }}>
    <path
      d="M9 23 L18 32 L35 13"
      fill="none"
      stroke={color}
      strokeWidth={7}
      strokeLinecap="round"
      strokeLinejoin="round"
      pathLength={1}
      strokeDasharray={1}
      strokeDashoffset={1 - p}
    />
  </svg>
);

const Bookmark: React.FC<{ fill: number }> = ({ fill }) => (
  <svg width={40} height={52} viewBox="0 0 40 52">
    <path d="M5 4 H35 V48 L20 37 L5 48 Z" fill={C.accent} fillOpacity={fill} stroke={C.accent} strokeWidth={5} strokeLinejoin="round" />
  </svg>
);

const Speech: React.FC<{ fill: number }> = ({ fill }) => (
  <svg width={48} height={46} viewBox="0 0 48 46">
    <path
      d="M24 4 C36 4 44 11 44 20 C44 29 36 36 24 36 C21 36 18 35.5 15.5 34.6 L6 41 L8.5 31.5 C5.6 28.5 4 24.4 4 20 C4 11 12 4 24 4 Z"
      fill={C.accent}
      fillOpacity={fill}
      stroke={C.accent}
      strokeWidth={5}
      strokeLinejoin="round"
    />
  </svg>
);

/** One action row (icon + label) that "activates" at `on`: the icon fills with a short press. */
const Action: React.FC<{ at: number; on: number; icon: (fill: number) => React.ReactNode; label: string }> = ({ at, on, icon, label }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = prog(frame, at, 10);
  const fill = prog(frame, on, 6);
  const pop = frame < on ? 0 : 1 - appleSpring(frame - on, fps, { response: 0.35, damping: 0.8 });
  return (
    <div
      style={{
        ...GLASS,
        background: C.white,
        display: "flex",
        alignItems: "center",
        gap: 20,
        padding: "22px 34px",
        borderRadius: 999,
        ...materialize(p, 0.94, 8),
        translate: `${(1 - p) * 40}px 0px`,
      }}
    >
      <span style={{ display: "flex", scale: String(1 + pop * 0.18) }}>{icon(fill)}</span>
      <span style={{ fontFamily: sans, fontWeight: 600, fontSize: 44, letterSpacing: "-0.02em", color: C.ink }}>{label}</span>
    </div>
  );
};

type EndCardProps = {
  at: number; // card enters (anchor to the spoken "follow")
  follow?: number; // fingertip taps the badge
  save?: number; // bookmark fills (anchor to "save")
  comment?: number; // speech bubble fills (anchor to "comment" / "tell")
  handle?: string; // channel handle (defaults to BRAND.handle)
  avatar?: string; // avatar path in public/ (defaults to BRAND.avatar)
  line?: string; // grey line under the handle
  question?: string; // the comment prompt (same as the iMessage bubble)
};

export const EndCard: React.FC<EndCardProps> = (props) => {
  const follow = props.follow ?? props.at + 18;
  return (
    <>
      {/* ka-ching lands with the checkmark (it starts drawing at follow + 6) */}
      <Sequence from={follow + 5} durationInFrames={42}>
        <Audio src={staticFile("sfx/kaching.wav")} volume={0.5} />
      </Sequence>
      <Card {...props} follow={follow} />
    </>
  );
};

const Card: React.FC<EndCardProps & { follow: number }> = ({
  at,
  follow,
  save = follow + 22,
  comment = save + 14,
  handle = BRAND.handle,
  avatar = BRAND.avatar,
  line = BRAND.tagline,
  question,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at) return null;

  const cover = prog(frame, at, 12); // page wipes the outro away (blur bridges the swap)
  const av = prog(frame, at + 4, 12);
  const text = prog(frame, at + 8, 10);

  // fingertip: glides in from the lower right, presses, lifts away
  const tipIn = prog(frame, follow - 12, 12, easeInOut);
  const down = frame < follow ? 0 : frame < follow + 4 ? prog(frame, follow, 4) : 1 - appleSpring(frame - follow - 4, fps, { response: 0.3 });
  const tipOut = prog(frame, follow + 10, 10);
  const ripple = prog(frame, follow, 14);
  const morph = prog(frame, follow + 2, 8, easeInOut);
  const badgeX = CX - BADGE / 2;
  const badgeY = AV_TOP + AV - BADGE / 2 - 6;
  const tipX = interpolate(tipIn, [0, 1], [CX + 260, CX + 8]) + tipOut * 80;
  const tipY = interpolate(tipIn, [0, 1], [badgeY + 300, badgeY + 26]) + tipOut * 60;

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", inset: 0, background: C.paper, opacity: cover, backdropFilter: `blur(${cover * 12}px)` }} />

      {/* avatar */}
      <div
        style={{
          position: "absolute",
          left: CX - AV / 2,
          top: AV_TOP,
          width: AV,
          height: AV,
          borderRadius: "50%",
          overflow: "hidden",
          border: `8px solid ${C.white}`,
          boxShadow: SHADOW_WINDOW,
          ...materialize(av),
        }}
      >
        <Img src={staticFile(avatar)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 30%" }} />
      </div>

      {/* follow badge: plus → checkmark */}
      <div
        style={{
          position: "absolute",
          left: badgeX,
          top: badgeY,
          width: BADGE,
          height: BADGE,
          borderRadius: "50%",
          background: C.accent,
          border: `6px solid ${C.white}`,
          display: "flex",
          alignItems: "center",
          alignContent: "center",
          justifyContent: "center",
          ...materialize(prog(frame, at + 10, 10), 0.9, 6),
          scale: String((0.9 + 0.1 * prog(frame, at + 10, 10)) * (1 - down * 0.12)),
        }}
      >
        <Plus p={morph} />
        <Check p={prog(frame, follow + 6, 8)} />
      </div>
      {/* tap ripple */}
      {frame >= follow ? (
        <div
          style={{
            position: "absolute",
            left: CX - 70,
            top: badgeY + BADGE / 2 - 70,
            width: 140,
            height: 140,
            borderRadius: "50%",
            border: `4px solid ${C.accent}`,
            opacity: 0.5 * (1 - ripple),
            scale: String(0.6 + 0.6 * ripple),
          }}
        />
      ) : null}

      {/* handle + line */}
      <div style={{ position: "absolute", left: 90, width: 900, top: AV_TOP + AV + 70, textAlign: "center", ...materialize(text, 1, 8) }}>
        <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 76, letterSpacing: "-0.045em", color: C.ink }}>{handle}</div>
        <div style={{ marginTop: 10, fontFamily: sans, fontWeight: 600, fontSize: 42, letterSpacing: "-0.02em", color: C.mute }}>{line}</div>
      </div>

      {/* save + comment */}
      <div style={{ position: "absolute", left: 90, width: 900, top: 1000, display: "flex", justifyContent: "center", gap: 24 }}>
        <Action at={follow + 8} on={save} icon={(f) => <Bookmark fill={f} />} label="Save" />
        <Action at={follow + 8 + 2} on={comment} icon={(f) => <Speech fill={f} />} label="Comment" />
      </div>
      {question ? (
        <div
          style={{
            position: "absolute",
            left: 90,
            width: 900,
            top: 1135,
            textAlign: "center",
            fontFamily: sans,
            fontWeight: 600,
            fontSize: 40,
            letterSpacing: "-0.02em",
            color: C.mute,
            ...materialize(prog(frame, comment, UNIT), 1, 6),
          }}
        >
          {question}
        </div>
      ) : null}

      {/* fingertip */}
      {frame >= follow - 12 && tipOut < 1 ? (
        <div
          style={{
            position: "absolute",
            left: tipX - 36,
            top: tipY - 36,
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "rgba(29,29,31,0.22)",
            border: `3px solid ${C.white}`,
            boxShadow: "0 10px 24px rgba(0,0,0,0.18)",
            opacity: tipIn * (1 - tipOut),
            scale: String(1 - down * 0.15),
          }}
        />
      ) : null}
    </div>
  );
};
