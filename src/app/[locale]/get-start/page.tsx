import { getLocale } from "next-intl/server";

import { BackgroundBeamsWithCollision } from "@/components/BackgroundBeamsWithCollision";
import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import PlanCard from "./plan-card";
import Announcement from "./announcement";
import { getUSDRate } from "@/app/requests/rate";
import { getAnnouncement } from "@/app/requests/announcement";
import { getPlanInfo } from "@/app/requests/planInfo";
// import { CheckIcon } from '@heroicons/react/20/solid'

export default async function GetStart() {
  const t = await getTranslations("GetStart");
  const locale = await getLocale();


  const planIds = [
    // '83f9d3b8cac611ef8fc352540025c377',
    "3134f94ac9aa11ef9d725254001e7c00",
    "9e6c7b28c9aa11efb47452540025c377",
    "69c45576c9aa11ef9ace52540025c377",
  ];

  const plans = await Promise.all(planIds.map((id) => getPlanInfo(id, planIds[planIds.length - 1])));

  const announcement = await getAnnouncement(locale as "zh" | "en");

  // 人民币->美元汇率
  const C2URate = locale === "zh" ? 1 : await getUSDRate();

  const customOrderId = Date.now() + Math.random().toString(36).slice(2);

  return (
    <div className='relative' suppressHydrationWarning>
      <BackgroundBeamsWithCollision className="min-h-screen max-h-screen">
        <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-8">
          <div className="px-6 py-12 sm:px-6 sm:py-8 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl text-gray-900 dark:text-white">
                {t("title")}
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-pretty text-lg/8 text-gray-600">
                {t.rich("description", {
                  br: () => <br />
                })}
              </p>
            </div>
          </div>
          {announcement.ec === 200 && (
            <Announcement summary={announcement.data.summary} details={announcement.data.details} />
          )}
          <div className="isolate mx-auto mt-10 grid max-w-md grid-cols-1 gap-8 md:max-w-2xl md:grid-cols-3 lg:max-w-4xl xl:mx-0 xl:max-w-6xl self-center">
            {plans.map((plan) => {
              if (!plan) return null;
              return <PlanCard key={plan.planId} plan={plan} customOrderId={customOrderId} C2URate={C2URate} locale={locale} />;
            })}
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6">
            <Link
              href="/get-key"
              className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              {t("getKey")}
            </Link>
            <Link
              href="/transfer"
              className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              {t("transfer")}
            </Link>
            <Link
              href="https://pd.qq.com/g/MirrorChyan"
              target="_blank"
              className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              {t("discussion")}
            </Link>
            <a href="https://github.com/MirrorChyan/docs" target="_blank" className="text-sm/6 font-semibold">
              {t("apiDoc")}<span aria-hidden="true">&nbsp;→</span>
            </a>
            <a href="https://github.com/MirrorChyan/user-frontend" target="_blank" className="text-sm/6 font-semibold">
              {t("openSource")}<span aria-hidden="true">&nbsp;</span>
            </a>
          </div>
          <div className="mt-10 bottom-4 w-full text-center">
            <a href="https://beian.miit.gov.cn/" target="_blank" className="text-xs text-gray-500 dark:text-gray-400">
              皖ICP备2025075166号
            </a>
            &nbsp;
            &nbsp;
            <a href="/disclaimer.html" target="_blank" className="text-xs text-gray-500 dark:text-gray-400">
              {t("disclaimer")}<span aria-hidden="true">&nbsp;</span>
            </a>
          </div>
        </div>
      </BackgroundBeamsWithCollision>
    </div>
  );
}
