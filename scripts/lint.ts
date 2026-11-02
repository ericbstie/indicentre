// Project lint for mistakes the compiler misses but past PRs kept making.
// `bun scripts/lint.ts` (part of `bun run check`).
//  - unused exports: three cleanup commits on main only removed exports
//    nothing imported. An exported value must be used by another file.
//    A test alone doesn't count unless the value is also used in its own
//    file: the store's Layer lived on main with only its test calling it.
//  - unused types: an exported type must be referenced somewhere (seen:
//    an exported desktop type nobody used). Types used only in their own
//    file are fine: they document a module's shape.
import { Glob } from "bun";

const files = new Map<string, string>();
for await (const f of new Glob("{src,scripts}/**/*.ts").scan())
  files.set(f, await Bun.file(f).text());

const isTest = (f: string) => f.endsWith(".test.ts");
const problems: string[] = [];
const EXPORT =
  /^export (?:(const|let|function|async function|class)|type|interface) (\w+)/gm;
for (const [file, src] of files) {
  if (isTest(file) || file.endsWith(".d.ts")) continue;
  for (const [, value, name] of src.matchAll(EXPORT)) {
    const used = new RegExp(`\\b${name}\\b`);
    const users = [...files].filter(([f, s]) => f !== file && used.test(s));
    const ownUses = src.split(used).length - 2;
    if (!value && !users.length && !ownUses)
      problems.push(`${file}: export type ${name} is unused`);
    if (value && !users.length)
      problems.push(`${file}: export ${name} is unused elsewhere`);
    else if (value && !ownUses && users.every(([f]) => isTest(f)))
      problems.push(`${file}: export ${name} is only used by tests`);
  }
}

for (const p of problems) console.error(p);
if (problems.length) process.exit(1);
