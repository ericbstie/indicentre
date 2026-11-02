/** Replaces `{key}` with `vars[key]`; unknown keys stay as they are. */
export const fill = (text: string, vars: Readonly<Record<string, string>>) =>
  text.replace(/\{(\w+)\}/g, (m, k: string) => vars[k] ?? m);
