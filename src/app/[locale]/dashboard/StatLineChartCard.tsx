"use client";

import { Card } from "@heroui/react";
import StatLineChart from "@/app/[locale]/dashboard/StatLineChart";
import { StatData } from "@/app/[locale]/dashboard/page";

type Props = {
  statData: StatData;
  animationCycle: number;
};

export default function StatLineChartCard({ statData, animationCycle }: Props) {
  return (
    <Card>
      <div className="w-full p-4">
        <StatLineChart statData={statData} animationCycle={animationCycle} />
      </div>
    </Card>
  );
}
