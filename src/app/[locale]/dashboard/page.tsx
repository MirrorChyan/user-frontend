"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import LoginForm from "@/app/[locale]/dashboard/LoginForm";
import RevenueSkeleton from "@/app/[locale]/dashboard/RevenueSkeleton";

// 看板依赖 recharts 等较大的库，登录成功后才加载
const Revenue = dynamic(() => import("@/app/[locale]/dashboard/Revenue"), {
  loading: () => <RevenueSkeleton />,
});

export type RevenueType = {
  activated_at: Date;
  amount: string;
  application: string;
  buy_count: number;
  blocked: boolean;
  plan: string;
  user_agent: string;
  platform: string;
  source: string;
};

export type RevenueResponse = {
  data: RevenueType[];
  ec: number;
};

export type StatDayStat = { request: number; count: number };
export type StatData = Record<string, Record<string, StatDayStat>>;

export default function Dashboard() {
  const [isLogin, setIsLogin] = useState<boolean>(false);
  const [revenueData, setRevenueData] = useState<RevenueType[]>([]);
  const [statData, setStatData] = useState<StatData>({});
  const [currentRid, setCurrentRid] = useState<string>("");
  const [currentDate, setCurrentDate] = useState<string>("");

  const handleLoginSuccess = (data: RevenueType[], rid: string, date: string, stat: StatData) => {
    setRevenueData(data);
    setStatData(stat);
    setCurrentRid(rid);
    setCurrentDate(date);
    setIsLogin(true);
  };

  const handleLogOut = () => {
    setIsLogin(false);
    setRevenueData([]);
    setCurrentRid("");
    setCurrentDate("");
  };

  if (isLogin) {
    return (
      <Revenue
        onLogOut={handleLogOut}
        revenueData={revenueData}
        statData={statData}
        date={currentDate}
        rid={currentRid}
      />
    );
  }

  return <LoginForm onLoginSuccess={handleLoginSuccess} />;
}
