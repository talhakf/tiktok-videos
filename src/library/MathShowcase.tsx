import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { AMBER } from "../components/dev/card";
import { GREEN } from "../components/diagram/Node";
import { BaseConverter } from "../components/math/BaseConverter";
import { BitwiseCard } from "../components/math/BitwiseCard";
import { ColorHexCard } from "../components/math/ColorHexCard";
import { FormulaCard } from "../components/math/FormulaCard";
import { UnicodeCard } from "../components/math/UnicodeCard";
import { TX } from "../layout";
import { Win } from "../lib/timing";
import { C, mono, prog } from "../theme";

// Preview of the math, numbers, encodings & color group:
// 1. BaseConverter (0..120)
// 2. BitwiseCard (120..240)
// 3. UnicodeCard (240..360)
// 4. ColorHexCard (360..480)
// 5. FormulaCard (480..600)

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

export const MathShowcase: React.FC = () => (
  <AbsoluteFill>
    <Backdrop />

    {/* 1. BaseConverter: synchronized dec / bin / hex / oct with place-value powers */}
    <Win from={0} to={120}>
      <Label at={0} y={255}>
        BaseConverter · dec / bin / hex / oct · steps 30, 62, 92
      </Label>
      <BaseConverter
        at={2}
        x={TX}
        y={310}
        h={630}
        filename="base-converter.ts"
        values={[
          { at: 2, num: 42, label: "answer (42)" },
          { at: 30, num: 65, label: "ascii 'A' (65)" },
          { at: 62, num: 170, label: "alternating 0xAA" },
          { at: 92, num: 255, label: "max uint8 (0xFF)" },
        ]}
      />
    </Win>

    {/* 2. BitwiseCard: column-by-column bit evaluation & #0071E3 1-bit highlights */}
    <Win from={120} to={240}>
      <Label at={120} y={255}>
        BitwiseCard · AND (&) · mask low nibble · evalAt 136
      </Label>
      <BitwiseCard
        at={122}
        x={TX}
        y={305}
        h={510}
        op="AND"
        a={0b10101100}
        b={0b00001111}
        evalAt={136}
        filename="mask.c"
      />
      <Label at={128} y={855}>
        BitwiseCard · XOR (^) · dark · toggle bits · evalAt 164
      </Label>
      <BitwiseCard
        at={130}
        x={TX}
        y={905}
        h={510}
        dark
        op="XOR"
        a={0b11001010}
        b={0b01011110}
        evalAt={164}
        filename="cipher.c"
      />
    </Win>

    {/* 3. UnicodeCard: char / emoji → code point → UTF-8 multi-byte encoding */}
    <Win from={240} to={360}>
      <Label at={240} y={255}>
        UnicodeCard · char → code point → utf-8 (1 to 4 bytes)
      </Label>
      <UnicodeCard
        at={242}
        x={TX}
        y={310}
        filename="utf8.txt"
        items={[
          {
            char: "A",
            name: "latin capital a",
            codePoint: "U+0041",
            utf8Hex: ["41"],
            utf8Bits: "01000001",
            bytes: 1,
            at: 248,
          },
          {
            char: "é",
            name: "latin small e acute",
            codePoint: "U+00E9",
            utf8Hex: ["C3", "A9"],
            utf8Bits: "11000011 10101001",
            bytes: 2,
            at: 262,
          },
          {
            char: "€",
            name: "euro sign",
            codePoint: "U+20AC",
            utf8Hex: ["E2", "82", "AC"],
            utf8Bits: "11100010 10000010 10101100",
            bytes: 3,
            at: 276,
          },
          {
            char: "🦝",
            name: "sudo the raccoon",
            codePoint: "U+1F99D",
            utf8Hex: ["F0", "9F", "A6", "9D"],
            utf8Bits: "11110000 10011111 10100110 10011101",
            bytes: 4,
            at: 290,
          },
        ]}
      />
    </Win>

    {/* 4. ColorHexCard: #0071E3 → RGB channels breakdown with animated color steps */}
    <Win from={360} to={480}>
      <Label at={360} y={255}>
        ColorHexCard · #0071E3 → #FF3B30 → #34C759
      </Label>
      <ColorHexCard
        at={362}
        x={TX}
        y={310}
        h={560}
        hex="#0071E3"
        name="system blue"
        steps={[
          { at: 396, hex: "#FF3B30", name: "system red" },
          { at: 432, hex: "#34C759", name: "system green" },
        ]}
      />
    </Win>

    {/* 5. FormulaCard: password entropy & Amdahl's Law with leader lines and solveAt */}
    <Win from={480} to={600}>
      <Label at={480} y={255}>
        FormulaCard · password entropy · E = L × log₂(R) · solveAt 514
      </Label>
      <FormulaCard
        at={482}
        x={TX}
        y={305}
        h={520}
        title="password entropy"
        filename="entropy.math"
        solveAt={514}
        substitution="12 × log₂(62) = 12 × 5.954"
        result="E = 71.4 bits"
        terms={[
          { sym: "E", label: "entropy (bits)", value: "71.4 bits", color: C.accent, at: 488 },
          { sym: " = ", label: "" },
          { sym: "L", label: "password length", value: "12 chars", color: GREEN, at: 494 },
          { sym: " × ", label: "" },
          { sym: "log₂(R)", label: "pool bits (R = 62)", value: "5.95 bits", color: AMBER, at: 500 },
        ]}
      />
      <Label at={488} y={865}>
        FormulaCard · amdahl's law · S = 1 / (1 - p + p/N) · solveAt 542
      </Label>
      <FormulaCard
        at={490}
        x={TX}
        y={915}
        h={520}
        dark
        title="amdahl's law"
        filename="amdahl.math"
        solveAt={542}
        substitution="1 / (1 - 0.90 + 0.90 / 8)"
        result="S = 4.71× speedup"
        terms={[
          { sym: "S", label: "max speedup", value: "4.71×", color: C.accent, at: 498 },
          { sym: " = 1 / (1 - ", label: "" },
          { sym: "p", label: "parallel fraction", value: "0.90 (90%)", color: GREEN, at: 506 },
          { sym: " + p / ", label: "" },
          { sym: "N", label: "cpu cores", value: "8 cores", color: AMBER, at: 514 },
          { sym: ")", label: "" },
        ]}
      />
    </Win>
  </AbsoluteFill>
);
