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

/**
 * 检测是否为内置浏览器（如微信、QQ等App内的WebView）
 * 这些浏览器通常无法正常处理支付跳转，需要使用二维码方式
 */
export function isInAppBrowser(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const userAgent = getUserAgent();

  return (
    userAgent.includes("MicroMessenger") || // 微信
    userAgent.includes("QQ/") || // QQ
    userAgent.includes("MQQBrowser") || // QQ浏览器
    userAgent.includes("Weibo") || // 微博
    userAgent.includes("BytedanceWebview") || // 抖音/头条
    userAgent.includes("AlipayClient") || // 支付宝
    userAgent.includes("DingTalk") // 钉钉
  );
}

export function shouldUseQRCodePayment(): boolean {
  return isSafariBrowser() || isInAppBrowser();
}
