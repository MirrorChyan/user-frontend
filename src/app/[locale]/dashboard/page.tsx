"use client";

import { useState } from "react";
import Revenue from "@/app/[locale]/dashboard/Revenue";
import LoginForm from "@/app/[locale]/dashboard/LoginForm";

export type RevenueType = {
  activated_at: Date;
  amount: string;
  application: string;
  buy_count: number;
  plan: string;
  user_agent: string;
  platform: string;
  source: string;
};

export type RevenueResponse = {
  data: RevenueType[];
  ec: number;
};

export default function Dashboard() {
  const [isLogin, setIsLogin] = useState<boolean>(false);
  const [revenueData, setRevenueData] = useState<RevenueType[]>([]);
  const [currentRid, setCurrentRid] = useState<string>("");
  const [currentDate, setCurrentDate] = useState<string>("");

  const handleLoginSuccess = (data: RevenueType[], rid: string, date: string) => {
    setRevenueData(data);
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
        date={currentDate}
        rid={currentRid}
      />
    );
  }

  return <LoginForm onLoginSuccess={handleLoginSuccess} />;
}
