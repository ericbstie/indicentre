// Running behind Caddy (docs/hosting.md): Caddy keeps the public Host header
// and adds X-Forwarded-For / X-Forwarded-Proto. Those headers are trusted
// only when the request itself comes from this machine.

/** Hosts the server answers to: ALLOWED_HOSTS (comma-separated) plus localhost. */
export const allowedHosts = (env: string | undefined) =>
  new Set(
    [
      ...(env ?? "indicentre.ericbs.dev").split(","),
      "localhost",
      "127.0.0.1",
      "[::1]",
    ]
      .map((h) => h.trim().toLowerCase())
      .filter(Boolean),
  );

/** True when the Host header (port ignored) is one of `allowed`. */
export const hostAllowed = (host: string | null, allowed: Set<string>) =>
  !!host && allowed.has(host.toLowerCase().replace(/:\d+$/, ""));

const isLoopback = (ip: string) =>
  ip === "::1" || /^(?:::ffff:)?127\./.test(ip);

/** The visitor as the app should see it: from Caddy's headers when proxied locally. */
export const visitor = (req: Request, peer: string) => {
  const trusted = isLoopback(peer);
  const forwarded = req.headers
    .get("x-forwarded-for")
    ?.split(",")
    .at(-1)
    ?.trim();
  const proto = req.headers.get("x-forwarded-proto");
  return {
    ip: (trusted && forwarded) || peer,
    scheme:
      trusted && proto === "https"
        ? "https"
        : new URL(req.url).protocol.slice(0, -1),
  };
};
