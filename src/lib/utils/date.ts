import type { useFormatter } from "next-intl";

export const DAY_MS = 24 * 60 * 60 * 1000;

let localTimeZone: string | undefined;

function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat(undefined, { timeZone });
    return true;
  } catch {
    return false;
  }
}

function detectTimeZone(): string {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (timeZone && isValidTimeZone(timeZone)) {
    return timeZone;
  }
  // 浏览器给不出可用的时区名时（如 V8 识别不了系统时区会返回 "Etc/Unknown"），按当前 UTC 偏移换算。
  // Etc/GMT 的符号与习惯写法相反：UTC+8 对应 Etc/GMT-8；非整点时区会有不超过半小时的误差
  const offsetHours = Math.round(-new Date().getTimezoneOffset() / 60);
  if (offsetHours === 0) {
    return "UTC";
  }
  return `Etc/GMT${offsetHours > 0 ? "-" : "+"}${Math.abs(offsetHours)}`;
}

/**
 * 浏览器所在时区，只能在客户端调用（事件处理、请求回调，或只在客户端渲染的内容）。
 * next-intl 的全局 timeZone 取自渲染页面的服务端（静态页即 CI 构建机，为 UTC），
 * 在客户端展示绝对时间时需显式传入此值，否则只有与服务端同时区的机器显示正确
 */
export function getLocalTimeZone(): string {
  if (typeof window === "undefined") {
    // 服务端只能拿到服务器时区，用它渲染会与客户端结果不一致
    throw new Error("getLocalTimeZone() 只能在客户端调用");
  }
  localTimeZone ??= detectTimeZone();
  return localTimeZone;
}

/** 按当前语言和浏览器时区格式化到期时间，如 "2026年12月1日 16:00" / "Dec 1, 2026, 4:00 PM" */
export function formatExpiry(
  format: ReturnType<typeof useFormatter>,
  value: string | number | Date
): string {
  return format.dateTime(new Date(value), {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    timeZone: getLocalTimeZone(),
  });
}

/** 时间点是否早于当前时刻 */
export function isPast(value: string | number | Date): boolean {
  return new Date(value).getTime() < Date.now();
}
