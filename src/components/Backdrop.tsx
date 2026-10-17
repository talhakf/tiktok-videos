import { AbsoluteFill } from "remotion";
import { C } from "../theme";

// Clean Apple page grey. No texture, no gradient.
export const Backdrop: React.FC = () => <AbsoluteFill style={{ backgroundColor: C.paper }} />;
