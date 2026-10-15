"use client";

import { createContext, useContext } from "react";

import { defaultSegment, groupOf, type Slot } from "@/lib/group";

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

export function useGroup(slot: Slot): string {
  return groupOf(useContext(GroupContext), slot);
}
