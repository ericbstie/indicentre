// Static files never change while the server runs (the bundle is built
// before it starts, models are hash-pinned), so each is gzipped once and
// kept in memory. Gzip cuts the first load from 3.4 MB to 1.1 MB.
const gzipped = new Map<string, Promise<Uint8Array<ArrayBuffer>>>();

/** `path` as a response with `headers`, gzipped when `req` accepts it; null when missing. */
export const serveFile = async (
  req: Request,
  path: string,
  headers: Record<string, string>,
) => {
  const file = Bun.file(path);
  if (!(await file.exists())) return null;
  const head = {
    ...headers,
    "content-type": file.type,
    vary: "accept-encoding",
  };
  if (!/\bgzip\b/.test(req.headers.get("accept-encoding") ?? ""))
    return new Response(file, { headers: head });
  let body = gzipped.get(path);
  if (!body) {
    body = file.bytes().then((b) => Bun.gzipSync(b));
    gzipped.set(path, body);
  }
  return new Response(await body, {
    headers: { ...head, "content-encoding": "gzip" },
  });
};
