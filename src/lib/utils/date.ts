export const DAY_MS = 24 * 60 * 60 * 1000;

const pad = (value: number) => String(value).padStart(2, "0");

/** 按本地时区格式化为 YYYY-MM-DD HH:mm:ss */
export function formatDateTime(value: Date | number): string {
  const date = new Date(value);
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  );
}
