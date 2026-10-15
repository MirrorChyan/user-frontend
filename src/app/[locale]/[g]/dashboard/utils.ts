export function getDashboardMonth(value: string) {
  return value.slice(4).padStart(2, "0");
}

export function formatDashboardDayKey(month: string | number, day: string | number) {
  return `${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function formatDashboardDayKeyFromDate(value: Date | string, month: string | number) {
  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return formatDashboardDayKey(month, parsedDate.getDate());
}

export function parseDashboardAmount(value: unknown) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
}
