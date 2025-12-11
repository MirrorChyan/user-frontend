"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { addToast, closeAll } from "@heroui/toast";
import { CLIENT_BACKEND } from "@/app/requests/misc";
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
  const [pendingMonth, setPendingMonth] = useState<string>("");

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
    setPendingMonth("");
    setIsLogin(true);
  };

  // Query effect for when month changes
  useEffect(() => {
    if (!pendingMonth || !currentRid || !currentToken) return;

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      if (month === pendingMonth) return;

      try {
        const response: RevenueResponse = await fetch(
          `${CLIENT_BACKEND}/api/billing/revenue?rid=${currentRid}&date=${pendingMonth}&is_ua=${+currentIsUa}`,
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
          setMonth(pendingMonth);
          setCurrentDate(pendingMonth);
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
  }, [pendingMonth, currentRid, currentToken, currentIsUa, t]);

  const handleLogOut = () => {
    setIsLogin(false);
    setRevenueData([]);
    setCurrentRid("");
    setCurrentDate("");
    setCurrentToken("");
    setCurrentIsUa(false);
    setMonth("");
    setPendingMonth("");
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
      <div className="max-w-8xl mx-auto p-4 sm:p-8">
        {/* Revenue charts and data display */}
        <Revenue
          onLogOut={handleLogOut}
          revenueData={revenueData}
          date={currentDate}
          rid={currentRid}
          month={month}
          onMonthChange={setPendingMonth}
        />
      </div>
    </div>
  );
}
