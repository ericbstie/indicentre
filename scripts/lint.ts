// Project lint for mistakes the compiler misses but past PRs kept making.
// `bun scripts/lint.ts` (part of `bun run check`).
//  - unused exports: three cleanup commits on main only removed exports
//    nothing imported. An exported value must be used by another file
//    (tests count). Types are exempt: they document a module's shape.
import { Glob } from "bun";

const files = new Map<string, string>();
for await (const f of new Glob("{src,scripts}/**/*.ts").scan())
  files.set(f, await Bun.file(f).text());

const problems: string[] = [];
const EXPORT = /^export (?:const|let|function|async function|class) (\w+)/gm;
for (const [file, src] of files) {
  if (file.endsWith(".test.ts") || file.endsWith(".d.ts")) continue;
  for (const [, name] of src.matchAll(EXPORT)) {
    const used = new RegExp(`\\b${name}\\b`);
    const elsewhere = [...files].some(([f, s]) => f !== file && used.test(s));
    if (!elsewhere)
      problems.push(`${file}: export ${name} is unused elsewhere`);
  }
}

for (const p of problems) console.error(p);
if (problems.length) process.exit(1);
