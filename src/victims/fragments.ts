// Hint fragments, one bank per weakness tag. Read like a coworker's note on
// the lead, not a profile summary. `{name}` = victim's first name.
// No pronouns (we don't know anyone's), no triads, no tidy morals.

import type { Tag } from "./types.ts";

export const FRAGMENTS: Readonly<Record<Tag, ReadonlyArray<string>>> = {
  authority: [
    "Says 'yes officer' to parking wardens.",
    "{name} reads anything with a crest on it twice. Then does what it says.",
    "Has never once argued with a form.",
  ],
  urgency: [
    "Hates a deadline more than losing money.",
    "{name} answers first, thinks after. Usually.",
    "Anything marked FINAL NOTICE gets paid the same hour.",
  ],
  greed: [
    "Thinks the big win is one form away.",
    "{name} still has the voucher from 2019. Hasn't expired, apparently.",
    "Free shipping gets a click. Free anything gets two.",
  ],
  curiosity: [
    "Cannot leave an unopened attachment alone.",
    "{name} opens mystery mail just to see who it's from.",
    "Will click a link titled 'is this you?' at 2 a.m.",
  ],
  fear: [
    "Worries about viruses the way other people worry about weather.",
    "One scary letter and {name} stops sleeping.",
    "Thinks 'your account has been compromised' sounds about right.",
  ],
  lonely: [
    "Keeps callers on the line. Any caller.",
    "{name} talked to a wrong number for forty minutes last week.",
    "Nobody has asked about the garden in months.",
  ],
  parcel: [
    "Always waiting for a parcel. Always.",
    "{name} refreshes tracking pages like other people check the weather.",
    "A missed-delivery note is basically a personal emergency.",
  ],
  bank: [
    "Trusts the bank more than family. Says so at dinner.",
    "{name} would read a code out to anyone who sounds like the bank.",
    "Calls the bank 'my bank'. Like a friend.",
  ],
  romance: [
    "Recently single and very online about it.",
    "{name} replies to every 'hello dear' with a paragraph.",
    "Believes in second chances. And in sailors.",
  ],
  job: [
    "Needs a job yesterday. Will skip the small print.",
    "{name} has a CV on six sites and no replies.",
    "A 'quick remote role, great pay' would get a reply in minutes.",
  ],
  "tech-help": [
    "Calls the printer 'the computer'.",
    "{name} has never updated anything on purpose.",
    "Would let a friendly voice 'just take a look' at the screen.",
  ],
  family: [
    "Would wire money to anyone who says 'Gran, it's me'.",
    "{name} worries about the kids. All of them, all the time.",
    "Picks up instantly if it might be family.",
  ],
};
