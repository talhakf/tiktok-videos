import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { CryptoBox } from "../components/net/CryptoBox";
import { JwtCard } from "../components/net/JwtCard";
import { NatTable } from "../components/net/NatTable";
import { PacketInspector } from "../components/net/PacketInspector";
import { SequenceDiagram } from "../components/net/SequenceDiagram";
import { UsbPinout } from "../components/net/UsbPinout";
import { TX } from "../layout";
import { Win } from "../lib/timing";
import { C, mono, prog } from "../theme";

// Preview of the net / security group:
// 0..100 SequenceDiagram, 100..200 PacketInspector, 200..300 JwtCard,
// 300..400 NatTable (NAT + DNS sinkhole), 400..500 CryptoBox (E2EE + Passkey), 500..600 UsbPinout.

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
        fontSize: 25,
        color: C.mute,
        opacity: prog(frame, at, 8),
      }}
    >
      {children}
    </div>
  );
};

export const NetShowcase: React.FC = () => (
  <AbsoluteFill>
    <Backdrop />

    {/* 1. SequenceDiagram: TCP 3-way handshake, TLS 1.3 ClientHello/ServerHello, and a dropped packet */}
    <Win from={0} to={100}>
      <Label at={0} y={260}>
        SequenceDiagram · 3-way handshake + TLS 1.3 + lost packet
      </Label>
      <SequenceDiagram
        at={2}
        x={TX}
        y={315}
        w={900}
        h={680}
        actors={[
          { id: "client", label: "Sudo's laptop", sub: "192.168.1.42", icon: "laptop" },
          { id: "server", label: "raccsnacks.com", sub: "203.0.113.9:443", icon: "server" },
        ]}
        messages={[
          { from: "client", to: "server", label: "SYN", sub: "seq=0", at: 10, dur: 14, tone: "accent" },
          { from: "server", to: "client", label: "SYN · ACK", sub: "seq=0, ack=1", at: 24, dur: 14, tone: "accent" },
          { from: "client", to: "server", label: "ACK + ClientHello", sub: "TLS 1.3", at: 38, dur: 14, tone: "good" },
          { from: "server", to: "client", label: "ServerHello · {cert}", sub: "1-RTT keys", at: 52, dur: 14, tone: "good" },
          { from: "client", to: "server", label: "UDP telemetry", sub: "fire & forget", at: 66, dur: 16, dashed: true, lost: true },
        ]}
        brackets={[
          { fromY: 0, toY: 2, label: "1-RTT", at: 42, side: "left" },
          { fromY: 2, toY: 3, label: "TLS 1.3", at: 56, side: "right" },
        ]}
      />
    </Win>

    {/* 2. PacketInspector: Wireshark packet list + OSI layer dissection */}
    <Win from={100} to={200}>
      <Label at={100} y={260}>
        PacketInspector · select 118 → 146 · OSI dissection
      </Label>
      <PacketInspector
        at={102}
        x={TX}
        y={315}
        w={900}
        title="Packet capture · en0"
        packets={[
          { no: 1, time: "0.000", src: "192.168.1.42", dst: "1.1.1.1", proto: "DNS", info: "Standard query A raccsnacks.com", at: 106 },
          { no: 2, time: "0.014", src: "192.168.1.42", dst: "203.0.113.9", proto: "TCP", info: "54321 → 443 [SYN] Seq=0 Win=65535", at: 110 },
          { no: 3, time: "0.028", src: "192.168.1.42", dst: "203.0.113.9", proto: "TLS 1.3", info: "ClientHello · SNI=raccsnacks.com", tone: "good", at: 114 },
          { no: 4, time: "0.085", src: "192.168.1.42", dst: "93.184.216.34", proto: "HTTP", info: "POST /login · pass=snacks123", tone: "bad", at: 118 },
        ]}
        select={[
          { index: 2, at: 122 },
          { index: 3, at: 148 },
        ]}
        layers={[
          { title: "Frame / IPv4", detail: "src 192.168.1.42 → dst 93.184.216.34 · TTL 64", icon: "globe", at: 120 },
          { title: "TCP :80", detail: "src port 54322 → dst port 80 · PSH, ACK", icon: "switch", at: 125 },
          { title: "TLSv1.3", detail: "none — port 80 sends cleartext!", tone: "warn", icon: "warning", at: 130 },
          { title: "HTTP payload", detail: "POST /login · user=sudo&pass=snacks123", highlight: true, tone: "bad", icon: "unlock", at: 135 },
        ]}
      />
    </Win>

    {/* 3. JwtCard: Base64url split, decode, and payload tampering */}
    <Win from={200} to={300}>
      <Label at={200} y={260}>
        JwtCard · decodeAt 212 · tamperAt 250 (role: admin → 401)
      </Label>
      <JwtCard
        at={202}
        x={TX}
        y={315}
        w={900}
        headerJson='{"alg": "HS256", "typ": "JWT"}'
        payloadJson='{"sub": "sudo", "role": "bandit"}'
        signatureLabel="HMACSHA256(header + payload, secret)"
        decodeAt={212}
        tamper={{
          at: 250,
          payloadJson: '{"sub": "sudo", "role": "admin"}',
          note: "tampered in DevTools!",
        }}
      />
    </Win>

    {/* 4. NatTable: Router NAT table on top, Pi-hole DNS sinkhole below */}
    <Win from={300} to={400}>
      <Label at={300} y={250}>
        NatTable · mode="nat" · LAN private ↔ WAN public
      </Label>
      <NatTable
        at={302}
        x={TX}
        y={300}
        w={900}
        mode="nat"
        title="Router NAT table · 203.0.113.7"
        entries={[
          { left: "192.168.1.42:54321", right: "203.0.113.7:61001", sub: "Sudo's laptop · HTTPS", status: "active", at: 308 },
          { left: "192.168.1.18:51820", right: "203.0.113.7:61002", sub: "Phone · WireGuard", status: "ok", at: 316 },
          { left: "0.0.0.0/0:22", right: "192.168.1.42:22", sub: "unsolicited inbound scan", status: "blocked", at: 324 },
        ]}
      />
      <Label at={326} y={690}>
        NatTable · mode="sinkhole" · Pi-hole DNS blocker
      </Label>
      <NatTable
        at={328}
        x={TX}
        y={740}
        w={900}
        mode="sinkhole"
        title="Pi-hole DNS sinkhole"
        entries={[
          { left: "raccsnacks.com", right: "203.0.113.9", sub: "A record · 14 ms", status: "ok", at: 334 },
          { left: "ads.doubleclick.example", right: "0.0.0.0", sub: "blocklist match", status: "blocked", at: 342 },
          { left: "telemetry.smart-tv.local", right: "0.0.0.0", sub: "blocklist match", status: "blocked", at: 350 },
        ]}
      />
    </Win>

    {/* 5. CryptoBox: E2EE encryption on top, Passkey origin check below */}
    <Win from={400} to={500}>
      <Label at={400} y={250}>
        CryptoBox · mode="encrypt" · E2EE keypair
      </Label>
      <CryptoBox
        at={402}
        x={TX}
        y={300}
        w={900}
        mode="encrypt"
        input='"meet at the dumpster at 2am"'
        transformed="0x9f8a7c3e...b412d08f"
        actionAt={416}
        verifyAt={434}
      />
      <Label at={422} y={795}>
        CryptoBox · mode="sign" · Passkey phishing originCheck
      </Label>
      <CryptoBox
        at={424}
        x={TX}
        y={845}
        w={900}
        mode="sign"
        publicLabel="Public key (on paypal.com)"
        privateLabel="Passkey (in Secure Enclave)"
        input="nonce: 8f3b9c1a04e2"
        transformed="sig: ed25519_7a91c0..."
        actionAt={440}
        originCheck={{
          expected: "paypal.com",
          actual: "paypa1.com",
          at: 456,
          ok: false,
        }}
      />
    </Win>

    {/* 6. UsbPinout: BadUSB HID spoofing + data blocker shield */}
    <Win from={500} to={600}>
      <Label at={500} y={260}>
        UsbPinout · deviceClaim 512 · injectAt 524 · blockDataAt 556
      </Label>
      <UsbPinout
        at={502}
        x={TX}
        y={315}
        w={900}
        deviceClaim={{ at: 512, text: "HID Class 0x03 · Keyboard", danger: true }}
        injectAt={524}
        blockDataAt={556}
      />
    </Win>
  </AbsoluteFill>
);
