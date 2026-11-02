import "./leads.css";
import { seedFrom, seeded } from "../core/rng.ts";
import { availableScams } from "../scams/registry.ts";
import {
  failHeat,
  fitTags,
  type Outcome,
  payout,
  personalize,
  resolveScam,
} from "../scams/resolve.ts";
import { type Modifiers, modifiersFor } from "../shop/tools.ts";
import type { ScamDef, ScamTemplate } from "../scams/types.ts";
import { generateVictims } from "../victims/generate.ts";
import { successChance } from "../victims/resistance.ts";
import { writeHints } from "../victims/hints.ts";
import type { Victim } from "../victims/types.ts";
import { type RevealLevel, reveal, type VictimView } from "../victims/view.ts";
import { esc, escLines } from "../desktop/html.ts";
import type { DesktopApp } from "./app.ts";

const LEADS_PER_BATCH = 3;

interface Lead {
  readonly victim: Victim;
  readonly view: VictimView;
}

const drawLeads = (seed: number, level: RevealLevel): ReadonlyArray<Lead> => {
  const rng = seeded(seed);
  return generateVictims(rng, LEADS_PER_BATCH).map((victim) => ({
    victim,
    view: reveal(victim, writeHints(rng, victim), level),
  }));
};

const pct = (x: number) => `${Math.round(x * 100)}%`;

const viewCard = (v: VictimView) => `
  <b>${esc(v.name)}</b>
  <small>${esc(v.ageBand)} · ${esc(v.occupation)}</small>
  <ul>${v.hints.map((h) => `<li>${esc(h)}</li>`).join("")}</ul>${
    v.weaknesses
      ? `<small>Falls for: ${esc(v.weaknesses.join(", "))} · tech ${esc(pct(v.techComfort ?? 0))}</small>`
      : ""
  }${v.defense ? `<small>Watch out: ${esc(v.defense)}</small>` : ""}`;

interface Result {
  readonly target: Victim;
  readonly scam: ScamDef;
  readonly template: ScamTemplate;
  readonly outcome: Outcome;
}

/** Pick a target, pick a scam template, send, see what happened and why. */
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
    const mods = (): Modifiers => modifiersFor(game.state().ownedTools);
    const draw = () => drawLeads(seedNow(), mods().reveal);
    let leads = draw();
    let target: Victim | undefined;
    let result: Result | undefined;

    const available = () => availableScams(game.state());

    // Payout and heat are always shown before sending; odds need persondata.
    const stakes = (s: ScamDef, tpl: ScamTemplate, t: Victim) => {
      const m = mods();
      const odds =
        m.reveal >= 2
          ? ` · ${pct(successChance(t, fitTags(tpl), m.chanceBonus))} odds`
          : "";
      return `+${payout(s, t)} bucks · heat +${s.heat.success}, +${failHeat(s, m)} if reported${odds}`;
    };

    const viewTargets = () => `
      <h3>Today's leads</h3>
      <div class="cards">${leads
        .map(
          ({ view }) => `
        <button class="card" data-target="${esc(view.id)}">${viewCard(view)}</button>`,
        )
        .join("")}</div>`;

    const viewTemplates = (t: Victim) => `
      <button class="link" data-back>← Leads</button>
      <h3>Scam ${esc(t.name)}</h3>
      ${available()
        .map(
          (s) => `
        <h4>${esc(s.name)}</h4>
        ${s.templates
          .map(
            (tpl) => `
          <div class="template">
            <div><b>${esc(tpl.label)}</b>
            <p class="subject">${esc(personalize(tpl.subject, t))}</p>
            <p class="body">${escLines(personalize(tpl.body, t))}</p></div>
            <button class="btn" data-send="${esc(s.id)}/${esc(tpl.id)}">Send<small>${esc(stakes(s, tpl, t))}</small></button>
          </div>`,
          )
          .join("")}`,
        )
        .join("")}`;

    const viewResult = (r: Result) => {
      const first = personalize("{name}", r.target);
      const o = r.outcome;
      return `
      <div class="result ${o.success ? "win" : "loss"}">
        <h3>${
          o.success
            ? `${esc(first)} fell for it. +${esc(o.bucks)} bucks`
            : `${esc(first)} didn't bite. Heat +${esc(o.heat)}`
        }</h3>
        ${
          o.success
            ? ""
            : `<blockquote>"${esc(o.defense.line)}"</blockquote>
        <p><b>What ${esc(first)} did right:</b> ${esc(o.defense.behavior)}</p>`
        }
        <p>Odds were ${esc(pct(o.chance))}.</p>
        <h4>Red flags ${esc(first)} ${o.success ? "missed" : "could have spotted"}</h4>
        <ul>${r.template.redFlags.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>
        <p class="lesson">${esc(r.scam.lesson)}</p>
        <button class="btn" data-next>Next leads</button>
      </div>`;
    };

    const render = () => {
      if (game.state().status === "shutdown") {
        el.innerHTML = `<div class="leads"><p class="empty">The servers have been seized.</p></div>`;
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

    const send = (scamId: string, templateId: string) => {
      const scam = available().find((s) => s.id === scamId);
      const template = scam?.templates.find((t) => t.id === templateId);
      if (!scam || !template || !target) return;
      const outcome = resolveScam(
        seeded(seedNow() + 7),
        scam,
        target,
        template,
        mods(),
      );
      result = { target, scam, template, outcome };
      outcome.actions.forEach(game.dispatch);
      game.emit({
        type: "ScamResolved",
        scam: scam.id,
        target: target.id,
        success: outcome.success,
        bucks: outcome.bucks,
        heat: outcome.heat,
      });
      if (outcome.success) {
        game.dispatch({
          type: "mail",
          mail: {
            id: `reply-${seedNow()}`,
            from: target.name,
            subject: `Re: ${personalize(template.subject, target)}`,
            body: "Done! I filled everything in. Thank you so much for warning me, you are very kind.",
          },
        });
      }
    };

    el.onclick = (e) => {
      const b = (e.target as HTMLElement).closest<HTMLElement>("button");
      if (!b) return;
      const d = b.dataset;
      if (d["target"])
        target = leads.find((l) => l.view.id === d["target"])?.victim;
      else if (d["back"] !== undefined) target = undefined;
      else if (d["send"]) {
        const [scamId = "", templateId = ""] = d["send"].split("/");
        send(scamId, templateId);
      } else if (d["next"] !== undefined) {
        result = target = undefined;
        leads = draw();
      }
      render();
    };

    render();
  },
} satisfies DesktopApp;
