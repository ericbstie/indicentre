import "./leads.css";
import { receiveMail } from "../content/mail.ts";
import { seedFrom, seeded } from "../core/rng.ts";
import { availableScams } from "../scams/registry.ts";
import {
  bonusFor,
  failHeat,
  pulls,
  type Outcome,
  payout,
  personalize,
  resolveScam,
  resolveWarmup,
  warmed,
} from "../scams/resolve.ts";
import { type Modifiers, modifiersFor } from "../shop/tools.ts";
import type { Channel, ScamDef, ScamTemplate } from "../scams/types.ts";
import { daily, generateVictims } from "../victims/generate.ts";
import { ANGLES } from "../victims/angles.ts";
import { fitLabel, successChance } from "../victims/resistance.ts";
import { writeHints } from "../victims/hints.ts";
import { firstName, type Victim } from "../victims/types.ts";
import { type RevealLevel, reveal, type VictimView } from "../victims/view.ts";
import { esc, escLines, tagList } from "../desktop/html.ts";
import { callOddsModifier } from "../workplace/slice.ts";
import type { DesktopApp } from "./app.ts";

const LEADS_PER_BATCH = 3;

interface Lead {
  readonly victim: Victim;
  readonly view: VictimView;
}

const today = daily();

const drawLeads = (
  seed: number,
  day: number,
  level: RevealLevel,
): ReadonlyArray<Lead> => {
  const rng = seeded(seed);
  const t = today(day);
  return generateVictims(rng, LEADS_PER_BATCH, t).map((victim) => ({
    victim,
    view: reveal(victim, writeHints(rng, victim, t.pickLine), level),
  }));
};

const CHANNEL: Record<Channel, string> = {
  mail: "Mail",
  sms: "Text message",
  call: "Phone call",
  marketplace: "Marketplace",
  social: "Social",
};

const pct = (x: number) => `${Math.round(x * 100)}%`;

const viewCard = (v: VictimView) => `
  <b>${esc(v.name)}</b>
  <small>${esc(v.ageBand)} · ${esc(v.occupation)}</small>
  <ul>${v.hints.map((h) => `<li>${esc(h)}</li>`).join("")}</ul>${
    v.weaknesses
      ? `<small>Falls for: ${tagList(v.weaknesses)} · tech ${esc(pct(v.techComfort ?? 0))}</small>`
      : ""
  }${v.defense ? `<small>Watch out: ${esc(v.defense)}</small>` : ""}`;

/**
 * Persondata's full profile of one lead: what public posts give away.
 * `best` is the open pitch with the highest odds, if any.
 */
const viewDossier = (v: VictimView, best?: { label: string; p: number }) => {
  const top = v.weaknesses?.[0];
  return v.hobby && v.recent && top
    ? `<section class="dossier">
        <h4>Dossier <small>scraped from public posts</small></h4>
        <dl>
          <dt>Who</dt><dd>${esc(v.ageBand)} · ${esc(v.occupation)}</dd>
          <dt>Hobby</dt><dd>${esc(v.hobby.text)} <small>${esc(v.hobby.source)}</small></dd>
          <dt>Recently</dt><dd>${esc(v.recent.text)} <small>${esc(v.recent.source)}</small></dd>
          <dt>Falls for</dt><dd>${tagList(v.weaknesses ?? [])} tech ${esc(pct(v.techComfort ?? 0))}</dd>
          <dt>Watch out</dt><dd>${esc(v.defense ?? "")}</dd>
          <dt>Angle</dt><dd>${tagList([top])} ${esc(ANGLES[top])}${
            best
              ? ` <small>Best open pitch: ${esc(best.label)}, ${esc(fitLabel(best.p))}</small>`
              : ""
          }</dd>
        </dl>
        <p class="lesson"><b>What ${esc(firstName(v))} could have hidden:</b> ${esc(v.recent.hide)}</p>
      </section>`
    : `<p class="empty">No dossier. Persondata in the Shop builds one from public posts.</p>`;
};

interface Result {
  readonly target: Victim;
  readonly scam: ScamDef;
  readonly template: ScamTemplate;
  readonly outcome: Outcome;
}

/** Pick a target, pick a scam template, send, see what happened. */
export default {
  id: "leads",
  title: "Leads",
  icon: "☎",
  order: 10,
  mount(el, { game }) {
    // `?seed=abc` makes every lead batch reproducible for playtests.
    const runSeed = seedFrom(
      new URLSearchParams(location.search).get("seed") ?? "",
    );
    const seedNow = () => {
      const s = game.state();
      return runSeed + s.day * 10_000 + s.minute;
    };
    const mods = (): Modifiers => {
      const s = game.state();
      return {
        ...modifiersFor(s.ownedTools),
        callBonus: callOddsModifier(s.workplace),
      };
    };
    const draw = () => drawLeads(seedNow(), game.state().day, mods().reveal);
    let leads = draw();
    let target: Victim | undefined;
    let result: Result | undefined;
    /** Warm-ups landed per `${victim}/${scam}` in this batch of leads. */
    let landed = new Map<string, number>();
    const key = (t: Victim, s: ScamDef) => `${t.id}/${s.id}`;
    const current = (t: Victim, s: ScamDef) =>
      warmed(t, s, landed.get(key(t, s)) ?? 0);

    const available = () => availableScams(game.state());

    // Payout, heat and a coarse fit are always shown; exact odds need persondata.
    const stakes = (s: ScamDef, tpl: ScamTemplate, t: Victim) => {
      const m = mods();
      const p = successChance(t, pulls(s, tpl), bonusFor(s, m));
      const odds = m.reveal >= 2 ? `, ${pct(p)} odds` : "";
      return `${CHANNEL[s.channel]} · +${payout(s, t)} bucks · heat +${s.heat.success}, +${failHeat(s, m)} if reported · ${s.minutes} min · ${fitLabel(p)}${odds}`;
    };

    const viewTargets = () => `
      <h3>Today's leads</h3>
      <div class="cards">${leads
        .map(
          ({ view }) => `
        <button class="card" data-target="${esc(view.id)}">${viewCard(view)}</button>`,
        )
        .join("")}</div>`;

    const viewTemplate = (
      t: Victim,
      s: ScamDef,
      tpl: ScamTemplate,
      action: string,
      stakes: string,
    ) => `
      <div class="template">
        <div><b>${esc(tpl.label)}</b> ${tagList(pulls(s, tpl))}
        <p class="subject">${esc(personalize(tpl.subject, t))}</p>
        <p class="body">${escLines(personalize(tpl.body, t))}</p></div>
        <button class="btn" ${action}>Send<small>${esc(stakes)}</small></button>
      </div>`;

    const viewWarmups = (t: Victim, s: ScamDef) => {
      const warmups = s.warmups ?? [];
      if (!warmups.length) return "";
      const done = landed.get(key(t, s)) ?? 0;
      const next = warmups[done];
      return `
        <p class="trust">Trust <meter value="${esc(current(t, s).trust)}"></meter>
          ${esc(done)}/${esc(warmups.length)} warm-ups. Ask now or keep talking.</p>
        ${next ? viewTemplate(t, s, next, `data-warm="${esc(s.id)}"`, `${CHANNEL[s.channel]} · no bucks yet · heat +${s.heat.success} if blocked · ${s.minutes} min`) : ""}`;
    };

    const viewOf = (t: Victim) => leads.find((l) => l.victim === t)?.view;

    /** The available pitch with the best odds on `t`, for the dossier. */
    const bestPitch = (t: Victim) => {
      const m = mods();
      return available()
        .flatMap((s) =>
          s.templates.map((tpl) => ({
            label: tpl.label,
            p: successChance(current(t, s), pulls(s, tpl), bonusFor(s, m)),
          })),
        )
        .reduce<{ label: string; p: number } | undefined>(
          (a, b) => (a && a.p >= b.p ? a : b),
          undefined,
        );
    };

    const viewTemplates = (t: Victim) => {
      const view = viewOf(t);
      return `
      <button class="link" data-back>← Leads</button>
      <h3>Scam ${esc(t.name)}</h3>
      ${view ? viewDossier(view, bestPitch(t)) : ""}
      ${available()
        .map(
          (s) => `
        <h4>${esc(s.name)}</h4>
        ${viewWarmups(t, s)}
        ${s.templates
          .map((tpl) =>
            viewTemplate(
              t,
              s,
              tpl,
              `data-send="${esc(s.id)}/${esc(tpl.id)}"`,
              stakes(s, tpl, current(t, s)),
            ),
          )
          .join("")}`,
        )
        .join("")}`;
    };

    const viewResult = (r: Result) => {
      const first = firstName(r.target);
      const o = r.outcome;
      return `
      <div class="result ${o.success ? "win" : "loss"}">
        <h3>${
          o.success
            ? `${esc(first)} fell for it. +${esc(o.bucks)} bucks`
            : `${esc(first)} ${r.scam.warmups?.includes(r.template) ? "blocked you" : "didn't bite"}. Heat +${esc(o.heat)}`
        }</h3>
        ${
          o.success
            ? `<blockquote>"${esc(personalize(r.scam.successLine, r.target))}"</blockquote>`
            : `<blockquote>"${esc(o.defense.line)}"</blockquote>`
        }
        <button class="btn" data-next>Next leads</button>
      </div>`;
    };

    const render = () => {
      if (game.state().status !== "playing") {
        el.innerHTML = `<div class="leads"><p class="empty">No more leads.</p></div>`;
        return;
      }
      el.innerHTML = `<div class="leads">${
        result
          ? viewResult(result)
          : target
            ? viewTemplates(target)
            : viewTargets()
      }</div>`;
    };

    const resolved = (target: Victim, scam: ScamDef, o: Outcome) =>
      game.emit({
        type: "ScamResolved",
        scam: scam.id,
        target: target.id,
        success: o.success,
        bucks: o.bucks,
        heat: o.heat,
        victim: {
          name: target.name,
          age: target.age,
          occupation: target.occupation,
          detail: target.detail.text,
          defense: target.defense,
        },
      });

    const send = (scamId: string, templateId: string) => {
      const scam = available().find((s) => s.id === scamId);
      const template = scam?.templates.find((t) => t.id === templateId);
      if (!scam || !template || !target) return;
      const outcome = resolveScam(
        seeded(seedNow() + 7),
        scam,
        current(target, scam),
        template,
        mods(),
      );
      result = { target, scam, template, outcome };
      outcome.actions.forEach(game.dispatch);
      resolved(target, scam, outcome);
      if (outcome.success) {
        game.dispatch(
          receiveMail({
            id: `reply-${seedNow()}`,
            from: target.name,
            subject: `Re: ${personalize(template.subject, target)}`,
            body: personalize(scam.successLine, target),
          }),
        );
      }
    };

    const warm = (scamId: string) => {
      const scam = available().find((s) => s.id === scamId);
      if (!scam || !target) return;
      const done = landed.get(key(target, scam)) ?? 0;
      const template = scam.warmups?.[done];
      if (!template) return;
      const outcome = resolveWarmup(
        seeded(seedNow() + 3),
        scam,
        current(target, scam),
        template,
        mods(),
      );
      outcome.actions.forEach(game.dispatch);
      if (outcome.success) {
        landed.set(key(target, scam), done + 1);
        return;
      }
      result = { target, scam, template, outcome };
      resolved(target, scam, outcome);
    };

    el.onclick = (e) => {
      const b = (e.target as HTMLElement).closest<HTMLElement>("button");
      if (!b) return;
      const d = b.dataset;
      if (d["target"])
        target = leads.find((l) => l.view.id === d["target"])?.victim;
      else if (d["back"] !== undefined) target = undefined;
      else if (d["warm"]) warm(d["warm"]);
      else if (d["send"]) {
        const [scamId = "", templateId = ""] = d["send"].split("/");
        send(scamId, templateId);
      } else if (d["next"] !== undefined) {
        result = target = undefined;
        landed = new Map();
        leads = draw();
      }
      render();
    };

    render();
  },
} satisfies DesktopApp;
