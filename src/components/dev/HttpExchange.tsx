import { useCurrentFrame } from "remotion";
import { presence } from "../diagram/Node";
import { GREEN, RED } from "../layouts/Mark";
import { tint } from "../windows/MacWindow";
import { C, easeInOut, materialize, mono, prog, sans } from "../../theme";
import { DevCard } from "./card";
import { CodeLang, LIGHT_SYNTAX, tokenizeLine } from "./syntax";

// One HTTP round trip as two white cards: the request (method chip, path, a few headers, optional body)
// on top, a wire with a dot travelling down, then the response (status pill, headers, short body)
// arriving at `respondAt`, with an optional latency label ("128 ms") beside the wire. No brands:
// use example.com style hosts. Status colours: 2xx green, 3xx blue, 4xx and 5xx red.

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";
export type HttpRequest = { method: HttpMethod; path: string; version?: string; headers?: [string, string][]; body?: string; bodyLang?: CodeLang };
export type HttpResponse = { status: number; reason?: string; headers?: [string, string][]; body?: string; bodyLang?: CodeLang };

/** Reason phrases of the common status codes (RFC 9110). */
export const REASONS: Record<number, string> = {
  100: "Continue",
  101: "Switching Protocols",
  200: "OK",
  201: "Created",
  202: "Accepted",
  204: "No Content",
  301: "Moved Permanently",
  302: "Found",
  304: "Not Modified",
  307: "Temporary Redirect",
  308: "Permanent Redirect",
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  405: "Method Not Allowed",
  409: "Conflict",
  418: "I'm a teapot",
  422: "Unprocessable Content",
  429: "Too Many Requests",
  500: "Internal Server Error",
  502: "Bad Gateway",
  503: "Service Unavailable",
  504: "Gateway Timeout",
};

const statusColors = (s: number) => {
  if (s >= 400) return { bg: tint(RED, 0.12), fg: "#C9281E" };
  if (s >= 300) return { bg: "#EBF4FF", fg: C.accent };
  if (s >= 200) return { bg: tint(GREEN, 0.15), fg: "#248A3D" };
  return { bg: "#F2F2F4", fg: C.mute };
};

const HEAD_ROW = 92;
const PAD = 30;

/** Height of a request / response card for its headers and body lines. */
const cardH = (headers: number, body: number, size: number) =>
  HEAD_ROW + (headers ? 12 + headers * size * 1.5 : 0) + (body ? 22 + body * size * 1.5 : 0) + PAD - 6;

const Headers: React.FC<{ headers: [string, string][]; size: number }> = ({ headers, size }) => (
  <div style={{ padding: `12px ${PAD}px 0`, fontFamily: mono, fontWeight: 500, fontSize: size, lineHeight: 1.5, whiteSpace: "pre" }}>
    {headers.map(([k, v]) => (
      <div key={k} style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
        <span style={{ color: C.mute }}>{k}: </span>
        <span style={{ color: C.ink }}>{v}</span>
      </div>
    ))}
  </div>
);

const Body: React.FC<{ body: string; lang: CodeLang; size: number }> = ({ body, lang, size }) => (
  <div style={{ margin: `22px ${PAD}px 0`, paddingTop: 0, fontFamily: mono, fontWeight: 500, fontSize: size, lineHeight: 1.5, whiteSpace: "pre", position: "relative" }}>
    <div style={{ position: "absolute", left: 0, right: 0, top: -11, height: 1, background: C.line }} />
    {body.split("\n").map((l, i) => (
      <div key={i} style={{ overflow: "hidden" }}>
        {tokenizeLine(l, lang).map((t, k) => (
          <span key={k} style={{ color: LIGHT_SYNTAX[t.k] }}>
            {t.t}
          </span>
        ))}
      </div>
    ))}
  </div>
);

/**
 * Request card at (x, y), then the response card below it (`gap` px of wire between them).
 * `sendAt` (default `at + 12`): a blue dot leaves the request and reaches the response at `respondAt`,
 * when the response card arrives (and `latency`, e.g. "128 ms", appears beside the wire).
 */
export const HttpExchange: React.FC<{
  request: HttpRequest;
  response: HttpResponse;
  x: number;
  y: number;
  w?: number;
  at: number;
  until?: number;
  sendAt?: number;
  respondAt: number;
  latency?: string;
  gap?: number;
  size?: number;
  host?: string; // shown in the request's Host header when `headers` don't set one
}> = ({ request, response, x, y, w = 900, at, until, sendAt, respondAt, latency, gap = 120, size = 26, host }) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;
  const reqHeaders: [string, string][] = [...(host && !request.headers?.some(([k]) => k.toLowerCase() === "host") ? [["Host", host] as [string, string]] : []), ...(request.headers ?? [])];
  const reqH = cardH(reqHeaders.length, request.body ? request.body.split("\n").length : 0, size);
  const resH = cardH(response.headers?.length ?? 0, response.body ? response.body.split("\n").length : 0, size);
  const send = sendAt ?? at + 12;
  const wireTop = y + reqH;
  const wireX = x + 90;
  const wire = prog(frame, send - 6, 8);
  const dot = frame >= send ? prog(frame, send, Math.max(6, respondAt - send), easeInOut) : -1;
  const res = frame >= respondAt ? prog(frame, respondAt, 10) : 0;
  const sc = statusColors(response.status);
  const reason = response.reason ?? REASONS[response.status] ?? "";
  const toneDot = response.status >= 400 ? RED : C.accent;

  return (
    <>
      <DevCard x={x} y={y} w={w} h={reqH} p={p}>
        <div style={{ height: HEAD_ROW, display: "flex", alignItems: "center", gap: 18, padding: `0 ${PAD}px` }}>
          <div
            style={{
              height: 52,
              padding: "0 16px",
              borderRadius: 12,
              background: "#EBF4FF",
              color: C.accent,
              display: "flex",
              alignItems: "center",
              fontFamily: mono,
              fontWeight: 700,
              fontSize: size + 2,
            }}
          >
            {request.method}
          </div>
          <div style={{ flex: 1, fontFamily: mono, fontWeight: 700, fontSize: size + 4, color: C.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {request.path}
          </div>
          <div style={{ fontFamily: mono, fontSize: size - 2, color: C.mute }}>{request.version ?? "HTTP/1.1"}</div>
        </div>
        {reqHeaders.length ? <Headers headers={reqHeaders} size={size} /> : null}
        {request.body ? <Body body={request.body} lang={request.bodyLang ?? "json"} size={size} /> : null}
      </DevCard>

      {/* the wire, the travelling dot, the latency label */}
      <div style={{ position: "absolute", left: wireX - 1.5, top: wireTop, width: 3, height: gap * wire, background: "#D2D2D7", opacity: p, borderRadius: 2 }} />
      {dot >= 0 && res < 1 ? (
        <div
          style={{
            position: "absolute",
            left: wireX - 11,
            top: wireTop + 6 + dot * (gap - 34),
            width: 22,
            height: 22,
            borderRadius: 11,
            background: C.accent,
            opacity: prog(frame, send, 4) * (1 - res),
          }}
        />
      ) : null}
      {latency && res > 0 ? (
        <div
          style={{
            position: "absolute",
            left: wireX + 30,
            top: wireTop + gap / 2 - 24,
            height: 48,
            padding: "0 18px",
            borderRadius: 24,
            background: C.white,
            border: `1px solid ${C.line}`,
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontFamily: mono,
            fontWeight: 700,
            fontSize: size,
            color: C.ink,
            ...materialize(res),
          }}
        >
          <div style={{ width: 12, height: 12, borderRadius: 6, background: toneDot }} />
          {latency}
        </div>
      ) : null}

      {res > 0 ? (
        <DevCard x={x} y={wireTop + gap} w={w} h={resH} p={res * p} style={{ translate: `0px ${(1 - res) * -20}px` }}>
          <div style={{ height: HEAD_ROW, display: "flex", alignItems: "center", gap: 18, padding: `0 ${PAD}px` }}>
            <div
              style={{
                height: 52,
                padding: "0 18px",
                borderRadius: 26,
                background: sc.bg,
                color: sc.fg,
                display: "flex",
                alignItems: "center",
                gap: 12,
                fontFamily: mono,
                fontWeight: 700,
                fontSize: size + 4,
              }}
            >
              {response.status}
              <span style={{ fontFamily: sans, fontWeight: 600, fontSize: size, letterSpacing: "-0.01em" }}>{reason}</span>
            </div>
          </div>
          {response.headers?.length ? <Headers headers={response.headers} size={size} /> : null}
          {response.body ? <Body body={response.body} lang={response.bodyLang ?? "json"} size={size} /> : null}
        </DevCard>
      ) : null}
    </>
  );
};

/** Total height of an HttpExchange (request + wire + response), for laying out what goes below it. */
export const httpExchangeH = (request: HttpRequest, response: HttpResponse, { gap = 120, size = 26, host }: { gap?: number; size?: number; host?: string } = {}) =>
  cardH((request.headers?.length ?? 0) + (host ? 1 : 0), request.body ? request.body.split("\n").length : 0, size) +
  gap +
  cardH(response.headers?.length ?? 0, response.body ? response.body.split("\n").length : 0, size);
