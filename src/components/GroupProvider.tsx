"use client";

import { createContext, useContext } from "react";

import type { Slot } from "@/config/group";
import { defaultSegment, groupOf, type SlotValue } from "@/lib/group";

const GroupContext = createContext(defaultSegment());

export default function GroupProvider({
  segment,
  children,
}: {
  segment: string;
  children: React.ReactNode;
}) {
  return <GroupContext.Provider value={segment}>{children}</GroupContext.Provider>;
}

export function useGroup<S extends Slot>(slot: S): SlotValue<S> {
  return groupOf(useContext(GroupContext), slot);
}
