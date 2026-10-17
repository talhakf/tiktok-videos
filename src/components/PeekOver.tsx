import { Sticker } from "./Doodles";

/**
 * A raccoon peeking over an edge (a terminal's top, a trash can's rim, a browser window): it rises from
 * behind the edge inside a clip box. `edgeY` is the edge; `overhang` px of the clip reach below it so paws
 * hang over (draw this after the window so they sit on top of it). Good stickers: peek-ledge, peek-paws,
 * ledge-lounge, trash-bin.
 */
export const PeekOver: React.FC<{
  src?: string;
  at: number;
  until?: number;
  x: number; // left of the clip box
  edgeY: number;
  w?: number; // sticker width
  h?: number; // clip height (how much of the raccoon can show)
  overhang?: number;
}> = ({ src = "raccoon/peek-ledge.png", at, until, x, edgeY, w = 280, h = 216, overhang = 30 }) => (
  <div style={{ position: "absolute", left: x, top: edgeY + overhang - h, width: w + 20, height: h, overflow: "hidden" }}>
    {/* no shadow: a clipped shadow shows as a box */}
    <Sticker src={src} at={at} until={until} x={10} y={10} w={w} from="below" shadow={false} />
  </div>
);
