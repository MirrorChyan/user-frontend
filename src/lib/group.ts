export const GROUP_COOKIE = "mc_grp";
export const PREVIEW_PARAM = "_g";
export const PREVIEW_PREFIX = "pre_";

export const SLOTS = [{ name: "page_group", values: ["a", "b"] }] as const;

export type Slot = (typeof SLOTS)[number]["name"];

function slotIndex(slot: Slot): number {
  return SLOTS.findIndex(s => s.name === slot);
}

export function slotValues(i: number): readonly string[] {
  return SLOTS[i].values;
}

export function defaultSegment(): string {
  return SLOTS.map(slot => slot.values[0]).join("");
}

export function isSegment(segment: string): boolean {
  return (
    segment.length === SLOTS.length && SLOTS.every((_, i) => slotValues(i).includes(segment[i]))
  );
}

export function allSegments(): string[] {
  return SLOTS.reduce<string[]>(
    (prefixes, slot) => prefixes.flatMap(prefix => slot.values.map(value => prefix + value)),
    [""]
  );
}

export function groupOf(segment: string, slot: Slot): string {
  const i = slotIndex(slot);
  return segment[i] ?? SLOTS[i].values[0];
}

export function exposureOf(
  cookie: string | undefined,
  slot: Slot
): { e: string; v: string } | undefined {
  if (!cookie) return undefined;
  const i = slotIndex(slot);
  if (cookie.startsWith(PREVIEW_PREFIX)) {
    const value = cookie[PREVIEW_PREFIX.length + i];
    return value ? { e: "pre", v: value } : undefined;
  }
  const [e, v] = (cookie.split(".")[i] ?? "").split("_");
  return e && v ? { e, v } : undefined;
}
