import { ExposureScope, PREVIEW_PREFIX, SLOTS, type Slot } from "@/config/group";

interface SlotConfig {
  name: Slot;
  values: readonly string[];
  exposure: ExposureScope;
}

// 赋值时检查每个槽位都配置了 exposure
const slotConfigs: readonly SlotConfig[] = SLOTS;

export type SlotValue<S extends Slot> = Extract<
  (typeof SLOTS)[number],
  { name: S }
>["values"][number];

function slotIndex(slot: Slot): number {
  const i = SLOTS.findIndex(s => s.name === slot);
  if (i < 0) throw new Error(`Slot ${slot} has no values in SLOTS`);
  return i;
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

export function globalExposureSlots(): Slot[] {
  return slotConfigs.filter(s => s.exposure === ExposureScope.Global).map(s => s.name);
}

export function groupOf<S extends Slot>(segment: string, slot: S): SlotValue<S> {
  const i = slotIndex(slot);
  return (segment[i] ?? SLOTS[i].values[0]) as SlotValue<S>;
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
