import type { DetectedPlatform } from "@/lib/utils/browserDetection";

export interface SupportOption {
  /** 自定义资源 id，形如 OtherRid/stable-windows-x64，没有则为 null，使用原 resource */
  rid: string | null;
  channel: string;
  os: string;
  arch: string;
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

    const parts = platformPart.split("-");
    return {
      rid,
      channel: parts[0],
      os: parts[1],
      arch: parts[2],
    };
  });
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
