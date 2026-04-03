"use client";

import React, { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from "recharts";
import { useTranslations } from "next-intl";
import { StatData } from "@/app/[locale]/dashboard/page";

type Props = {
  statData: StatData;
};

// 用一下扇形图颜色得了，懒得找了（
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
  "#DC143C",
  "#9370DB",
  "#20B2AA",
];

export default function StatLineChart({ statData }: Props) {
  const t = useTranslations("Dashboard");

  const rids = useMemo(() => Object.keys(statData), [statData]);

  const dates = useMemo(() => {
    const dateSet = new Set<string>();
    rids.forEach(rid => Object.keys(statData[rid]).forEach(d => dateSet.add(d)));
    return [...dateSet].sort();
  }, [statData, rids]);

  const requestData = useMemo(
    () =>
      dates.map(date => ({
        date,
        ...Object.fromEntries(rids.map(rid => [rid, statData[rid]?.[date]?.request ?? 0])),
      })),
    [statData, rids, dates]
  );

  const countData = useMemo(
    () =>
      dates.map(date => ({
        date,
        ...Object.fromEntries(rids.map(rid => [rid, statData[rid]?.[date]?.count ?? 0])),
      })),
    [statData, rids, dates]
  );

  const yTickFormatter = (value: number) =>
    value >= 1000 ? `${(value / 1000).toFixed(0)}k` : String(value);

  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded border bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <p className="mb-1 font-medium dark:text-white">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} style={{ color: entry.color }} className="text-sm">
            {entry.name}: {(entry.value as number).toLocaleString()}
          </p>
        ))}
      </div>
    );
  };

  const renderChart = (data: object[], title: string) => (
    <div>
      <h3 className="mb-2 text-center text-sm font-medium text-gray-600 dark:text-gray-300">
        {title}
      </h3>
      <ResponsiveContainer width="100%" height={220} debounce={200}>
        <LineChart data={data} margin={{ left: 8, right: 24, top: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fill: "#666", fontSize: 11 }}
            tickLine={{ stroke: "#ccc" }}
            minTickGap={20}
          />
          <YAxis
            tickFormatter={yTickFormatter}
            tick={{ fill: "#666", fontSize: 11 }}
            tickLine={{ stroke: "#ccc" }}
            domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.1)]}
          />
          <Tooltip content={<CustomTooltip />} />
          {rids.map((rid, i) => (
            <Line
              key={rid}
              type="monotone"
              dataKey={rid}
              stroke={COLORS[i % COLORS.length]}
              strokeWidth={2}
              dot={{ fill: COLORS[i % COLORS.length], strokeWidth: 0, r: 3 }}
              activeDot={{ r: 6, fill: "#fff", stroke: COLORS[i % COLORS.length], strokeWidth: 2 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <div className="space-y-6 p-2">
      <h3 className="text-center text-base font-semibold sm:text-lg dark:text-white">
        {t("statChart.title")}
      </h3>
      <div className="grid grid-cols-1 gap-6">
        {renderChart(requestData, t("statChart.request"))}
        {renderChart(countData, t("statChart.count"))}
      </div>
    </div>
  );
}
