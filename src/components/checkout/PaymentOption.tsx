import React from "react";
import { ThumbsUp } from "lucide-react";
import { useTranslations } from "next-intl";

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
      className={`relative flex cursor-pointer items-center rounded-xl border p-4 transition-colors ${checked ? "border-primary bg-secondary/50" : "border-border hover:bg-muted/50"}`}
      onClick={onClick}
    >
      {recommend && (
        <div className="absolute -right-2 -top-2 flex items-center rounded-full bg-emerald-500 px-2 py-1 text-xs text-white shadow-sm">
          <ThumbsUp className="mr-1 h-3 w-3" />
          <span>{t("recommend")}</span>
        </div>
      )}

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
        <span className="font-medium text-foreground">{name}</span>
      </div>
      <div
        className={`ml-6 mr-3 flex h-5 w-5 items-center justify-center rounded-full border-2 ${checked ? "border-primary" : "border-border"}`}
      >
        {checked && <div className="h-3 w-3 rounded-full bg-primary"></div>}
      </div>
    </label>
  );
}
