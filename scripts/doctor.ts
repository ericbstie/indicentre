// Before you push: how far behind main you are, files this branch changes
// that other unmerged branches change too, and names you removed that open
// branches still use (PR #30 dropped ScamDef fields under three scam PRs),
// and new exports whose name main already has.
//   bun run doctor
import { $ } from "bun";

const lines = (s: string) => s.split("\n").filter(Boolean);
const git = async (...args: string[]) =>
  lines(await $`git ${args}`.quiet().nothrow().text());

await $`git fetch -q origin`.quiet().nothrow();
const [behind = "0"] = await git("rev-list", "--count", "HEAD..origin/main");
if (behind !== "0")
  console.log(`Behind origin/main by ${behind} commit(s): rebase now.\n`);

const [base] = await git("merge-base", "HEAD", "origin/main");
const mine = new Set(await git("diff", "--name-only", base ?? "origin/main"));
const self = (await git("rev-parse", "--abbrev-ref", "@{u}"))[0];

// Field and export names on removed lines that no added line brings back.
const named = (diff: string[], sign: string) =>
  new Set(
    diff.flatMap((l) => {
      const m =
        l[0] === sign &&
        /^.\s*(?:export\s+(?:const|function|type|interface)\s+|readonly\s+)(\w+)/.exec(
          l,
        );
      return m ? [m[1]!] : [];
    }),
  );
const myDiff = await git("diff", base ?? "origin/main", "--", "src");
const added = named(myDiff, "+");
const removed = [...named(myDiff, "-")].filter((n) => !added.has(n));

// A second helper for the same job (two firstName, pct, fill so far).
const exp = "export (const|function|class) ";
const was = named(myDiff, "-");
const newExports = myDiff.flatMap((l) => {
  const m = new RegExp(`^\\+${exp}(\\w+)`).exec(l);
  return m && !was.has(m[2]!) ? [m[2]!] : [];
});
for (const n of newExports) {
  const homes = await git(
    "grep",
    "-lE",
    `^${exp}${n}\\b`,
    "origin/main",
    "--",
    "src",
  );
  if (homes.length)
    console.log(
      `New export ${n}: main already has one in ${homes.join(", ").replaceAll("origin/main:", "")}. Reuse it.\n`,
    );
}

let clashes = 0;
const refs = "--format=%(refname:short)";
for (const ref of await git("for-each-ref", refs, "refs/remotes/origin")) {
  if (ref === self || ref === "origin/main" || !ref.includes("/")) continue;
  // Unmerged = has commits with no patch-equivalent on main (rebase merges).
  if (!(await git("cherry", "origin/main", ref)).some((c) => c[0] === "+"))
    continue;
  const [mb] = await git("merge-base", ref, "origin/main");
  if (!mb) continue;
  const shared = (await git("diff", "--name-only", mb, ref)).filter((f) =>
    mine.has(f),
  );
  const theirs = removed.length
    ? (await git("diff", mb, ref, "--", "src")).filter((l) => l[0] === "+")
    : [];
  const uses = removed.filter((n) =>
    theirs.some((l) => new RegExp(`\\b${n}\\b`).test(l)),
  );
  if (!shared.length && !uses.length) continue;
  clashes++;
  console.log(ref);
  for (const f of shared) console.log(`  ${f}`);
  for (const n of uses)
    console.log(`  uses ${n}, which you removed: tell that branch`);
}
if (!clashes) console.log("No files shared with other open branches.");
