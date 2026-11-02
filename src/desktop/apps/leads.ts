import { seeded } from "../../core/rng.ts";
import { isUnlocked } from "../../core/state.ts";
import { scams } from "../../scams/registry.ts";
import { type Outcome, personalize, resolveScam } from "../../scams/resolve.ts";
import { generateTargets } from "../../scams/targets.ts";
import type { ScamDef, ScamTemplate, Target } from "../../scams/types.ts";
import type { DesktopApp } from "../desktop.ts";
import { esc, escLines } from "../html.ts";

const LEADS_PER_BATCH = 3;

interface Result {
  readonly target: Target;
  readonly scam: ScamDef;
  readonly template: ScamTemplate;
  readonly outcome: Outcome;
}

/** Pick a target, pick a scam template, send, see what happened and why. */
export const leadsApp: DesktopApp = {
  id: "leads",
  title: "Leads",
  icon: "☎",
  mount(el, game) {
    const seedNow = () => {
      const s = game.state();
      return s.day * 10_000 + s.minute;
    };
    let targets = generateTargets(seeded(seedNow()), LEADS_PER_BATCH);
    let target: Target | undefined;
    let result: Result | undefined;

    const available = () => scams.filter((s) => isUnlocked(game.state(), s.id));

    const viewTargets = () => `
      <h3>Today's leads</h3>
      <div class="cards">${targets
        .map(
          (t) => `
        <button class="card" data-target="${esc(t.id)}">
          <b>${esc(t.name)}</b>
          <small>${esc(t.age)} · ${esc(t.archetype)}</small>
          <ul>${t.notes.map((n) => `<li>${esc(n)}</li>`).join("")}</ul>
        </button>`,
        )
        .join("")}</div>`;

    const viewTemplates = (t: Target) => `
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
            <button data-send="${esc(s.id)}/${esc(tpl.id)}">Send</button>
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
            ? `${esc(first)} fell for it. +${esc(o.bucks)} scam bucks`
            : `${esc(first)} reported you. Shutdown meter +${esc(o.heat)}`
        }</h3>
        <p>Odds were ${esc(Math.round(o.chance * 100))}%.</p>
        <h4>Red flags ${esc(first)} ${o.success ? "missed" : "spotted"}</h4>
        <ul>${r.template.redFlags.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>
        <p class="lesson">${esc(r.scam.lesson)}</p>
        <button data-next>Next leads</button>
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
      );
      result = { target, scam, template, outcome };
      outcome.actions.forEach(game.dispatch);
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
      if (d["target"]) target = targets.find((t) => t.id === d["target"]);
      else if (d["back"] !== undefined) target = undefined;
      else if (d["send"]) {
        const [scamId = "", templateId = ""] = d["send"].split("/");
        send(scamId, templateId);
      } else if (d["next"] !== undefined) {
        result = target = undefined;
        targets = generateTargets(seeded(seedNow()), LEADS_PER_BATCH);
      }
      render();
    };

    render();
  },
};
