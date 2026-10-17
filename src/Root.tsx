import { Folder } from "remotion";
import { ProfilePictureStill } from "./brand/ProfilePicture";
import { LibraryFolder } from "./library/Library";
import { WifiPasswordsComposition } from "./videos/wifi-passwords/WifiPasswords";
import { PhishingLinksComposition } from "./videos/phishing-links/PhishingLinks";
import { MacTerminalSecretsComposition } from "./videos/mac-terminal-secrets/MacTerminalSecrets";
import { LinuxFoldersComposition } from "./videos/linux-folders/LinuxFolders";
import { Git3Composition } from "./videos/git-3/Git3";
import { FreeLearningSitesComposition } from "./videos/free-learning-sites/FreeLearningSites";
import { SlowComputerComposition } from "./videos/slow-computer/SlowComputer";
import { WhoOnWifiComposition } from "./videos/who-on-wifi/WhoOnWifi";
import { EmailPlusComposition } from "./videos/email-plus/EmailPlus";
import { NetworkCommandsComposition } from "./videos/network-commands/NetworkCommands";
import { WifiHackingComposition } from "./videos/wifi-hacking/WifiHacking";
import { LinuxMistakesComposition } from "./videos/linux-mistakes/LinuxMistakes";
import { TerminalBasicsComposition } from "./videos/terminal-basics/TerminalBasics";
import { MergeConflictsComposition } from "./videos/merge-conflicts/MergeConflicts";
import { CurlWebsitesComposition } from "./videos/curl-websites/CurlWebsites";
import { ApiCurlComposition } from "./videos/api-curl/ApiCurl";
import { QrBiteComposition } from "./videos/qr-bite/QrBite";
import { DarkWebComposition } from "./videos/dark-web/DarkWeb";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="TikTok">
        <WifiPasswordsComposition />
        <PhishingLinksComposition />
        <MacTerminalSecretsComposition />
        <LinuxFoldersComposition />
        <Git3Composition />
        <FreeLearningSitesComposition />
        <SlowComputerComposition />
        <WhoOnWifiComposition />
        <EmailPlusComposition />
        <NetworkCommandsComposition />
        <WifiHackingComposition />
        <LinuxMistakesComposition />
        <TerminalBasicsComposition />
        <MergeConflictsComposition />
        <CurlWebsitesComposition />
        <ApiCurlComposition />
        <QrBiteComposition />
        <DarkWebComposition />
      </Folder>
      <Folder name="Brand">
        <ProfilePictureStill />
      </Folder>
      <LibraryFolder />
    </>
  );
};
