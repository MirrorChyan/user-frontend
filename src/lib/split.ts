import type { NextFetchEvent, NextRequest } from "next/server";

import {
  GROUP_COOKIE,
  PREVIEW_PARAM,
  PREVIEW_PREFIX,
  SLOTS,
  defaultSegment,
  isSegment,
  slotValues,
} from "./group";

type Range = [number, number];

interface Filter {
  attribute?: string;
  seed: string;
  hashVersion?: number;
  ranges: Range[];
}

interface Rule {
  force?: unknown;
  variations?: unknown[];
  weights?: number[];
  coverage?: number;
  ranges?: Range[];
  range?: Range;
  seed?: string;
  key?: string;
  hashAttribute?: string;
  hashVersion?: number;
  namespace?: [string, number, number];
  filters?: Filter[];
  meta?: { key?: string; passthrough?: boolean }[];
  condition?: unknown;
  parentConditions?: unknown;
}

interface Feature {
  defaultValue?: unknown;
  rules?: Rule[];
}

interface Result {
  value: unknown;
  key?: string;
  variation?: string;
}

const REFRESH_MS = 60_000;
const RETRY_MS = 10_000;
const TIMEOUT_MS = 1_000;
const KEY = /^[a-z0-9]{1,8}$/;
const VARIATION = /^[a-z0-9]{1,3}$/;
const BOT = /bot|crawl|spider|slurp|preview|headless/i;

let features: Record<string, Feature> | undefined;
let nextFetchAt = 0;
let pending: Promise<void> | undefined;

function load(source: string): Promise<void> {
  return fetch(source, { cache: "no-store", signal: AbortSignal.timeout(TIMEOUT_MS) })
    .then(res => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
    .then(body => {
      features = body && typeof body.features === "object" ? body.features : {};
      nextFetchAt = Date.now() + REFRESH_MS;
    })
    .catch(() => {
      nextFetchAt = Date.now() + RETRY_MS;
    })
    .finally(() => {
      pending = undefined;
    });
}

function currentFeatures(event: NextFetchEvent): Record<string, Feature> | undefined {
  const source = process.env.SPLIT_SOURCE;
  if (!source) return undefined;
  if (!pending && Date.now() >= nextFetchAt) {
    pending = load(source);
    event.waitUntil(pending);
  }
  return features;
}

function fnv1a(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return h >>> 0;
}

export function hash(seed: string, value: string, version: number): number | null {
  if (version === 2) return (fnv1a(fnv1a(seed + value) + "") % 10000) / 10000;
  if (version === 1) return (fnv1a(value + seed) % 1000) / 1000;
  return null;
}

export function bucketRanges(count: number, coverage?: number, weights?: number[]): Range[] {
  const c = Math.min(1, Math.max(0, coverage ?? 1));
  const equal = new Array<number>(count).fill(1 / count);
  let w = weights && weights.length === count ? weights : equal;
  const total = w.reduce((sum, x) => sum + x, 0);
  if (total < 0.99 || total > 1.01) w = equal;
  let start = 0;
  return w.map(x => {
    const range: Range = [start, start + c * x];
    start += x;
    return range;
  });
}

function inRange(n: number, [start, end]: Range): boolean {
  return n >= start && n < end;
}

function filteredOut(filters: Filter[], id: string): boolean {
  return filters.some(filter => {
    if ((filter.attribute ?? "id") !== "id") return true;
    const n = hash(filter.seed, id, filter.hashVersion || 2);
    return n === null || !filter.ranges.some(range => inRange(n, range));
  });
}

export function evaluate(feature: Feature | undefined, featureKey: string, id: string): Result {
  for (const rule of feature?.rules ?? []) {
    if (rule.condition || rule.parentConditions) continue;
    if (rule.filters && filteredOut(rule.filters, id)) continue;
    if ("force" in rule) {
      if (rule.range || (rule.coverage ?? 1) < 1) continue;
      return { value: rule.force };
    }
    const variations = rule.variations;
    if (!Array.isArray(variations) || variations.length < 2) continue;
    if ((rule.hashAttribute ?? "id") !== "id") continue;
    if (rule.namespace) {
      const [name, start, end] = rule.namespace;
      const n = hash(`__${name}`, id, 1);
      if (n === null || !inRange(n, [start, end])) continue;
    }
    const key = rule.key ?? featureKey;
    const n = hash(rule.seed ?? key, id, rule.hashVersion ?? 1);
    if (n === null) continue;
    const ranges = rule.ranges ?? bucketRanges(variations.length, rule.coverage, rule.weights);
    const i = ranges.findIndex(range => inRange(n, range));
    if (i < 0 || rule.meta?.[i]?.passthrough) continue;
    return { value: variations[i], key, variation: rule.meta?.[i]?.key ?? String(i) };
  }
  return { value: feature?.defaultValue };
}

export interface Split {
  segment: string;
  cookie?: string;
  session?: boolean;
}

export function split(request: NextRequest, event: NextFetchEvent, id: string | undefined): Split {
  if (BOT.test(request.headers.get("user-agent") ?? "")) return { segment: defaultSegment() };

  const current = request.cookies.get(GROUP_COOKIE)?.value;
  const preview =
    request.nextUrl.searchParams.get(PREVIEW_PARAM) ??
    (current?.startsWith(PREVIEW_PREFIX) ? current.slice(PREVIEW_PREFIX.length) : undefined);
  if (preview && isSegment(preview)) {
    return { segment: preview, cookie: PREVIEW_PREFIX + preview, session: true };
  }

  const all = id ? currentFeatures(event) : undefined;
  const values: string[] = [];
  const tags: string[] = [];
  SLOTS.forEach((slot, i) => {
    const allowed = slotValues(i);
    const result: Result =
      all && id ? evaluate(all[slot.name], slot.name, id) : { value: undefined };
    const value =
      typeof result.value === "string" && allowed.includes(result.value) ? result.value : undefined;
    if (result.key === undefined) {
      values.push(value ?? allowed[0]);
      tags.push("");
    } else if (value && KEY.test(result.key) && VARIATION.test(result.variation ?? "")) {
      values.push(value);
      tags.push(`${result.key}_${result.variation}`);
    } else {
      values.push(allowed[0]);
      tags.push("");
    }
  });
  return { segment: values.join(""), cookie: tags.some(Boolean) ? tags.join(".") : undefined };
}
