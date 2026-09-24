"use client";

import React, { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  TooltipContentProps,
  XAxis,
  YAxis,
} from "recharts";
import { useTranslations } from "next-intl";
import { StatData } from "@/app/[locale]/dashboard/page";

type Props = {
  statData: StatData;
  /** 变化时重播描线动画（见 globals.css 的 stat-line-chart） */
  animationCycle: number;
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

function renderTooltip({ active, payload, label }: TooltipContentProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded border bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-800">
      <p className="mb-1 font-medium dark:text-white">{label}</p>
      <div className="max-h-48 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600">
        {[...payload]
          .sort((a, b) => (b.value as number) - (a.value as number))
          .map((entry, i) => (
            <p key={i} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {(entry.value as number).toLocaleString()}
            </p>
          ))}
      </div>
    </div>
  );
}

export default function StatLineChart({ statData, animationCycle }: Props) {
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

  const renderChart = (data: object[], title: string) => (
    <div className="stat-line-chart" data-cycle={animationCycle % 2}>
      <h3 className="mb-2 text-center text-sm font-medium text-gray-600 dark:text-gray-300">
        {title}
      </h3>
      <div className="relative">
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
            {rids.map((rid, i) => (
              <Line
                key={rid}
                type="monotone"
                dataKey={rid}
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={2}
                dot={{ fill: COLORS[i % COLORS.length], strokeWidth: 0, r: 3 }}
                activeDot={{
                  r: 6,
                  fill: "#fff",
                  stroke: COLORS[i % COLORS.length],
                  strokeWidth: 2,
                }}
                // 资源多时会有上百条线，recharts 3 的 JS 入场动画每帧都要重渲染所有线并测量路径长度，
                // 切换到本页时会连续卡顿 1 秒以上，改用下方的遮罩实现入场动画
                isAnimationActive={false}
              />
            ))}
            {/* recharts 3 按 JSX 顺序决定层级，Tooltip 放在最后才不会被折线遮挡 */}
            <Tooltip content={renderTooltip} wrapperStyle={{ pointerEvents: "auto" }} />
          </LineChart>
        </ResponsiveContainer>
        {/*
        入场动画：与卡片同色的遮罩盖住绘图区（左侧 68px 为 Y 轴），向右收起，折线从左到右出现。
        只对遮罩做 transform 动画，由合成线程完成，不会逐帧重绘上百条折线
      */}
        <div
          aria-hidden
          className="stat-line-reveal bg-content1 pointer-events-none absolute inset-y-0 right-0 left-[68px]"
        />
      </div>
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
