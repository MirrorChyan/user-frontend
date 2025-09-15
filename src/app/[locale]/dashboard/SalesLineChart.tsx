import React, { useMemo, useState } from "react";
import {
  Brush,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from "recharts";
import {
  eachDayOfInterval,
  eachHourOfInterval,
  endOfMonth,
  format,
  parseISO,
  startOfDay,
  startOfHour,
  startOfMonth,
} from "date-fns";
import { RevenueType } from "@/app/[locale]/dashboard/page";
import { cn, Radio, RadioGroup, Switch, Tooltip as Tippy } from "@heroui/react";
import { useTranslations } from "next-intl";

type PropsType = {
  revenueData: RevenueType[];
  date: string;
};

type DataType = {
  amount: number;
  count: number;
  time: Date;
};

type TooltipType = TooltipProps<number, string> & {
  payload?: {
    payload: {
      time: Date;
      amount: number;
      count: number;
    };
  }[];
};

export default function SalesLineChart({ revenueData, date }: PropsType) {
  const t = useTranslations("Dashboard");
  // 状态管理
  const [showSales, setShowSales] = useState(true);
  const [timeRange, setTimeRange] = useState<string>("day");

  // 时间格式化
  function timeFormatter(date: Date) {
    switch (timeRange) {
      case "minute":
        return format(date, "MM-dd HH:00");
      case "hour":
        return format(date, "MM-dd HH:00");
      case "day":
        return format(date, "yyyy-MM-dd");
      default:
        return format(date, "MM-dd HH:mm");
    }
  }

  // 处理原始数据
  const processedData = useMemo(() => {
    const groupedData: Record<string, { sumAmount: number; sumCount: number; time: Date }> = {};

    function createDataMap(data: DataType[]): Map<string, DataType> {
      const map = new Map<string, DataType>();
      data.forEach(item => {
        map.set(timeFormatter(item.time), {
          amount: item.amount,
          count: item.count,
          time: item.time,
        });
      });
      return map;
    }

    function generateTimeSeries(start: Date, end: Date): Date[] {
      const interval = { start, end };

      switch (timeRange) {
        case "day":
          return eachDayOfInterval(interval);
        case "hour":
          return eachHourOfInterval(interval);
        default:
          throw new Error("不支持的时间粒度");
      }
    }

    function fillTimeSeries(originalData: DataType[]): DataType[] {
      const currentYear = Number(date.slice(0, 4));
      const currentMonth = Number(date.slice(5));
      const month = [
        31,
        (currentYear % 4 === 0 && currentYear % 100 !== 0) || currentYear % 400 === 0 ? 29 : 28,
        31,
        30,
        31,
        30,
        31,
        31,
        30,
        31,
        30,
        31,
      ];

      const start = startOfMonth(`${currentYear}-${currentMonth}-${1} 00:00:00`);
      const end = endOfMonth(`${currentYear}-${currentMonth}-${month[currentMonth - 1]} 23:59:59`);

      const completeTimes = generateTimeSeries(start, end);
      const dataMap = createDataMap(originalData);

      return completeTimes.map(time => {
        const key = timeFormatter(time);
        return (
          dataMap.get(key) || {
            amount: 0,
            count: 0,
            time: time,
          }
        );
      });
    }

    revenueData.forEach(item => {
      const date = parseISO(String(item.activated_at));
      let key: Date;

      switch (timeRange) {
        case "hour":
          key = startOfHour(date);
          break;
        case "day":
          key = startOfDay(date);
          break;
        default:
          key = startOfHour(date);
      }

      const isoKey = key.toISOString();

      if (!groupedData[isoKey]) {
        groupedData[isoKey] = {
          sumAmount: 0,
          sumCount: 0,
          time: key,
        };
      }

      groupedData[isoKey].sumAmount += parseFloat(item.amount);
      groupedData[isoKey].sumCount += item.buy_count;
    });
    const result = Object.values(groupedData)
      .sort((a, b) => a.time.getTime() - b.time.getTime())
      .map(item => ({
        time: item.time,
        amount: item.sumAmount,
        count: item.sumCount,
      }));
    return fillTimeSeries(result);
  }, [revenueData, timeRange]);

  // 自定义 Tooltip
  const CustomTooltip = ({ active, payload }: TooltipType) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <p className="dark:border-gray-70 font-medium">
            {timeRange === "day"
              ? format(data.time, "yyyy-MM-dd")
              : format(data.time, "yyyy-MM-dd HH:mm")}
          </p>
          <p className="text-blue-600 dark:text-blue-400">
            {showSales
              ? `${t("amount")}: ${data.amount.toFixed(2)}${t("unit.amount")}`
              : `${t("count")}: ${data.count}${t("unit.count")}`}
          </p>
        </div>
      );
    }
    return null;
  };

  const startIndex = 0;
  const endIndex =
    timeRange === "day" ? processedData.length - 1 : Math.floor(processedData.length * 0.25);

  return (
    <div className="relative h-full">
      <div className="flex flex-col gap-2 px-2 sm:flex-row sm:items-center sm:gap-4">
        <h3 className="w-full text-center text-base sm:flex-1 sm:text-lg">
          {t("lineChart.title")}
        </h3>

        <div className="flex w-full items-center gap-3 sm:w-auto sm:gap-4">
          <RadioGroup
            orientation="horizontal"
            value={timeRange}
            size="sm"
            onValueChange={(value: string) => {
              setTimeRange(value);
            }}
            className="flex-1 sm:flex-none"
          >
            {[
              { label: t("unit.hour"), value: "hour" },
              { label: t("unit.day"), value: "day" },
            ].map(({ label, value }) => (
              <Radio
                key={value}
                value={value}
                classNames={{
                  base: cn(
                    "inline-flex m-0 bg-content1 hover:bg-content2",
                    "items-center justify-between flex-row-reverse",
                    "max-w-[100px] sm:max-w-[300px] cursor-pointer",
                    "rounded-lg gap-1 sm:gap-2 border-2 border-transparent",
                    "data-[selected=true]:border-primary p-1"
                  ),
                }}
              >
                {label}
              </Radio>
            ))}
          </RadioGroup>
          <Tippy
            content={showSales ? t("lineChart.toggleCount") : t("lineChart.toggleAmount")}
            showArrow
            className="text-gray-500 dark:text-gray-200"
          >
            <Switch isSelected={showSales} size="sm" onValueChange={value => setShowSales(value)} />
          </Tippy>
        </div>
      </div>

      <div
        className="mt-4 overflow-x-auto"
        style={{
          cursor: "grab",
          scrollbarWidth: "thin",
          scrollbarColor: "#888 transparent",
        }}
      >
        <ResponsiveContainer width={"100%"} height={220} debounce={200}>
          <LineChart
            data={processedData}
            margin={{
              left: 0,
              right: 24,
              top: 12,
              bottom: 8,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />

            {/* X轴添加缩放控制 */}
            <XAxis
              dataKey="time"
              tickFormatter={timeFormatter}
              minTickGap={20}
              scale="time"
              domain={["auto", "auto"]}
              tick={{ fill: "#666", fontSize: 12 }}
              tickLine={{ stroke: "#ccc" }}
              allowDataOverflow
            />

            <YAxis
              label={{
                value: showSales ? t("lineChart.labelAmount") : t("lineChart.labelCount"),
                angle: -90,
                position: "insideLeft",
                fontSize: 14,
                offset: 10,
              }}
              tick={{ fill: "#666", fontSize: 12 }}
              tickLine={{ stroke: "#ccc" }}
              domain={[0, (dataMax: number) => (dataMax * 1.1).toFixed(2)]}
            />

            <Brush
              dataKey="time"
              startIndex={startIndex}
              endIndex={endIndex}
              stroke="#8884d8"
              tickFormatter={timeFormatter}
              className="dark:[&_rect:first-child]:fill-gray-800"
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{ strokeWidth: 0, className: "dark:text-gray-200" }}
            />

            <Line
              className="dark:text-gray-200"
              type="monotone"
              dataKey={showSales ? "amount" : "count"}
              stroke="#8884d8"
              strokeWidth={2}
              dot={{
                /* 此处有魔法，不能配置dot={null}，因为rechart库的问题 */
                fill: "#8884d8",
                strokeWidth: 0,
                r: 0,
              }}
              activeDot={{
                r: 6,
                fill: "#fff",
                stroke: "#8884d8",
                strokeWidth: 2,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 px-2 text-sm text-gray-500 sm:hidden">{t("lineChart.slide")}</div>
    </div>
  );
}
