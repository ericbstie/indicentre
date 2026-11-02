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
- **The slot for it in text is `{name}`.** Seen: `{first}` in
  `src/victims/fragments.ts` and the news slots next to `{name}` in scams.
  The content contract checks it.
- **Tags render with `tagList()`** (`desktop/html.ts`). Seen: "Falls for"
  as comma text in Leads next to new lure chips on pitches and Shop rows.
- **Percentages use one helper.** Seen: `pct()` in `leads.ts`, a second
  `pct()` in PR #4, inline `Math.round(x * 100)` in PR #5.

## Styles

- **Use a token when one exists** (`client/tokens.css`). Seen: `.card` used
  `var(--line)` while `.template` used `#ddd`; `#444`/`#555` instead of
  `var(--ink-soft)` in `leads.css` and PR #4; `#e0e0e0` instead of
  `var(--line)` for the mail list rows (`src/apps/mail.css`).

## Pass 3 (after the story arc and scams 6-8)

- **A number on screen comes from the function that applies it.** Seen: the
  Shop printed `heat.fail` raw while Leads used `failHeat()` with the
  Spoofed caller ID, so one scam showed +13 and +7 (`src/shop/catalog.ts`).
- **`fitTags` name the victim's situation; lures live on templates.** Seen:
  X
  copied from the `new:scam` scaffold, so every pitch showed the same chips.
- **Anything that talks waits in `queueDialog`.** Seen: the catfisher clue
  polled `dialogOpen()`/`modalOpen()` itself (`src/systems/catfisher.ts`).
- **One made-up name per real thing, one label per idea.** Seen: "Windowly"
  in the boss's joke next to "Windoze" in Rohan's script; "What you learned"
  on the run-end card for the beats' "What to spot" lines.
- **After a pitch: outcome, bucks, heat and a win's reply. Nothing else.**
  Seen: a loss quoting the victim's defense, the day 2 call's lesson after
  the call, and Priya promising "what they should have spotted" after every
  send. The content contract greps for it.
- **A line the player hears again comes from a pool of 3+ picked with
  `noRepeat()`.** Seen: one `successLine` per scam (playtest 1).

## Text (slop pass, research/avoiding-slop.md)

The content contract checks the grep-able rules. These are judgment calls:

- **Hints and lessons describe the scam the templates run.** Seen: Mags
  coached a fake seller while the marketplace templates are a fake buyer.
- **Each real-world role has one made-up name:** Fjellstad Bank, QuickCrate
  (courier), Lykke Sport (giveaway shop), Datavakt (tech support). Seen:
  BankCo and ParcelPost next to them, Kwikship and Nettvakt in the scams.
- **Say a point once, where the player reads it.** Seen: the catfish red
  flags in the day 0 lesson, the day 6 lesson and the won ending's note.
- **One image per lead.** Seen: the weather comparison in two fragment
  banks, the password sticky note in both `DETAILS` and fragments.
- **One plain, sad reply in each `successLines` pool.** Seen: all 21 ended
  on the victim's cheerful misreading.
- **Win replies are typed to the scammer.** They arrive as `Re:` mail, so
  they answer the pitch in the victim's own register and the harm shows
  in what they say. Seen: replies written like news quotes ("The bank
  says...") before the real-patterns pass (docs/scam-patterns.md).
- **Places are Norwegian.** Seen: "a dentist in Ohio".
