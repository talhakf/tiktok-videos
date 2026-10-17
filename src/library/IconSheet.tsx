import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Icon, ICON_NAMES } from "../icons/Icons";
import { C, mono, prog } from "../theme";

// Every icon on one sheet (still, frame 30) and drawing on (frames 0–30) for review.
export const IconSheet: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.paper, padding: "56px 42px", display: "flex", flexDirection: "row", flexWrap: "wrap", alignContent: "flex-start", gap: 0 }}>
      {ICON_NAMES.map((n, i) => (
        <div key={n} style={{ width: 122, height: 128, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <Icon name={n} size={54} draw={prog(frame, i * 0.16, 12)} color={i % 9 === 0 ? C.accent : C.ink} />
          <div style={{ fontFamily: mono, fontSize: 15, color: C.mute }}>{n}</div>
        </div>
      ))}
    </AbsoluteFill>
  );
};
