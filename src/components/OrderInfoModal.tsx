"use client";

import { useTranslations, useFormatter, useLocale } from "next-intl";
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { Fragment, useEffect, useMemo, useState } from "react";
import { OrderInfoType } from "@/components/checkout/QRCodePayModal";
import { X, AlertCircle, CheckCircle } from "lucide-react";
import QQGroupLink from "@/components/QQGroupLink";
import { Link } from "@/i18n/routing";
import { CLIENT_BACKEND } from "@/app/requests/misc";
import moment from "moment";
import { addToast } from "@heroui/toast";

interface OrderInfoModalProps {
  orderId: string;
  onClose: () => void;
}

export default function OrderInfoModal({ orderId, onClose }: OrderInfoModalProps) {
  const t = useTranslations("ShowKey");
  const format = useFormatter();
  const locale = useLocale();
  const [orderInfo, setOrderInfo] = useState<OrderInfoType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  const formattedTime = useMemo(() => {
    if (!orderInfo?.expired_at) return null;
    return format.dateTime(moment(orderInfo.expired_at).toDate(), {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  }, [orderInfo?.expired_at, format]);

  useEffect(() => {
    moment.locale(locale);
  }, [locale]);

  const relativeTime = useMemo(() => {
    if (!orderInfo?.expired_at) return null;
    return moment.duration(moment(orderInfo.expired_at).diff(moment())).humanize();
  }, [orderInfo?.expired_at, locale]);

  const copyToClipboard = () => {
    if (!orderInfo?.cdk) return;

    if (!navigator?.clipboard?.writeText) {
      addToast({
        color: "danger",
        description: t("copyFailed"),
      });
      return;
    }

    navigator.clipboard
      .writeText(orderInfo.cdk)
      .then(() => {
        addToast({
          color: "success",
          description: t("copySuccess"),
        });
      })
      .catch(err => {
        console.error(err);
        addToast({
          color: "danger",
          description: t("copyFailed"),
        });
      });
  };

  useEffect(() => {
    const fetchOrderInfo = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${CLIENT_BACKEND}/api/billing/order/query?order_id=${orderId}`
        );
        const { ec, msg, data } = await response.json();

        if (ec === 200) {
          const expired = moment(data.expired_at).isBefore(moment());
          setIsExpired(expired);
          if (expired) {
            setError("orderExpired");
          } else {
            setOrderInfo(data);
          }
        } else {
          setError(msg);
        }
      } catch {
        setError("networkError");
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderInfo();
    }
  }, [orderId]);

  return (
    <Transition appear show={true} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="bg-opacity-25 fixed inset-0 bg-black backdrop-blur-sm" />
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
                    className="text-xl leading-6 font-medium text-gray-900 dark:text-white"
                  >
                    {t("orderInfo")}
                  </DialogTitle>
                  <button
                    onClick={onClose}
                    className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <svg
                      className="mb-4 h-12 w-12 animate-spin text-indigo-600"
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
                    <p className="text-gray-500 dark:text-gray-400">{t("loading")}</p>
                  </div>
                ) : orderInfo && orderInfo.cdk ? (
                  <div className="text-center">
                    <div className="mb-6 flex justify-center">
                      <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
                        <CheckCircle className="h-12 w-12 text-green-600" />
                      </div>
                    </div>
                    <h4 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                      {t("thanksForBuying")}
                    </h4>
                    <p className="mb-2 text-base text-gray-600 dark:text-gray-300">
                      {t("yourKey")}
                    </p>
                    <div
                      className="mb-4 flex cursor-pointer items-center justify-between rounded-lg bg-gray-50 p-4 dark:bg-gray-700"
                      onClick={copyToClipboard}
                    >
                      <span className="font-mono text-indigo-600 select-all dark:text-indigo-400">
                        {orderInfo.cdk}
                      </span>
                      <button className="ml-2 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400">
                        {t("copy")}
                      </button>
                    </div>
                    {orderInfo.expired_at && formattedTime && relativeTime && (
                      <p className="mb-4 text-gray-600 dark:text-gray-300">
                        <span>{t("expireAt", { time: formattedTime })}</span>
                        <span>{t("timeLeft", { relativeTime })}</span>
                      </p>
                    )}
                    <p className="mt-6 text-center text-sm">
                      <QQGroupLink text={t("haveQuestion")} />
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="mb-4 rounded-full bg-red-100 p-3 dark:bg-red-900/30">
                      <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
                    </div>
                    <h4 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                      {isExpired
                        ? t("orderExpired")
                        : error
                          ? t(`msg.${error}`)
                          : t("orderNotFound")}
                    </h4>
                    <Link href="/get-key">
                      <button
                        type="button"
                        className="mt-4 flex justify-center rounded-md bg-indigo-500 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                      >
                        {t("goBack")}
                      </button>
                    </Link>
                    <p className="mt-6 text-center text-sm">
                      <QQGroupLink text={t("haveQuestion")} />
                    </p>
                  </div>
                )}
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
