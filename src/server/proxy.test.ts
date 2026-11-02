import { describe, expect, test } from "bun:test";
import { allowedHosts, hostAllowed, visitor } from "./proxy";

describe("hostAllowed", () => {
  const allowed = allowedHosts(undefined);
  test("default public name and localhost pass, with or without a port", () => {
    for (const h of [
      "indicentre.ericbs.dev",
      "INDICENTRE.ericbs.dev",
      "localhost:7777",
      "127.0.0.1:7777",
      "[::1]:7777",
    ])
      expect(hostAllowed(h, allowed)).toBe(true);
  });
  test("other or missing hosts are refused", () => {
    for (const h of [
      "evil.example",
      "indicentre.ericbs.dev.evil.example",
      "",
      null,
    ])
      expect(hostAllowed(h, allowed)).toBe(false);
  });
  test("ALLOWED_HOSTS replaces the default but keeps localhost", () => {
    const custom = allowedHosts("a.example, b.example");
    expect(hostAllowed("b.example", custom)).toBe(true);
    expect(hostAllowed("localhost", custom)).toBe(true);
    expect(hostAllowed("indicentre.ericbs.dev", custom)).toBe(false);
  });
});

describe("visitor", () => {
  const proxied = new Request("http://indicentre.ericbs.dev/", {
    headers: {
      "x-forwarded-for": "6.6.6.6, 203.0.113.9",
      "x-forwarded-proto": "https",
    },
  });
  test("trusts the last X-Forwarded-For entry and the proto from loopback", () => {
    for (const peer of ["127.0.0.1", "::1", "::ffff:127.0.0.1"])
      expect(visitor(proxied, peer)).toEqual({
        ip: "203.0.113.9",
        scheme: "https",
      });
  });
  test("ignores forwarded headers from anyone else", () => {
    expect(visitor(proxied, "198.51.100.4")).toEqual({
      ip: "198.51.100.4",
      scheme: "http",
    });
  });
  test("direct local request without headers", () => {
    expect(visitor(new Request("http://localhost:7777/"), "127.0.0.1")).toEqual(
      { ip: "127.0.0.1", scheme: "http" },
    );
  });
});
