import type { Caption } from "@remotion/captions";
import { Audio } from "@remotion/media";
import { useMemo } from "react";
import { AbsoluteFill, Composition, useCurrentFrame, useVideoConfig, staticFile } from "remotion";
import { Backdrop } from "../../components/Backdrop";
import { Cover, CoverStill, CW, CX } from "../../components/Cover";
import { Captions } from "../../components/Captions";
import { Circle, Note, Sticker } from "../../components/Doodles";
import { EndCard } from "../../components/EndCard";
import { Headline } from "../../components/Headline";
import { PeekOver } from "../../components/PeekOver";
import { SaveOutro } from "../../components/SaveOutro";
import { dim, type Line } from "../../components/Terminal";
import { BuildList } from "../../components/layouts/BuildList";
import { ChipDrop } from "../../components/layouts/ChipDrop";
import { RED } from "../../components/layouts/Mark";
import { Verdict } from "../../components/layouts/Verdict";
import { Annotate } from "../../components/text/Annotate";
import { Button, TextField } from "../../components/ui/Form";
import { MacWindow } from "../../components/windows/MacWindow";
import { MailInbox, MailMessage } from "../../components/windows/Mail";
import { Icon } from "../../icons/Icons";
import { TW, TX, TY } from "../../layout";
import { durationFromCaptions, Sfx, Win } from "../../lib/timing";
import { makeCues } from "../../lib/cues";
import { C, easeInOut, materialize, mono, prog, sans, TERM, W, H } from "../../theme";
import captionsJson from "../../../public/email-plus/captions.json";

// The + trick that shows who sold your email: sign up as yourname+site@gmail.com, spam to +pizza = the pizza
// app leaked it, filter it to the trash. Caveats: some forms reject +, spammers can strip it (a clue, not proof).
// Facts + sources: SudoRaccoon/Videos/email-plus.md. Design + motion: Playbook/Design system.md.
// Fake addresses only: "yourname" is Google's own placeholder; app names are generic.

const captions = captionsJson as Caption[];
const FPS = 30;
const DURATION = durationFromCaptions(captions, FPS);

const ADDR = "yourname+pizza@gmail.com";

export const EmailPlusComposition = () => (
  <>
    <Composition id="EmailPlus" component={EmailPlus} durationInFrames={DURATION} fps={FPS} width={W} height={H} />
    <CoverStill id="EmailPlusCover" component={EmailPlusCover} />
  </>
);

const useT = () => {
  const { fps } = useVideoConfig();
  return useMemo(() => {
    const { at, last, end } = makeCues(captions, fps);
    return {
      sold: at("sold"),
      gmail1: at("gmail"),
      sudo: at("sudo"),
      snack: at("snack"),
      spam1: at("spam"),
      stop: at("stop"),
      leak: at("leak"),
      add: at("add"),
      plus3: at("plus", 3),
      word: at("word"),
      atSign: at("at"),
      yourname: at("yourname"),
      pizza1: at("pizza"),
      gmailcom: at("gmailcom"),
      still: at("still"),
      lands: at("lands"),
      so: at("so"),
      own: at("own"),
      tag: at("tag"),
      pizza2: at("pizza", 2),
      snackbox: at("snackbox"),
      trashdeals: at("trashdeals"),
      weeks: at("weeks"),
      spam2: at("spam", 2),
      pizza3: at("pizza", 3),
      now: at("now", 2),
      know: at("know"),
      leaked: at("leaked"),
      make: at("make"),
      filter: at("filter"),
      goes: at("goes"),
      straight: at("straight"),
      trash: at("trash"),
      sudos: at("sudo's"),
      it: at("it", 2), // "It works" (the first "it" is "and it all goes")
      site: at("site"),
      gmail2: at("gmail", 2),
      outlook: at("outlook"),
      two: at("two"),
      some: at("some"),
      reject: at("reject"),
      spammer: at("spammer"),
      del: at("delete"),
      clue: at("clue"),
      proof: at("proof"),
      save: at("save"),
      follow: last("follow"),
      comment: last("comment"),
      end,
    };
  }, [fps]);
};
type Cues = ReturnType<typeof useT>;

// ---------------- hook: the spam mail, its To: line ringed on "+pizza", on screen from frame 0 ----------------
const MSG_Y = 450;
const SpamMessage: React.FC<{ at: number; mark: number; until?: number; y?: number }> = ({ at, mark, until, y = MSG_Y }) => (
  <MailMessage
    x={TX}
    y={y}
    w={TW}
    h={500}
    at={at}
    until={until}
    from="Hot Deals 4U"
    to={ADDR}
    toMark={{ text: "+pizza", at: mark }}
    subject="You won a free pizza oven!!"
    body={["Claim it now, this offer ends tonight…"]}
    time="3:07 am"
    spam
  />
);

const Hook: React.FC<{ T: Cues }> = ({ T }) => (
  <>
    <Headline a="The + trick that shows" b="who sold your email." size={78} until={T.sudo} />
    <SpamMessage at={-20} mark={Math.round(T.sold - 6)} />
    <Sticker src="raccoon/side-eye.png" at={-20} x={W - 420} y={1010} w={400} fadeBottom={60} />
  </>
);

// ---------------- problem: Sudo signs up everywhere, the spam piles in ----------------
const SPAM_ROWS = [
  { from: "Mega Prize Club", subject: "Final notice: claim your prize", preview: "You have been selected…" },
  { from: "Crypto Snacks", subject: "Turn 1 chip into 1,000 chips", preview: "Limited spots left" },
  { from: "Hot Deals 4U", subject: "You won a free pizza oven!!", preview: "Claim it now, this offer ends…" },
  { from: "Lucky Winner", subject: "Re: your reward is waiting", preview: "Open to confirm…" },
];
const Problem: React.FC<{ T: Cues }> = ({ T }) => {
  const frame = useCurrentFrame();
  const n = SPAM_ROWS.filter((_, i) => frame >= T.spam1 + i * 5).length;
  return (
    <>
      <Headline a="Sudo signs up for every snack app." b="Now the spam won't stop." at={T.sudo} bAt={T.spam1} size={70} />
      <MailInbox
        x={TX}
        y={TY + 30}
        w={TW}
        h={64 + 4 * 116}
        at={T.sudo + 2}
        title={n ? `Inbox · ${2 + n * 11}` : "Inbox · 2"}
        rows={[
          ...SPAM_ROWS.map((r, i) => ({ ...r, unread: true, time: "3:07 am", at: T.spam1 + (SPAM_ROWS.length - 1 - i) * 5 })),
          { from: "Snack Box", subject: "Welcome, Sudo!", preview: "Your first box ships Monday", time: "Mon", at: T.snack - 6 },
          { from: "Pizza app", subject: "Your account is ready", preview: "Order your first slice", time: "Mon" },
        ]}
      />
      <Sticker src="raccoon/oops.png" at={T.stop - 4} x={W - 320} y={990} w={240} fadeBottom={50} />
      <Note at={T.leak} x={TX} y={1110} size={44}>
        {"Who leaked my email?"}
      </Note>
    </>
  );
};

// ---------------- the trick: + and any word before the @ ----------------
const AS = 52; // Annotate font size
const MONO_W = 0.6;
const AW = ADDR.length * MONO_W * AS + 60;
const AX = Math.round((W - AW) / 2);
const AY = 520;
const annRing = (from: number, to: number) => ({
  x: AX + 30 + from * MONO_W * AS - 10,
  y: AY + 22 - 8,
  w: (to - from) * MONO_W * AS + 20,
  h: AS * 1.3 + 16,
});
const Trick: React.FC<{ T: Cues }> = ({ T }) => (
  <>
    <Headline a="Add + and any word" b="before the @." at={T.add} bAt={T.atSign} size={80} />
    <Annotate
      text={ADDR}
      at={T.add + 2}
      x={AX}
      y={AY}
      size={AS}
      segments={[
        { from: 8, to: 14, label: "any word", at: T.word, color: C.accent },
        { from: 0, to: 8, label: "you", at: T.yourname },
        { from: 14, to: 24, label: "same address", at: T.gmailcom },
      ]}
      focus={{ index: 0, at: T.word + 4, until: T.yourname }}
    />
    <Circle at={T.plus3} until={T.word} {...annRing(8, 9)} />
    <Circle at={T.atSign} until={T.yourname} {...annRing(14, 15)} />
    <MailInbox
      x={TX}
      y={820}
      w={TW}
      h={64 + 128}
      rowH={128}
      at={T.still}
      title="Inbox · yourname@gmail.com"
      rows={[{ from: "Pizza app", tag: "+pizza", subject: "Welcome! Your account is ready", preview: "Sent to yourname+pizza@gmail.com", time: "now", unread: true, at: T.lands }]}
    />
    <Sticker src="raccoon/scheming.png" at={T.add + 6} x={W - 300} y={1070} w={210} />
  </>
);

// ---------------- one tag per site: three sign-up fields ----------------
const SITES = [
  { label: "Pizza app", tag: "pizza" },
  { label: "Snack Box", tag: "snackbox" },
  { label: "Trash Deals", tag: "trashdeals" },
] as const;
const Tags: React.FC<{ T: Cues }> = ({ T }) => {
  // "+tag" is typed exactly on its spoken word: the 9 characters before it ("yourname+") start 9 frames earlier
  const words = [T.pizza2, T.snackbox, T.trashdeals];
  return (
    <>
      <Headline a="Every site" b="gets its own tag." at={T.so} bAt={T.own} size={80} />
      {SITES.map((s, i) => {
        const typeAt = words[i] - 9;
        return (
          <TextField
            key={s.tag}
            x={TX}
            y={460 + i * 170}
            w={TW}
            at={i === 0 ? T.site : words[i] - 16}
            label={`${i + 1}/3  ${s.label} · sign up`}
            icon="mail"
            value={`yourname+${s.tag}@gmail.com`}
            typeAt={typeAt}
            fpc={1}
            monoValue
            blurAt={words[i + 1] !== undefined ? words[i + 1] - 9 : T.weeks - 6}
          />
        );
      })}
      <Sticker src="raccoon/pointing.png" at={T.tag} x={W - 330} y={990} w={250} />
    </>
  );
};

// ---------------- weeks later: spam to +pizza → the pizza app leaked it ----------------
const Spam: React.FC<{ T: Cues }> = ({ T }) => (
  <>
    <Headline a="Spam sent to +pizza?" b="The pizza app leaked it." at={T.weeks} bAt={T.know} size={76} />
    <MailInbox
      x={TX}
      y={TY + 30}
      w={TW}
      h={64 + 3 * 124}
      rowH={124}
      at={T.weeks + 2}
      title="Inbox · yourname@gmail.com"
      rows={[
        { from: "Hot Deals 4U", tag: "+pizza", spam: true, subject: "You won a free pizza oven!!", preview: "Claim it now, this offer ends…", time: "3:07 am", unread: true, at: T.spam2 },
        { from: "Snack Box", tag: "+snackbox", subject: "Your box ships Monday", preview: "Extra crunchy this week", time: "Tue" },
        { from: "Trash Deals", tag: "+trashdeals", subject: "Receipt: 1 slightly used bin", preview: "Thanks for your order", time: "Mon" },
      ]}
      focus={[{ row: 0, at: T.pizza3 }]}
      markTag={{ row: 0, at: T.pizza3 }}
    />
    <Note at={T.leaked} x={TX} y={1000} size={44}>
      {"+pizza → the pizza app"}
    </Note>
    <Sticker src="raccoon/gasp.png" at={T.now} x={W - 330} y={940} w={260} fadeBottom={60} />
  </>
);

// ---------------- one filter: straight to the trash ----------------
const CHECK = 46;
const Filter: React.FC<{ T: Cues }> = ({ T }) => {
  const frame = useCurrentFrame();
  const tick = prog(frame, T.goes, 8);
  const canX = TX + 600;
  const canY = 1000;
  return (
    <>
      <Headline a="One filter." b="Straight to the trash." at={T.make} bAt={T.straight} size={80} />
      <MacWindow x={TX} y={TY + 20} w={TW} h={430} at={T.make + 2} title="Create filter">
        <TextField x={40} y={28} w={TW - 80} at={T.make + 4} label="To" value={ADDR} typeAt={T.filter} fpc={1} monoValue blurAt={T.goes} />
        <div style={{ position: "absolute", left: 46, top: 200, display: "flex", alignItems: "center", gap: 20, fontFamily: sans, fontWeight: 600, fontSize: 34, color: C.ink }}>
          <div style={{ width: CHECK, height: CHECK, borderRadius: 12, border: `2px solid ${tick > 0.5 ? C.accent : "#C7C7CC"}`, background: tick > 0 ? `rgba(0,113,227,${tick})` : C.white, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {tick > 0 ? <Icon name="check" size={34} color={C.white} weight={3} draw={prog(frame, T.goes + 2, 8)} /> : null}
          </div>
          Delete it
        </div>
        <Button x={46} y={280} at={T.make + 6} label="Create filter" pressAt={T.straight} doneAt={T.straight + 8} doneLabel="Filter created" size={30} h={84} />
      </MacWindow>
      <ChipDrop items={["free pizza oven!!", "final notice", "you won"]} at={T.filter + 6} drop={T.trash} x={TX + 10} y={canY - 20} rowGap={76} canX={canX} canY={canY} size={30} />
      <PeekOver src="raccoon/peek-ledge.png" at={T.sudos} x={canX - 34} edgeY={canY + 26} w={250} h={200} overhang={10} />
    </>
  );
};

// ---------------- works in Gmail and Outlook ----------------
const Works: React.FC<{ T: Cues }> = ({ T }) => (
  <>
    <Headline a="Works in Gmail" b="and Outlook." at={T.it} bAt={T.outlook} size={84} />
    <BuildList
      x={TX}
      y={TY + 60}
      w={TW}
      card
      rows={[
        { at: T.it + 2, cmd: "Gmail", text: "yourname+tag@gmail.com", mark: "check", doneAt: T.gmail2 },
        { at: T.it + 4, cmd: "Outlook", text: "yourname+tag@outlook.com", mark: "check", doneAt: T.outlook },
      ]}
    />
    <Sticker src="raccoon/hands-up.png" at={T.it + 6} x={W - 330} y={1060} w={240} />
  </>
);

// ---------------- two catches: some forms reject +, spammers can strip it ----------------
const STRIP_S = 48;
const Stripped: React.FC<{ at: number; strike: number; cut: number }> = ({ at, strike, cut }) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const p = prog(frame, at, 10);
  const c = prog(frame, cut, 12, easeInOut);
  const tagW = 6 * MONO_W * STRIP_S;
  return (
    <div style={{ position: "absolute", left: TX, top: 760, width: TW, ...materialize(p) }}>
      <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 26, color: C.mute, paddingLeft: 6, height: 40 }}>2/2  a spammer deletes the tag</div>
      <div style={{ height: 110, borderRadius: 22, background: C.white, border: `1px solid ${C.line}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: mono, fontWeight: 500, fontSize: STRIP_S, color: C.ink, whiteSpace: "pre" }}>
        yourname
        <span style={{ display: "inline-block", width: tagW * (1 - c), overflow: "hidden", opacity: 1 - c, position: "relative", color: RED }}>
          +pizza
          <span style={{ position: "absolute", left: 0, top: "52%", height: 4, borderRadius: 2, background: RED, width: `${100 * prog(frame, strike, 10)}%` }} />
        </span>
        @gmail.com
      </div>
    </div>
  );
};
const Catches: React.FC<{ T: Cues }> = ({ T }) => (
  <>
    <Headline a="Two catches." b="A clue, not proof." at={T.two} bAt={T.clue} size={84} />
    <TextField
      x={TX}
      y={470}
      w={TW}
      at={T.some}
      label="1/2  some sign-up forms"
      icon="mail"
      value={ADDR}
      monoValue
      focusAt={T.some}
      states={[{ at: T.reject, kind: "error", message: "Please enter a valid email address" }]}
    />
    <Stripped at={T.spammer} strike={T.spammer + 6} cut={T.del} />
    <Verdict at={T.clue} x={TX} y={960} kind="fact" label="a clue" size={0.8} />
    <Verdict at={T.proof} x={TX + 330} y={960} kind="myth" label="not proof" size={0.8} />
    <Sticker src="raccoon/sneaking.png" at={T.spammer} x={W - 400} y={1010} w={400} from="right" />
  </>
);

const cheat = (rows: [string, string][]): Line[] => [[dim("# the + email trick")], ...rows.map(([a, b]): Line => [{ t: a.padEnd(8), c: TERM.green, b: true }, { t: b }])];

export const EmailPlus: React.FC = () => {
  const T = useT();
  return (
    <AbsoluteFill style={{ fontFamily: sans }}>
      <Backdrop />

      <Win from={0} to={T.sudo}>
        <Hook T={T} />
      </Win>
      <Win from={T.sudo} to={T.add}>
        <Problem T={T} />
      </Win>
      <Win from={T.add} to={T.so}>
        <Trick T={T} />
      </Win>
      <Win from={T.so} to={T.weeks}>
        <Tags T={T} />
      </Win>
      <Win from={T.weeks} to={T.make}>
        <Spam T={T} />
      </Win>
      <Win from={T.make} to={T.it}>
        <Filter T={T} />
      </Win>
      <Win from={T.it} to={T.two}>
        <Works T={T} />
      </Win>
      <Win from={T.two} to={T.save}>
        <Catches T={T} />
      </Win>

      <SaveOutro
        at={T.save}
        h={440}
        fontSize={28}
        lines={cheat([
          ["sign up", "yourname+site@gmail.com"],
          ["inbox", "still your normal inbox"],
          ["spam", "read the To: line"],
          ["filter", "that address → trash"],
          ["works", "Gmail, Outlook"],
          ["catch", "a clue, not proof"],
        ])}
        question={"Which site\nsold yours?"}
      />
      <EndCard at={T.follow} comment={T.comment} line="Follow for more security tricks." question="Which site sold yours?" />

      <Captions captions={captions} top={1340} />

      <Audio src={staticFile("email-plus/voice.mp3")} />
      <Sfx name="whoosh" at={[T.sudo, T.add, T.so, T.weeks, T.make, T.it, T.two, T.save, T.follow]} />
      <Sfx name="mouse-click" at={[T.pizza2 - 9, T.snackbox - 9, T.trashdeals - 9, T.filter]} />
      <Sfx name="ding" at={[T.lands, T.goes]} />
      <Sfx name="switch" at={[T.reject, T.del]} />
    </AbsoluteFill>
  );
};

// Cover (1080×1440, uploaded separately in TikTok Studio): headline + the payoff visual + chips. Not a video frame.
export const EmailPlusCover: React.FC = () => (
  <Cover title="Who sold your email?" sub="The + trick tells you." size={96} chips={["+pizza", "Gmail", "Outlook"]}>
    <MailMessage
      x={CX}
      y={470}
      w={CW}
      h={470}
      at={-100}
      from="Hot Deals 4U"
      to={ADDR}
      toMark={{ text: "+pizza", at: -100 }}
      subject="You won a free pizza oven!!"
      body={["Claim it now, this offer ends tonight…"]}
      time="3:07 am"
      spam
      size={42}
    />
    <Sticker src="raccoon/side-eye.png" at={-100} x={600} y={850} w={400} fadeBottom={50} />
  </Cover>
);
