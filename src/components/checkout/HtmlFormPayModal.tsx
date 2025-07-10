"use client";

import { useTranslations } from "next-intl";
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { Fragment } from "react";
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
  qrCodeCircleColor,
}: HtmlFormPayModalProps) {
  const gT = useTranslations('GetStart');
  const t = useTranslations("Checkout");

  const currentPrice = (+(planInfo?.price ?? 0) * rate).toFixed(2)
  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => {
      }}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel
                className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-8 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-6">
                  <DialogTitle
                    as="h3"
                    className="text-xl font-medium leading-6 text-gray-900 dark:text-white"
                  >
                    {orderInfo ? t("paymentSuccess") : paymentType}
                  </DialogTitle>
                </div>

                {orderInfo && orderInfo.cdk
                  ? (
                    <ShowKeyInfo info={orderInfo}></ShowKeyInfo>
                  ) : (
                    <>
                      <div className="text-center mb-6">
                        <p className="text-base text-gray-500 dark:text-gray-400 mb-3">
                          {t("scanQRCodeToPay")}
                        </p>
                        <p className="text-base text-gray-400 dark:text-gray-500">
                          {t("productTitle")}: {gT.has(`planTitle.${planInfo?.title}`) ? gT(`planTitle.${planInfo?.title}`) : planInfo?.title}
                        </p>
                        <p className="text-lg font-medium text-indigo-600 dark:text-indigo-400 mt-2">
                          {t("amountToPay")}: {gT('priceSymbol')} {currentPrice}
                        </p>
                      </div>

                      <div className="flex justify-center mb-4">
                        {paymentHtml ? (
                          <div
                            className={`relative p-1 rounded-lg ${qrCodeCircleColor}`}>
                            <div className="relative bg-white p-1 rounded-md">
                              <HtmlFormPayPage paymentHtml={paymentHtml} />
                            </div>
                          </div>
                        ) : (
                          <div
                            className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg h-[240px] w-[240px] flex items-center justify-center">
                            <div className="flex flex-col items-center">
                              <svg className="animate-spin mb-2 h-16 w-16 text-indigo-600"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                  strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>

                      {paymentHtml && isPolling && (
                        <div className="flex justify-center items-center mb-6 text-gray-600 dark:text-gray-300">
                          <Loader2 className="animate-spin mr-2 h-4 w-4" />
                          <span className="text-sm">{t("checkingPaymentStatus")}</span>
                        </div>
                      )}

                      <div className="mt-6">
                        <p className="text-sm text-center text-gray-500 dark:text-gray-400">
                          {t("paymentNote")}
                        </p>
                        {paymentHtml && (
                          <p className="text-sm text-center mt-3">
                            <QQGroupLink text={t("paymentIssue")} />
                          </p>
                        )}
                      </div>
                    </>
                  )}

              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 