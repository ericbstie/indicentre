# IndiCentre

A satirical game about online safety. You are the new junior at a scam call
center. Seeing scams from the inside, you learn to spot them yourself.

First-person 3D office, a simplified PC desktop, scam bucks to earn, and a
shutdown meter that ends the run if it fills.

## Run

Requires [Bun](https://bun.com) 1.4.4.

```sh
bun install --frozen-lockfile
bun run dev      # http://localhost:3000 with hot reload
```

Click to look around, WASD to move, E to use the PC, Esc to stand up.

| Script          | Does                                               |
| --------------- | -------------------------------------------------- |
| `bun run dev`   | Dev server with HMR                                |
| `bun run start` | Server without hot reload                          |
| `bun run build` | Static production bundle in `dist/`                |
| `bun run check` | Typecheck (strict, doubles as lint) + format check |
| `bun run fmt`   | Format everything                                  |
| `bun run test`  | Unit tests                                         |

To host it behind Caddy on your own server, see
[docs/hosting.md](docs/hosting.md).

See [CONTRIBUTING.md](CONTRIBUTING.md) for the architecture and how to add
scams, apps and NPCs.
