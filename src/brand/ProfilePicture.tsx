import { AbsoluteFill, Img, Still, staticFile } from "remotion";
import { C } from "../theme";
import { BRAND } from "./config";

// Channel profile picture (TikTok/Instagram show it as a circle). Same raccoon as the EndCard avatar, so the
// profile and the end of every video match. Render: npx remotion still ProfilePicture <file>.png
const SIZE = 1080;

const ProfilePicture: React.FC<{ bg: string }> = ({ bg }) => (
  <AbsoluteFill style={{ background: bg }}>
    {/* full head with ears; the photo's straight bottom/right edges sit on the canvas edge, outside the circle */}
    <Img src={staticFile(BRAND.avatar)} style={{ position: "absolute", left: 0, bottom: 0, width: SIZE }} />
  </AbsoluteFill>
);

export const ProfilePictureStill = () => (
  <>
    <Still id="ProfilePicture" component={ProfilePicture} defaultProps={{ bg: C.accent }} width={SIZE} height={SIZE} />
    <Still id="ProfilePictureLight" component={ProfilePicture} defaultProps={{ bg: C.paper }} width={SIZE} height={SIZE} />
  </>
);
