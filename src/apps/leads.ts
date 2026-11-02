import "./leads.css";
import { receiveMail } from "../content/mail.ts";
import { noRepeat, seedFrom, seeded } from "../core/rng.ts";
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
import { freshness, markLanded } from "../scams/wear.ts";
import { type Modifiers, modifiersFor } from "../shop/tools.ts";
import type { ScamDef, ScamTemplate } from "../scams/types.ts";
import { fitLabel, successChance } from "../victims/resistance.ts";
import type { Victim } from "../victims/types.ts";
import { esc } from "../desktop/html.ts";
import { callOddsModifier } from "../workplace/slice.ts";
import type { DesktopApp } from "./app.ts";
import { viewDossier } from "./leads/dossier.ts";
import { drawLeads } from "./leads/draw.ts";
import {
  CHANNEL,
  pct,
  type Result,
  viewCard,
  viewResult,
  viewTemplate,
} from "./leads/views.ts";

/** Win replies don't repeat back to back. */
const pickReply = noRepeat();

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
      const fresh = freshness(game.state(), s.id);
      return `+${payout(s, t, fresh)} bucks · heat +${s.heat.success}, +${failHeat(s, m)} if reported · ${fitLabel(p)}${odds}`;
    };

    const viewTargets = () => `
      <div class="cards">${leads
        .map(
          ({ view }) => `
        <button class="card panel" data-target="${esc(view.id)}">${viewCard(view)}</button>`,
        )
        .join("")}</div>`;

    const viewWarmups = (t: Victim, s: ScamDef) => {
      const warmups = s.warmups ?? [];
      if (!warmups.length) return "";
      const done = landed.get(key(t, s)) ?? 0;
      const next = warmups[done];
      return `
        <p class="trust">Trust <meter value="${esc(current(t, s).trust)}"></meter>
          ${esc(done)}/${esc(warmups.length)} warm-ups</p>
        ${next ? viewTemplate(t, s, next, `data-warm="${esc(s.id)}"`, `no bucks yet · heat +${s.heat.success} if blocked`) : ""}`;
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

    /** Marks a scam that pays less today because it has been run a lot. */
    const worn = (s: ScamDef) => {
      const fresh = freshness(game.state(), s.id);
      return fresh < 1
        ? ` <small class="worn">worn out today, pays ${esc(pct(fresh))}</small>`
        : "";
    };

    const viewTemplates = (t: Victim) => {
      const view = viewOf(t);
      return `
      <h3><button class="link" data-back>← Leads</button> ${esc(t.name)}${
        view
          ? ` <small>${esc(view.ageBand)} · ${esc(view.occupation)}</small>`
          : ""
      }</h3>
      ${view ? viewDossier(view, bestPitch(t)) : ""}
      ${available()
        .map(
          (s) => `
        <h4>${esc(s.name)} <small>${CHANNEL[s.channel]} · ${esc(s.minutes)} min</small>${worn(s)}</h4>
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

    const render = () => {
      if (game.state().status !== "playing") {
        el.innerHTML = `<div class="leads page"><p class="empty">No more leads.</p></div>`;
        return;
      }
      el.innerHTML = `<div class="leads page">${
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
        freshness(game.state(), scam.id),
      );
      // Only wins pick, so a loss can't shift the memory and let the last win's line repeat.
      const reply = outcome.success
        ? personalize(
            pickReply(seeded(seedNow() + 11), scam.successLines),
            target,
          )
        : "";
      result = { target, scam, template, outcome, reply };
      outcome.actions.forEach(game.dispatch);
      if (outcome.success) game.dispatch(markLanded(game.state(), scam.id));
      resolved(target, scam, outcome);
      if (outcome.success) {
        game.dispatch(
          receiveMail({
            id: `reply-${seedNow()}`,
            from: target.name,
            subject: `Re: ${personalize(template.subject, target)}`,
            body: reply,
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
      result = { target, scam, template, outcome, reply: "" };
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
