"use client";

import React, { useState } from "react";
import { ChartBarIcon } from "@heroicons/react/24/outline";
import styles from "@/components/design-a/flow.module.css";
import { useTranslations } from "next-intl";
import { Button, Input, Tooltip } from "@heroui/react";
import { ComputerDesktopIcon } from "@heroicons/react/16/solid";
import { addToast, closeAll } from "@heroui/toast";
import { CLIENT_BACKEND } from "@/app/requests/misc";
import YearMonthPicker, { getCurrentYearMonth } from "@/components/YearMonthPicker";
import { RevenueResponse, RevenueType, StatData } from "@/app/[locale]/[g]/dashboard/page";

type LoginFormProps = {
  onLoginSuccess: (data: RevenueType[], rid: string, date: string, statData: StatData) => void;
};

type StatResponse = { ec: number; data?: StatData };

async function fetchDashboardData(rid: string, token: string, month: string, isUa: boolean) {
  const headers = { Authorization: token };
  const revenueQuery = new URLSearchParams({ rid, date: month, is_ua: String(+isUa) });
  const statQuery = new URLSearchParams({ rid });
  const [revenueRes, statRes] = await Promise.all([
    fetch(`${CLIENT_BACKEND}/api/billing/revenue?${revenueQuery}`, { headers }).then(
      res => res.json() as Promise<RevenueResponse>
    ),
    // 统计数据是可选的，失败时不影响收益数据展示
    fetch(`${CLIENT_BACKEND}/api/billing/stat/resources?${statQuery}`, { headers })
      .then(res => res.json() as Promise<StatResponse>)
      .catch((): StatResponse => ({ ec: -1 })),
  ]);
  return { revenueRes, statRes };
}

export default function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const t = useTranslations("Dashboard");

  // Form state
  // 与年月选择器的初始值保持一致
  const [month, setMonth] = useState<string>(getCurrentYearMonth);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUa, setIsUa] = useState<boolean>(false);

  // Event handlers
  const handleMonthChange = (value: string) => setMonth(value);
  const toggleUa = () => setIsUa(!isUa);

  // Form submission
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const rid = (formData.get("rid") as string)?.trim();
    const token = (formData.get("token") as string)?.trim();

    if (!rid || !token) {
      closeAll();
      addToast({
        description: t("requiredFields"),
        color: "warning",
      });
      return;
    }

    setIsLoading(true);
    const result = await fetchDashboardData(rid, token, month, isUa).catch((error: unknown) => {
      console.error("Error:", error);
      return null;
    });
    setIsLoading(false);

    if (!result || result.revenueRes.ec !== 200) {
      closeAll();
      addToast({
        description: t("error"),
        color: "warning",
      });
      return;
    }

    const { revenueRes, statRes } = result;
    const statData: StatData = statRes.ec === 200 ? (statRes.data ?? {}) : {};
    onLoginSuccess(revenueRes.data, rid, month, statData);
  };

  return (
    <div className={styles.center}>
      <div className={styles.formCard}>
        <div>
          <div className={styles.formIcon}>
            <ChartBarIcon />
          </div>
          <h1 className={styles.title}>{t("title")}</h1>

          <form className={styles.form} onSubmit={onSubmit} autoComplete="off">
            <YearMonthPicker onChange={handleMonthChange} />

            <div className="flex h-14 items-center gap-2">
              <div className="flex-grow">
                <Input variant="bordered" label={t("rid")} name="rid" type="text" />
              </div>

              <Tooltip content={t("tooltip")}>
                <div className="flex h-full items-center justify-center">
                  <button
                    type="button"
                    onClick={toggleUa}
                    aria-label={t("tooltip")}
                    aria-pressed={isUa}
                    className={`mr-1 flex h-full w-14 items-center justify-center rounded-md transition-colors ${isUa ? "bg-indigo-100 dark:bg-indigo-900" : "bg-gray-100 dark:bg-gray-800"} `}
                  >
                    <ComputerDesktopIcon
                      className={`h-1/2 w-1/2 ${isUa ? "text-indigo-600 dark:text-indigo-400" : "text-gray-500 dark:text-gray-400"} `}
                    />
                  </button>
                </div>
              </Tooltip>
            </div>

            <Input
              variant="bordered"
              label={t("token")}
              name="token"
              type="password"
              autoComplete="off"
            />

            <Button type="submit" isLoading={isLoading} className={styles.primary}>
              {t("confirm")}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
