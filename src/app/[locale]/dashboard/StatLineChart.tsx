"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { X } from "lucide-react";
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

const stopPropagation = (e: React.SyntheticEvent) => e.stopPropagation();

type StatChartProps = {
  data: object[];
  title: string;
  rids: string[];
  animationCycle: number;
};

function StatChart({ data, title, rids, animationCycle }: StatChartProps) {
  const t = useTranslations("Dashboard");
  // 悬停时鼠标移向悬浮窗会经过相邻日期导致悬浮窗跳走，需点击固定后才能滚动查看
  const [pinned, setPinned] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pinned) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setPinned(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPinned(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [pinned]);

  const renderTooltip = ({ active, payload, label }: TooltipContentProps) => {
    if (!active || !payload?.length) return null;
    return (
      // 悬浮窗在 recharts-wrapper 内，事件冒泡回图表会按指针位置改掉固定的日期
      <div
        className="rounded border bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-800"
        onClick={stopPropagation}
        onMouseMove={stopPropagation}
        onTouchMove={stopPropagation}
      >
        <div className="mb-1 flex items-center justify-between gap-2">
          <p className="font-medium dark:text-white">{label}</p>
          {pinned && (
            <button
              type="button"
              aria-label={t("statChart.unpin")}
              className="rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-200"
              onClick={() => setPinned(false)}
            >
              <X size={14} />
            </button>
          )}
        </div>
        <div className="max-h-48 overflow-y-auto overscroll-contain [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600">
          {[...payload]
            .sort((a, b) => (b.value as number) - (a.value as number))
            .map((entry, i) => (
              <p key={i} style={{ color: entry.color }} className="text-sm">
                {entry.name}: {(entry.value as number).toLocaleString()}
              </p>
            ))}
        </div>
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
          {pinned ? t("statChart.unpinHint") : t("statChart.pinHint")}
        </p>
      </div>
    );
  };

  return (
    <div className="stat-line-chart" data-cycle={animationCycle % 2}>
      <h3 className="mb-2 text-center text-sm font-medium text-gray-600 dark:text-gray-300">
        {title}
      </h3>
      <div ref={containerRef} className="relative">
        <ResponsiveContainer width="100%" height={220} debounce={200}>
          <LineChart
            data={data}
            margin={{ left: 8, right: 24, top: 8, bottom: 8 }}
            onClick={state => {
              if (state.isTooltipActive && state.activeTooltipIndex != null) setPinned(true);
            }}
          >
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
            <Tooltip
              content={renderTooltip}
              trigger={pinned ? "click" : "hover"}
              wrapperStyle={{ pointerEvents: pinned ? "auto" : "none" }}
            />
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
}

const yTickFormatter = (value: number) =>
  value >= 1000 ? `${(value / 1000).toFixed(0)}k` : String(value);

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

  return (
    <div className="space-y-6 p-2">
      <h3 className="text-center text-base font-semibold sm:text-lg dark:text-white">
        {t("statChart.title")}
      </h3>
      <div className="grid grid-cols-1 gap-6">
        <StatChart
          data={requestData}
          title={t("statChart.request")}
          rids={rids}
          animationCycle={animationCycle}
        />
        <StatChart
          data={countData}
          title={t("statChart.count")}
          rids={rids}
          animationCycle={animationCycle}
        />
      </div>
    </div>
  );
}
