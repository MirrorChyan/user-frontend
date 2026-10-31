import type { DetectedPlatform } from "@/lib/utils/browserDetection";

/**
 * support 每项形如 [rid/]channel-os-arch[@os-arch]。
 * @ 前的系统、架构决定下载哪个包；@ 后的只用于展示和按 UA 匹配，缺省时与 @ 前相同。
 * 例如 stable-any-any@windows-x64：下载未指定平台的包，页面上显示 windows / x64。
 */
export interface SupportOption {
  /** 自定义资源 id，形如 OtherRid/stable-windows-x64，没有则为 null，使用原 resource */
  rid: string | null;
  channel: string;
  /** 展示和匹配用的系统、架构 */
  os: string;
  arch: string;
  /** 下载用的系统、架构 */
  pkgOs: string;
  pkgArch: string;
}

export interface SupportSelection {
  os: string;
  arch: string;
}

/** 后端返回的系统名别名，仅用于匹配，写回状态时仍使用原始值 */
const OS_ALIASES: Record<string, string> = {
  win: "windows",
};

export function parseSupportOptions(support: string[]): SupportOption[] {
  return (support ?? []).map(item => {
    let rid: string | null = null;
    let platformPart = item;

    if (item.includes("/")) {
      const slashIndex = item.indexOf("/");
      rid = item.substring(0, slashIndex);
      platformPart = item.substring(slashIndex + 1);
    }

    let display: string[] | null = null;
    const atIndex = platformPart.indexOf("@");
    if (atIndex >= 0) {
      display = platformPart.substring(atIndex + 1).split("-");
      platformPart = platformPart.substring(0, atIndex);
      // @ 后不是两段非空值时视为没写，按 @ 前的值显示
      if (display.length !== 2 || display.some(value => !value)) {
        display = null;
      }
    }

    const parts = platformPart.split("-");
    return {
      rid,
      channel: parts[0],
      os: display?.[0] ?? parts[1],
      arch: display?.[1] ?? parts[2],
      pkgOs: parts[1],
      pkgArch: parts[2],
    };
  });
}

/**
 * 按所选渠道、系统、架构找到对应的选项，精确匹配优先，其次是 any。
 * 选择框隐藏时所选值为空字符串，按 any 匹配
 */
export function findSupportOption(
  options: SupportOption[],
  channel: string,
  os: string,
  arch: string
): SupportOption | undefined {
  const selectedOs = os || "any";
  const selectedArch = arch || "any";
  const matches = (option: SupportOption, exact: boolean) =>
    option.channel === channel &&
    (option.os === selectedOs || (!exact && option.os === "any")) &&
    (option.arch === selectedArch || (!exact && option.arch === "any"));
  return (
    options.find(option => matches(option, true)) ?? options.find(option => matches(option, false))
  );
}

/**
 * 下载时传给后端的系统和架构：命中选项时用它 @ 前的值，否则沿用所选值。any 转为空字符串
 */
export function resolveDownloadPlatform(
  option: SupportOption | undefined,
  os: string,
  arch: string
): SupportSelection {
  const toQuery = (value: string) => (value === "any" ? "" : value);
  return {
    os: toQuery(option?.pkgOs ?? os),
    arch: toQuery(option?.pkgArch ?? arch),
  };
}

function score(optionValue: string, detected: string): number {
  if (detected && optionValue === detected) {
    return 2;
  }
  return optionValue === "any" ? 1 : 0;
}

/**
 * 在指定 channel 下按 UA 挑选最佳匹配的系统和架构。
 * 只有精确命中才写回具体值，通配或未命中返回空字符串；channel 下无可用项返回 null。
 */
export function matchSupportSelection(
  options: SupportOption[],
  channel: string,
  platform: DetectedPlatform
): SupportSelection | null {
  if (!channel || !platform.os) {
    return null;
  }

  let best: SupportSelection | null = null;
  let bestScore = -1;

  for (const option of options) {
    if (option.channel !== channel) {
      continue;
    }
    const osScore = score(OS_ALIASES[option.os] ?? option.os, platform.os);
    if (osScore === 0) {
      continue;
    }
    const archScore = score(option.arch, platform.arch);
    // 系统优先于架构，同分时列表中靠前的选项胜出
    const total = osScore * 10 + archScore;
    if (total > bestScore) {
      bestScore = total;
      best = {
        os: osScore === 2 ? option.os : "",
        arch: archScore === 2 ? option.arch : "",
      };
    }
  }

  return best;
}
