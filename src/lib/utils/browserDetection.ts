export function getUserAgent(): string {
  return typeof navigator !== "undefined" ? navigator.userAgent : "";
}

export function isSafariBrowser(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const userAgent = getUserAgent();

  const isSafari =
    userAgent.includes("Safari") &&
    !userAgent.includes("Chrome") &&
    !userAgent.includes("Chromium") &&
    !userAgent.includes("Edge");

  const isAppleDevice =
    userAgent.includes("Macintosh") || userAgent.includes("iPhone") || userAgent.includes("iPad");

  return isSafari && isAppleDevice;
}

export function shouldUseQRCodePayment(): boolean {
  return isSafariBrowser();
}
