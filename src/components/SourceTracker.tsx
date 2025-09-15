"use client";

import { useEffect } from "react";

interface SourceTrackerProps {
  source?: string;
}

type SourceInfo = {
  source: string;
  ts: number;
};

export default function SourceTracker({ source }: SourceTrackerProps) {
  useEffect(() => {
    if (source) {
      window.localStorage.setItem(
        "source",
        JSON.stringify({
          source: source,
          ts: new Date().valueOf(),
        } as SourceInfo)
      );
    }
  });
  return null;
}

export function getSource(): string {
  const source = localStorage.getItem("source");
  if (!source) return "";

  try {
    const { ts, source: value } = JSON.parse(source) as SourceInfo;
    const isExpired = Date.now() - ts > 3_600_000;

    if (isExpired) {
      localStorage.removeItem("source");
      return "";
    }
    return value;
  } catch {
    localStorage.removeItem("source");
    return "";
  }
}
