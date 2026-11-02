"use client";

import { useEffect } from "react";
import { ExposureScope, GROUP_COOKIE, SLOTS, type Slot } from "@/config/group";
import { track } from "@/lib/analytics";
import { exposureOf } from "@/lib/group";
import { usePathname } from "@/i18n/routing";

const reported = new Set<string>();

function readCookie(name: string): string | undefined {
  const prefix = `${name}=`;
  return document.cookie
    .split("; ")
    .find(c => c.startsWith(prefix))
    ?.slice(prefix.length);
}

export default function Exposure({ slot }: { slot: Slot }) {
  const pathname = usePathname();
  useEffect(() => {
    const exposure = exposureOf(readCookie(GROUP_COOKIE), slot);
    if (!exposure) return;
    const scope = SLOTS.find(item => item.name === slot)?.exposure;
    const id = `${slot}:${scope === ExposureScope.Page ? pathname : "global"}:${exposure.e}_${exposure.v}`;
    if (reported.has(id)) return;
    reported.add(id);
    track("exp", exposure);
  }, [slot, pathname]);

  return null;
}
