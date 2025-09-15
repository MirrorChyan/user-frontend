import React from "react";
import { ThumbsUp, Smartphone } from "lucide-react";
import { useTranslations } from "next-intl";
import { isMobile } from "react-device-detect";

export default function PaymentOption({
  checked,
  name,
  onClick,
  children,
  recommend = false,
  mobilePay = false,
}: {
  checked: boolean;
  children?: React.ReactNode;
  onClick: () => void;
  name: string;
  recommend?: boolean;
  mobilePay?: boolean;
}) {
  const t = useTranslations("Checkout");
  return (
    <label
      className={`relative flex cursor-pointer items-center rounded-xl border p-4 transition-colors ${checked ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30" : "border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50"}`}
      onClick={onClick}
    >
      {recommend && (
        <div className="absolute -right-2 -top-2 flex items-center rounded-full bg-emerald-500 px-2 py-1 text-xs text-white shadow-sm">
          <ThumbsUp className="mr-1 h-3 w-3" />
          <span>{t("recommend")}</span>
        </div>
      )}

      {/* {mobilePay && isMobile && (
      <div className="absolute -top-2 right-16 bg-blue-500 text-white text-xs px-2 py-1 rounded-full flex items-center shadow-sm">
        <Smartphone className="w-3 h-3 mr-1" />
        <span>{t('mobilePay')}</span>
      </div>
    )} */}

      <input
        type="radio"
        name="payment"
        value="afdian"
        checked={checked}
        onChange={onClick}
        className="sr-only"
      />

      <div className="flex flex-1 items-center">
        {children}
        <span className="font-medium text-gray-900 dark:text-white">{name}</span>
      </div>
      <div
        className={`ml-6 mr-3 flex h-5 w-5 items-center justify-center rounded-full border-2 ${checked ? "border-indigo-600" : "border-gray-300 dark:border-gray-600"}`}
      >
        {checked && <div className="h-3 w-3 rounded-full bg-indigo-600"></div>}
      </div>
    </label>
  );
}
