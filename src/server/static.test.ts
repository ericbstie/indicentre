import { expect, test } from "bun:test";
import { serveFile } from "./static";

const path = `${import.meta.dir}/static.ts`;
const req = (encoding?: string) =>
  new Request("http://localhost/", {
    headers: encoding ? { "accept-encoding": encoding } : {},
  });

test("gzips when the client accepts it, and keeps the given headers", async () => {
  const res = await serveFile(req("gzip, deflate, br"), path, { etag: '"x"' });
  expect(res?.headers.get("content-encoding")).toBe("gzip");
  expect(res?.headers.get("etag")).toBe('"x"');
  const body = Bun.gunzipSync(new Uint8Array(await res!.arrayBuffer()));
  expect(new TextDecoder().decode(body)).toBe(await Bun.file(path).text());
});

test("plain body without gzip in accept-encoding; null for a missing file", async () => {
  const res = await serveFile(req(), path, {});
  expect(res?.headers.get("content-encoding")).toBeNull();
  expect(await res?.text()).toBe(await Bun.file(path).text());
  expect(await serveFile(req("gzip"), `${path}.missing`, {})).toBeNull();
});
