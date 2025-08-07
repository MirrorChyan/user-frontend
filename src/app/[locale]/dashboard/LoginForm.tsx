"use client";

import React, { useState, ReactNode, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import {
  Button,
  Input,
  Tooltip,
  Card
} from "@heroui/react";
import { ComputerDesktopIcon, ChevronDownIcon } from "@heroicons/react/16/solid";
import { closeAll, addToast } from "@heroui/toast";
import { CLIENT_BACKEND } from "@/app/requests/misc";
import YearMonthPicker from "@/components/YearMonthPicker";
import { RevenueType, RevenueResponse } from "@/app/[locale]/dashboard/page";


type LoginFormProps = {
  onLoginSuccess: (data: RevenueType[], rid: string, date: string, token?: string, isUa?: boolean) => void;
  variant?: "standalone" | "embedded";
  initialToken?: string;
  initialRid?: string;
  initialMonth?: string;
  initialIsUa?: boolean;
  isLoading?: boolean;
  logoutButton?: ReactNode;
}

export default function LoginForm({
  onLoginSuccess,
  variant = "standalone",
  initialToken = "",
  initialRid = "",
  initialMonth = "",
  initialIsUa = false,
  isLoading = false,
  logoutButton
}: LoginFormProps) {
  const t = useTranslations("Dashboard");

  // Form state
  const [month, setMonth] = useState<string>(initialMonth);
  const [rid, setRid] = useState<string>(initialRid);
  const [token, setToken] = useState<string>(initialToken);
  const [isFormLoading, setIsFormLoading] = useState<boolean>(isLoading);
  const [isUa, setIsUa] = useState<boolean>(initialIsUa);

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const toggleOpen = () => setIsOpen(!isOpen);

  useEffect(() => {
    setMonth(initialMonth);
    setRid(initialRid);
    setToken(initialToken);
    setIsUa(initialIsUa);
  }, [initialMonth, initialRid, initialToken, initialIsUa]);

  // Submit handler
  const fetchRevenue = async () => {
    if (!rid || !token || !month) return;
    try {
      setIsFormLoading(true);
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
      onLoginSuccess(response.data, rid, month, token, isUa);
    } catch (error) {
      console.error("Error:", error);
      closeAll();
      addToast({
        description: t("error"),
        color: "warning",
      });
    } finally {
      setIsFormLoading(false);
    }
  };

  // Debounce logic for automatic query after date changing
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (variant !== "embedded") return;
    if (!rid || !token || !month) return;
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(fetchRevenue, 500);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  // Event handlers
  const handleMonthChange = (value: string) => setMonth(value);
  const handleRidChange = (e: React.ChangeEvent<HTMLInputElement>) => setRid(e.target.value);
  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => setToken(e.target.value);
  const toggleUa = () => setIsUa(!isUa);

  // Form submission
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    fetchRevenue();
  };

  // Reusable RID input with UA toggle button
  const RidInputWithToggle = () => (
    <div className="flex items-center gap-2 h-14">
      <div className="flex-grow">
        <Input label={t("rid")} name="rid" type="text" value={rid} onChange={handleRidChange} />
      </div>

      <Tooltip content={t("tooltip")}>
        <div className="flex items-center h-full justify-center">
          <button
            type="button"
            onClick={toggleUa}
            className={`flex items-center justify-center h-full w-14 rounded-xl ${isUa ? "bg-indigo-100 dark:bg-indigo-900" : "bg-gray-100 dark:bg-gray-800"}`}
          >
            <ComputerDesktopIcon
              className={`h-1/2 w-1/2 ${isUa ? "text-indigo-600 dark:text-indigo-400" : "text-gray-500 dark:text-gray-400"}`}
            />
          </button>
        </div>
      </Tooltip>
    </div>
  );

  // Reusable token input
  const TokenInput = () => (
    <Input label={t("token")} name="token" type="password" value={token} onChange={handleTokenChange} />
  );

  // Reusable form content wrapper
  const FormContent = ({ children, onSubmit }: { children: ReactNode, onSubmit: (e: React.FormEvent<HTMLFormElement>) => void }) => (
    <form onSubmit={onSubmit}>
      {children}
    </form>
  );

  // Reusable submit button
  const SubmitButton = ({ isFullWidth = false }: { isFullWidth?: boolean }) => {
    const baseClasses = "flex justify-center rounded-xl px-6 py-2 text-sm/6 font-semibold text-white";
    const hoverClasses = "hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500";
    const widthClasses = isFullWidth ? "w-full mt-6" : "";

    return (
      <Button
        type="submit"
        color="primary"
        isLoading={isFormLoading}
        className={`${baseClasses} ${hoverClasses} ${widthClasses} bg-indigo-500`}
      >
        {initialToken ? t("refresh") : t("confirm")}
      </Button>
    );
  };

  // Render form content
  const renderFormContent = () => {
    const isEmbedded = variant === "embedded";

    const drawerContent = isEmbedded && (
      isOpen && (
        <div className="w-full">
          <div className="flex flex-col gap-6 rounded-xl mt-4 px-4">
            <RidInputWithToggle />
            <div className="flex justify-end gap-3 sm:gap-6 items-center">
              {logoutButton && <div>{logoutButton}</div>}
              <div><SubmitButton /></div>
            </div>
          </div>
        </div>
      )
    );

    const standaloneControls = !isEmbedded && (
      <>
        <RidInputWithToggle />
        <TokenInput />
        <SubmitButton isFullWidth={true} />
      </>
    );
    return (
      <>
        <FormContent onSubmit={onSubmit}>
          <div className={`flex flex-col ${isEmbedded ? "gap-2" : "gap-6 text-balance text-xl leading-8 text-gray-600 dark:text-gray-400"}`}>
            <YearMonthPicker onChange={handleMonthChange} initialYearMonth={month} showArrow={isEmbedded} />
            {drawerContent}
            {standaloneControls}
          </div>
        </FormContent>
      </>
    );
  };

  if (variant === "embedded") {
    // Embedded
    return (
      <div className="relative">
        {/* Toggle collapse button */}
        <div className="absolute left-0 right-0 flex justify-center" style={{ top: '100%' }}>
          <button
            type="button"
            onClick={toggleOpen}
            className="-my-0.5 py-0.5 px-6 flex items-center justify-center rounded-b-2xl shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all select-none"
          >
            <span className="flex items-center text-sm">
              {isOpen ? t("hideQueryForm") : t("showQueryForm")}
              <span className={`ml-2 transition-transform ${isOpen ? "rotate-180" : "rotate-0"}`}>
                <ChevronDownIcon className="w-4 h-4" />
              </span>
            </span>
          </button>
        </div>

        {/* Embedded form */}
        <Card className="p-6 overflow-hidden relative">
          {renderFormContent()}
        </Card>
      </div>
    );
  } else {
    // Standalone
    return (
      <div className="mx-auto max-w-2xl">
        <h2 className="text-center text-4xl sm:text-5xl font-semibold tracking-tight text-gray-900 dark:text-white">
          {t("title")}
        </h2>
        <div className="mt-8">
          {renderFormContent()}
        </div>
      </div>
    );
  }
}
