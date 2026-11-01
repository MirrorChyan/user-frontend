import { parseSupportOptions } from "@/lib/utils/support";

export function supportedSystems(support: string[]): string[] {
  return [
    ...new Set(
      parseSupportOptions(support)
        .map(option => (option.os === "win" ? "windows" : option.os))
        .filter(Boolean)
    ),
  ];
}

export function systemLabel(system: string, genericLabel: string): string {
  return (
    (
      {
        windows: "Windows",
        macos: "macOS",
        linux: "Linux",
        android: "Android",
        any: genericLabel,
      } as Record<string, string>
    )[system] ?? system
  );
}
