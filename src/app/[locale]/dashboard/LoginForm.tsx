"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Button, Input, Tooltip } from "@heroui/react";
import { ComputerDesktopIcon } from "@heroicons/react/16/solid";
import { addToast, closeAll } from "@heroui/toast";
import { CLIENT_BACKEND } from "@/app/requests/misc";
import YearMonthPicker from "@/components/YearMonthPicker";
import { RevenueResponse, RevenueType } from "@/app/[locale]/dashboard/page";

type LoginFormProps = {
  onLoginSuccess: (data: RevenueType[], rid: string, date: string) => void;
};

export default function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const t = useTranslations("Dashboard");

  // Form state
  const [month, setMonth] = useState<string>("");
  const [rid, setRid] = useState<string>("");
  const [token, setToken] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUa, setIsUa] = useState<boolean>(false);

  // Event handlers
  const handleMonthChange = (value: string) => setMonth(value);
  const handleRidChange = (e: React.ChangeEvent<HTMLInputElement>) => setRid(e.target.value.trim());
  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setToken(e.target.value.trim());
  const toggleUa = () => setIsUa(!isUa);

  // Form submission
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!rid || !token) return;

    try {
      setIsLoading(true);
      const response: RevenueResponse = await fetch(
        `${CLIENT_BACKEND}/api/billing/revenue?rid=${rid}&date=${month}&is_ua=${+isUa}`,
        {
          headers: { Authorization: token },
        }
      ).then(res => res.json());

      if (response.ec !== 200) {
        closeAll();
        addToast({
          description: t("error"),
          color: "warning",
        });
        return;
      }

      onLoginSuccess(response.data, rid, month);
    } catch (error) {
      console.error("Error:", error);
      closeAll();
      addToast({
        description: t("error"),
        color: "warning",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="min-w-[40vw] text-center">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-center text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl dark:text-white">
            {t("title")}
          </h2>

          <form
            className="mt-12 flex flex-col gap-5 text-lg leading-8 text-gray-600 dark:text-gray-400"
            onSubmit={onSubmit}
          >
            <YearMonthPicker onChange={handleMonthChange} />

            <div className="flex h-14 items-center gap-2">
              <div className="flex-grow">
                <Input label={t("rid")} name="rid" type="text" onChange={handleRidChange} />
              </div>

              <Tooltip content={t("tooltip")}>
                <div className="flex h-full items-center justify-center">
                  <button
                    type="button"
                    onClick={toggleUa}
                    className={`mr-1 flex h-full w-14 items-center justify-center rounded-md transition-colors ${isUa ? "bg-indigo-100 dark:bg-indigo-900" : "bg-gray-100 dark:bg-gray-800"} `}
                  >
                    <ComputerDesktopIcon
                      className={`h-1/2 w-1/2 ${isUa ? "text-indigo-600 dark:text-indigo-400" : "text-gray-500 dark:text-gray-400"} `}
                    />
                  </button>
                </div>
              </Tooltip>
            </div>

            <Input label={t("token")} name="token" type="password" onChange={handleTokenChange} />

            <Button
              type="submit"
              isLoading={isLoading}
              className="mt-6 flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
            >
              {t("confirm")}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
