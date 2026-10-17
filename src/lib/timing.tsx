import type { Caption } from "@remotion/captions";
import { Audio } from "@remotion/media";
import { Sequence, staticFile, useCurrentFrame } from "remotion";

// Timing helpers every video uses: beat windows, the composition length and sound-effect cues.

/** Shows children only inside [from, to). Each beat of a video is one window. */
export const Win: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({ from, to, children }) => {
  const frame = useCurrentFrame();
  return frame >= from && frame < to ? <>{children}</> : null;
};

/** Composition length: the last spoken word plus `tailMs` (the end card holds ~2.5s). */
export const durationFromCaptions = (captions: Caption[], fps: number, tailMs = 2500) =>
  Math.ceil(((captions[captions.length - 1].endMs + tailMs) / 1000) * fps);

export type SfxName = "whoosh" | "mouse-click" | "switch" | "ding" | "kaching";

// House levels: the ones git-3 and linux-mistakes shipped with, quiet under the voice.
const LEVEL: Record<SfxName, { volume: number; len: number; lead: number }> = {
  whoosh: { volume: 0.18, len: 20, lead: 4 }, // starts 4 frames early so the swoosh peaks on the cut
  "mouse-click": { volume: 0.14, len: 12, lead: 0 },
  switch: { volume: 0.3, len: 12, lead: 0 },
  ding: { volume: 0.22, len: 40, lead: 0 },
  kaching: { volume: 0.5, len: 40, lead: 0 }, // built into EndCard already
};

/** One sound effect at every frame in `at` (public/sfx/<name>.wav). `<Sfx name="whoosh" at={[T.t1, T.t2]} />` */
export const Sfx: React.FC<{ name: SfxName; at: number[]; volume?: number }> = ({ name, at, volume }) => {
  const l = LEVEL[name];
  return (
    <>
      {at.map((f, i) => (
        <Sequence key={`${name}${i}`} from={f - l.lead} durationInFrames={l.len}>
          <Audio src={staticFile(`sfx/${name}.wav`)} volume={volume ?? l.volume} />
        </Sequence>
      ))}
    </>
  );
};
