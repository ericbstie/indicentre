// Weighted tables the victim generator draws from. Content only: edit freely,
// generate.test.ts checks the shape. Voice: one concrete detail, no pronouns
// in details (names don't tell us anyone's pronouns), people not punchlines.

import type { Defense, Detail, Leak, RecentEvent, Tag } from "./types.ts";

export interface Occupation {
  readonly label: string;
  readonly w: number;
  readonly age: readonly [number, number];
  readonly techComfort: readonly [number, number];
  readonly trust: readonly [number, number];
  readonly wealth: readonly [number, number];
  /** Weaknesses this kind of life tends to have; generator draws 1-2. */
  readonly leans: ReadonlyArray<Tag>;
}

export const OCCUPATIONS: ReadonlyArray<Occupation> = [
  {
    label: "Retired teacher",
    w: 4,
    age: [66, 82],
    techComfort: [0.1, 0.35],
    trust: [0.6, 0.9],
    wealth: [1.2, 1.8],
    leans: ["authority", "bank", "family", "tech-help"],
  },
  {
    label: "Retired ferry engineer",
    w: 3,
    age: [68, 86],
    techComfort: [0.05, 0.3],
    trust: [0.5, 0.85],
    wealth: [1.1, 1.7],
    leans: ["authority", "bank", "lonely", "tech-help"],
  },
  {
    label: "Widowed farmer",
    w: 2,
    age: [70, 88],
    techComfort: [0.05, 0.25],
    trust: [0.55, 0.9],
    wealth: [1, 1.6],
    leans: ["lonely", "authority"],
  },
  {
    label: "Nursing student",
    w: 3,
    age: [19, 26],
    techComfort: [0.5, 0.8],
    trust: [0.3, 0.6],
    wealth: [0.4, 0.7],
    leans: ["parcel", "job", "greed", "curiosity"],
  },
  {
    label: "Delivery driver",
    w: 3,
    age: [22, 45],
    techComfort: [0.4, 0.7],
    trust: [0.3, 0.6],
    wealth: [0.6, 0.9],
    leans: ["job", "greed", "urgency"],
  },
  {
    label: "Bakery owner",
    w: 2,
    age: [35, 60],
    techComfort: [0.25, 0.55],
    trust: [0.4, 0.7],
    wealth: [1, 1.5],
    leans: ["bank", "urgency", "authority"],
  },
  {
    label: "Primary school parent",
    w: 4,
    age: [31, 47],
    techComfort: [0.35, 0.65],
    trust: [0.4, 0.7],
    wealth: [0.9, 1.3],
    leans: ["parcel", "urgency", "family"],
  },
  {
    label: "Hotel night receptionist",
    w: 2,
    age: [24, 50],
    techComfort: [0.4, 0.7],
    trust: [0.3, 0.6],
    wealth: [0.6, 0.9],
    leans: ["lonely", "curiosity"],
  },
  {
    label: "Crypto hobbyist",
    w: 2,
    age: [23, 40],
    techComfort: [0.55, 0.85],
    trust: [0.25, 0.55],
    wealth: [0.8, 1.4],
    leans: ["greed", "curiosity", "urgency"],
  },
  {
    label: "Recently divorced dentist",
    w: 1,
    age: [40, 58],
    techComfort: [0.35, 0.6],
    trust: [0.4, 0.7],
    wealth: [1.5, 2],
    leans: ["lonely", "greed"],
  },
  {
    label: "Job seeker",
    w: 3,
    age: [20, 55],
    techComfort: [0.35, 0.7],
    trust: [0.45, 0.75],
    wealth: [0.4, 0.7],
    leans: ["job", "urgency", "greed"],
  },
  {
    label: "Small-town accountant",
    w: 2,
    age: [38, 63],
    techComfort: [0.4, 0.7],
    trust: [0.3, 0.55],
    wealth: [1.1, 1.6],
    leans: ["authority", "fear", "bank"],
  },
  {
    label: "Bookkeeper at a family plumbing firm",
    w: 2,
    age: [34, 64],
    techComfort: [0.3, 0.6],
    trust: [0.45, 0.75],
    wealth: [1.3, 1.9],
    leans: ["authority", "urgency", "bank"],
  },
  {
    label: "New hire at a regional engineering firm",
    w: 2,
    age: [22, 34],
    techComfort: [0.45, 0.75],
    trust: [0.5, 0.8],
    wealth: [1.2, 1.7],
    leans: ["authority", "urgency", "fear"],
  },
  {
    label: "IT consultant",
    w: 1,
    age: [27, 55],
    techComfort: [0.85, 1],
    trust: [0.1, 0.3],
    wealth: [1.2, 1.7],
    leans: ["curiosity", "parcel"],
  },
  {
    label: "Care home volunteer",
    w: 2,
    age: [55, 75],
    techComfort: [0.15, 0.45],
    trust: [0.65, 0.95],
    wealth: [0.9, 1.3],
    leans: ["family", "fear", "tech-help"],
  },
  {
    label: "Gig-economy designer",
    w: 2,
    age: [24, 38],
    techComfort: [0.6, 0.85],
    trust: [0.3, 0.55],
    wealth: [0.5, 0.9],
    leans: ["job", "curiosity", "fear"],
  },
];

/** Each detail's tag is added to the victim's weaknesses, so hints are fair. */
export const DETAILS: ReadonlyArray<
  Detail & {
    readonly w: number;
    readonly minAge?: number;
    readonly maxAge?: number;
  }
> = [
  {
    w: 3,
    minAge: 60,
    tag: "tech-help",
    text: "Bought a tablet in March. Still prints every email.",
  },
  {
    w: 2,
    minAge: 60,
    tag: "tech-help",
    text: "The grandkids set up the laptop and nobody has touched the settings since.",
  },
  {
    w: 2,
    tag: "tech-help",
    text: "Has a sticky note on the monitor that just says PASSWORD?",
  },
  {
    w: 3,
    minAge: 55,
    tag: "bank",
    text: "Same bank for 41 years. Knows the branch manager's dog by name.",
  },
  {
    w: 2,
    tag: "bank",
    text: "Checks the balance every morning before coffee.",
  },
  {
    w: 3,
    tag: "parcel",
    text: "Three orders in transit. One of them is a lamp shaped like a mushroom.",
  },
  {
    w: 2,
    maxAge: 45,
    tag: "parcel",
    text: "Has the tracking page for a pair of trainers open in a pinned tab.",
  },
  {
    w: 2,
    minAge: 60,
    tag: "lonely",
    text: "Plays bridge on Thursdays. The other six days are quiet.",
  },
  {
    w: 2,
    tag: "lonely",
    text: "Answers every call, including the ones about solar panels.",
  },
  {
    w: 2,
    tag: "lonely",
    text: "Updated a dating profile last week. New photo, same fishing hat.",
  },
  {
    w: 1,
    minAge: 40,
    tag: "lonely",
    text: "Writes long comments under a widowed sea captain's sailing videos.",
  },
  {
    w: 3,
    maxAge: 55,
    tag: "job",
    text: "Has sent out 38 job applications since August.",
  },
  {
    w: 2,
    maxAge: 40,
    tag: "job",
    text: "Rent goes up in January. Looking for anything remote.",
  },
  {
    w: 2,
    tag: "greed",
    text: "Bought a scratch card every Friday for nine years and won 50 kr once.",
  },
  {
    w: 2,
    maxAge: 45,
    tag: "greed",
    text: "Follows four accounts that post screenshots of their trading gains.",
  },
  {
    w: 2,
    tag: "curiosity",
    text: "Clicks every 'you won't believe' headline.",
  },
  {
    w: 1,
    tag: "curiosity",
    text: "Is halfway through a family tree and emails strangers with the same surname.",
  },
  {
    w: 2,
    minAge: 50,
    tag: "family",
    text: "Grandson is backpacking in Peru and only texts when the money runs out.",
  },
  { w: 2, tag: "family", text: "Kid just started university two cities away." },
  {
    w: 2,
    tag: "authority",
    text: "Keeps the tax letters in a folder labelled IMPORTANT, in red.",
  },
  {
    w: 1,
    tag: "authority",
    text: "Stood up when a police officer walked into the café once. Not for any reason.",
  },
  {
    w: 2,
    tag: "fear",
    text: "Got a speeding fine in May and still thinks about it.",
  },
  {
    w: 1,
    tag: "fear",
    text: "Read an article about identity theft and changed nothing, but worried a lot.",
  },
  {
    w: 2,
    tag: "urgency",
    text: "Replies to texts within ten seconds and brags about it.",
  },
  {
    w: 1,
    tag: "urgency",
    text: "Pays every bill the day it arrives. Late fees are a personal insult.",
  },
];

/** The tell. Some victims win, and when they do this is what the player learns. */
export const DEFENSES: ReadonlyArray<
  Omit<Defense, "line"> & {
    readonly w: number;
    /** What they might say; one per victim, never the last one used. */
    readonly lines: readonly [string, string, ...string[]];
  }
> = [
  {
    w: 3,
    id: "calls-back",
    counters: ["bank"],
    behavior: "Called the bank on the number printed on the card instead.",
    lines: [
      "I'll ring the number on my card and ask them myself. Oh, now you have to go?",
      "I'll ring the bank myself. If it's you, you'll pick up.",
    ],
  },
  {
    w: 2,
    id: "asks-family",
    counters: ["tech-help", "fear"],
    behavior: "Asked a family member before doing anything.",
    lines: [
      "My grandson set a rule: anyone who rings about my computer gets hung up on. Sorry, those are the rules.",
      "Let me just ask my son. Hello? Oh, you've gone quiet.",
    ],
  },
  {
    w: 2,
    id: "checks-sender",
    counters: ["parcel", "urgency", "curiosity"],
    behavior: "Checked the sender's address and saw it didn't match.",
    lines: [
      "That address isn't theirs. It's not even close.",
      "Fjellstad Bank has one d at the end. Your link has two.",
    ],
  },
  {
    w: 2,
    id: "uses-app",
    counters: ["parcel"],
    behavior:
      "Opened the shop's own app instead of the link, and there was no fee in it.",
    lines: [
      "The app says it's out for delivery. So what's this, then?",
      "Nothing in the app and nothing on my doorstep, so I'm deleting this text.",
    ],
  },
  {
    w: 2,
    id: "sleeps-on-it",
    counters: ["urgency", "greed"],
    behavior: "Waited a day. The 'deadline' passed and nothing happened.",
    lines: [
      "If it's real it'll still be real tomorrow.",
      "Twenty-four hours, it says. I'll have a look in forty-eight.",
    ],
  },
  {
    w: 2,
    id: "no-fee-for-prizes",
    counters: ["greed"],
    behavior: "Knew that money you have to pay a fee to receive never arrives.",
    lines: [
      "I pay you so you can pay me? No. I didn't enter anything.",
      "I've never won a raffle in my life. I'm not starting with a fee.",
    ],
  },
  {
    w: 2,
    id: "video-call",
    counters: ["lonely"],
    behavior:
      "Asked for a video call. The other side suddenly had a broken camera.",
    lines: [
      "Twelve weeks and your camera's still broken? Buy a new phone.",
      "Camera on, or I'm logging off.",
    ],
  },
  {
    w: 2,
    id: "image-search",
    counters: ["lonely"],
    behavior:
      "Reverse-searched the profile photo. It belonged to a dentist in Trondheim.",
    lines: [
      "Your photo is on a teeth-whitening ad. Nice teeth, though.",
      "Funny. You're also in a brochure for a dentist.",
    ],
  },
  {
    w: 2,
    id: "no-upfront-pay",
    counters: ["job"],
    behavior: "Refused a job that wanted money before the first day.",
    lines: [
      "Employers pay me. That's the whole arrangement.",
      "A starter fee? For a job? Do I pay for my own payslip as well?",
    ],
  },
  {
    w: 2,
    id: "no-remote-access",
    counters: ["tech-help", "fear"],
    behavior: "Wouldn't install anything a stranger asked for.",
    lines: [
      "Nobody is getting into this computer. I can barely get into it.",
      "Install what? No. I don't even install the printer updates.",
    ],
  },
  {
    w: 1,
    id: "safe-word",
    counters: ["family"],
    behavior: "Asked for the family safe word. The 'grandson' didn't know it.",
    lines: [
      "What's the word, then? ... That's what I thought.",
      "Nice try. My grandson has never once called me that.",
    ],
  },
  {
    w: 2,
    id: "looks-up-number",
    counters: ["authority", "fear"],
    behavior: "Looked up the office's real number and asked them directly.",
    lines: [
      "I phoned the actual office. They'd never heard of you.",
      "The real number's on their website. Shall we both ring it now?",
      "I rang them on the number we already had. Nothing has changed, they said.",
    ],
  },
  {
    w: 1,
    id: "reports-it",
    counters: ["authority", "fear", "bank"],
    behavior:
      "Forwarded the message to the bank's fraud team and blocked the number.",
    lines: [
      "Forwarded. Blocked. Back to my crossword.",
      "That's going straight to the fraud team. They know me there.",
    ],
  },
];

export const FIRST_NAMES: ReadonlyArray<string> = [
  "Gunnar",
  "Kari",
  "Ole",
  "Ingrid",
  "Lars",
  "Sofie",
  "Emma",
  "Jonas",
  "Hanna",
  "Erik",
  "Linda",
  "Tom",
  "Aisha",
  "Mateo",
  "Yuki",
  "Grace",
  "Bjørn",
  "Astrid",
  "Nils",
  "Marit",
  "Sigrid",
  "Arne",
  "Tove",
  "Kristian",
  "Leila",
  "Omar",
  "Fatima",
  "Tariq",
  "Mei",
  "Daniel",
  "Sara",
  "Petra",
  "Jakub",
  "Zofia",
  "Aleksander",
  "Noor",
  "Ruth",
  "Edvard",
  "Liv",
  "Henrik",
  "Camilla",
  "Rune",
  "Birgit",
  "Thomas",
  "Selma",
  "Kofi",
  "Amara",
  "Diego",
];

export const LAST_NAMES: ReadonlyArray<string> = [
  "Olsen",
  "Hansen",
  "Berg",
  "Larsen",
  "Haugen",
  "Dahl",
  "Moen",
  "Novak",
  "Silva",
  "Kim",
  "Lund",
  "Bakke",
  "Johansen",
  "Pedersen",
  "Nilsen",
  "Solberg",
  "Strand",
  "Aasen",
  "Eide",
  "Holm",
  "Rahman",
  "Kowalski",
  "Mensah",
  "Torres",
  "Lie",
  "Vik",
  "Sandvik",
  "Myhre",
  "Ruud",
  "Nguyen",
  "Ali",
  "Brekke",
];

type AgeFit = { readonly minAge?: number; readonly maxAge?: number };

/** Dossier flavour: no effect on odds. One per victim, fitted to age. */
export const HOBBIES: ReadonlyArray<Leak & AgeFit> = [
  {
    minAge: 40,
    text: "Sings in a church choir that rehearses on Thursdays.",
    source: "Choir newsletter, public PDF",
  },
  {
    maxAge: 50,
    text: "Five-a-side football, Tuesday nights.",
    source: "Club fixture list",
  },
  {
    minAge: 45,
    text: "Grows marrows. Came second at the county show.",
    source: "Show results page",
  },
  {
    text: "Posts a photo of a cake every Sunday.",
    source: "Public photo feed",
  },
  {
    text: "Plays online chess, mostly after midnight.",
    source: "Public player profile",
  },
  {
    text: "Birdwatcher. Logs every sighting with the time and place.",
    source: "Public sightings map",
  },
  {
    text: "Runs the neighbourhood group chat.",
    source: "Invite link posted on a public noticeboard",
  },
  {
    minAge: 55,
    text: "Knits for the grandchildren. Takes orders from friends too.",
    source: "Craft market listing",
  },
  {
    text: "Restores old radios. Sells the spare parts online.",
    source: "Marketplace seller page",
  },
  {
    minAge: 60,
    text: "Bingo at the community hall on Fridays.",
    source: "Photo of the hall noticeboard",
  },
  {
    maxAge: 55,
    text: "Checks in at the same gym at 6 a.m. every weekday.",
    source: "Fitness app, public by default",
  },
  {
    text: "Writes long reviews of local restaurants. Signs them with a full name.",
    source: "Review site profile",
  },
];

/** What just happened in their life, where it was posted, and what to keep back. */
export const RECENT_EVENTS: ReadonlyArray<RecentEvent & AgeFit> = [
  {
    text: "Just bought a car. The photo shows the plate and the dealer's sign.",
    source: "Public photo post",
    hide: "The plate and the dealer. A new-car post tells strangers money just moved.",
  },
  {
    text: "Moved house last month. The housewarming invite has the new street.",
    source: "Public event page",
    hide: "The street name. An invite can go to friends only.",
  },
  {
    text: "Back from two weeks abroad. Posted the flight times before leaving.",
    source: "Public travel posts",
    hide: "The trip dates, at least until getting home.",
  },
  {
    minAge: 50,
    text: "New grandchild. The birth post names the hospital and both parents.",
    source: "Family photo post, set to public",
    hide: "Family names. They answer half the security questions out there.",
  },
  {
    maxAge: 64,
    text: "Started a new job. Announced the employer and the start date.",
    source: "Career profile",
    hide: "The start date. A fake 'new starter paperwork' mail only works if the sender knows it.",
  },
  {
    minAge: 55,
    text: "Lost a partner in the spring. The memorial page is open for messages.",
    source: "Memorial page",
    hide: "Who can post on the memorial page. Strangers read open guestbooks too.",
  },
  {
    text: "Signed up for a charity run. The fundraising page shows the full name and town.",
    source: "Fundraising page",
    hide: "The town. A fundraiser needs a first name, not a home address.",
  },
  {
    text: "Complained to the bank in public about a blocked card.",
    source: "Public reply thread",
    hide: "Which bank it is. A public complaint tells anyone who to pretend to be.",
  },
  {
    text: "Selling a sofa. The listing shows a personal phone number.",
    source: "Marketplace listing",
    hide: "The phone number. The site's own messages would have done.",
  },
  {
    text: "Birthday last week. Forty-odd friends posted the date and the age.",
    source: "Public birthday wall",
    hide: "The birth date. It's on most identity checks.",
  },
  {
    minAge: 60,
    text: "Retired in June. The leaving-do photos mention the pension fund.",
    source: "Former employer's news page",
    hide: "The pension fund. A new pension is a new reason to expect official mail.",
  },
  {
    minAge: 40,
    text: "The eldest just started university in another city.",
    source: "Proud-parent post",
    hide: "Which city. A 'new phone, need money' text sounds right when the details fit.",
  },
  {
    text: "Posted about a delivery that is three days late.",
    source: "Public complaint to a courier",
    hide: "That a parcel is late. That is the opening line of every fake delivery text.",
  },
];
