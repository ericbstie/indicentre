# Consistency rules

Each rule exists because the same thing was already done two ways. Add a
rule only when you find a real duplicate, and cite where.

## Words the player sees

- **Money is "bucks", danger is "heat".** Write `+N bucks` and `heat +N`.
  Seen: `+N scam bucks` and `Shutdown meter +N` in the Leads result next to
  `+N bucks · heat +N` on the Send button (`src/apps/leads.ts`), and
  `Heat` / `N bucks` in the PR #5 HUD. Also seen: `Pays N, +N heat` in the
  Shop scam blurb (`src/shop/catalog.ts`) and "shutdown meter" in the welcome
  mail (`src/content/mail.ts`) while the HUD says `Heat`.
- **Key hints read `[Key] Action`.** Seen: `[E] Use PC`, `[Esc] Leave`,
  `[M] Sound on`, but `Esc to stand up` on the desktop (`src/desktop/desktop.ts`).

## One way to show a thing

- **Stakes live on the Send button's `<small>` line** (`src/apps/leads.ts`).
  Extend that line; don't add a second stakes paragraph. Seen: PR #4 and
  PR #5 each add their own `.stakes` line beside it.
- **What the player may know before sending goes through `RevealLevel`**
  (`src/victims/view.ts`, `REVEAL` in `leads.ts`). Seen: PR #4 shows odds
  always, PR #5 gates them on a separate `revealOdds` tool flag.
- **Victim traits use `victims/types.ts` tags.** Seen: PR #4 adds a second
  tag list (`FIT_TAGS`) for the same idea.
- **The takeaway box is `.lesson` in `client/tokens.css`.** Seen: Leads and
  the PR #5 Shop each declared their own copy.
- **A victim's first name comes from `firstName()`** (`src/victims/types.ts`).
  Seen: a second `firstName` in `src/news/news.ts`, and
  `personalize("{name}", target)` used as one in `src/apps/leads.ts`.
- **Percentages use one helper.** Seen: `pct()` in `leads.ts`, a second
  `pct()` in PR #4, inline `Math.round(x * 100)` in PR #5.

## Styles

- **Use a token when one exists** (`client/tokens.css`). Seen: `.card` used
  `var(--line)` while `.template` used `#ddd`; `#444`/`#555` instead of
  `var(--ink-soft)` in `leads.css` and PR #4; `#e0e0e0` instead of
  `var(--line)` for the mail list rows (`src/apps/mail.css`).
