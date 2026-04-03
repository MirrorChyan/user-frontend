"use client";

import { Card } from "@heroui/react";
import StatLineChart from "@/app/[locale]/dashboard/StatLineChart";
import { StatData } from "@/app/[locale]/dashboard/page";

type Props = {
  statData: StatData;
};

export default function StatLineChartCard({ statData }: Props) {
  return (
    <Card>
      <div className="w-full p-4">
        <StatLineChart statData={statData} />
      </div>
    </Card>
  );
}
