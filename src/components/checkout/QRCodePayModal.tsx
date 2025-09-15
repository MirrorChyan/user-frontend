"use client";

import { useTranslations } from "next-intl";
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { Fragment } from "react";
import QRCodeImage from "@/components/checkout/QRCodeImage";
import ShowKeyInfo from "@/components/checkout/ShowKeyInfo";
import { Loader2 } from "lucide-react";
import QQGroupLink from "@/components/QQGroupLink";

export interface OrderInfoType {
  cdk?: string;
  expired_at?: string;
}

export interface QRCodePayModalProps {
  open: boolean;
  paymentUrl?: string;
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
  qrCodeIcon: React.ReactNode;
}

export default function QRCodePayModal({
  open,
  paymentType,
  paymentUrl,
  orderInfo,
  planInfo,
  isPolling = true,
  rate,
  qrCodeCircleColor,
  qrCodeIcon,
}: QRCodePayModalProps) {
  const gT = useTranslations("GetStart");
  const t = useTranslations("Checkout");

  const currentPrice = (+(planInfo?.price ?? 0) * rate).toFixed(2);
  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => {}}>
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
              <DialogPanel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all dark:bg-gray-800">
                <div className="mb-6 flex items-center justify-between">
                  <DialogTitle
                    as="h3"
                    className="text-xl font-medium leading-6 text-gray-900 dark:text-white"
                  >
                    {orderInfo ? t("paymentSuccess") : paymentType}
                  </DialogTitle>
                </div>

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
                      {paymentUrl ? (
                        <div className={`relative rounded-lg p-1 ${qrCodeCircleColor} `}>
                          <div className="relative rounded-md bg-white p-1">
                            <QRCodeImage size={240} value={paymentUrl} logo={qrCodeIcon} />
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

                    {paymentUrl && isPolling && (
                      <div className="mb-6 flex items-center justify-center text-gray-600 dark:text-gray-300">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span className="text-sm">{t("checkingPaymentStatus")}</span>
                      </div>
                    )}

                    <div className="mt-6">
                      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                        {t("paymentNote")}
                      </p>
                      {paymentUrl && (
                        <p className="mt-3 text-center text-sm">
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
