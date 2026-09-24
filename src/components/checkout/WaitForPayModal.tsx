"use client";

import { useTranslations } from "next-intl";
import AppDialog from "@/components/AppDialog";
import ShowKeyInfo from "@/components/checkout/ShowKeyInfo";
import { OrderInfoType } from "@/components/checkout/QRCodePayModal";
import QQGroupLink from "@/components/QQGroupLink";

interface WaitForPayModalProps {
  open: boolean;
  paymentType: string;
  // 支付页面地址，自动打开的新窗口被拦截时供用户手动打开
  paymentUrl?: string;
  isLoading?: boolean;
  onClose?: () => void;
  orderInfo?: OrderInfoType;
}

export default function WaitForPayModal({
  open,
  paymentType,
  paymentUrl,
  isLoading = true,
  onClose,
  orderInfo,
}: WaitForPayModalProps) {
  const t = useTranslations("Checkout");
  const orderT = useTranslations("Order");

  return (
    <AppDialog open={open} title={paymentType} onClose={onClose}>
      {isLoading ? (
        <>
          <div className="flex flex-col items-center justify-center py-10">
            <div className="mb-4 h-16 w-16 animate-spin rounded-full border-t-2 border-b-2 border-pink-500"></div>
            <p className="text-base text-gray-500 dark:text-gray-400">
              {orderT("ProcessingOrder")}
            </p>
          </div>
          {paymentUrl && (
            <div className="flex flex-col items-center">
              <p className="mb-3 text-center text-sm text-gray-500 dark:text-gray-400">
                {t("paymentPageNotOpened")}
              </p>
              <a
                href={paymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
              >
                {t("openPaymentPage")}
              </a>
            </div>
          )}
          <div className="mt-6">
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              {t("paymentNote")}
            </p>
            <p className="mt-3 text-center text-sm">
              <QQGroupLink text={t("paymentIssue")} />
            </p>
          </div>
        </>
      ) : (
        <ShowKeyInfo info={orderInfo}></ShowKeyInfo>
      )}
    </AppDialog>
  );
}
