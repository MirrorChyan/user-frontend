"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@heroui/react";
import { closeAll, addToast } from "@heroui/toast";
import Revenue from "@/app/[locale]/dashboard/Revenue";
import LoginForm from "@/app/[locale]/dashboard/LoginForm";

export type RevenueType = {
  activated_at: Date
  amount: string
  application: string
  buy_count: number
  plan: string
  user_agent: string
  platform: string
  source: string
}

export type RevenueResponse = {
  data: RevenueType[]
  ec: number
}

export default function Dashboard() {
  const t = useTranslations("Dashboard");

  // State
  const [isLogin, setIsLogin] = useState<boolean>(false);
  const [isLoading] = useState<boolean>(false);

  // Revenue data
  const [revenueData, setRevenueData] = useState<RevenueType[]>([]);
  const [currentRid, setCurrentRid] = useState<string>("");
  const [currentDate, setCurrentDate] = useState<string>("");
  const [currentToken, setCurrentToken] = useState<string>("");
  const [currentIsUa, setCurrentIsUa] = useState<boolean>(false);

  // Handle login success from LoginForm
  const handleLoginSuccess = (data: RevenueType[], rid: string, date: string, token?: string, isUa?: boolean) => {
    setRevenueData(data);
    setCurrentRid(rid);
    setCurrentDate(date);
    if (token) setCurrentToken(token);
    if (isUa !== undefined) setCurrentIsUa(isUa);
    setIsLogin(true);
  };

  const handleLogOut = () => {
    setIsLogin(false);
    setRevenueData([]);
    setCurrentRid("");
    setCurrentDate("");
    setCurrentToken("");
    setCurrentIsUa(false);
  };

  // If not logged in, show the standalone login form
  if (!isLogin) {
    return (
      <div className="min-w-96 min-h-screen flex flex-col justify-center items-center">
        <LoginForm
          onLoginSuccess={(data, rid, date, token, isUa) => handleLoginSuccess(data, rid, date, token, isUa)}
        />
      </div>
    );
  }

  // If logged in, show dashboard view with embedded query form on the top
  return (
    <div className="min-w-96 dark:bg-gray-900">
      <div className="p-4 sm:p-8 max-w-7xl mx-auto">
        {/* Header area with title */}
        <div className="flex flex-col justify-between">
          <h1 className="text-center text-3xl sm:text-4xl font-bold dark:text-white flex-grow">
            {t("dashboardTitle")}
          </h1>
        </div>

        {/* Query form */}
        <div className="m-6">
          <LoginForm
            variant="embedded"
            initialToken={currentToken}
            initialRid={currentRid}
            initialMonth={currentDate}
            initialIsUa={currentIsUa}
            isLoading={isLoading}
            logoutButton={
              <Button
                onClick={handleLogOut}
                variant="ghost"
                color="danger"
                className="flex items-center gap-2"
              >
                {t("logout")}
              </Button>
            }
            onLoginSuccess={(data, rid, date, token, isUa) => {
              closeAll();
              addToast({
                description: t("refreshSuccess"),
                color: "success",
              });
              handleLoginSuccess(data, rid, date, token, isUa);
            }}
          />
        </div>

        {/* Revenue charts and data display */}
        <Revenue onLogOut={handleLogOut} revenueData={revenueData} date={currentDate} rid={currentRid} />
      </div>
    </div>
  );
}
