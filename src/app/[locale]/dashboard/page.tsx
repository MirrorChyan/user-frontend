"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Card } from "@heroui/react";
import { addToast, closeAll } from "@heroui/toast";
import { CLIENT_BACKEND } from "@/app/requests/misc";
import Revenue from "@/app/[locale]/dashboard/Revenue";
import LoginForm from "@/app/[locale]/dashboard/LoginForm";
import YearMonthPicker from "@/components/YearMonthPicker";

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
  const t = useTranslations("Dashboard");

  // State
  const [isLogin, setIsLogin] = useState<boolean>(false);

  // Revenue data
  const [revenueData, setRevenueData] = useState<RevenueType[]>([]);
  const [currentRid, setCurrentRid] = useState<string>("");
  const [currentDate, setCurrentDate] = useState<string>("");
  const [currentToken, setCurrentToken] = useState<string>("");
  const [currentIsUa, setCurrentIsUa] = useState<boolean>(false);
  const [month, setMonth] = useState<string>("");

  // Debounce timer for query form
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Handle login success from LoginForm
  const handleLoginSuccess = (
    data: RevenueType[],
    rid: string,
    date: string,
    token?: string,
    isUa?: boolean
  ) => {
    setRevenueData(data);
    setCurrentRid(rid);
    setCurrentDate(date);
    if (token) setCurrentToken(token);
    if (isUa !== undefined) setCurrentIsUa(isUa);
    setMonth(date);
    setIsLogin(true);
  };

  // Query effect for when month changes
  useEffect(() => {
    if (!month || !currentRid || !currentToken) return;

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      try {
        const response: RevenueResponse = await fetch(
          `${CLIENT_BACKEND}/api/billing/revenue?rid=${currentRid}&date=${month}&is_ua=${+currentIsUa}`,
          {
            headers: { Authorization: currentToken },
          }
        ).then(res => res.json());

        if (response.ec === 200) {
          closeAll();
          addToast({
            description: t("refreshSuccess"),
            color: "success",
          });
          setRevenueData(response.data);
          setCurrentDate(month);
        } else {
          closeAll();
          addToast({
            description: t("error"),
            color: "warning",
          });
        }
      } catch (error) {
        console.error("Error:", error);
        closeAll();
        addToast({
          description: t("error"),
          color: "warning",
        });
      }
    }, 500);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [month, currentRid, currentToken, currentIsUa, t]);

  const handleLogOut = () => {
    setIsLogin(false);
    setRevenueData([]);
    setCurrentRid("");
    setCurrentDate("");
    setCurrentToken("");
    setCurrentIsUa(false);
    setMonth("");
  };

  // If not logged in, show the standalone login form
  if (!isLogin) {
    return (
      <div className="flex min-h-screen min-w-96 flex-col items-center justify-center">
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  // If logged in, show dashboard view with embedded query form on the top
  return (
    <div className="min-w-96 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl p-4 sm:p-8">
        {/* Header area with title */}
        <div className="flex flex-col justify-between">
          <h1 className="flex-grow text-center text-3xl font-bold dark:text-white sm:text-4xl">
            {t("dashboardTitle")}
          </h1>
        </div>

        {/* Query form */}
        <div className="m-6">
          <Card className="p-6">
            <YearMonthPicker onChange={setMonth} initialYearMonth={month} showArrow={true} />
          </Card>
        </div>

        {/* Revenue charts and data display */}
        <Revenue
          onLogOut={handleLogOut}
          revenueData={revenueData}
          date={currentDate}
          rid={currentRid}
        />
      </div>
    </div>
  );
}
