import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { AudioSamplerCard } from "../components/media/AudioSamplerCard";
import { FrameRateCompare } from "../components/media/FrameRateCompare";
import { KeyframeCurve } from "../components/media/KeyframeCurve";
import { PixelGridZoom } from "../components/media/PixelGridZoom";
import { VideoCodecFrames } from "../components/media/VideoCodecFrames";
import { TX } from "../layout";
import { Win } from "../lib/timing";
import { C, mono, prog } from "../theme";

// Preview of the media & graphics engineering group:
// 1. PixelGridZoom (0..120): Raster bitmap vs Vector cubic Bézier zoom (1× → 8×)
// 2. FrameRateCompare (120..240): 24 / 30 / 60 / 120 fps tracks + 16.67 ms vs 22 ms jank budget
// 3. KeyframeCurve (240..360): linear(0,0,1,1) vs cubic-bezier(0.22, 1, 0.36, 1) & spring inspector
// 4. VideoCodecFrames (360..480): GOP (I, P, B frames) compression + datamoshing when I-frame drops
// 5. AudioSamplerCard (480..600): Analog sine wave → 44.1 kHz sample stems → 16-bit PCM stair-steps

const Label: React.FC<{ at: number; x?: number; y: number; children: string }> = ({ at, x = TX, y, children }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        fontFamily: mono,
        fontWeight: 500,
        fontSize: 26,
        color: C.mute,
        opacity: prog(frame, at, 8),
      }}
    >
      {children}
    </div>
  );
};

export const MediaShowcase: React.FC = () => (
  <AbsoluteFill>
    <Backdrop />

    {/* 1. PixelGridZoom: Raster PNG pixel blocks vs Vector SVG cubic Bézier path */}
    <Win from={0} to={120}>
      <Label at={0} y={260}>
        PixelGridZoom · raster [R,G,B] vs vector Bézier · zoomAt 26 (1× → 8×)
      </Label>
      <PixelGridZoom
        at={2}
        x={TX}
        y={320}
        h={680}
        zoomAt={26}
        zoomDur={34}
        maxZoom={8}
      />
    </Win>

    {/* 2. FrameRateCompare: 24 / 30 / 60 / 120 fps motion + 16.67 ms budget vs 22 ms jank */}
    <Win from={120} to={240}>
      <Label at={120} y={260}>
        FrameRateCompare · 24/30/60/120 fps · jankAt 168 (22.0 ms)
      </Label>
      <FrameRateCompare
        at={122}
        x={TX}
        y={320}
        h={700}
        runAt={128}
        runDur={60}
        jankAt={168}
      />
    </Win>

    {/* 3. KeyframeCurve: linear(0,0,1,1) vs cubic-bezier(0.22, 1, 0.36, 1) & spring */}
    <Win from={240} to={360}>
      <Label at={240} y={260}>
        KeyframeCurve · linear vs cubic-bezier(0.22, 1, 0.36, 1) · playAt 252
      </Label>
      <KeyframeCurve
        at={242}
        x={TX}
        y={320}
        h={700}
        playAt={252}
        playDur={56}
        p1={[0.22, 1]}
        p2={[0.36, 1]}
        showSpring
      />
    </Win>

    {/* 4. VideoCodecFrames: H.264 / HEVC / AV1 GOP strip + datamoshing on dropped I-frame */}
    <Win from={360} to={480}>
      <Label at={360} y={260}>
        VideoCodecFrames · I (420 KB) / P (18 KB) / B (6 KB) · dropIframeAt 412
      </Label>
      <VideoCodecFrames
        at={362}
        x={TX}
        y={320}
        h={700}
        dropIframeAt={412}
      />
    </Win>

    {/* 5. AudioSamplerCard: 44.1 kHz · 16-bit PCM sampling stems + digital stair-steps */}
    <Win from={480} to={600}>
      <Label at={480} y={260}>
        AudioSamplerCard · 44.1 kHz · 16-bit PCM · sampleAt 504 · quantizeAt 522
      </Label>
      <AudioSamplerCard
        at={482}
        x={TX}
        y={320}
        h={680}
        sampleAt={504}
        quantizeAt={522}
      />
    </Win>
  </AbsoluteFill>
);
