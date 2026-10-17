import { Composition, Folder } from "remotion";
import { H, W } from "../theme";
import { AIShowcase } from "./AIShowcase";
import { AlgoShowcase } from "./AlgoShowcase";
import { ApiShowcase } from "./ApiShowcase";
import { ArchShowcase } from "./ArchShowcase";
import { BytesShowcase } from "./BytesShowcase";
import { ChartsShowcase } from "./ChartsShowcase";
import { CLIShowcase } from "./CLIShowcase";
import { CloudShowcase } from "./CloudShowcase";
import { DataShowcase } from "./DataShowcase";
import { DebugShowcase } from "./DebugShowcase";
import { DevShowcase } from "./DevShowcase";
import { DiagramsShowcase } from "./DiagramsShowcase";
import { DistShowcase } from "./DistShowcase";
import { DomShowcase } from "./DomShowcase";
import { GitShowcase } from "./GitShowcase";
import { HardwareShowcase } from "./HardwareShowcase";
import { IconSheet } from "./IconSheet";
import { KernelShowcase } from "./KernelShowcase";
import { KineticShowcase } from "./KineticShowcase";
import { LangShowcase } from "./LangShowcase";
import { LayoutsShowcase } from "./LayoutsShowcase";
import { MathShowcase } from "./MathShowcase";
import { MediaShowcase } from "./MediaShowcase";
import { MetaphorShowcase } from "./MetaphorShowcase";
import { MetricsShowcase } from "./MetricsShowcase";
import { MobileShowcase } from "./MobileShowcase";
import { MoreShowcase } from "./MoreShowcase";
import { MotionShowcase } from "./MotionShowcase";
import { NetShowcase } from "./NetShowcase";
import { ParseShowcase } from "./ParseShowcase";
import { SecShowcase } from "./SecShowcase";
import { SocialShowcase } from "./SocialShowcase";
import { StorageShowcase } from "./StorageShowcase";
import { StoryShowcase } from "./StoryShowcase";
import { UIShowcase } from "./UIShowcase";
import { WebShowcase } from "./WebShowcase";
import { WidgetsShowcase } from "./WidgetsShowcase";
import { WindowsShowcase } from "./WindowsShowcase";

// Library previews: one composition per component group, for Remotion Studio and review stills
// (`npx remotion still <id> --frame=<n> out/library/<id>.png`). Not videos: nothing here is posted.
export const LibraryFolder: React.FC = () => (
  <Folder name="Library">
    <Composition id="LibIcons" component={IconSheet} durationInFrames={60} fps={30} width={W} height={H} />
    <Composition id="LibWindows" component={WindowsShowcase} durationInFrames={600} fps={30} width={W} height={H} />
    <Composition id="LibDiagrams" component={DiagramsShowcase} durationInFrames={600} fps={30} width={W} height={H} />
    <Composition id="LibData" component={DataShowcase} durationInFrames={600} fps={30} width={W} height={H} />
    <Composition id="LibLayouts" component={LayoutsShowcase} durationInFrames={600} fps={30} width={W} height={H} />
    <Composition id="LibMore" component={MoreShowcase} durationInFrames={600} fps={30} width={W} height={H} />
    <Composition id="LibMotion" component={MotionShowcase} durationInFrames={600} fps={30} width={W} height={H} />
    <Composition id="LibCharts" component={ChartsShowcase} durationInFrames={600} fps={30} width={W} height={H} />
    <Composition id="LibUI" component={UIShowcase} durationInFrames={600} fps={30} width={W} height={H} />
    <Composition id="LibDev" component={DevShowcase} durationInFrames={600} fps={30} width={W} height={H} />
    <Composition id="LibSocial" component={SocialShowcase} durationInFrames={600} fps={30} width={W} height={H} />
    <Composition id="LibBytes" component={BytesShowcase} durationInFrames={600} fps={30} width={W} height={H} />
    <Composition id="LibNet" component={NetShowcase} durationInFrames={600} fps={30} width={W} height={H} />
    <Composition id="LibArch" component={ArchShowcase} durationInFrames={600} fps={30} width={W} height={H} />
    <Composition id="LibCLI" component={CLIShowcase} durationInFrames={600} fps={30} width={W} height={H} />
    <Composition id="LibWeb" component={WebShowcase} durationInFrames={600} fps={30} width={W} height={H} />
    <Composition id="LibAI" component={AIShowcase} durationInFrames={600} fps={30} width={W} height={H} />
    <Composition id="LibAlgo" component={AlgoShowcase} durationInFrames={600} fps={30} width={W} height={H} />
    <Composition id="LibHardware" component={HardwareShowcase} durationInFrames={600} fps={30} width={W} height={H} />
    <Composition id="LibCloud" component={CloudShowcase} durationInFrames={600} fps={30} width={W} height={H} />
    <Composition id="LibDom" component={DomShowcase} durationInFrames={600} fps={30} width={W} height={H} />
    <Composition id="LibParse" component={ParseShowcase} durationInFrames={600} fps={30} width={W} height={H} />
    <Composition id="LibMath" component={MathShowcase} durationInFrames={600} fps={30} width={W} height={H} />
    <Composition id="LibWidgets" component={WidgetsShowcase} durationInFrames={600} fps={30} width={W} height={H} />
    <Composition id="LibStory" component={StoryShowcase} durationInFrames={600} fps={30} width={W} height={H} />
    <Composition id="LibMetaphor" component={MetaphorShowcase} durationInFrames={600} fps={30} width={W} height={H} />
    <Composition id="LibSec" component={SecShowcase} durationInFrames={600} fps={30} width={W} height={H} />
    <Composition id="LibDist" component={DistShowcase} durationInFrames={600} fps={30} width={W} height={H} />
    <Composition id="LibDebug" component={DebugShowcase} durationInFrames={600} fps={30} width={W} height={H} />
    <Composition id="LibStorage" component={StorageShowcase} durationInFrames={600} fps={30} width={W} height={H} />
    <Composition id="LibKernel" component={KernelShowcase} durationInFrames={600} fps={30} width={W} height={H} />
    <Composition id="LibMedia" component={MediaShowcase} durationInFrames={600} fps={30} width={W} height={H} />
    <Composition id="LibLang" component={LangShowcase} durationInFrames={600} fps={30} width={W} height={H} />
    <Composition id="LibGit" component={GitShowcase} durationInFrames={600} fps={30} width={W} height={H} />
    <Composition id="LibApi" component={ApiShowcase} durationInFrames={600} fps={30} width={W} height={H} />
    <Composition id="LibMobile" component={MobileShowcase} durationInFrames={600} fps={30} width={W} height={H} />
    <Composition id="LibMetrics" component={MetricsShowcase} durationInFrames={600} fps={30} width={W} height={H} />
    <Composition id="LibKinetic" component={KineticShowcase} durationInFrames={600} fps={30} width={W} height={H} />
  </Folder>
);
