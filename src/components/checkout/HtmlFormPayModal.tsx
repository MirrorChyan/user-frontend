"use client";

import { useTranslations } from "next-intl";
import AppDialog from "@/components/AppDialog";
import ShowKeyInfo from "@/components/checkout/ShowKeyInfo";
import { Loader2 } from "lucide-react";
import QQGroupLink from "@/components/QQGroupLink";
import HtmlFormPayPage from "@/components/checkout/HtmlFormPayPage";

export interface OrderInfoType {
  cdk?: string;
  expired_at?: string;
}

export interface HtmlFormPayModalProps {
  open: boolean;
  paymentHtml?: string;
  paymentType: string;
  orderInfo?: OrderInfoType;
  planInfo?: {
    title: string;
    price: string;
  };
  rate: number;
  isPolling?: boolean;
  onClose?: () => void;
  qrCodeCircleColor?: string;
}

export default function HtmlFormPayModal({
  open,
  paymentType,
  paymentHtml,
  orderInfo,
  planInfo,
  isPolling = true,
  rate,
  onClose,
  qrCodeCircleColor,
}: HtmlFormPayModalProps) {
  const gT = useTranslations("GetStart");
  const t = useTranslations("Checkout");

  const currentPrice = (+(planInfo?.price ?? 0) * rate).toFixed(2);
  return (
    <AppDialog open={open} title={orderInfo ? t("paymentSuccess") : paymentType} onClose={onClose}>
      {orderInfo && orderInfo.cdk ? (
        <ShowKeyInfo info={orderInfo}></ShowKeyInfo>
      ) : (
        <>
          <div className="mb-6 text-center">
            <p className="mb-3 text-base text-gray-500 dark:text-gray-400">
              {t("scanQRCodeToPay")}
            </p>
            <p className="text-base text-gray-400 dark:text-gray-500">
              {t("productTitle")}:{" "}
              {gT.has(`planTitle.${planInfo?.title}`)
                ? gT(`planTitle.${planInfo?.title}`)
                : planInfo?.title}
            </p>
            <p className="mt-2 text-lg font-medium text-indigo-600 dark:text-indigo-400">
              {t("amountToPay")}: {gT("priceSymbol")} {currentPrice}
            </p>
          </div>

          <div className="mb-4 flex justify-center">
            {paymentHtml ? (
              <div className={`relative rounded-lg p-1 ${qrCodeCircleColor}`}>
                <div className="relative rounded-md bg-white p-1">
                  <HtmlFormPayPage paymentHtml={paymentHtml} />
                </div>
              </div>
            ) : (
              <div className="flex h-[240px] w-[240px] items-center justify-center rounded-lg bg-gray-100 p-4 dark:bg-gray-700">
                <div className="flex flex-col items-center">
                  <svg
                    className="mb-2 h-16 w-16 animate-spin text-indigo-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </div>
              </div>
            )}
          </div>

          {paymentHtml && isPolling && (
            <div className="mb-6 flex items-center justify-center text-gray-600 dark:text-gray-300">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span className="text-sm">{t("checkingPaymentStatus")}</span>
            </div>
          )}

          <div className="mt-6">
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              {t("paymentNote")}
            </p>
            {paymentHtml && (
              <p className="mt-3 text-center text-sm">
                <QQGroupLink text={t("paymentIssue")} />
              </p>
            )}
          </div>
        </>
      )}
    </AppDialog>
  );
}
