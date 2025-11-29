"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import HomeButton from "@/components/HomeButton";
import QQGroupLink from "@/components/QQGroupLink";

export default function GetKey() {
  const t = useTranslations("GetKey");
  const [inputOrderId, setInputOrderId] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    const orderId = inputOrderId.trim();
    router.push(`/projects?order_id=${orderId}`);
  };

  return (
    <>
      <div className="relative flex min-h-screen flex-1 flex-col justify-center bg-white px-3 transition-colors duration-300 dark:bg-transparent">
        <div className="relative sm:mx-auto sm:w-full sm:max-w-sm">
          <HomeButton className="absolute bottom-0" />
          <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900 dark:text-gray-100">
            {t("title")}
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="key"
                className="block text-sm/6 font-medium text-gray-700 dark:text-gray-200"
              >
                {t.rich("orderId", {
                  br: () => <br />,
                })}
                {/* <span style={{ float: "right" }}>
                  <Link
                    href="https://afdian.com/dashboard/order"
                    target="_blank"
                    className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                  >
                    <u><em>{t("queryOrderId")}</em></u>
                  </Link>
                </span> */}
              </label>
              <div className="mt-4">
                <input
                  id="key"
                  name="key"
                  onChange={e => setInputOrderId(e.target.value)}
                  className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base outline outline-1 -outline-offset-1 placeholder:text-gray-500 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 dark:text-white dark:outline-white/10 sm:text-sm/6"
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-6 flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:bg-indigo-600 dark:hover:bg-indigo-500"
            >
              {t("getKey")}
            </button>
            <p className="mt-3 text-center text-sm">
              <QQGroupLink text={t("haveQuestion")} />
            </p>
          </form>
        </div>
      </div>
    </>
  );
}
