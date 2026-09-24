"use client";

import { useEffect } from "react";
import { getStorageItem, removeStorageItem, setStorageItem } from "@/lib/utils/storage";

interface SourceTrackerProps {
  source?: string;
}

type SourceInfo = {
  source: string;
  ts: number;
};

const SOURCE_KEY = "source";

export default function SourceTracker({ source }: SourceTrackerProps) {
  useEffect(() => {
    if (source) {
      setStorageItem(
        SOURCE_KEY,
        JSON.stringify({
          source: source,
          ts: new Date().valueOf(),
        } as SourceInfo)
      );
    }
  }, [source]);
  return null;
}

export function getSource(): string {
  const source = getStorageItem(SOURCE_KEY);
  if (!source) return "";

  try {
    const { ts, source: value } = JSON.parse(source) as SourceInfo;
    const isExpired = Date.now() - ts > 3_600_000;

    if (isExpired) {
      removeStorageItem(SOURCE_KEY);
      return "";
    }
    return value;
  } catch {
    removeStorageItem(SOURCE_KEY);
    return "";
  }
}
