// Lists files this branch changes that other unmerged branches change too,
// so name clashes and shared-file edits show up before the PR does.
//   bun run doctor
import { $ } from "bun";

const lines = (s: string) => s.split("\n").filter(Boolean);
const git = async (...args: string[]) =>
  lines(await $`git ${args}`.quiet().nothrow().text());

await $`git fetch -q origin`.quiet().nothrow();
const [base] = await git("merge-base", "HEAD", "origin/main");
const mine = new Set(await git("diff", "--name-only", base ?? "origin/main"));
const self = (await git("rev-parse", "--abbrev-ref", "@{u}"))[0];

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
  if (!shared.length) continue;
  clashes++;
  console.log(`${ref}\n${shared.map((f) => `  ${f}`).join("\n")}`);
}
if (!clashes) console.log("No files shared with other open branches.");
