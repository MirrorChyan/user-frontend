import { notFound } from "next/navigation";

import GroupProvider from "@/components/GroupProvider";
import { allSegments, isSegment } from "@/lib/group";

export function generateStaticParams() {
  return allSegments().map(g => ({ g }));
}

export default async function GroupLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ g: string }>;
}) {
  const { g } = await params;
  if (!isSegment(g)) {
    notFound();
  }

  return <GroupProvider segment={g}>{children}</GroupProvider>;
}
