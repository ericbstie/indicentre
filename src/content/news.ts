// Text banks for the office news TV. Voice: local paper, flat, one number,
// one place, one name. Victims are people, not punchlines. No pronouns for
// victims (we don't know them), no triads. Slots: {place} {role} {first}
// {age} {amount} {scam}. {role} is the victim's occupation, lowercased.

export const PLACES = [
  "Bergen",
  "Drammen",
  "Tromsø",
  "Skien",
  "Hamar",
  "Bodø",
  "Ålesund",
  "Moss",
  "Kristiansand",
  "Lillehammer",
];

export const VICTIM_HEADLINES = [
  "{place} {role} loses {amount} kr to {scam}",
  "{amount} kr gone in one afternoon, says {place} {role}",
  "Police warn after {place} {role} pays {amount} kr",
  "{place}: {role} hit by {scam}, loses {amount} kr",
  "Another {scam} in {place}. This time {amount} kr",
  "{role} in {place} out {amount} kr after one click",
];

/** What the victim told the reporter. Short, specific, a little off-topic. */
export const VICTIM_QUOTES = [
  "It had the logo. It had my name. I thought that was enough.",
  "I was going to buy a new fridge with that.",
  "I told my son. He went very quiet on the phone, which is worse.",
  "They were so polite. That's the part I keep thinking about.",
  "I checked the sender. I just didn't know what I was checking for.",
  "I've changed every password. I wrote them in a notebook. Is that bad?",
  "It said twenty-four hours. I didn't want to lose the account.",
  "The real bank called the next day. Too late, but nice of them.",
  "I keep opening the mail again. It still looks real to me.",
  "I'm not stupid. I was in a hurry.",
  "My grandson does my email on Sundays now.",
  "They thanked me at the end. They actually thanked me.",
  "The police said I'm the third one on this street this month.",
  "I was on the bus. I just wanted it sorted before my stop.",
];
