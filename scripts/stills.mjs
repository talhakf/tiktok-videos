// Render a set of preview stills with one bundle.
// Usage: node scripts/stills.mjs <compositionId> <frame> [frame...]
// Output: out/<id>/stills/ (the video note with `composition: <compositionId>`), else out/stills/.
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import fs from "node:fs";
import path from "node:path";

const [id, ...frames] = process.argv.slice(2);
const notes = path.resolve("SudoRaccoon/Videos");
const vid = fs
  .readdirSync(notes)
  .find((f) => f.endsWith(".md") && new RegExp(`^composition: ${id}$`, "m").test(fs.readFileSync(path.join(notes, f), "utf8")));
const dir = vid ? `out/${vid.slice(0, -3)}/stills` : "out/stills";
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), enableCaching: true });
const composition = await selectComposition({ serveUrl, id });
for (const f of frames) {
  const output = `${dir}/${id}-${String(f).padStart(4, "0")}.png`;
  await renderStill({ serveUrl, composition, frame: Number(f), output, scale: 0.5 });
  console.log(output);
}
