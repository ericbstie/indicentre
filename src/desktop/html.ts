const ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
};

/** Escape text for interpolation into innerHTML templates. */
export const esc = (s: string | number) =>
  String(s).replace(/[&<>"]/g, (c) => ENTITIES[c] ?? c);

/** Escape, then keep line breaks. */
export const escLines = (s: string) => esc(s).replace(/\n/g, "<br>");

/** Victim weakness / scam lure tags as chips. One look everywhere (`.tag`). */
export const tagList = (tags: ReadonlyArray<string>) =>
  `<span class="tags">${tags.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</span>`;
