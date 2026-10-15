import { EVENT_ENDPOINT, TRACKED_QUERY_PARAMS, VISITOR_COOKIE } from "@/config/group";
import { routing } from "@/i18n/routing";

type EventData = Record<string, string | number | boolean>;

let lastPageUrl: string | undefined;

function enabled(): boolean {
  return document.cookie.split("; ").some(c => c.startsWith(`${VISITOR_COOKIE}=`));
}

function withoutQuery(url: string): string {
  try {
    const { origin, pathname } = new URL(url);
    return origin + pathname;
  } catch {
    return "";
  }
}

function trackedPath(): string {
  const current = new URLSearchParams(location.search);
  const kept = new URLSearchParams();
  for (const key of TRACKED_QUERY_PARAMS) {
    const value = current.get(key);
    if (value) kept.set(key, value.slice(0, 100));
  }
  const query = kept.toString();
  const path = query ? `${location.pathname}?${query}` : location.pathname;
  return path.length <= 500 ? path : location.pathname.slice(0, 500);
}

function send(body: Record<string, unknown>): void {
  try {
    if (!enabled()) return;
    const json = JSON.stringify({
      ...body,
      u: trackedPath(),
      t: document.title.slice(0, 200),
      s: `${screen.width}x${screen.height}`,
      l: navigator.language.slice(0, 35),
    });
    if (navigator.sendBeacon?.(EVENT_ENDPOINT, new Blob([json], { type: "application/json" })))
      return;
    fetch(EVENT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: json,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // 忽略
  }
}

function referrer(): string {
  return (lastPageUrl ?? withoutQuery(document.referrer)).slice(0, 500);
}

function isLocaleRoot(pathname: string): boolean {
  return routing.locales.some(locale => pathname === `/${locale}` || pathname === `/${locale}/`);
}

export function pageview(): void {
  if (isLocaleRoot(location.pathname)) return;
  const url = location.origin + location.pathname;
  if (url === lastPageUrl) return;
  const r = referrer();
  lastPageUrl = url;
  send({ k: "pv", r });
}

export function track(event: string, data?: EventData): void {
  send({ k: "ev", n: event, r: referrer(), d: data });
}
