"use client";

import { useEffect } from "react";

import { track } from "@/lib/analytics";
import { GROUP_COOKIE, exposureOf, type Slot } from "@/lib/group";

const reported = new Set<string>();

function readCookie(name: string): string | undefined {
  const prefix = `${name}=`;
  return document.cookie
    .split("; ")
    .find(c => c.startsWith(prefix))
    ?.slice(prefix.length);
}

export default function Exposure({ slot }: { slot: Slot }) {
  useEffect(() => {
    const exposure = exposureOf(readCookie(GROUP_COOKIE), slot);
    if (!exposure) return;
    const id = `${exposure.e}_${exposure.v}`;
    if (reported.has(id)) return;
    reported.add(id);
    track("exp", exposure);
  }, [slot]);

  return null;
}
