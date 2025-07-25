"use client";

import { useEffect, useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Card, Button, Skeleton } from "@heroui/react";
import { debounce } from "lodash";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, TooltipProps } from "recharts";
import { Props } from "recharts/types/component/DefaultLegendContent";
import { RevenueType } from "@/app/[locale]/dashboard/page";
import SalesList from "@/app/[locale]/dashboard/SalesList";
import SalesLineChart from "@/app/[locale]/dashboard/SalesLineChart";


type RevenueProps = {
    revenueData: RevenueType[]
    onLogOut: () => void
    date: string
    rid: string
}

type ChartDataItem = {
    name: string;
    amount: number;
    count: number;
    percentage?: number;
}

type SalesPieChartProps = {
    data: ChartDataItem[],
    title: string
}

export default function Revenue({ revenueData, onLogOut, rid, date }: RevenueProps) {
    const t = useTranslations("Dashboard");
    const [isLoading, setIsLoading] = useState<boolean>(true);
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

    function calculatePercentages(data: ChartDataItem[]): ChartDataItem[] {
        const total = data.reduce((sum, item) => sum + item.count, 0);

        if (total === 0) {
            return data.map(item => ({
                ...item,
                percentage: 0
            }));
        }

        return data.map(item => ({
            ...item,
            percentage: parseFloat(((item.count / total) * 100).toFixed(1))
        }))
            .sort((a, b) => b.count == a.count ? b.amount - a.amount : b.count - a.count);
    }

    // Function to prepare chart data by grouping
    function prepareChartData(data: RevenueType[], key: keyof RevenueType): ChartDataItem[] {
        const grouped: Record<string, { amount: number, count: number }> = data.reduce((acc, item) => {
            const keyValue = String(item[key]);
            const amount = parseFloat(item.amount);
            const count = Number(item.buy_count);

            if (!acc[keyValue]) {
                acc[keyValue] = { amount: 0, count: 0 };
            }
            acc[keyValue].amount += amount;
            acc[keyValue].count += count;
            return acc;
        }, {} as Record<string, { amount: number, count: number }>);

        return Object.entries(grouped).map(([name, { amount, count }]) => ({
            name,
            amount: parseFloat(amount.toFixed(2)),
            count
        }));
    }

    // Function to render legend for pie chart
    const renderLegend = ({ payload }: Props) => {
        if (!payload) return null;
        return (
            <ul className="text-xs">
                {payload.map((entry: any, index: number) => (
                    <li key={`item-${index}`} className="flex items-center mb-1">
                        <span
                            className="inline-block w-3 h-3 mr-1"
                            style={{ backgroundColor: entry.color }}
                        />
                        <div className="flex flex-col">
                            <span>{entry.value} {entry.payload.percentage}% </span>
                            <span className="text-gray-500">
                                {entry.payload.count}{t("unit.count")} {entry.payload.amount.toFixed(2)}{t("unit.amount")}
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
        const csvContent = "\uFEFF" + "activated_at,application,plan,user_agent,source,platform,amount\n" +
            revenueData.map(d =>
                `${d.activated_at},${d.application},${d.plan},${d.user_agent},${d.source},${d.platform},${d.amount}`)
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
        const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#DC143C", "#9370DB", "#20B2AA"];


        const customTooltip = (toolTipProps: TooltipProps<number, string>) => {
            const { active, payload } = toolTipProps;
            if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                    <div className="bg-white dark:bg-gray-800 p-2 shadow rounded border dark:border-gray-700">
                        <p className="font-medium text-gray-900 dark:text-white">{data.name} {data.percentage}%</p>
                        <p className="text-gray-700 dark:text-gray-300">
                            {data.count}{t("unit.count")} {data.amount.toFixed(2)}{t("unit.amount")}
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
                                scrollbarWidth: "none", /* Firefox */
                                msOverflowStyle: "none", /* Internet Explorer 10+ */
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
            <div className="p-6 space-y-8 max-w-7xl mx-auto">
                <Skeleton className="w-1/2 h-20 rounded-lg" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    <div className="lg:col-span-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                            {[1, 2].map((_, i) => (
                                <Skeleton key={i} className="h-20 rounded-lg" />
                            ))}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 sm:grid-cols-1 gap-6 mb-6">
                            {[1, 2, 3, 4].map((_, i) => (
                                <Skeleton key={i} className="h-60 rounded-lg" />
                            ))}
                        </div>
                    </div>
                    <Skeleton className="lg:col-span-1 mb-6 rounded-lg min-h-96" />
                </div>
                <Skeleton className="h-96 rounded-lg" />
            </div>
        );
    }

    return (
        <div className="dark:bg-gray-900">
            <div className="p-6 max-w-7xl mx-auto">
                {/* 标题区 */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                    <h1 className="text-4xl font-bold dark:text-white flex-grow">
                        {t("dashboardTitle", { rid, date })}
                    </h1>
                    {/* 导出按钮移动到标题右侧 */}
                    <Button className="w-full sm:w-auto" color="secondary" variant="ghost" onClick={handleExport}>
                        {t("export")}
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    <div className="max-w-7xl mx-auto w-full lg:col-span-2">
                        {/* Stats cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                            <Card>
                                <div className="p-4 sm:p-8">
                                    <h3 className="text-gray-500">{t("monthlyCount")}</h3>
                                    <p className="text-2xl sm:text-3xl font-bold">
                                        {revenueData.reduce((acc, cur) => acc + Number(cur.buy_count), 0)}
                                        {t("unit.count")}
                                    </p>
                                </div>
                            </Card>
                            <Card>
                                <div className="p-4 sm:p-8">
                                    <h3 className="text-gray-500">{t("monthlyAmount")}</h3>
                                    <p className="text-2xl sm:text-3xl font-bold">
                                        {revenueData.reduce(
                                            (acc, cur) => acc + Number(cur.amount), 0
                                        ).toFixed(2)}
                                        {t("unit.amount")}
                                    </p>
                                </div>
                            </Card>
                        </div>

                        {/* Chart section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 sm:grid-cols-1 gap-6 mb-6">
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
                    </div>
                    <Card className="lg:col-span-1 mb-6">
                        <div className="p-4 flex flex-col h-96 lg:h-[48.01rem]">
                            <h3>{t("list.title")}</h3>
                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                <SalesList listData={revenueData} date={date} />
                            </div>
                        </div>
                    </Card>
                </div>
                {/* 折线图 (桌面2列) */}
                <Card>
                    <div className="w-full h-96 sm:h-80 p-4">
                        <SalesLineChart revenueData={revenueData} date={date} />
                    </div>
                </Card>
            </div>
        </div>
    );
}
