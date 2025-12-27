"use client";

import { useTranslations } from "next-intl";
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { Fragment } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@heroui/react";
import PaymentIcon from "./PaymentIcon";

interface InAppBrowserWarningModalProps {
  open: boolean;
  onClose: () => void;
  onSwitchToWechat?: () => void;
}

export default function InAppBrowserWarningModal({
  open,
  onClose,
  onSwitchToWechat,
}: InAppBrowserWarningModalProps) {
  const t = useTranslations("Checkout");

  const handleSwitchToWechat = () => {
    onSwitchToWechat?.();
    onClose();
  };

  return (
    <Transition appear show={open} as={Fragment}>
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
              <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-gray-800">
                {/* 关闭按钮 */}
                <button
                  onClick={onClose}
                  className="absolute right-4 top-4 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                  aria-label={t("backToHome")}
                >
                  <X className="h-5 w-5" />
                </button>

                {/* 警告图标 */}
                <div className="mb-4 flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                    <AlertTriangle className="h-8 w-8 text-amber-500" />
                  </div>
                </div>

                {/* 标题 */}
                <DialogTitle
                  as="h3"
                  className="mb-3 text-center text-lg font-semibold text-gray-900 dark:text-white"
                >
                  {t("inAppBrowserWarningTitle")}
                </DialogTitle>

                {/* 说明文字 */}
                <p className="mb-6 text-center text-sm text-gray-600 dark:text-gray-400">
                  {t("inAppBrowserWarningDesc")}
                </p>

                {/* 操作按钮 */}
                <div className="space-y-3">
                  {onSwitchToWechat && (
                    <Button
                      onPress={handleSwitchToWechat}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#15BA11] p-4 text-base font-medium text-white transition-colors hover:bg-[#0fa00d]"
                    >
                      <PaymentIcon type="wechat" className="h-5 w-5" />
                      {t("switchToWechatPay")}
                    </Button>
                  )}

                  <Button
                    onPress={onClose}
                    variant="bordered"
                    className="flex w-full items-center justify-center rounded-xl border-2 border-gray-200 p-4 text-base font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    {t("understood")}
                  </Button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
