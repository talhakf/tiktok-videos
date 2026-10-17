import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { BorrowChecker } from "../components/lang/BorrowChecker";
import { ClosureScope } from "../components/lang/ClosureScope";
import { GarbageCollector } from "../components/lang/GarbageCollector";
import { TypeLattice } from "../components/lang/TypeLattice";
import { VTableDispatch } from "../components/lang/VTableDispatch";
import { TX } from "../layout";
import { Win } from "../lib/timing";
import { C, mono, prog } from "../theme";

// Preview of the lang group (600 frames @ 30fps):
// 0..120:   BorrowChecker (Rust ownership move, shared &T vs exclusive &mut T)
// 120..240: GarbageCollector (Mark-and-sweep reachability wave + sweep reclamation)
// 240..360: TypeLattice (TypeScript control-flow union type narrowing)
// 360..480: ClosureScope (Stack frame pop vs heap lexical environment backpack)
// 480..600: VTableDispatch (Trait object fat pointer + vtable lookup vs static dispatch)

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

export const LangShowcase: React.FC = () => (
  <AbsoluteFill>
    <Backdrop />

    {/* 1. BorrowChecker: Rust ownership move, shared borrows (&T), and mutable conflict (&mut T) */}
    <Win from={0} to={120}>
      <Label at={0} y={260}>
        BorrowChecker · move 26 · shared &amp;s2 54 · &amp;mut conflict 82
      </Label>
      <BorrowChecker
        at={2}
        x={TX}
        y={320}
        moveAt={26}
        sharedAt={54}
        mutAt={82}
      />
    </Win>

    {/* 2. GarbageCollector: Mark-and-Sweep reachability wave from Stack Roots + Sweep */}
    <Win from={120} to={240}>
      <Label at={120} y={260}>
        GarbageCollector · markAt 148 · sweepAt 186
      </Label>
      <GarbageCollector
        at={122}
        x={TX}
        y={320}
        markAt={148}
        sweepAt={186}
      />
    </Win>

    {/* 3. TypeLattice: TypeScript control-flow union narrowing string | number | null -> string */}
    <Win from={240} to={360}>
      <Label at={240} y={260}>
        TypeLattice · guard1At 268 (null) · guard2At 302 (number → string)
      </Label>
      <TypeLattice
        at={242}
        x={TX}
        y={320}
        guard1At={268}
        guard2At={302}
      />
    </Win>

    {/* 4. ClosureScope: Outer stack frame pops while Heap Closure backpack persists */}
    <Win from={360} to={480}>
      <Label at={360} y={260}>
        ClosureScope · returnAt 386 · inc() 414 → 1 · inc() 444 → 2
      </Label>
      <ClosureScope
        at={362}
        x={TX}
        y={320}
        returnAt={386}
        call1At={414}
        call2At={444}
      />
    </Win>

    {/* 5. VTableDispatch: Fat pointer (data_ptr + vptr) & vtable vs static dispatch */}
    <Win from={480} to={600}>
      <Label at={480} y={260}>
        VTableDispatch · lookupAt 508 · compareAt 544
      </Label>
      <VTableDispatch
        at={482}
        x={TX}
        y={320}
        lookupAt={508}
        compareAt={544}
      />
    </Win>
  </AbsoluteFill>
);
