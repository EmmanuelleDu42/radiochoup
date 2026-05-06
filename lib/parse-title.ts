export function splitTitle(title: string): [string, string] {
  const idx = title.indexOf(" - ");
  if (idx === -1) return [title, ""];
  return [title.slice(0, idx), title.slice(idx + 3)];
}
