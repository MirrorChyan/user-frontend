const BROWSER_BLACKLIST = ["Safari"];

export function getUserAgent(): string {
  return typeof navigator !== "undefined" ? navigator.userAgent.toLowerCase() : "";
}

export function isBlacklistedBrowser(): boolean {
  const userAgent = getUserAgent();

  if (typeof window === "undefined") {
    return false;
  }
  return BROWSER_BLACKLIST.some(browser => userAgent.includes(browser.toLowerCase()));
}

export function shouldUseQRCodePayment(): boolean {
  return isBlacklistedBrowser();
}
