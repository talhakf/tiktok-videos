import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { BatterySettingsCard } from "../components/mobile/BatterySettingsCard";
import { BottomSheetModal } from "../components/mobile/BottomSheetModal";
import { PushNotificationStack } from "../components/mobile/PushNotificationStack";
import { SegmentedTabs } from "../components/mobile/SegmentedTabs";
import { SwipeActionList } from "../components/mobile/SwipeActionList";
import { TX } from "../layout";
import { Win } from "../lib/timing";
import { C, mono, prog } from "../theme";

// Preview of the mobile & cross-platform UI group (src/components/mobile/):
// 1. PushNotificationStack (0..120)
// 2. BottomSheetModal (120..240)
// 3. SwipeActionList (240..360)
// 4. SegmentedTabs (360..480)
// 5. BatterySettingsCard (480..600)

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

export const MobileShowcase: React.FC = () => (
  <AbsoluteFill>
    <Backdrop />

    {/* 1. PushNotificationStack: stacked iOS/macOS banners springing down */}
    <Win from={0} to={120}>
      <Label at={0} y={250}>
        PushNotificationStack · spring stack at 6, 24, 42, 60
      </Label>
      <PushNotificationStack
        at={2}
        y={310}
        items={[
          {
            app: "Authenticator",
            time: "now",
            title: "Sign-in request from Frankfurt",
            body: "tap to review new device session on macOS",
            icon: "key",
            tone: "accent",
            at: 6,
          },
          {
            app: "Network Guard",
            time: "1m ago",
            title: "Unencrypted DNS query blocked",
            body: "tracker.metrics-sdk.io was intercepted over port 53",
            icon: "shield",
            tone: "warn",
            at: 24,
          },
          {
            app: "System Security",
            time: "2m ago",
            title: "Clipboard read in background",
            body: "Flashlight Pro pasted from your system clipboard",
            icon: "warning",
            tone: "bad",
            at: 42,
          },
          {
            app: "Passkeys",
            time: "Just now",
            title: "Hardware key synced via iCloud",
            body: "ed25519 credential ready for github.com",
            icon: "shieldCheck",
            tone: "good",
            at: 60,
          },
        ]}
      />
    </Win>

    {/* 2. BottomSheetModal: slide-up Passkey & Biometric confirmation sheet */}
    <Win from={120} to={240}>
      <Label at={120} y={250}>
        BottomSheetModal · slide-up 122 · confirmAt 168
      </Label>
      <BottomSheetModal
        at={122}
        y={305}
        title="Sign in to github.com"
        subtitle="Use your saved passkey for @sudoraccoon"
        icon="fingerprint"
        confirmAt={168}
        rows={[
          { label: "Account", value: "sudo@raccoon.dev", icon: "user", mono: true },
          { label: "Relying party", value: "github.com", icon: "globe", mono: true },
          { label: "Key type", value: "ed25519 hardware enclave", icon: "key" },
        ]}
      />

      <Label at={134} y={975}>
        BottomSheetModal · dark · confirmAt 188
      </Label>
      <BottomSheetModal
        at={136}
        y={1030}
        h={440}
        dark
        title="Authorize SSH key signature"
        subtitle="ssh-ed25519 SHA256:9xK2pL8vQ"
        icon="key"
        confirmAt={188}
        rows={[
          { label: "Host", value: "prod-db-01.internal", icon: "server", mono: true },
        ]}
      />
    </Win>

    {/* 3. SwipeActionList: swipe row left to reveal red Block / blue Archive */}
    <Win from={240} to={360}>
      <Label at={240} y={250}>
        SwipeActionList · swipe row 1 at 268 (Block)
      </Label>
      <SwipeActionList
        at={242}
        y={305}
        title="App network permissions"
        right="3 active"
        items={[
          {
            title: "Signal Messenger",
            sub: "end-to-end encrypted relay · 14.2 MB",
            meta: "443/tcp",
            icon: "lock",
            tone: "good",
          },
          {
            title: "Free QR Scanner",
            sub: "uploading contacts to ad- telemetry-09.net",
            meta: "8080/tcp",
            icon: "qr",
            badge: "suspicious",
            tone: "bad",
          },
          {
            title: "Terminal SSH",
            sub: "local wireguard tunnel · 2.1 MB",
            meta: "22/tcp",
            icon: "terminal",
            tone: "accent",
          },
        ]}
        swipeRow={{
          index: 1,
          at: 268,
          actionLabel: "Block",
          tone: "bad",
          icon: "shield",
          pressAt: 306,
        }}
      />

      <Label at={250} y={810}>
        SwipeActionList · dark · swipe row 0 at 292 (Archive)
      </Label>
      <SwipeActionList
        at={252}
        y={865}
        dark
        title="Active login sessions"
        right="2 devices"
        items={[
          {
            title: "Chrome · Windows 10",
            sub: "last active 42 days ago · unknown IP",
            meta: "revoke",
            icon: "laptop",
            badge: "stale",
            tone: "warn",
          },
          {
            title: "MacBook Pro · kitty",
            sub: "current session · verified via passkey",
            meta: "active",
            icon: "terminal",
            tone: "good",
          },
        ]}
        swipeRow={{
          index: 0,
          at: 292,
          actionLabel: "Archive",
          tone: "accent",
          icon: "archive",
          pressAt: 326,
        }}
      />
    </Win>

    {/* 4. SegmentedTabs: gliding segmented control pill + cross-fading card body */}
    <Win from={360} to={480}>
      <Label at={360} y={250}>
        SegmentedTabs · switches 0 → 1 at 392 → 2 at 428
      </Label>
      <SegmentedTabs
        at={362}
        y={305}
        h={470}
        tabs={[
          {
            label: "Sandbox",
            title: "Isolated app container",
            body: "Each mobile app runs inside its own kernel sandbox with zero read access to other apps’ files.",
            code: "/var/mobile/Containers/Data/Application/8F2A/",
            stat: "uid 501",
            icon: "shield",
            tone: "accent",
          },
          {
            label: "Permissions",
            title: "Just-in-time prompts",
            body: "Camera, mic, and location require explicit user consent and display an active hardware indicator dot.",
            code: "TCC.db → kTCCServiceMicrophone = ALLOW",
            stat: "3 granted",
            icon: "lock",
            tone: "good",
          },
          {
            label: "Background",
            title: "Silent background wakeups",
            body: "Trackers abuse silent push notifications to wake the radio and harvest network telemetry while you sleep.",
            code: "apsd: content-available=1 → wake(03:14:09)",
            stat: "blocked",
            icon: "warning",
            tone: "bad",
          },
        ]}
        switches={[
          { index: 1, at: 392 },
          { index: 2, at: 428 },
        ]}
      />

      <Label at={368} y={830}>
        SegmentedTabs · dark · switch 0 → 1 at 410
      </Label>
      <SegmentedTabs
        at={370}
        y={885}
        h={440}
        dark
        tabs={[
          {
            label: "DNS over HTTPS",
            title: "Encrypted hostname lookups",
            body: "Wraps every domain lookup inside TLS on port 443 so local routers only see the resolver IP.",
            code: "https://cloudflare-dns.com/dns-query",
            stat: "TLS 1.3",
            icon: "globe",
            tone: "good",
          },
          {
            label: "Plaintext DNS",
            title: "Visible to every hop",
            body: "UDP port 53 broadcasts every domain you visit in cleartext to café Wi-Fi and your ISP.",
            code: "UDP 53 → Q: api.bank.com (unencrypted)",
            stat: "exposed",
            icon: "wifiOff",
            tone: "bad",
          },
        ]}
        switches={[{ index: 1, at: 410 }]}
      />
    </Win>

    {/* 5. BatterySettingsCard: 24h activity bars + background harvester alert */}
    <Win from={480} to={600}>
      <Label at={480} y={250}>
        BatterySettingsCard · 24h bars · harvester highlight at 510
      </Label>
      <BatterySettingsCard
        at={482}
        y={310}
        level={38}
        highlightAt={510}
        apps={[
          {
            name: "Flashlight LED Pro",
            pct: 46,
            sub: "4h 12m background activity · 1,840 wakeups",
            icon: "bolt",
            suspicious: true,
          },
          {
            name: "Safari",
            pct: 24,
            sub: "1h 48m on screen · 4m background",
            icon: "globe",
          },
          {
            name: "Messages",
            pct: 16,
            sub: "52m on screen · push notifications",
            icon: "speech",
          },
          {
            name: "Terminal SSH",
            pct: 9,
            sub: "28m on screen · wireguard session",
            icon: "terminal",
          },
        ]}
      />
    </Win>
  </AbsoluteFill>
);
