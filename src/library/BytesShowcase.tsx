import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { AvalancheGrid } from "../components/bytes/AvalancheGrid";
import { ByteMap } from "../components/bytes/ByteMap";
import { ChmodCalc } from "../components/bytes/ChmodCalc";
import { FloatLayout } from "../components/bytes/FloatLayout";
import { HexDump } from "../components/bytes/HexDump";
import { InodeMap } from "../components/bytes/InodeMap";
import { LzTokens } from "../components/bytes/LzTokens";
import { TX } from "../layout";
import { Win } from "../lib/timing";
import { C, mono, prog } from "../theme";

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

export const BytesShowcase: React.FC = () => (
  <AbsoluteFill>
    <Backdrop />

    {/* 1. HexDump: dark PNG header + light disguised ZIP */}
    <Win from={0} to={90}>
      <Label at={0} y={255}>
        HexDump · dark · PNG magic bytes (18) + IHDR chunk (42)
      </Label>
      <HexDump
        at={2}
        x={TX}
        y={310}
        dark
        filename="photo.png"
        right="24 B"
        bytes={[
          0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
          0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
          0x00, 0x00, 0x04, 0x38, 0x00, 0x00, 0x07, 0x80,
        ]}
        highlights={[
          { from: 0, to: 7, at: 18, label: "PNG magic bytes", tone: "accent" },
          { from: 12, to: 15, at: 42, label: "IHDR chunk", tone: "good" },
        ]}
      />

      <Label at={10} y={765}>
        HexDump · light · disguised ZIP header inside .jpg (30)
      </Label>
      <HexDump
        at={12}
        x={TX}
        y={820}
        dark={false}
        filename="vacation.jpg"
        headerBadge={{ text: "actually a ZIP!", tone: "bad", at: 32 }}
        bytes={[
          0x50, 0x4b, 0x03, 0x04, 0x14, 0x00, 0x00, 0x00,
          0x08, 0x00, 0x6d, 0x61, 0x70, 0x2e, 0x74, 0x78,
        ]}
        highlights={[
          { from: 0, to: 3, at: 30, label: "PK · ZIP header", tone: "bad" },
          { from: 10, to: 15, at: 50, label: "map.tx filename", tone: "warn" },
        ]}
      />
    </Win>

    {/* 2. ByteMap: JPEG + ZIP polyglot file layout */}
    <Win from={90} to={175}>
      <Label at={90} y={255}>
        ByteMap · JPEG + ZIP polyglot · focus 118 → 144
      </Label>
      <ByteMap
        at={92}
        x={TX}
        y={310}
        title="meme.jpg (polyglot)"
        totalSize="48.2 KB"
        sections={[
          {
            label: "JPEG image stream",
            sub: "SOI header, EXIF & compressed scanlines",
            magic: "FF D8 ... FF D9",
            range: "0x0000..0x63FF",
            share: 54,
            tone: "accent",
            icon: "file",
            readDir: "down",
          },
          {
            label: "ZIP compressed entries",
            sub: "local file headers + deflate payload",
            magic: "50 4B 03 04",
            range: "0x6400..0xB9FF",
            share: 32,
            tone: "good",
            icon: "box",
          },
          {
            label: "ZIP central directory",
            sub: "end of central directory record (EOCD)",
            magic: "50 4B 05 06",
            range: "0xBA00..0xC080",
            share: 14,
            tone: "warn",
            icon: "key",
            readDir: "up",
          },
        ]}
        focus={[
          { index: 0, at: 118, note: "image viewer reads top → down from 0x0000 and stops at FF D9" },
          { index: 2, at: 144, note: "unzip scans bottom → up from EOF to find 50 4B 05 06" },
        ]}
      />
    </Win>

    {/* 3. InodeMap: unlink vs /proc fd recovery vs shred */}
    <Win from={175} to={265}>
      <Label at={175} y={255}>
        InodeMap · unlinkAt 202 · fdProc 222 · shredAt 244
      </Label>
      <InodeMap
        at={177}
        x={TX}
        y={310}
        filename="map.txt"
        inode={291449}
        size="16.0 KB"
        blocks={["secret", "3am", "trash", "map"]}
        unlinkAt={202}
        fdProc={{ path: "/proc/1148/fd/3", at: 222 }}
        shredAt={244}
      />
    </Win>

    {/* 4. ChmodCalc: 644 -> 755 -> 777 danger */}
    <Win from={265} to={350}>
      <Label at={265} y={255}>
        ChmodCalc · 644 → 755 (290) → 777 world-writable (318)
      </Label>
      <ChmodCalc
        at={267}
        x={TX}
        y={310}
        mode="644"
        targetName="deploy.sh"
        steps={[
          { at: 290, mode: "755", label: "owner rwx · executable" },
          { at: 318, mode: "777", label: "world-writable!", danger: true },
        ]}
      />
    </Win>

    {/* 5. FloatLayout: IEEE 754 0.1 + 0.2 = 0.30000000000000004 */}
    <Win from={350} to={435}>
      <Label at={350} y={255}>
        FloatLayout · IEEE 754 · chopAt 376 · sumAt 398
      </Label>
      <FloatLayout
        at={352}
        x={TX}
        y={310}
        label="0.1"
        repeatChunk="0011"
        chopAt={376}
        sumAt={398}
      />
    </Win>

    {/* 6. AvalancheGrid: SHA-256 1-char change -> 50% bits flipped */}
    <Win from={435} to={520}>
      <Label at={435} y={255}>
        AvalancheGrid · SHA-256 · diffAt 462 (128 / 256 bits)
      </Label>
      <AvalancheGrid
        at={437}
        x={TX}
        y={310}
        algo="SHA-256"
        inputA="snacks"
        inputB="snackS"
        hashA="8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4"
        hashB="3c91a4e0b72d58f1a29674e8c03d5b19f472e6018b3c9d4e7f12a5086b9e3d1c"
        diffAt={462}
        bitsFlipped={128}
        totalBits={256}
      />
    </Win>

    {/* 7. LzTokens: DEFLATE sliding-window back-references */}
    <Win from={520} to={600}>
      <Label at={520} y={255}>
        LzTokens · compressAt 548 · 35,000 B → 181 B
      </Label>
      <LzTokens
        at={522}
        x={TX}
        y={310}
        title="DEFLATE · LZ77 sliding window"
        compressAt={548}
        beforeBytes={35000}
        afterBytes={181}
        tokens={[
          { kind: "lit", text: "snack " },
          { kind: "ref", back: 6, len: 18, preview: "snack snack snack " },
          { kind: "lit", text: "time!" },
        ]}
      />
    </Win>
  </AbsoluteFill>
);
