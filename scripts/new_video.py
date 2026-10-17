"""Start a new Sudo the Raccoon video.

Usage: .venv/bin/python scripts/new_video.py <id> "<Title>" [--format tool-listicle|concept-explainer]

Creates (skips anything that already exists):
  SudoRaccoon/Videos/<id>.md          vault note from Templates/Video.md (status: scripting)
  src/videos/<id>/<Name>.tsx               composition skeleton (hook, one scene, save-card outro)
  public/<id>/captions.json + voice.mp3    placeholders so the Studio loads before tts.py runs
  (the skeleton includes a <Name>Cover still: the 1080×1440 TikTok cover, rendered by scripts/render.py)
and registers the composition in src/Root.tsx.
"""

import datetime
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def pascal(s: str) -> str:
    return "".join(p.capitalize() for p in re.split(r"[^a-zA-Z0-9]+", s) if p)


def main() -> None:
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    fmt = "concept-explainer" if "--format" in sys.argv and "concept" in " ".join(sys.argv) else "tool-listicle"
    if len(args) < 2:
        sys.exit(__doc__)
    vid, title = args[0], args[1]
    if not re.fullmatch(r"[a-z0-9-]+", vid):
        sys.exit("id must be lowercase-with-dashes")
    name = pascal(vid)
    if name[0].isdigit():
        name = "V" + name

    # 1. vault note
    note = ROOT / "SudoRaccoon" / "Videos" / f"{vid}.md"
    if note.exists():
        md = note.read_text()
        md = re.sub(r"^status: idea$", "status: scripting", md, flags=re.M)
        md = re.sub(r"^composition:.*$", f"composition: {name}", md, flags=re.M)
        md = re.sub(r"^output:.*$", f"output: out/{vid}/{vid}-tiktok.mp4", md, flags=re.M)
        note.write_text(md)
        print("updated", note.relative_to(ROOT))
    else:
        tpl = (ROOT / "SudoRaccoon" / "Templates" / "Video.md").read_text()
        md = (
            tpl.replace("id: {{title}}", f"id: {vid}")
            .replace('title: ""', f'title: "{title}"')
            .replace("# {{title}}", f"# {title}")
            .replace("{{date}}", datetime.date.today().isoformat())
            .replace("status: idea", "status: scripting")
            .replace("format: tool-listicle", f"format: {fmt}")
        )
        md = re.sub(r"^composition:.*$", f"composition: {name}", md, flags=re.M)
        md = re.sub(r"^output:.*$", f"output: out/{vid}/{vid}-tiktok.mp4", md, flags=re.M)
        note.write_text(md)
        print("created", note.relative_to(ROOT))

    # 2. placeholders so the composition bundles before the voice exists
    pub = ROOT / "public" / vid
    pub.mkdir(parents=True, exist_ok=True)
    if not (pub / "captions.json").exists():
        (pub / "captions.json").write_text(json.dumps([
            {"text": " Write", "startMs": 0, "endMs": 400, "timestampMs": 200, "confidence": None},
            {"text": " the", "startMs": 400, "endMs": 600, "timestampMs": 500, "confidence": None},
            {"text": " script", "startMs": 600, "endMs": 1200, "timestampMs": 900, "confidence": None},
            {"text": " first.", "startMs": 1200, "endMs": 2000, "timestampMs": 1600, "confidence": None},
        ], indent=1))
    if not (pub / "voice.mp3").exists():
        subprocess.run(["ffmpeg", "-v", "error", "-f", "lavfi", "-i", "anullsrc=r=24000:cl=mono", "-t", "2",
                        "-q:a", "9", str(pub / "voice.mp3")], check=True)

    # 3. composition skeleton
    comp_dir = ROOT / "src" / "videos" / vid
    comp = comp_dir / f"{name}.tsx"
    if not comp.exists():
        comp_dir.mkdir(parents=True, exist_ok=True)
        comp.write_text(SKELETON.replace("__NAME__", name).replace("__ID__", vid).replace("__TITLE__", title))
        print("created", comp.relative_to(ROOT))

    # 4. register in Root.tsx
    root = ROOT / "src" / "Root.tsx"
    r = root.read_text()
    imp = f'import {{ {name}Composition }} from "./videos/{vid}/{name}";'
    if imp not in r:
        last_import = [m.end() for m in re.finditer(r"^import .*;$", r, flags=re.M)][-1]
        r = r[:last_import] + "\n" + imp + r[last_import:]
        tiktok = r.index('<Folder name="TikTok">')
        close = r.index("      </Folder>", tiktok)
        r = r[:close] + f"        <{name}Composition />\n" + r[close:]
        root.write_text(r)
        print("registered", f"{name} in src/Root.tsx")

    print(f"\nnext: write ## Script in SudoRaccoon/Videos/{vid}.md, then .venv/bin/python scripts/tts.py {vid}")


SKELETON = r'''import type { Caption } from "@remotion/captions";
import { Audio } from "@remotion/media";
import { useMemo } from "react";
import { AbsoluteFill, Composition, useCurrentFrame, useVideoConfig, staticFile } from "remotion";
import { Backdrop } from "../../components/Backdrop";
import { Cover, CoverStill, CW, CX } from "../../components/Cover";
import { Captions } from "../../components/Captions";
import { Bubble, Note, Sticker } from "../../components/Doodles";
import { EndCard } from "../../components/EndCard";
import { Terminal, type Block } from "../../components/Terminal";
import { ToolHeader } from "../../components/ToolHeader";
import { makeCues } from "../../lib/cues";
import { C, materialize, prog, sans, W, H } from "../../theme";
import captionsJson from "../../../public/__ID__/captions.json";

// __TITLE__
// Skeleton from scripts/new_video.py. Full example built from the library (git history): git show eb97c76:src/videos/wifi-passwords/WifiPasswords.tsx
// Design + motion rules: SudoRaccoon/Playbook/Design system.md.

const captions = captionsJson as Caption[];
const FPS = 30;
const DURATION = Math.ceil(((captions[captions.length - 1].endMs + 2500) / 1000) * FPS); // end card holds ~2.5s

const TX = 90;
const TY = 420;
const TW = 900;
const TH = 620;
const BAND = 1075; // raccoons / keys / notes live below the terminal

export const __NAME__Composition = () => (
  <>
    <Composition id="__NAME__" component={__NAME__} durationInFrames={DURATION} fps={FPS} width={W} height={H} />
    <CoverStill id="__NAME__Cover" component={__NAME__Cover} />
  </>
);

const useT = () => {
  const { fps } = useVideoConfig();
  return useMemo(() => {
    const { end } = makeCues(captions, fps);
    // TODO: anchor every beat to a spoken word, e.g. t1: at("one"), save: at("save"),
    // cta: last("follow"), comment: last("comment") (the script's last line is the spoken call to action)
    return { story: Math.round(3 * fps), t1: Math.round(8 * fps), outro: Math.max(end - 9 * fps, 10 * fps), cta: Math.max(end - 3 * fps, 12 * fps), end };
  }, [fps]);
};

export const __NAME__: React.FC = () => {
  const T = useT();
  const frame = useCurrentFrame();
  const blocks: Block[] = [{ at: T.t1 + 10, cmd: "echo hello", out: ["hello"] }];
  return (
    <AbsoluteFill style={{ fontFamily: sans }}>
      <Backdrop />

      {/* Hook: title on screen from frame 0 (two-tone), payoff visible */}
      {frame < T.story ? (
        <div style={{ position: "absolute", left: TX, top: 210, width: TW, fontFamily: sans, fontWeight: 700, fontSize: 80,
          lineHeight: 1.02, letterSpacing: "-0.045em", color: C.ink, ...materialize(1 - prog(frame, T.story - 8, 8), 0.98, 8) }}>
          __TITLE__
          <br />
          <span style={{ color: C.mute }}>Explained by a raccoon.</span>
        </div>
      ) : null}

      <ToolHeader x={TX} y={210} w={TW} until={T.outro} tools={[{ from: T.t1, name: "tool", repo: "github.com/owner/tool", n: 1, of: 5 }]} />
      {frame < T.outro ? <Terminal x={TX} y={TY} w={TW} h={TH} blocks={blocks} enterAt={T.t1} /> : null}
      <Note at={T.t1 + 30} until={T.outro} x={TX + 30} y={BAND}>One glass callout per beat</Note>
      <Sticker src="raccoon/pointing.png" at={T.t1 + 20} until={T.outro} x={TX + 600} y={BAND - 85} w={270} />

      {/* Outro: save card + question bubble + handle */}
      <Bubble at={T.outro + 30} x={TX + 380} y={BAND - 250}>{"Which tool\ndid I miss?"}</Bubble>
      <Sticker src="raccoon/waving-laugh.png" at={T.outro + 6} x={TX + 10} y={BAND - 200} w={340} fadeBottom={70} />

      {/* Call to action, every video: follow (badge plus → check), save, comment */}
      <EndCard at={T.cta} question="Which tool did I miss?" />

      <Captions captions={captions} top={1340} />
      <Audio src={staticFile("__ID__/voice.mp3")} />
    </AbsoluteFill>
  );
};

// Cover (1080×1440, uploaded separately in TikTok Studio): headline + the payoff visual + chips. Not a video frame.
export const __NAME__Cover: React.FC = () => (
  <Cover title="__TITLE__" sub="Explained by a raccoon." chips={["tool"]}>
    <Terminal x={CX} y={540} w={CW} h={520} fontSize={30} blocks={[{ at: -100, cmd: "echo hello", out: ["hello"] }]} />
    <Sticker src="raccoon/pointing.png" at={-100} x={780} y={830} w={240} />
  </Cover>
);
'''

if __name__ == "__main__":
    main()
