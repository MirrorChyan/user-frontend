import { getLocale, getTranslations } from "next-intl/server";

import { BackgroundBeamsWithCollision } from "@/components/BackgroundBeamsWithCollision";
import { Link } from "@/i18n/routing";
import { getUSDRate } from "@/app/requests/rate";
import { getAnnouncement } from "@/app/requests/announcement";
import { getPlans } from "@/app/requests/plan";
import SourceTracker from "@/components/SourceTracker";
import ProjectBanner from "@/components/ProjectsBanner";
import Announcement from "@/components/home/Announcement";
import Plans from "@/components/home/Plans";
import IcpInfo from "@/components/home/IcpInfo";

export default async function GetStart({
  searchParams,
}: {
  searchParams: Promise<{ type_id?: string; source?: string }>;
}) {
  const t = await getTranslations("GetStart");

  const locale = await getLocale();

  const { type_id, source } = await searchParams;

  const [plans, announcement] = await Promise.all([
    getPlans(type_id),
    getAnnouncement(locale as "zh" | "en"),
  ]);
  const { homePlans, morePlans } = plans;

  // 人民币->美元汇率
  const C2URate = locale === "zh" ? 1 : await getUSDRate();

  return (
    <div className="relative" suppressHydrationWarning>
      <SourceTracker source={source} />
      <BackgroundBeamsWithCollision className="min-h-screen">
        <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-8">
          <div className="px-6 py-12 sm:px-6 sm:py-8 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-balance text-4xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
                {t("title")}
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-pretty text-lg/8 text-gray-600">
                {t.rich("description", {
                  br: () => <br />,
                })}
              </p>
            </div>
          </div>
          {announcement.ec === 200 && (
            <Announcement summary={announcement.data.summary} details={announcement.data.details} />
          )}

          <ProjectBanner />

          <Plans morePlans={morePlans} homePlans={homePlans} C2URate={C2URate} />
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 md:mt-10">
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
          </div>
          <div className="mt-16 flex flex-wrap items-center justify-center gap-6 md:mt-10">
            <a
              href="https://github.com/MirrorChyan/docs"
              target="_blank"
              className="text-sm/6 font-semibold text-gray-900 dark:text-white"
            >
              {t("apiDoc")}
              <span aria-hidden="true">&nbsp;</span>
            </a>
            <a
              href="https://github.com/MirrorChyan/user-frontend"
              target="_blank"
              className="text-sm/6 font-semibold text-gray-900 dark:text-white"
            >
              {t("openSource")}
              <span aria-hidden="true">&nbsp;</span>
            </a>
          </div>
          <div className="absolute bottom-4 left-0 mt-16 flex w-full items-center justify-center gap-1.5">
            <IcpInfo />
            <div>
              <a
                href="/disclaimer.html"
                target="_blank"
                className="text-xs text-gray-500 dark:text-gray-400"
              >
                {t("disclaimer")}
                <span aria-hidden="true">&nbsp;</span>
              </a>
            </div>
          </div>
        </div>
      </BackgroundBeamsWithCollision>
    </div>
  );
}
