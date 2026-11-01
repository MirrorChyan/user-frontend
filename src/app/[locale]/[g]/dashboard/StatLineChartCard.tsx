"use client";

import styles from "@/components/design-a/flow.module.css";

import { Card } from "@heroui/react";
import StatLineChart from "@/app/[locale]/[g]/dashboard/StatLineChart";
import { StatData } from "@/app/[locale]/[g]/dashboard/page";

type Props = {
  statData: StatData;
  animationCycle: number;
};

export default function StatLineChartCard({ statData, animationCycle }: Props) {
  return (
    <Card className={styles.statCard}>
      <div className="w-full p-4">
        <StatLineChart statData={statData} animationCycle={animationCycle} />
      </div>
    </Card>
  );
}
