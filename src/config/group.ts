export enum Slot {
  PageGroup = "page_group",
}

export enum ExposureScope {
  Page = "page",
  Global = "global",
}

// 取值是单个小写字母，第一个是默认组
export const SLOTS = [
  { name: Slot.PageGroup, values: ["a", "b"], exposure: ExposureScope.Page },
] as const;

// 以下与上报服务端约定，改动需同步
export const VISITOR_COOKIE = "mc_vid";
export const VISITOR_MAX_AGE = 60 * 60 * 24 * 365;
export const GROUP_COOKIE = "mc_grp";
export const GROUP_MAX_AGE = 60 * 60 * 24 * 30;
export const PREVIEW_PARAM = "_g";
export const PREVIEW_PREFIX = "pre_";
export const SPLIT_KEY_FORMAT = /^[a-z0-9]{1,8}$/;
export const SPLIT_VARIATION_FORMAT = /^[a-z0-9]{1,3}$/;
export const EVENT_ENDPOINT = "/m/e";
export const TRACKED_QUERY_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "source",
] as const;

export const SPLIT_REFRESH_MS = 60_000;
export const SPLIT_RETRY_MS = 10_000;
export const SPLIT_TIMEOUT_MS = 1_000;
export const BOT_UA = /bot|crawl|spider|slurp|preview|headless/i;
