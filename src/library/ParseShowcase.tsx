import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { AstView } from "../components/parse/AstView";
import { LexerTokens } from "../components/parse/LexerTokens";
import { RegexCard } from "../components/parse/RegexCard";
import { SemverCard } from "../components/parse/SemverCard";
import { StateMachine } from "../components/parse/StateMachine";
import { TX } from "../layout";
import { Win } from "../lib/timing";
import { C, mono, prog } from "../theme";

// Preview of the parse / compiler / regex group (600 frames @ 30fps):
// 0..120: RegexCard, 120..240: LexerTokens, 240..360: AstView, 360..480: StateMachine, 480..600: SemverCard.

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

export const ParseShowcase: React.FC = () => (
  <AbsoluteFill>
    <Backdrop />

    {/* 1. RegexCard: live pattern breakdown + highlighted matches + capture group pills */}
    <Win from={0} to={120}>
      <Label at={0} y={255}>
        RegexCard · /pattern/flags · match spans · capture groups $1 $2 $3
      </Label>
      <RegexCard
        at={2}
        x={TX}
        y={310}
        filename="email.regex"
        flags="gi"
        stepAt={14}
        stepGap={12}
        testString="contact: ada@analytical.uk"
        parts={[
          { expr: "([a-z._]+)", desc: "username characters (letters, dots, underscores)", group: 1, example: "ada" },
          { expr: "@", desc: "literal @ separator symbol", example: "@" },
          { expr: "([a-z0-9-]+)", desc: "domain host name", group: 2, example: "analytical" },
          { expr: "\\.", desc: "escaped literal dot before TLD", example: "." },
          { expr: "([a-z]{2,})", desc: "top-level domain (2 or more letters)", group: 3, example: "uk" },
        ]}
        matches={[
          { start: 9, end: 12, group: 1 },
          { start: 12, end: 13, color: "#8E3CCB" },
          { start: 13, end: 23, group: 3 },
          { start: 23, end: 24, color: "#C95A00" },
          { start: 24, end: 26, group: 5 },
        ]}
        groups={[
          { index: 1, name: "user", value: "ada" },
          { index: 2, name: "host", value: "analytical", color: "#248A3D" },
          { index: 3, name: "tld", value: "uk", color: "#0E7490" },
        ]}
      />
    </Win>

    {/* 2. LexerTokens: slicing source code into typed token cards */}
    <Win from={120} to={240}>
      <Label at={120} y={255}>
        LexerTokens · &quot;const total = price * 2;&quot; · tokenizeAt 136
      </Label>
      <LexerTokens
        at={122}
        x={TX}
        y={310}
        filename="lexer.ts"
        code="const total = price * 2;"
        tokenizeAt={136}
        stepFrames={7}
        tokens={[
          { kind: "KEYWORD", value: "const" },
          { kind: "IDENT", value: "total" },
          { kind: "OP", value: "=" },
          { kind: "IDENT", value: "price" },
          { kind: "OP", value: "*" },
          { kind: "NUMBER", value: "2" },
        ]}
      />

      <Label at={132} y={865}>
        LexerTokens · dark · tokenizeAt 162
      </Label>
      <LexerTokens
        at={134}
        x={TX}
        y={920}
        dark
        filename="query.py"
        code="limit = count + 10"
        tokenizeAt={162}
        stepFrames={7}
        tokens={[
          { kind: "IDENT", value: "limit" },
          { kind: "OP", value: "=" },
          { kind: "IDENT", value: "count" },
          { kind: "OP", value: "+" },
          { kind: "NUMBER", value: "10" },
        ]}
      />
    </Win>

    {/* 3. AstView: syntax tree diagram + bottom-up expression evaluation */}
    <Win from={240} to={360}>
      <Label at={240} y={255}>
        AstView · 40 + 2 * 5 · bottom-up evalAt 272 (2 * 5 → 10, 40 + 10 → 50)
      </Label>
      <AstView
        at={242}
        x={TX}
        y={310}
        h={740}
        filename="ast-eval.ts"
        expression="40 + 2 * 5"
        evalAt={272}
        evalStep={30}
        nodes={[
          { id: "add", kind: "BinaryExpr", value: "+", x: 420, y: 115, children: ["n40", "mul"], result: 50 },
          { id: "n40", kind: "NumericLiteral", value: "40", x: 220, y: 300, result: 40 },
          { id: "mul", kind: "BinaryExpr", value: "*", x: 620, y: 300, children: ["n2", "n5"], result: 10 },
          { id: "n2", kind: "NumericLiteral", value: "2", x: 470, y: 485, result: 2 },
          { id: "n5", kind: "NumericLiteral", value: "5", x: 760, y: 485, result: 5 },
        ]}
      />
    </Win>

    {/* 4. StateMachine: FSM stepping through input tape -> Accepted & Rejected */}
    <Win from={360} to={480}>
      <Label at={360} y={250}>
        StateMachine · identifier FSM · &quot;ab9&quot; → Accepted
      </Label>
      <StateMachine
        at={362}
        x={TX}
        y={300}
        h={530}
        filename="id-fsm.ts"
        input="ab9"
        stepAt={376}
        fpc={15}
        states={[
          { id: "q0", label: "q0", sub: "start", x: 185, y: 215, initial: true },
          { id: "q1", label: "q1", sub: "ident", x: 475, y: 215, accept: true },
          { id: "q2", label: "q2", sub: "digits", x: 755, y: 215, accept: true },
        ]}
        transitions={[
          { from: "q0", to: "q1", label: "[a-z]" },
          { from: "q1", to: "q1", label: "[a-z]" },
          { from: "q1", to: "q2", label: "[0-9]" },
          { from: "q2", to: "q2", label: "[0-9]" },
        ]}
      />

      <Label at={368} y={865}>
        StateMachine · dark · invalid token &quot;a!9&quot; → Rejected
      </Label>
      <StateMachine
        at={370}
        x={TX}
        y={915}
        h={530}
        dark
        filename="reject-fsm.ts"
        input="a!9"
        stepAt={390}
        fpc={15}
        states={[
          { id: "q0", label: "q0", sub: "start", x: 185, y: 215, initial: true },
          { id: "q1", label: "q1", sub: "ident", x: 475, y: 215, accept: true },
          { id: "q2", label: "q2", sub: "digits", x: 755, y: 215, accept: true },
        ]}
        transitions={[
          { from: "q0", to: "q1", label: "[a-z]" },
          { from: "q1", to: "q1", label: "[a-z]" },
          { from: "q1", to: "q2", label: "[0-9]" },
        ]}
      />
    </Win>

    {/* 5. SemverCard: MAJOR.MINOR.PATCH anatomy + ^2.14.3 vs ~2.14.3 range matrix */}
    <Win from={480} to={600}>
      <Label at={480} y={255}>
        SemverCard · 2.14.3 (breaking · feature · bugfix) · ^2.14.3 vs ~2.14.3
      </Label>
      <SemverCard
        at={482}
        x={TX}
        y={310}
        version="2.14.3"
        splitAt={492}
        rangeAt={514}
        candidates={[
          { version: "2.14.9", note: "patch bugfix" },
          { version: "2.15.0", note: "minor feature" },
          { version: "3.0.0", note: "major breaking" },
          { version: "2.14.1", note: "older patch" },
        ]}
      />
    </Win>
  </AbsoluteFill>
);
