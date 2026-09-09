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
    // userAgent.includes("MQQBrowser") || // QQ浏览器
    userAgent.includes("Weibo") || // 微博
    userAgent.includes("BytedanceWebview") || // 抖音/头条
    // userAgent.includes("AlipayClient") || // 支付宝
    userAgent.includes("DingTalk") // 钉钉
  );
}

export function shouldUseQRCodePayment(): boolean {
  return isSafariBrowser() || isInAppBrowser();
}

export type PlatformOS = "windows" | "macos" | "linux" | "android" | "";
export type PlatformArch = "x64" | "arm64" | "";

export interface DetectedPlatform {
  os: PlatformOS;
  arch: PlatformArch;
}

interface NavigatorUAData {
  platform?: string;
}

function getUserAgentDataPlatform(): string {
  const data = (navigator as Navigator & { userAgentData?: NavigatorUAData }).userAgentData;
  return data?.platform?.toLowerCase() ?? "";
}

function detectOS(userAgent: string): PlatformOS {
  // iPad 桌面模式的 UA 与 Macintosh 完全一致，避免给它匹配上 macOS 的安装包
  if (userAgent.includes("Macintosh") && navigator.maxTouchPoints > 1) {
    return "";
  }

  // Chromium 提供的低熵字段比 UA 字符串更可靠
  const platform = getUserAgentDataPlatform();
  if (platform.includes("android")) return "android";
  if (platform.includes("windows")) return "windows";
  if (platform.includes("macos")) return "macos";
  if (platform.includes("linux")) return "linux";

  if (/iPhone|iPad|iPod/i.test(userAgent)) return "";
  // Android 的 UA 中同样包含 Linux，必须先判断
  if (/Android/i.test(userAgent)) return "android";
  if (/Windows/i.test(userAgent)) return "windows";
  if (/Macintosh|Mac OS X/i.test(userAgent)) return "macos";
  if (/Linux|X11/i.test(userAgent)) return "linux";

  return "";
}

function detectArch(userAgent: string, os: PlatformOS): PlatformArch {
  if (/arm64|aarch64|armv8/i.test(userAgent)) return "arm64";
  // 无论 Intel 还是 Apple Silicon，Mac 的 UA 都自称 Intel，无法据此区分架构
  if (os === "macos") return "";
  if (/win64|x64|x86_64|amd64|wow64/i.test(userAgent)) return "x64";
  return "";
}

/**
 * 根据 UA 推断当前设备的系统和架构，无法确定的部分返回空字符串
 */
export function detectPlatform(): DetectedPlatform {
  if (typeof window === "undefined") {
    return { os: "", arch: "" };
  }

  const userAgent = getUserAgent();
  const os = detectOS(userAgent);
  return { os, arch: detectArch(userAgent, os) };
}
