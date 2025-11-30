"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { useRouter } from "@/i18n/routing";
import HomeButton from "@/components/HomeButton";
import QQGroupLink from "@/components/QQGroupLink";
import { cn } from "@/lib/utils/css";

export default function GetKey() {
  const t = useTranslations("GetKey");
  const [inputOrderId, setInputOrderId] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    const orderId = inputOrderId.trim();
    if (!orderId) return;
    router.push(`/projects?order_id=${orderId}`);
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
      {/* Return Home Button - Top Left */}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[420px]"
      >
        <div className="w-full overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 shadow-xl shadow-black/5 dark:border-gray-700 dark:bg-gray-800 md:p-10">
          {/* Header Section */}
          <div className="">
            <div className="relative mb-3 flex items-center">
              <div className="w-8">
                <HomeButton className="border border-gray-200 bg-white text-gray-700 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-center text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                  {t("title")}
                </h1>
              </div>
            </div>
            <p className="mt-2 text-left text-sm leading-relaxed text-gray-600 dark:text-gray-200">
              {t.rich("orderId", {
                br: () => <br />,
              })}
            </p>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="group relative">
              <label
                htmlFor="key"
                className="mb-2 mt-5 block text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-white"
              >
                {t("inputPlaceholder")}
              </label>
              <input
                id="key"
                name="key"
                type="text"
                autoComplete="off"
                required
                onChange={e => setInputOrderId(e.target.value)}
                className={cn(
                  "block w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3.5 text-base text-gray-900 transition-all dark:border-gray-600 dark:bg-gray-700 dark:text-white",
                  "placeholder:text-gray-500 focus:border-indigo-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600 dark:placeholder:text-gray-400 dark:focus:bg-gray-700"
                )}
              />
            </div>

            <button
              type="submit"
              className={cn(
                "relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-all",
                "hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-600/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 active:scale-[0.98]"
              )}
            >
              <span>{t("getKey")}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-4 w-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                />
              </svg>
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-8 flex justify-center border-t border-gray-200 pt-6 dark:border-gray-700">
            <div className="text-sm text-gray-600 transition-colors hover:text-gray-900 dark:hover:text-white">
              <QQGroupLink text={t("haveQuestion")} />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
