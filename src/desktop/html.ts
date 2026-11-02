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
