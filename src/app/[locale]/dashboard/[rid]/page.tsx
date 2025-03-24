"use client";

import { useEffect, useRef, useState } from "react";
import { Card, Button, Skeleton } from "@heroui/react";
import { useParams, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { clsx } from "clsx";
import { debounce } from "lodash";
import { Revenue } from "@/app/[locale]/dashboard/page";


export default function Dashboard() {
  const t = useTranslations("Dashboard");
  const router = useRouter();
  const accessRef = useRef<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [revenueData, setRevenueData] = useState<Revenue[]>([]);

  const searchParams = useSearchParams();
  const date = searchParams.get("date");
  const params = useParams();
  const rid: string = params.rid as string ?? "MAA";

  useEffect(() => {
    // 只在客户端执行 直接打开了 /zh/dashboard/{rid} 页面，或者刷新了页面，跳转回 /zh/dashboard
    if (typeof window !== "undefined") {
      const localRid = sessionStorage.getItem("rid");

      if (!localRid || !rid || !date) {
        return router.replace("/dashboard");
      }

      const data = sessionStorage.getItem("REVENUE_DATA");

      if (data) {
        setRevenueData(JSON.parse(data));
        if (!accessRef.current) {
          accessRef.current = true;
          return;
        }
        sessionStorage.removeItem("REVENUE_DATA"); // 使用后清理
      } else {
        router.replace("/dashboard"); // 无数据时重定向
      }
    }
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  // CSV导出处理
  const handleExport = debounce(async () => {
    const filename = `Mirror酱 ${rid} ${date?.slice(0, 4)}-${date?.slice(5)} 销售数据.csv`;
    const csvContent = "\uFEFF" + "activated_at,application,user_agent,plan,buy_count,amount\n" +
      revenueData.map(d =>
        `${d.activated_at},${d.application},${d.user_agent},${d.plan},${d.buy_count},${d.amount}`)
        .join("\n");

    const blob = new Blob([csvContent], {type: "text/csv"});
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  }, 500);

  if (isLoading) {
    return (
      <div className="p-6 space-y-8 max-w-7xl mx-auto">
        {/* 标题骨架 */}
        <Skeleton className="w-1/2 h-20 rounded-lg"/>

        {/* 统计卡片骨架 */}
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((_, i) => (
            <Skeleton key={i} className={clsx(
              "rounded-xl", i === 2 ? "h-20" : "h-52"
            )}/>
          ))}
        </div>

        {/* 图表区骨架 */}
        <div className="grid grid-cols-3 gap-6">
          {[1, 2, 3].map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-xl"/>
          ))}
        </div>

        {/* 数据表格区 */}
        <div className="grid grid-cols-1 md:grid-cols-3 sm:grid-cols-1 gap-6 mb-6">
          {[1, 2].map((_, i) => (
            <Skeleton key={i} className={clsx(
              "h-52 rounded-xl",
              i === 0 ? "lg:col-span-1" : "lg:col-span-2"
            )}/>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* 标题区 */}
      <h1 className="text-4xl indent-0 font-bold mb-6 sm:indent-6">
        {t("dashboardTitle", {rid})}
      </h1>

      <div className="max-w-7xl mx-auto">
        {/* 统计卡片区 - 桌面3列/手机1列布局 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card>
            <div className="p-4 sm:p-8">
              <h3 className="text-gray-500">{t("totalAmount")}</h3>
              <p className="text-2xl sm:text-3xl font-bold">
                {revenueData.reduce((acc, cur)=> acc + Number(cur.buy_count), 0)}份
              </p>
            </div>
          </Card>
          <Card>
            <div className="p-4 sm:p-8">
              <h3 className="text-gray-500">{t("totalRevenue")}</h3>
              <p className="text-2xl sm:text-3xl font-bold">
                {revenueData.reduce(
                  (acc, cur) => acc + Number(cur.amount) * Number(cur.buy_count), 0
                ).toFixed(2)}元
              </p>
            </div>
          </Card>
          <div className="flex items-center justify-center p-4">
            <Button className="w-full sm:w-auto" color="secondary" variant="ghost" onClick={handleExport}>
              {t("export")}
            </Button>
          </div>
        </div>

        {/* 图表区 - 桌面3列/手机单列 */}
        <div className="grid grid-cols-1 md:grid-cols-3 sm:grid-cols-1 gap-6 mb-6">
          <Card>
            <div className="p-4">
              <h3 className="mb-4">{t("application")}</h3>
              <div className="w-full h-52 bg-blue-300 rounded"></div>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <h3 className="mb-4">{t("userAgent")}</h3>
              <div className="w-full h-52 bg-blue-300 rounded">
              </div>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <h3 className="mb-4">{t("plan")}</h3>
              <div className="w-full h-52 bg-blue-300 rounded"></div>
            </div>
          </Card>
        </div>

        {/* 数据表格区 - 桌面1+2列/手机单列 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* 日销售记录 (桌面1列) */}
          <Card className="lg:col-span-1">
            <div className="p-4">
              <h3 className="mb-4">{t("dailyRecord")}</h3>
              <div className="w-full h-64 bg-amber-400"></div>
            </div>
          </Card>

          {/* 折线图 (桌面2列) */}
          <Card className="lg:col-span-2">
            <div className="p-4">
              <h3 className="mb-4">{t("totalAmountChart")}</h3>
              <div className="w-full h-64 bg-indigo-300"></div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
