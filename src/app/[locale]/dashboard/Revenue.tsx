"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Button,
  Card,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Skeleton,
  Tab,
  Tabs,
} from "@heroui/react";
import { debounce } from "lodash";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, TooltipProps } from "recharts";
import { Props } from "recharts/types/component/DefaultLegendContent";
import { RevenueType, StatData } from "@/app/[locale]/dashboard/page";
import SalesList from "@/app/[locale]/dashboard/SalesList";
import SalesLineChart from "@/app/[locale]/dashboard/SalesLineChart";
import StatLineChartCard from "@/app/[locale]/dashboard/StatLineChartCard";

type RevenueProps = {
  date: string;
  onLogOut: () => void;
  revenueData: RevenueType[];
  rid: string;
  statData: StatData;
};

type ChartDataItem = {
  name: string;
  amount: number;
  count: number;
  percentage?: number;
};

type SalesPieChartProps = {
  data: ChartDataItem[];
  title: string;
};

export default function Revenue({ revenueData, statData, onLogOut, rid, date }: RevenueProps) {
  const t = useTranslations("Dashboard");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("sales");
  const { totalCount, totalAmount, refundedCount, refundedAmount } = useMemo(() => {
    return revenueData.reduce(
      (acc, cur) => {
        const buyCount = Number(cur.buy_count) || 0;
        const amount = Number(cur.amount) || 0;

        acc.totalCount += buyCount;
        acc.totalAmount += amount;

        if (cur.blocked) {
          acc.refundedCount += buyCount;
          acc.refundedAmount += amount;
        }

        return acc;
      },
      { totalCount: 0, totalAmount: 0, refundedCount: 0, refundedAmount: 0 }
    );
  }, [revenueData]);
  useEffect(() => {
    if (!revenueData) {
      return onLogOut();
    }
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  // Prepare chart data
  const applicationData = useMemo(() => {
    const data = prepareChartData(revenueData, "application");
    return calculatePercentages(data);
  }, [revenueData]);

  const userAgentData = useMemo(() => {
    const data = prepareChartData(revenueData, "user_agent");
    return calculatePercentages(data);
  }, [revenueData]);

  const planData = useMemo(() => {
    const data = prepareChartData(revenueData, "plan");
    return calculatePercentages(data);
  }, [revenueData]);

  const sourceData = useMemo(() => {
    const data = prepareChartData(revenueData, "source");
    return calculatePercentages(data);
  }, [revenueData]);

  const PLATFORM_FEE_RATES: Record<string, number> = {
    yimapay: 0.02,
    afdian: 0.06,
    weixin: 0.01,
    alipay: 0.006,
  };

  const PLATFORM_LABELS: Record<string, string> = {
    yimapay: "易码付",
    afdian: "爱发电",
    weixin: "微信",
    alipay: "支付宝",
  };

  const estimatedRevenue = useMemo(() => {
    const platformMap: Record<
      string,
      { amount: number; fee: number; received: number; dividend: number; feeRate: number }
    > = {};

    revenueData.forEach(item => {
      if (item.blocked) return;

      const platform = item.platform;
      const amount = parseFloat(item.amount);
      const feeRate = PLATFORM_FEE_RATES[platform] ?? 0;

      if (!platformMap[platform]) {
        platformMap[platform] = { amount: 0, fee: 0, received: 0, dividend: 0, feeRate };
      }

      platformMap[platform].amount += amount;
      platformMap[platform].fee += amount * feeRate;
      platformMap[platform].received += amount * (1 - feeRate);
      platformMap[platform].dividend += amount * (1 - feeRate) * 0.5;
    });

    const platforms = Object.entries(platformMap)
      .map(([name, d]) => ({
        name,
        label: PLATFORM_LABELS[name] || name,
        amount: parseFloat(d.amount.toFixed(2)),
        fee: parseFloat(d.fee.toFixed(2)),
        received: parseFloat(d.received.toFixed(2)),
        dividend: parseFloat(d.dividend.toFixed(2)),
        feeRate: d.feeRate,
      }))
      .sort((a, b) => b.amount - a.amount);

    const total = parseFloat(platforms.reduce((sum, d) => sum + d.dividend, 0).toFixed(2));

    return { platforms, total };
  }, [revenueData]);

  function calculatePercentages(data: ChartDataItem[]): ChartDataItem[] {
    const total = data.reduce((sum, item) => sum + item.count, 0);

    if (total === 0) {
      return data.map(item => ({
        ...item,
        percentage: 0,
      }));
    }

    return data
      .map(item => ({
        ...item,
        percentage: parseFloat(((item.count / total) * 100).toFixed(1)),
      }))
      .sort((a, b) => (b.count == a.count ? b.amount - a.amount : b.count - a.count));
  }

  // Function to prepare chart data by grouping
  function prepareChartData(data: RevenueType[], key: keyof RevenueType): ChartDataItem[] {
    const grouped: Record<string, { amount: number; count: number }> = data.reduce(
      (acc, item) => {
        const keyValue = String(item[key]);
        const amount = parseFloat(item.amount);
        const count = Number(item.buy_count);

        if (!acc[keyValue]) {
          acc[keyValue] = { amount: 0, count: 0 };
        }
        acc[keyValue].amount += amount;
        acc[keyValue].count += count;
        return acc;
      },
      {} as Record<string, { amount: number; count: number }>
    );

    return Object.entries(grouped).map(([name, { amount, count }]) => ({
      name,
      amount: parseFloat(amount.toFixed(2)),
      count,
    }));
  }

  // Function to render legend for pie chart
  const renderLegend = ({ payload }: Props) => {
    if (!payload) return null;
    return (
      <ul className="text-xs">
        {payload.map((entry: any, index: number) => (
          <li key={`item-${index}`} className="mb-1 flex items-center">
            <span className="mr-1 inline-block h-3 w-3" style={{ backgroundColor: entry.color }} />
            <div className="flex flex-col">
              <span>
                {entry.value} {entry.payload.percentage}%{" "}
              </span>
              <span className="text-gray-500">
                {entry.payload.count}
                {t("unit.count")} {entry.payload.amount.toFixed(2)}
                {t("unit.amount")}
              </span>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  // CSV export handler
  const handleExport = debounce(async () => {
    const filename = `MirrorChyan Sales ${rid} ${date}.csv`;
    const csvContent =
      "\uFEFF" +
      "activated_at,application,plan,user_agent,source,platform,amount,blocked\n" +
      revenueData
        .map(
          d =>
            `${d.activated_at},${d.application},${d.plan},${d.user_agent},${d.source},${d.platform},${d.amount},${d.blocked ? 1 : 0}`
        )
        .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  }, 500);

  // Reusable Pie Chart component
  const SalesPieChart = (pieChartProps: SalesPieChartProps) => {
    const [activeSliceIndex, setActiveSliceIndex] = useState<number | undefined>(undefined);
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

    const customTooltip = (toolTipProps: TooltipProps<number, string>) => {
      const { active, payload } = toolTipProps;
      if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
          <div className="rounded border bg-white p-2 shadow dark:border-gray-700 dark:bg-gray-800">
            <p className="font-medium text-gray-900 dark:text-white">
              {data.name} {data.percentage}%
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              {data.count}
              {t("unit.count")} {data.amount.toFixed(2)}
              {t("unit.amount")}
            </p>
          </div>
        );
      }
      return null;
    };

    return (
      <div className="h-full">
        <h3 className="mb-2">{pieChartProps.title}</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={pieChartProps.data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              innerRadius={30}
              fill="#8884d8"
              dataKey="count"
              activeIndex={activeSliceIndex}
              onMouseEnter={(_, index) => setActiveSliceIndex(index)}
              onMouseLeave={() => setActiveSliceIndex(undefined)}
            >
              {pieChartProps.data.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={customTooltip} />
            <Legend
              layout="vertical"
              align="left"
              verticalAlign="top"
              content={renderLegend}
              wrapperStyle={{
                maxHeight: "240px",
                overflowY: "auto",
                direction: "ltr",
                paddingRight: "10px",
                textAlign: "left",
                scrollbarWidth: "none" /* Firefox */,
                msOverflowStyle: "none" /* Internet Explorer 10+ */,
              }}
              className="no-scrollbar"
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl space-y-8 p-6">
        <Skeleton className="h-20 w-1/2 rounded-lg" />
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:col-span-2">
            {[1, 2, 3, 4].map((_, i) => (
              <Skeleton key={i} className="h-60 rounded-lg" />
            ))}
          </div>
          <Skeleton className="min-h-96 rounded-lg lg:col-span-1" />
        </div>
        <Skeleton className="h-96 rounded-lg" />
      </div>
    );
  }

  const hasStatData = Object.keys(statData).length > 0;

  return (
    <div className="min-h-screen dark:bg-gray-900">
      <div className="mx-auto max-w-7xl p-6">
        {/* 标题区 */}
        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <h1 className="flex-grow text-4xl font-bold dark:text-white">
            {t("dashboardTitle", { rid, date })}
          </h1>
          <div className="flex w-full items-center gap-3 sm:mr-8 sm:w-auto">
            {hasStatData ? (
              <Tabs
                selectedKey={activeTab}
                onSelectionChange={key => setActiveTab(key as string)}
                size="sm"
                variant="bordered"
              >
                <Tab key="sales" title={t("lineChart.title")} />
                <Tab key="stat" title={t("statChart.title")} />
              </Tabs>
            ) : null}
            <Button
              className="w-full sm:w-auto"
              color="secondary"
              variant="ghost"
              onClick={handleExport}
            >
              {t("export")}
            </Button>
          </div>
        </div>

        {activeTab === "stat" ? (
          <StatLineChartCard statData={statData} />
        ) : (
          <>
            {/* Stats cards */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Card>
                <div className="p-4 sm:p-8">
                  <h3 className="text-gray-500">{t("monthlyCount")}</h3>
                  <p className="text-2xl font-bold sm:text-3xl">
                    {totalCount}
                    {t("unit.count")}
                    {refundedCount > 0 ? (
                      <span className="ml-2 text-sm font-normal text-gray-500">
                        {t("refundedCount", { count: refundedCount })}
                      </span>
                    ) : null}
                  </p>
                </div>
              </Card>
              <Card>
                <div className="p-4 sm:p-8">
                  <h3 className="text-gray-500">{t("monthlyAmount")}</h3>
                  <p className="text-2xl font-bold sm:text-3xl">
                    {totalAmount.toFixed(2)}
                    {t("unit.amount")}
                    {refundedAmount > 0 ? (
                      <span className="ml-2 text-sm font-normal text-gray-500">
                        {t("refundedAmount", { amount: refundedAmount.toFixed(2) })}
                      </span>
                    ) : null}
                  </p>
                </div>
              </Card>
              <Popover placement="bottom" showArrow>
                <PopoverTrigger>
                  <Card isPressable className="text-left">
                    <div className="p-4 sm:p-8">
                      <h3 className="!text-gray-500">{t("estimatedRevenue")}</h3>
                      <p className="!text-foreground text-2xl !font-bold sm:text-3xl">
                        {estimatedRevenue.total.toFixed(2)}
                        {t("unit.amount")}
                        <span className="ml-2 text-sm font-normal text-gray-500">
                          {t("clickToViewDetail")}
                        </span>
                      </p>
                    </div>
                  </Card>
                </PopoverTrigger>
                <PopoverContent>
                  <div className="p-3">
                    <table className="text-sm">
                      <thead>
                        <tr className="border-b text-left text-gray-500 dark:text-gray-400">
                          <th className="pr-4 pb-2">{t("estimatedRevenueDetail.platform")}</th>
                          <th className="pr-4 pb-2">{t("estimatedRevenueDetail.feeRate")}</th>
                          <th className="pr-4 pb-2 text-right">
                            {t("estimatedRevenueDetail.sales")}
                          </th>
                          <th className="pr-4 pb-2 text-right">
                            {t("estimatedRevenueDetail.platformFee")}
                          </th>
                          <th className="pr-4 pb-2 text-right">
                            {t("estimatedRevenueDetail.received")}
                          </th>
                          <th className="pr-4 pb-2">{t("estimatedRevenueDetail.shareRate")}</th>
                          <th className="pb-2 text-right">
                            {t("estimatedRevenueDetail.dividend")}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {estimatedRevenue.platforms.map(p => (
                          <tr
                            key={p.name}
                            className="border-b border-gray-100 dark:border-gray-700"
                          >
                            <td className="py-2 pr-4 font-medium">{p.label}</td>
                            <td className="py-2 pr-4 text-gray-500">
                              {(p.feeRate * 100).toFixed(1)}%
                            </td>
                            <td className="py-2 pr-4 text-right">{p.amount.toFixed(2)}</td>
                            <td className="py-2 pr-4 text-right text-red-500">
                              -{p.fee.toFixed(2)}
                            </td>
                            <td className="py-2 pr-4 text-right">{p.received.toFixed(2)}</td>
                            <td className="py-2 pr-4 text-center text-gray-500">50%</td>
                            <td className="py-2 text-right font-medium text-green-600 dark:text-green-400">
                              {p.dividend.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="font-bold">
                          <td className="pt-2" colSpan={6}>
                            {t("estimatedRevenueDetail.total")}
                          </td>
                          <td className="pt-2 text-right text-green-600 dark:text-green-400">
                            {estimatedRevenue.total.toFixed(2)}
                            {t("unit.amount")}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                    <p className="mt-3 border-t border-gray-200 pt-2 text-xs text-gray-400 dark:border-gray-700">
                      {t("estimatedRevenueDetail.disclaimer")}
                    </p>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Charts + Sales list */}
            <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:col-span-2">
                <Card>
                  <div className="p-2">
                    <SalesPieChart data={applicationData} title={t("application")} />
                  </div>
                </Card>
                <Card>
                  <div className="p-2">
                    <SalesPieChart data={planData} title={t("plan")} />
                  </div>
                </Card>
                <Card>
                  <div className="p-2">
                    <SalesPieChart data={userAgentData} title={t("userAgent")} />
                  </div>
                </Card>
                <Card>
                  <div className="p-2">
                    <SalesPieChart data={sourceData} title={t("source")} />
                  </div>
                </Card>
              </div>
              <Card className="lg:col-span-1">
                <div className="flex h-96 flex-col p-4 lg:h-full">
                  <h3>{t("list.title")}</h3>
                  <div className="custom-scrollbar flex-1 overflow-y-auto">
                    <SalesList listData={revenueData} date={date} />
                  </div>
                </div>
              </Card>
            </div>
            <Card>
              <div className="h-96 w-full p-4 sm:h-80">
                <SalesLineChart revenueData={revenueData} date={date} />
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
