# Hosting behind Caddy

The game is client-only; the server just serves the built bundle and the
3D models. On the server, Caddy terminates TLS and proxies to the app on
plain HTTP at 127.0.0.1:7777.

## Run

In the project folder (needs Bun 1.4.4 and mise):

```sh
git pull
mise run app >/dev/null 2>&1 & disown
```

`mise run app` installs from the lockfile, runs `bun run build` and starts
the production server (no dev server, hot reload or file watching). To
restart after a `git pull`, stop the old one first:
`pkill -f "bun src/server.ts"`. `mise run dev` is the hot-reload dev server.

## Caddyfile

```
indicentre.ericbs.dev {
	reverse_proxy 127.0.0.1:7777
}
```

Then `caddy reload` (or `sudo systemctl reload caddy`).

## Settings

| Env var         | Default                 | Does                                       |
| --------------- | ----------------------- | ------------------------------------------ |
| `PORT`          | `7777` (`3000` in dev)  | Listen port                                |
| `HOST`          | `127.0.0.1`             | Listen address                             |
| `ALLOWED_HOSTS` | `indicentre.ericbs.dev` | Comma-separated public names (+ localhost) |

Any other `Host` header gets `421`. `X-Forwarded-For` (last entry) and
`X-Forwarded-Proto` are trusted only from 127.0.0.1/::1, i.e. from Caddy;
the request log uses them (`src/server/proxy.ts`). There are no
WebSockets, redirects or cookies in production, so nothing else depends on
the scheme.
