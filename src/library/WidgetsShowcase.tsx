import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { AMBER } from "../components/dev/card";
import { GREEN, RED } from "../components/diagram/Node";
import { ActivityMonitor } from "../components/widgets/ActivityMonitor";
import { AudioTrackCard } from "../components/widgets/AudioTrackCard";
import { CalendarGrid } from "../components/widgets/CalendarGrid";
import { PermissionPrompt } from "../components/widgets/PermissionPrompt";
import { SliderCard } from "../components/widgets/SliderCard";
import { TW, TX } from "../layout";
import { Win } from "../lib/timing";
import { C, mono, prog } from "../theme";

// Preview of the Desktop, Mobile & Modern App Widgets (src/components/widgets/).
// Five 120-frame sections across 600 frames:
// 1. PermissionPrompt (0..120)
// 2. ActivityMonitor (120..240)
// 3. AudioTrackCard (240..360)
// 4. CalendarGrid (360..480)
// 5. SliderCard (480..600)

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
        fontSize: 25,
        color: C.mute,
        opacity: prog(frame, at, 8),
      }}
    >
      {children}
    </div>
  );
};

export const WidgetsShowcase: React.FC = () => (
  <AbsoluteFill>
    <Backdrop />

    {/* 1. PermissionPrompt: macOS deny & iOS allow */}
    <Win from={0} to={120}>
      <Label at={0} y={248}>
        PermissionPrompt mac · microphone · deny at 56
      </Label>
      <PermissionPrompt
        at={4}
        until={114}
        y={298}
        app="snack-calc"
        permission="microphone"
        appIcon="hash"
        appTile="#1D1D1F"
        explanation="A calculator app is requesting live microphone audio access."
        detail="/Applications/snack-calc.app/Contents/MacOS/calc"
        choice="deny"
        pressAt={56}
      />

      <Label at={10} y={888}>
        PermissionPrompt ios · local network · allow at 84
      </Label>
      <PermissionPrompt
        at={14}
        until={114}
        y={938}
        variant="ios"
        app="Termius"
        permission="network"
        appIcon="terminal"
        appTile={C.accent}
        explanation="Discover and connect to SSH servers on your local Wi-Fi network."
        choice="allow"
        pressAt={84}
      />
    </Win>

    {/* 2. ActivityMonitor: select runaway process & kill at 178 */}
    <Win from={120} to={240}>
      <Label at={120} y={250}>
        ActivityMonitor · select hog 140 · quit process at 178 (99% → 4%)
      </Label>
      <ActivityMonitor
        at={124}
        until={234}
        x={TX}
        y={306}
        w={TW}
        h={650}
        selectHogAt={140}
        killAt={178}
        cpuBefore={99}
        cpuAfter={4}
      />
    </Win>

    {/* 3. AudioTrackCard: waveform scrubhead + -14 LUFS & auto-ducking */}
    <Win from={240} to={360}>
      <Label at={240} y={250}>
        AudioTrackCard · play at 254 · -14 LUFS + music auto-ducking
      </Label>
      <AudioTrackCard
        at={244}
        until={354}
        x={TX}
        y={304}
        w={TW}
        h={476}
        title="voiceover-take3.wav"
        subtitle="48 kHz · 24-bit mono · normalized"
        lufs="-14.0 LUFS"
        playAt={254}
        playDur={86}
      />

      <Label at={248} y={836}>
        AudioTrackCard dark · background stem loop
      </Label>
      <AudioTrackCard
        at={252}
        until={354}
        x={TX}
        y={890}
        w={TW}
        h={350}
        dark
        showDucking={false}
        icon="speaker"
        title="lofi-study-bed.mp3"
        subtitle="Stereo stem · ducked -12 dB under voice"
        lufs="-24.0 LUFS"
        playAt={260}
        playDur={82}
      />
    </Win>

    {/* 4. CalendarGrid: monthly cron backups, failure day, and release ring */}
    <Win from={360} to={480}>
      <Label at={360} y={250}>
        CalendarGrid · cron streak (good/bad) + release milestones (ring/accent)
      </Label>
      <CalendarGrid
        at={364}
        until={474}
        x={TX}
        y={306}
        w={TW}
        month="October 2026"
        subtitle="cron: 0 3 * * * · pg_dump"
        daysInMonth={31}
        startDay={3}
        marks={[
          { day: 1, kind: "good", label: "ok", at: 374 },
          { day: 2, kind: "good", label: "ok", at: 377 },
          { day: 3, kind: "good", label: "ok", at: 380 },
          { day: 4, kind: "good", label: "ok", at: 383 },
          { day: 5, kind: "good", label: "ok", at: 386 },
          { day: 6, kind: "good", label: "ok", at: 389 },
          { day: 7, kind: "bad", label: "disk full", at: 394 },
          { day: 8, kind: "good", label: "fixed", at: 404 },
          { day: 9, kind: "good", label: "ok", at: 408 },
          { day: 10, kind: "good", label: "ok", at: 411 },
          { day: 14, kind: "ring", label: "today", at: 416 },
          { day: 21, kind: "accent", label: "rc.1", at: 424 },
          { day: 29, kind: "accent", label: "ship v2", at: 432 },
        ]}
      />
    </Win>

    {/* 5. SliderCard: smooth keyframe-gliding Apple-style parameter sliders */}
    <Win from={480} to={600}>
      <Label at={480} y={250}>
        SliderCard · keyframes at 498, 528, 558
      </Label>
      <SliderCard
        at={484}
        until={594}
        x={TX}
        y={306}
        w={TW}
        title="Render & audio parameters"
        subtitle="preset: reels-1080p"
        sliders={[
          {
            label: "Video bitrate",
            unit: "Mbps",
            min: 2,
            max: 24,
            icon: "film",
            color: C.accent,
            keys: [
              { at: 484, value: 8 },
              { at: 498, value: 18 },
              { at: 556, value: 14 },
            ],
          },
          {
            label: "Model temperature",
            min: 0,
            max: 1,
            decimals: 2,
            icon: "sparkle",
            color: GREEN,
            keys: [
              { at: 484, value: 0.7 },
              { at: 512, value: 0.2 },
              { at: 558, value: 0.35 },
            ],
          },
          {
            label: "Music ducking",
            unit: "dB",
            min: -36,
            max: 0,
            icon: "waveform",
            color: AMBER,
            keys: [
              { at: 484, value: -8 },
              { at: 526, value: -24 },
            ],
          },
          {
            label: "CPU thread cap",
            unit: "%",
            min: 10,
            max: 100,
            icon: "cpu",
            color: RED,
            keys: [
              { at: 484, value: 95 },
              { at: 540, value: 35 },
            ],
          },
        ]}
      />
    </Win>
  </AbsoluteFill>
);
