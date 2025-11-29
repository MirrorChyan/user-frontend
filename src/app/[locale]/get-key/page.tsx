"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { useRouter } from "@/i18n/routing";
import HomeButton from "@/components/HomeButton";
import QQGroupLink from "@/components/QQGroupLink";
import { BackgroundBeamsWithCollision } from "@/components/BackgroundBeamsWithCollision";

export default function GetKey() {
  const t = useTranslations("GetKey");
  const [inputOrderId, setInputOrderId] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    const orderId = inputOrderId.trim();
    router.push(`/projects?order_id=${orderId}`);
  };

  return (
    <BackgroundBeamsWithCollision className="min-h-screen">
      <div className="relative flex min-h-screen w-full flex-col items-center justify-center px-4 py-12">
        {/* 主卡片容器 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative w-full max-w-md"
        >
          {/* 返回首页按钮 */}
          <HomeButton className="absolute -top-12 left-0" />

          {/* 卡片 */}
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white/80 shadow-xl backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/80">
            {/* 头部装饰 */}
            <div className="relative h-2 w-full bg-indigo-500" />

            {/* 卡片内容 */}
            <div className="px-8 py-10">
              {/* 图标 */}
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500 shadow-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="white"
                  className="h-8 w-8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z"
                  />
                </svg>
              </div>

              {/* 标题 */}
              <h2 className="mb-6 text-center text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                {t("title")}
              </h2>
              <p className="mb-6 text-left text-sm text-gray-500 dark:text-gray-400">
                {t.rich("orderId", {
                  br: () => <br />,
                })}
              </p>

              {/* 表单 */}
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="relative">
                  <div
                    className={`absolute -inset-0.5 rounded-lg bg-indigo-500 opacity-0 blur transition duration-300 ${
                      isFocused ? "opacity-75" : ""
                    }`}
                  />
                  <input
                    id="key"
                    name="key"
                    placeholder={t("inputPlaceholder")}
                    onChange={e => setInputOrderId(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className="relative block w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-500"
                  />
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-indigo-600 px-4 py-3 text-base font-semibold text-white shadow-lg transition-all duration-200 hover:bg-indigo-500 hover:shadow-indigo-500/25"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                    />
                  </svg>
                  {t("getKey")}
                </motion.button>
              </form>
            </div>

            {/* 底部提示 */}
            <div className="border-t border-gray-100 bg-gray-50/50 px-8 py-4 dark:border-gray-700 dark:bg-gray-800/50">
              <p className="text-center text-sm">
                <QQGroupLink text={t("haveQuestion")} />
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </BackgroundBeamsWithCollision>
  );
}
