"use client";

import { useTranslations } from "next-intl";
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { Fragment } from "react";
import { Home } from "lucide-react";
import { useRouter } from "@/i18n/routing";
import ShowKeyInfo from "@/components/checkout/ShowKeyInfo";
import { OrderInfoType } from "@/components/checkout/YmPaymentModal";

interface AfdianPaymentModalProps {
  open: boolean;
  isLoading?: boolean;
  onClose?: () => void;
  orderInfo?: OrderInfoType;
}

export default function AfdianPaymentModal({ open, isLoading = true, onClose, orderInfo }: AfdianPaymentModalProps) {
  const t = useTranslations("Checkout");
  const orderT = useTranslations("Order");
  const router = useRouter();

  const handleHomeClick = () => {
    if (onClose) {
      onClose();
    }
    router.push("/");
  };

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => { }}>
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
                    {t("afdianPayment")}
                  </DialogTitle>
                  {
                    orderInfo &&
                    <button
                      onClick={handleHomeClick}
                      className="rounded-full p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      aria-label={t("backToHome")}
                    >
                      <Home className="h-5 w-5" />
                    </button>
                  }
                </div>

                {isLoading ? (
                  <>
                    <div className="flex flex-col items-center justify-center py-10">
                      <div
                        className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-pink-500 mb-4"></div>
                      <p className="text-base text-gray-500 dark:text-gray-400">
                        {orderT("ProcessingOrder")}
                      </p>
                    </div>
                    <div className="mt-6">
                      <p className="text-sm text-center text-gray-500 dark:text-gray-400">
                        {t("paymentNote")}
                      </p>
                    </div>
                  </>
                ) :
                  <ShowKeyInfo info={orderInfo}></ShowKeyInfo>
                }


              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 