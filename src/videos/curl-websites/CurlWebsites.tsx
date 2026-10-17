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
import { cheatLines, SaveOutro } from "../../components/SaveOutro";
import { dim, Segs, Terminal, termRing, type Block, type Line } from "../../components/Terminal";
import { ToolHeader } from "../../components/ToolHeader";
import { Arrow, arrowPath, Tunnel } from "../../components/diagram/Arrow";
import { anchors, Node } from "../../components/diagram/Node";
import { KeyCombo } from "../../components/layouts/KeyCombo";
import { GREEN, RED } from "../../components/layouts/Mark";
import { Verdict } from "../../components/layouts/Verdict";
import { QrCode, qrTerminalRows } from "../../components/text/QrCode";
import { BrowserWindow } from "../../components/windows/BrowserWindow";
import { Icon, type IconName } from "../../icons/Icons";
import { TW, TX, TY } from "../../layout";
import { durationFromCaptions, Sfx, Win } from "../../lib/timing";
import { makeCues } from "../../lib/cues";
import { C, mono, prog, sans, TERM, W, H } from "../../theme";
import captionsJson from "../../../public/curl-websites/captions.json";

// Websites that work in your terminal: wttr.in, cheat.sh, qrenco.de, ifconfig.me, parrot.live.
// Facts + sources (verified locally 2026-10-13): SudoRaccoon/Videos/curl-websites.md → Facts checked.
// Privacy: wttr.in uses /London; ifconfig.me uses RFC 5737 documentation IPs (203.0.113.42, 198.51.100.7).

const captions = captionsJson as Caption[];
const FPS = 30;
const DURATION = durationFromCaptions(captions, FPS);

export const CurlWebsitesComposition = () => (
  <>
    <Composition id="CurlWebsites" component={CurlWebsites} durationInFrames={DURATION} fps={FPS} width={W} height={H} />
    <CoverStill id="CurlWebsitesCover" component={CurlWebsitesCover} />
  </>
);

const useT = () => {
  const { fps } = useVideoConfig();
  return useMemo(() => {
    const { at, last, end } = makeCues(captions, fps);
    return {
      noBrowser: at("no"),
      nothing: at("nothing"),
      curl: at("curl"),
      mac: at("mac"),
      // story
      story: at("3"),
      snack: at("snack"),
      refuses: at("refuses"),
      heavy: at("heavy"),
      forty: at("forty"),
      // 1/5 wttr.in
      t1: at("one"),
      wttr: at("curlwttrinlondon"),
      prints: at("prints"),
      ascii: at("ascii"),
      temp: at("temperature"),
      wind: at("wind"),
      city: at("city"),
      q0: at("0"),
      leave: at("leave"),
      ip1: at("ip"),
      // 2/5 cheat.sh
      t2: at("two"),
      cheat: at("curlcheatshtar"),
      forget: at("forget"),
      community: at("community"),
      examples: at("examples"),
      zero: at("zero"),
      ask: at("ask"),
      cheatPy: at("curlcheatsh"),
      // 3/5 qrenco.de
      t3: at("three"),
      qrenco: at("curlqrencodesnacks"),
      anything: at("anything"),
      scannable: at("scannable"),
      blocks: at("blocks"),
      gang: at("gang"),
      scan: at("scan"),
      // 4/5 ifconfig.me
      t4: at("four"),
      ifc: at("curlifconfigme"),
      oneLine: at("line"),
      publicIp: at("public"),
      website: at("website"),
      before: at("before"),
      vpn: at("vpn"),
      working: at("working", 2),
      // 5/5 parrot.live
      t5: at("five", 2),
      parrotCmd: at("curlparrotlive"),
      succeeds: at("succeeds"),
      streams: at("streams"),
      colorful: at("colorful"),
      forever: at("forever"),
      until: at("until"),
      press: at("press"),
      ctrlc: at("ctrlc"),
      // outro
      save: at("save"),
      follow: last("follow"),
      comment: last("comment"),
      end,
    };
  }, [fps]);
};
type Cues = ReturnType<typeof useT>;

const IconNote: React.FC<{
  icon: IconName;
  at: number;
  until?: number;
  x?: number;
  y: number;
  size?: number;
  tint?: string;
  children: React.ReactNode;
}> = ({ icon, at, until, x = TX, y, size, tint = C.accent, children }) => {
  const frame = useCurrentFrame();
  return (
    <Note at={at} until={until} x={x} y={y} size={size}>
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <Icon name={icon} size={46} color={tint} weight={2.2} draw={prog(frame, at + 2, 14)} />
        <span>{children}</span>
      </div>
    </Note>
  );
};

// window height for `rows` text rows (title bar + padding = ~150 px)
const termH = (rows: number, fs: number) => Math.ceil(rows * fs * 1.38 + 150);

// ---------------- terminal outputs (real formats verified locally) ----------------
const WTTR_OUT: Line[] = [
  [{ t: "Weather report: London", b: true }],
  "",
  [
    { t: "      \\   /     ", c: TERM.yellow, b: true },
    { t: "Sunny", c: TERM.fg, b: true },
  ],
  [
    { t: "       .-.      ", c: TERM.yellow, b: true },
    { t: "+19(14) °C", c: TERM.green, b: true },
  ],
  [
    { t: "    ― (   ) ―   ", c: TERM.yellow, b: true },
    { t: "→ 20 km/h", c: TERM.blue, b: true },
  ],
  [
    { t: "       `-’      ", c: TERM.yellow, b: true },
    { t: "10 km", c: TERM.fg },
  ],
  [
    { t: "      /   \\     ", c: TERM.yellow, b: true },
    { t: "0.0 mm", c: TERM.cyan },
  ],
];

const CHEAT_TAR_OUT: Line[] = [
  [dim("# To extract an uncompressed archive:")],
  [{ t: "tar -xvf /path/to/foo.tar", c: TERM.green, b: true }],
  "",
  [dim("# To extract a .tgz or .tar.gz archive:")],
  [{ t: "tar -xzvf /path/to/foo.tgz", c: TERM.green, b: true }],
  "",
  [dim("# To create a .tgz or .tar.gz archive:")],
  [{ t: "tar -czvf /path/to/foo.tgz /path/to/foo/", c: TERM.green, b: true }],
];

const CHEAT_PY_OUT: Line[] = [
  [dim("# Reverse a list in Python (cheat.sh):")],
  [{ t: "array = [0, 10, 20, 40]", c: TERM.fg }],
  [{ t: "for i in reversed(array):", c: TERM.blue, b: true }],
  [{ t: "    print(i)", c: TERM.fg }],
  "",
  [dim("# Or get a reversed list directly:")],
  [{ t: "list(reversed(array))", c: TERM.green, b: true }],
];

// Real 18-line ASCII frames captured from `curl -s parrot.live`
const PARROT_FRAMES: string[][] = [
  [
    "                         .cccc;;cc;';c.           ",
    "                      .,:dkdc:;;:c:,:d:.          ",
    "                     .loc'.,cc::c:::,..;:.        ",
    "                   .cl;....;dkdccc::,...c;        ",
    "                  .c:,';:'..ckc',;::;....;c.      ",
    "                .c:'.,dkkoc:ok:;llllc,,c,';:.     ",
    "               .;c,';okkkkkkkk:;lllll,:kd;.;:,.   ",
    "               co..:kkkkkkkkkk:;llllc':kkc..oNc   ",
    "             .cl;.,oxkkkkkkkkkc,:cll;,okkc'.cO;   ",
    "             ;k:..ckkkkkkkkkkkl..,;,.;xkko:',l'   ",
    "            .,...';dkkkkkkkkkkd;.....ckkkl'.cO;   ",
    "         .,,:,.;oo:ckkkkkkkkkkkdoc;;cdkkkc..cd,   ",
    "      .cclo;,ccdkkl;llccdkkkkkkkkkkkkkkkd,.c;     ",
    "     .lol:;;okkkkkxooc::coodkkkkkkkkkkkko'.oc     ",
    "   .c:'..lkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkd,.oc     ",
    "  .lo;,:cdkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkd,.c;     ",
    ",dx:..;lllllllllllllllllllllllllllllllllc'...     ",
    "cNO;........................................      ",
  ],
  [
    "                .ckx;'........':c.                ",
    "             .,:c:::::oxxocoo::::,',.             ",
    "            .odc'..:lkkoolllllo;..;d,             ",
    "            ;c..:o:..;:..',;'.......;.            ",
    "           ,c..:0Xx::o:.,cllc:,'::,.,c.           ",
    "           ;c;lkXKXXXXl.;lllll;lKXOo;':c.         ",
    "         ,dc.oXXXXXXXXl.,lllll;lXXXXx,c0:         ",
    "         ;Oc.oXXXXXXXXo.':ll:;'oXXXXO;,l'         ",
    "         'l;;kXXXXXXXXd'.'::'..dXXXXO;,l'         ",
    "         'l;:0XXXXXXXX0x:...,:o0XXXXx,:x,         ",
    "         'l;;kXXXXXXXXXKkol;oXXXXXXXO;oNc         ",
    "        ,c'..ckk0XXXXXXXXXX00XXXXXXX0:;o:.        ",
    "      .':;..:do::ooookXXXXXXXXXXXXXXXo..c;        ",
    "    .',',:co0XX0kkkxxOXXXXXXXXXXXXXXXOc..;l.      ",
    "  .:;'..oXXXXXXXXXXXXXXXXXXXXXXXXXXXXXko;';:.     ",
    ".ldc..:oOXKXXXXXXKXXKXXXXXXXXXXXXXXXXXXXo..oc     ",
    ":0o...:dxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxo,.:,     ",
    "cNo........................................;'     ",
  ],
  [
    "            .cc;.  ...  .;c.                      ",
    "         .,,cc:cc:lxxxl:ccc:;,.                   ",
    "        .lo;...lKKklllookl..cO;                   ",
    "      .cl;.,:'.okl;..''.;,..';:.                  ",
    "     .:o;;dkd,.ll..,cc::,..,'.;:,.                ",
    "     co..lKKKkokl.':lloo;''ol..;dl.               ",
    "   .,c;.,xKKKKKKo.':llll;.'oOxl,.cl,.             ",
    "   cNo..lKKKKKKKo'';llll;;okKKKl..oNc             ",
    "   cNo..lKKKKKKKko;':c:,'lKKKKKo'.oNc             ",
    "   cNo..lKKKKKKKKKl.....'dKKKKKxc,l0:             ",
    "   .c:'.lKKKKKKKKKk;....lKKKKKKo'.oNc             ",
    "     ,:.'oxOKKKKKKKOxxxxOKKKKKKxc,;ol:.           ",
    "     ;c..'':oookKKKKKKKKKKKKKKKKKk:.'clc.         ",
    "   ,xl'.,oxo;'';oxOKKKKKKKKKKKKKKKOxxl:::;,.      ",
    "  .dOc..lKKKkoooookKKKKKKKKKKKKKKKKKKKxl,;ol.     ",
    "  cx,';okKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKl..;lc.   ",
    "  co..:dddddddddddddddddddddddddddddddddl::',::.  ",
    "  co...........................................   ",
  ],
  [
    "           .ccccccc.                              ",
    "      .,,,;cooolccoo;;,,.                         ",
    "     .dOx;..;lllll;..;xOd.                        ",
    "   .cdo;',loOXXXXXkll;';odc.                      ",
    "  ,ol:;c,':oko:cccccc,...ckl.                     ",
    "  ;c.;kXo..::..;c::'.......oc                     ",
    ",dc..oXX0kk0o.':lll;..cxxc.,ld,                   ",
    "kNo.'oXXXXXXo',:lll;..oXXOo;cOd.                  ",
    "KOc;oOXXXXXXo.':lol;..dXXXXl';xc                  ",
    "Ol,:k0XXXXXX0c.,clc'.:0XXXXx,.oc                  ",
    "KOc;dOXXXXXXXl..';'..lXXXXXo..oc                  ",
    "dNo..oXXXXXXXOx:..'lxOXXXXXk,.:; ..               ",
    "cNo..lXXXXXXXXXOolkXXXXXXXXXkl,..;:';.            ",
    ".,;'.,dkkkkk0XXXXXXXXXXXXXXXXXOxxl;,;,;l:.        ",
    "  ;c.;:''''':doOXXXXXXXXXXXXXXXXXXOdo;';clc.      ",
    "  ;c.lOdood:'''oXXXXXXXXXXXXXXXXXXXXXk,..;ol.     ",
    "  ';.:xxxxxocccoxxxxxxxxxxxxxxxxxxxxxxl::'.';;.   ",
    "  ';........................................;l'   ",
  ],
  [
    "                   .ccccccc.                      ",
    "               .ccckNKOOOOkdcc.                   ",
    "            .;;cc:ccccccc:,:c::,,.                ",
    "         .c;:;.,cccllxOOOxlllc,;ol.               ",
    "        .lkc,coxo:;oOOxooooooo;..:,               ",
    "      .cdc.,dOOOc..cOd,.',,;'....':l.             ",
    "      cNx'.lOOOOxlldOc..;lll;.....cO;             ",
    "     ,do;,:dOOOOOOOOOl'':lll;..:d:''c,            ",
    "     co..lOOOOOOOOOOOl'':lll;.'lOd,.cd.           ",
    "     co.'dOOOOOOOOOOOo,.;llc,.,dOOc..dc           ",
    "     co..lOOOOOOOOOOOOc.';:,..cOOOl..oc           ",
    "   .,:;.'::lxOOOOOOOOOo:'...,:oOOOc.'dc           ",
    "   ;Oc..cl'':lldOOOOOOOOdcclxOOOOx,.cd.           ",
    "  .:;';lxl''''':lldOOOOOOOOOOOOOOc..oc            ",
    ",dl,.'cooc:::,....,::coooooooooooc'.c:            ",
    "cNo.................................oc            ",
    "                                                  ",
    "                                                  ",
  ],
  [
    "                              .ccccc.             ",
    "                         .cc;'coooxkl;.           ",
    "                     .:c:::c:,,,,,;c;;,.'.        ",
    "                   .clc,',:,..:xxocc;'..c;        ",
    "                  .c:,';:ox:..:c,,,,,,...cd,      ",
    "                .c:'.,oxxxxl::l:.,loll;..;ol.     ",
    "                ;Oc..:xxxxxxxxx:.,llll,....oc     ",
    "             .,;,',:loxxxxxxxxx:.,llll;.,,.'ld,   ",
    "            .lo;..:xxxxxxxxxxxx:.'cllc,.:l:'cO;   ",
    "           .:;...'cxxxxxxxxxxxxoc;,::,..cdl;;l'   ",
    "         .cl;':,'';oxxxxxxdxxxxxx:....,cooc,cO;   ",
    "     .,,,::;,lxoc:,,:lxxxxxxxxxxxo:,,;lxxl;'oNc   ",
    "   .cdxo;':lxxxxxxc'';cccccoxxxxxxxxxxxxo,.;lc.   ",
    "  .loc'.'lxxxxxxxxocc;''''';ccoxxxxxxxxx:..oc     ",
    "olc,..',:cccccccccccc:;;;;;;;;:ccccccccc,.'c,     ",
    "Ol;......................................;l'      ",
    "                                                  ",
    "                                                  ",
  ],
];

const PARROT_COLORS = [TERM.red, TERM.orange, TERM.yellow, TERM.green, TERM.cyan, TERM.blue, TERM.purple];

// ---------------- 0. Hook: payoff visible from frame 0 ----------------
const HOOK_TY = 500;
const HOOK_FS = 25;
const HOOK_H = termH(8, HOOK_FS);
const HOOK_NOTE_Y = HOOK_TY + HOOK_H + 34;

const Hook: React.FC<{ T: Cues }> = ({ T }) => (
  <>
    <Headline a="5 websites that work" b="in your terminal." until={T.story} size={80} />
    <Terminal
      x={TX}
      y={HOOK_TY}
      w={TW}
      h={HOOK_H}
      fontSize={HOOK_FS}
      blocks={[{ at: -200, cmd: "curl wttr.in/London?0", out: WTTR_OUT }]}
    />
    <PeekOver src="raccoon/peek-paws.png" at={-100} x={TX + 560} edgeY={HOOK_TY} w={300} h={230} overhang={34} />
    <Circle at={T.noBrowser} {...termRing(TX, HOOK_TY, HOOK_FS, 3, 4, 24, 5)} />
    <Note at={-100} x={TX} y={HOOK_NOTE_Y} font="mono" size={24}>
      wttr.in · cheat.sh · qrenco.de · ifconfig.me · parrot.live
    </Note>
    <IconNote icon="globe" at={T.noBrowser} until={T.nothing} y={HOOK_NOTE_Y + 114}>
      No browser needed.
    </IconNote>
    <IconNote icon="check" tint={GREEN} at={T.nothing} until={T.mac} y={HOOK_NOTE_Y + 114}>
      Nothing to install — curl is built in.
    </IconNote>
    <IconNote icon="terminal" at={T.mac} y={HOOK_NOTE_Y + 114}>
      Mac · Linux · Windows (curl.exe)
    </IconNote>
  </>
);

// ---------------- Story: 3 a.m., 40 heavy browser tabs ----------------
const TAB_TITLES = ["tar flags?", "weather", "what is my ip", "qr generator", "python reverse", "docs", "blog", "+33"];

const HeavyBrowserPage: React.FC = () => (
  <div style={{ position: "absolute", inset: 0, fontFamily: sans, padding: 28, background: C.white }}>
    {/* cramped tab strip */}
    <div style={{ display: "flex", gap: 8, marginBottom: 22, overflow: "hidden" }}>
      {TAB_TITLES.map((t, i) => (
        <div
          key={t}
          style={{
            padding: "8px 14px",
            borderRadius: 10,
            background: i === 0 ? C.accent : C.soft,
            color: i === 0 ? C.white : C.mute,
            fontWeight: 600,
            fontSize: 20,
            whiteSpace: "nowrap",
          }}
        >
          {t}
        </div>
      ))}
    </div>
    {/* fake bloated blog page */}
    <div style={{ fontWeight: 700, fontSize: 32, color: C.ink, marginBottom: 14 }}>
      Ultimate guide to tar flags (2026 update)
    </div>
    <div style={{ height: 56, borderRadius: 14, background: "#FFE8E5", border: `2px solid ${RED}`, display: "flex", alignItems: "center", padding: "0 18px", fontWeight: 600, fontSize: 22, color: RED, marginBottom: 14 }}>
      Allow notifications + accept 47 cookie partners?
    </div>
    <div style={{ height: 110, borderRadius: 16, background: C.soft, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: 24, color: C.mute }}>
      [ Auto-playing video ad — 1.8 GB memory ]
    </div>
  </div>
);

const Story: React.FC<{ T: Cues }> = ({ T }) => (
  <>
    <Headline a="3 a.m. Midnight snack raid." b="40 browser tabs? No thanks." at={T.story} bAt={T.refuses} size={72} />
    <BrowserWindow x={TX} y={450} w={TW} h={430} url="https://bloated-blog.example/tar-flags-guide" at={T.story + 6}>
      <HeavyBrowserPage />
    </BrowserWindow>
    <Verdict kind="myth" label="40 tabs" at={T.forty - 4} x={TX + 540} y={480} size={0.78} />
    <IconNote icon="cross" tint={RED} at={T.refuses} y={920}>
      {"Heavy browser at 3 a.m.?\nSudo stays in the terminal."}
    </IconNote>
    <Sticker src="raccoon/night-snack.png" at={T.snack - 4} x={TX + 560} y={870} w={340} fadeBottom={70} />
  </>
);

// ---------------- 1/5 wttr.in ----------------
const WTTR_FS = 25;
const WTTR_H = termH(11, WTTR_FS);
const ONE_NOTE_Y = TY + WTTR_H + 34;

const WttrIn: React.FC<{ T: Cues }> = ({ T }) => {
  const tf = Math.max(22, T.prints - T.wttr - 10);
  const blocks: Block[] = [
    { at: T.wttr, cmd: "curl wttr.in/London", typeFrames: tf, outDelay: 4, out: WTTR_OUT },
    {
      at: T.q0 - 8,
      cmd: "curl wttr.in/London?0",
      typeFrames: 16,
      outDelay: 3,
      out: [[{ t: "London: ", b: true }, { t: "☀️  +19°C · → 20 km/h · 0.0 mm", c: TERM.green, b: true }]],
    },
  ];
  return (
    <>
      <Terminal x={TX} y={TY} w={TW} h={WTTR_H} fontSize={WTTR_FS} enterAt={T.t1} blocks={blocks} />
      <Circle at={T.ascii} until={T.temp} {...termRing(TX, TY, WTTR_FS, 3, 4, 11, 5)} />
      <Circle at={T.temp} until={T.city} {...termRing(TX, TY, WTTR_FS, 3, 16, 12, 5)} />
      <Circle at={T.city} until={T.q0 - 6} {...termRing(TX, TY, WTTR_FS, 0, 4 + 12, 7)} />
      <Circle at={T.q0 + 10} until={T.leave} {...termRing(TX, TY, WTTR_FS, 8, 4 + 19, 2)} />
      <IconNote icon="sun" at={T.prints} until={T.city} y={ONE_NOTE_Y}>
        {"Live weather + ASCII art\nin your terminal"}
      </IconNote>
      <IconNote icon="globe" at={T.city} until={T.q0} y={ONE_NOTE_Y}>
        {"/London = any city\n(Tokyo, Berlin, NewYork)"}
      </IconNote>
      <IconNote icon="bolt" at={T.q0} until={T.leave} y={ONE_NOTE_Y}>
        {"?0 = just today's weather\n?format=3 = one line"}
      </IconNote>
      <IconNote icon="warning" tint={RED} at={T.leave} y={ONE_NOTE_Y}>
        {"No city? It guesses your\nlocation from your IP"}
      </IconNote>
      <Sticker src="raccoon/pointing.png" at={T.ascii} x={TX + 665} y={ONE_NOTE_Y - 25} w={235} />
    </>
  );
};

// ---------------- 2/5 cheat.sh ----------------
const CHEAT_FS = 22;
const CHEAT_H = termH(10, CHEAT_FS);
const TWO_NOTE_Y = TY + CHEAT_H + 38;

const CheatSh: React.FC<{ T: Cues }> = ({ T }) => {
  const tf1 = Math.max(20, T.forget - T.cheat - 10);
  const pyStart = T.ask + 6;
  return (
    <>
      <Win from={T.t2} to={pyStart}>
        <Terminal
          x={TX}
          y={TY}
          w={TW}
          h={CHEAT_H}
          fontSize={CHEAT_FS}
          enterAt={T.t2}
          blocks={[{ at: T.cheat, cmd: "curl cheat.sh/tar", typeFrames: tf1, outDelay: 4, out: CHEAT_TAR_OUT }]}
        />
        <Circle at={T.examples} {...termRing(TX, TY, CHEAT_FS, 5, 0, "tar -xzvf /path/to/foo.tgz".length)} />
      </Win>
      <Win from={pyStart} to={T.t3}>
        <Terminal
          x={TX}
          y={TY}
          w={TW}
          h={CHEAT_H}
          fontSize={CHEAT_FS}
          enterAt={pyStart}
          blocks={[
            {
              at: pyStart + 2,
              cmd: "curl cheat.sh/python/reverse+a+list",
              typeFrames: 24,
              outDelay: 4,
              out: CHEAT_PY_OUT,
            },
          ]}
        />
        <Circle at={T.cheatPy + 24} {...termRing(TX, TY, CHEAT_FS, 7, 0, "list(reversed(array))".length)} />
      </Win>
      <IconNote icon="cross" tint={RED} at={T.forget} until={T.community} y={TWO_NOTE_Y}>
        {"Skip 10 blog posts\nfor one terminal flag"}
      </IconNote>
      <IconNote icon="check" tint={GREEN} at={T.community} until={T.zero} y={TWO_NOTE_Y}>
        {"Community cheat sheets:\njust the working examples"}
      </IconNote>
      <IconNote icon="shieldCheck" tint={GREEN} at={T.zero} until={T.ask} y={TWO_NOTE_Y}>
        {"Zero ads · zero popups\nany CLI tool or language"}
      </IconNote>
      <IconNote icon="code" at={T.ask} y={TWO_NOTE_Y}>
        {"Ask coding questions:\ncheat.sh/python/..."}
      </IconNote>
      <Sticker src="raccoon/scheming.png" at={T.examples} x={TX + 665} y={TWO_NOTE_Y - 10} w={220} />
    </>
  );
};

// ---------------- 3/5 qrenco.de ----------------
const QR_TEXT = "snacks";
const QR_ROWS = qrTerminalRows(QR_TEXT, { quiet: 1 });
const QR_FS = 15;
const QR_H = termH(25, QR_FS);
const QR_CARD = 330;
const THREE_NOTE_Y = TY + QR_H + 32;

const QrencoDe: React.FC<{ T: Cues }> = ({ T }) => {
  const tf = Math.max(20, T.anything - T.qrenco - 10);
  return (
    <>
      <Terminal
        x={TX}
        y={TY}
        w={TW}
        h={QR_H}
        fontSize={QR_FS}
        enterAt={T.t3}
        blocks={[{ at: T.qrenco, cmd: "curl qrenco.de/snacks", typeFrames: tf, outDelay: 4, out: QR_ROWS }]}
      />
      {/* Scannable high-contrast QR card beside the terminal blocks so any phone camera reads it right off the video */}
      <QrCode
        text={QR_TEXT}
        at={T.scannable}
        x={TX + TW - QR_CARD - 36}
        y={TY + 115}
        size={QR_CARD}
        mode="sweep"
        dur={20}
        label="snacks"
      />
      <Circle at={T.scan} x={TX + TW - QR_CARD - 48} y={TY + 103} w={QR_CARD + 24} h={QR_CARD + 24} />
      <IconNote icon="qr" at={T.anything} until={T.gang} y={THREE_NOTE_Y}>
        {"Any text or URL after /\nturns into terminal blocks"}
      </IconNote>
      <IconNote icon="users" at={T.gang} until={T.scan} y={THREE_NOTE_Y}>
        {"Share a URL or Wi-Fi string\nright from your terminal"}
      </IconNote>
      <IconNote icon="phone" tint={GREEN} at={T.scan} y={THREE_NOTE_Y}>
        {"Try scanning it right now →\nit says \"snacks\""}
      </IconNote>
      <Sticker src="raccoon/duo-huddle.png" at={T.gang} x={TX + 670} y={THREE_NOTE_Y - 15} w={215} />
    </>
  );
};

// ---------------- 4/5 ifconfig.me ----------------
const IFC_FS = 26;
const IFC_H = termH(6, IFC_FS);
const PUBLIC_IP = "203.0.113.42"; // RFC 5737 TEST-NET-3 documentation IP (never the machine's real IP)
const VPN_IP = "198.51.100.7"; // RFC 5737 TEST-NET-2 documentation IP
const YOU_NODE = { x: TX + 145, y: 925, w: 136, shape: "circle" as const };
const WEB_NODE = { x: TX + 575, y: 925, w: 136, shape: "circle" as const };
const FOUR_NOTE_Y = 1095;

const IfconfigMe: React.FC<{ T: Cues }> = ({ T }) => {
  const frame = useCurrentFrame();
  const tf = Math.max(18, T.oneLine - T.ifc - 8);
  const vpnCmdAt = T.before + 4;
  const wire = arrowPath({ from: anchors(YOU_NODE).right, to: anchors(WEB_NODE).left });
  return (
    <>
      <Terminal
        x={TX}
        y={TY}
        w={TW}
        h={IFC_H}
        fontSize={IFC_FS}
        enterAt={T.t4}
        blocks={[
          {
            at: T.ifc,
            cmd: "curl ifconfig.me",
            typeFrames: tf,
            outDelay: 4,
            out: [[{ t: PUBLIC_IP, c: TERM.green, b: true }]],
          },
          {
            at: vpnCmdAt,
            cmd: "curl ifconfig.me  # VPN on",
            typeFrames: 18,
            outDelay: 4,
            out: [[{ t: VPN_IP, c: TERM.blue, b: true }]],
          },
        ]}
      />
      <Circle at={T.publicIp} until={vpnCmdAt} {...termRing(TX, TY, IFC_FS, 1, 0, PUBLIC_IP.length)} />
      <Circle at={T.vpn + 4} {...termRing(TX, TY, IFC_FS, 3, 0, VPN_IP.length)} />

      {/* You → Website diagram with VPN tunnel appearing at T.vpn */}
      <Tunnel path={wire} at={T.vpn - 4} width={64} label="VPN tunnel" lock />
      <Node {...YOU_NODE} icon="laptop" label="you" at={T.publicIp} size={28} />
      <Node
        {...WEB_NODE}
        icon="globe"
        label="websites"
        at={T.publicIp + 2}
        size={28}
        states={[{ at: T.vpn, state: "ok" }]}
      />
      <Arrow
        at={T.publicIp + 4}
        from={anchors(YOU_NODE).right}
        to={anchors(WEB_NODE).left}
        active={T.vpn}
        label={frame >= T.vpn ? VPN_IP : PUBLIC_IP}
        labelMono
      />

      <IconNote icon="eye" at={T.oneLine} until={T.before} y={FOUR_NOTE_Y}>
        {"Your public IP address\n(what every website sees)"}
      </IconNote>
      <IconNote icon="shieldCheck" tint={GREEN} at={T.before} y={FOUR_NOTE_Y}>
        {"Run before & after VPN:\nnew IP = VPN is working"}
      </IconNote>
      <Sticker src="raccoon/peek-pillar.png" at={T.website} x={W - 210} y={850} w={210} from="right" />
    </>
  );
};

// ---------------- 5/5 parrot.live ----------------
const PARROT_FS = 20;
const PARROT_H = termH(20, PARROT_FS);
const FIVE_NOTE_Y = TY + PARROT_H + 34;

const ParrotLive: React.FC<{ T: Cues }> = ({ T }) => {
  const frame = useCurrentFrame();
  const tf = 20;
  const streamStart = T.parrotCmd + tf + 4;
  const stopped = frame >= T.ctrlc + 4;
  const activeFrame = stopped ? T.ctrlc + 4 : frame;
  const idx = Math.max(0, Math.floor((activeFrame - streamStart) / 3)) % PARROT_FRAMES.length;
  const color = PARROT_COLORS[Math.max(0, Math.floor((activeFrame - streamStart) / 3)) % PARROT_COLORS.length];
  const typedChars = Math.max(0, Math.min("curl parrot.live".length, Math.floor(((frame - T.parrotCmd) / tf) * "curl parrot.live".length)));

  return (
    <>
      <Terminal x={TX} y={TY} w={TW} h={PARROT_H} fontSize={PARROT_FS} enterAt={T.t5} title="sudo@laptop: ~ (curl parrot.live)">
        {frame < streamStart ? (
          <div style={{ whiteSpace: "pre" }}>
            <span style={{ color: TERM.blue, fontWeight: 700 }}>~ </span>
            <span style={{ color: TERM.green, fontWeight: 700 }}>$ </span>
            <span style={{ color: TERM.fg }}>{"curl parrot.live".slice(0, typedChars)}</span>
            <span style={{ background: TERM.fg }}> </span>
          </div>
        ) : (
          <div style={{ fontFamily: mono, fontSize: PARROT_FS, lineHeight: 1.32, whiteSpace: "pre" }}>
            {PARROT_FRAMES[idx].map((line, i) => (
              <div key={i} style={{ color, fontWeight: 700 }}>
                {line}
              </div>
            ))}
            {stopped ? (
              <div style={{ marginTop: 4 }}>
                <Segs
                  line={[
                    { t: "^C", c: TERM.red, b: true },
                    { t: "  ~ ", c: TERM.blue, b: true },
                    { t: "$ ", c: TERM.green, b: true },
                  ]}
                />
              </div>
            ) : null}
          </div>
        )}
      </Terminal>

      <IconNote icon="star" at={T.streams} until={T.until - 4} y={FIVE_NOTE_Y}>
        {"Streams ANSI frames\nin an infinite loop"}
      </IconNote>
      <KeyCombo keys={["ctrl", "c"]} at={T.until - 4} press={T.ctrlc} x={TX} y={FIVE_NOTE_Y} />
      <Sticker src="raccoon/celebrate.png" at={T.succeeds} x={TX + 640} y={FIVE_NOTE_Y - 125} w={250} fadeBottom={60} />
    </>
  );
};

export const CurlWebsites: React.FC = () => {
  const T = useT();
  return (
    <AbsoluteFill style={{ fontFamily: sans }}>
      <Backdrop />

      <Win from={0} to={T.story}>
        <Hook T={T} />
      </Win>
      <Win from={T.story} to={T.t1}>
        <Story T={T} />
      </Win>
      <Win from={T.t1} to={T.t2}>
        <WttrIn T={T} />
      </Win>
      <Win from={T.t2} to={T.t3}>
        <CheatSh T={T} />
      </Win>
      <Win from={T.t3} to={T.t4}>
        <QrencoDe T={T} />
      </Win>
      <Win from={T.t4} to={T.t5}>
        <IfconfigMe T={T} />
      </Win>
      <Win from={T.t5} to={T.save}>
        <ParrotLive T={T} />
      </Win>

      <ToolHeader
        x={TX}
        y={210}
        w={TW}
        until={T.save}
        tools={[
          { from: T.t1, name: "wttr.in", repo: "curl wttr.in/London · weather", n: 1, of: 5 },
          { from: T.t2, name: "cheat.sh", repo: "curl cheat.sh/tar · cheat sheets", n: 2, of: 5 },
          { from: T.t3, name: "qrenco.de", repo: "curl qrenco.de/snacks · QR code", n: 3, of: 5 },
          { from: T.t4, name: "ifconfig.me", repo: "curl ifconfig.me · public IP", n: 4, of: 5 },
          { from: T.t5, name: "parrot.live", repo: "curl parrot.live · party parrot", n: 5, of: 5 },
        ]}
      />

      <SaveOutro
        at={T.save}
        h={termH(5, 25)}
        fontSize={25}
        lines={cheatLines(
          [
            ["curl wttr.in/London", "live weather"],
            ["curl cheat.sh/tar", "cheat sheets"],
            ["curl qrenco.de/snacks", "terminal QR"],
            ["curl ifconfig.me", "your public IP"],
            ["curl parrot.live", "party parrot"],
          ],
          23,
        )}
        sub="Mac · Linux · Windows (curl.exe)"
        question={"Which one did\nyou try first?"}
      />
      <EndCard at={T.follow} comment={T.comment} question="Which one did you try first?" line="Follow for more terminal tricks." />

      <Captions captions={captions} top={1340} />

      <Audio src={staticFile("curl-websites/voice.mp3")} />
      <Sfx name="whoosh" at={[T.story, T.t1, T.t2, T.t3, T.t4, T.t5, T.save, T.follow]} />
      <Sfx name="mouse-click" at={[T.wttr, T.q0 - 8, T.cheat, T.ask + 8, T.qrenco, T.ifc, T.before + 4, T.parrotCmd]} />
      <Sfx name="switch" at={[T.ctrlc]} />
      <Sfx name="ding" at={[T.prints, T.examples, T.scan, T.vpn, T.streams]} />
    </AbsoluteFill>
  );
};

// Cover (1080×1440, uploaded separately in TikTok Studio): headline + the payoff visual + chips. Not a video frame.
const CTY = 690;
const CFS = 26;
export const CurlWebsitesCover: React.FC = () => (
  <Cover title="5 websites that work" sub="in your terminal." size={92} chips={["wttr.in", "cheat.sh", "qrenco.de"]}>
    <Terminal
      x={CX}
      y={CTY}
      w={CW}
      h={termH(5, CFS)}
      fontSize={CFS}
      title="curl cheat sheet"
      blocks={[
        {
          at: -100,
          out: cheatLines(
            [
              ["curl wttr.in/London", "weather"],
              ["curl cheat.sh/tar", "cheat sheet"],
              ["curl qrenco.de/snacks", "QR code"],
              ["curl ifconfig.me", "public IP"],
              ["curl parrot.live", "party parrot"],
            ],
            23,
          ),
        },
      ]}
    />
    <div style={{ position: "absolute", left: CX + 600, top: CTY + 34 - 240, width: 340, height: 240, overflow: "hidden" }}>
      <Sticker src="raccoon/peek-paws.png" at={-100} x={10} y={10} w={320} from="below" shadow={false} />
    </div>
  </Cover>
);
