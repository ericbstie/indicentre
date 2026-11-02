import { esc, tagList } from "../../desktop/html.ts";
import { ANGLES } from "../../victims/angles.ts";
import { fitLabel } from "../../victims/resistance.ts";
import { firstName } from "../../victims/types.ts";
import type { VictimView } from "../../victims/view.ts";
import { pct } from "./views.ts";

/**
 * Persondata's full profile of one lead: what public posts give away.
 * `best` is the open pitch with the highest odds, if any.
 */
export const viewDossier = (
  v: VictimView,
  best?: { label: string; p: number },
) => {
  const top = v.weaknesses?.[0];
  return v.hobby && v.recent && top
    ? `<section class="dossier panel">
        <h4>Dossier</h4>
        <dl>
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
    : "";
};
