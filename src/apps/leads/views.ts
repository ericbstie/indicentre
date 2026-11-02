import { esc, escLines, tagList } from "../../desktop/html.ts";
import { type Outcome, personalize, pulls } from "../../scams/resolve.ts";
import type { Channel, ScamDef, ScamTemplate } from "../../scams/types.ts";
import { firstName, type Victim } from "../../victims/types.ts";
import type { VictimView } from "../../victims/view.ts";

/** Leads' HTML pieces: a lead card, a pitch, a result. Pure functions. */
export const CHANNEL: Record<Channel, string> = {
  mail: "Mail",
  sms: "Text message",
  call: "Phone call",
  marketplace: "Marketplace",
  social: "Social",
};

export const pct = (x: number) => `${Math.round(x * 100)}%`;

export const viewCard = (v: VictimView) => `
  <b>${esc(v.name)}</b>
  <small>${esc(v.ageBand)} · ${esc(v.occupation)}</small>
  <ul>${v.hints.map((h) => `<li>${esc(h)}</li>`).join("")}</ul>${
    v.weaknesses
      ? `<small>Falls for: ${tagList(v.weaknesses)} · tech ${esc(pct(v.techComfort ?? 0))}</small>`
      : ""
  }${v.defense ? `<small>Watch out: ${esc(v.defense)}</small>` : ""}`;

export interface Result {
  readonly target: Victim;
  readonly scam: ScamDef;
  readonly template: ScamTemplate;
  readonly outcome: Outcome;
  /** A win's reply from `successLines`, personalized. */
  readonly reply: string;
}

export const viewTemplate = (
  t: Victim,
  s: ScamDef,
  tpl: ScamTemplate,
  action: string,
  stakes: string,
) => `
  <div class="template panel">
    <div><b>${esc(tpl.label)}</b> ${tagList(pulls(s, tpl))}
    <p class="subject">${esc(personalize(tpl.subject, t))}</p>
    <p class="body">${escLines(personalize(tpl.body, t))}</p></div>
    <button class="btn" ${action}>Send<small>${esc(stakes)}</small></button>
  </div>`;

export const viewResult = (r: Result) => {
  const first = firstName(r.target);
  const o = r.outcome;
  return `
  <div class="result ${o.success ? "win" : "loss"}">
    <h3>${
      o.success
        ? `${esc(first)} fell for it. +${esc(o.bucks)} bucks`
        : `${esc(first)} ${r.scam.warmups?.includes(r.template) ? "blocked you" : "didn't bite"}. Heat +${esc(o.heat)}`
    }</h3>
    ${o.success ? `<blockquote>"${esc(r.reply)}"</blockquote>` : ""}
    <button class="btn" data-next>Next leads</button>
  </div>`;
};
