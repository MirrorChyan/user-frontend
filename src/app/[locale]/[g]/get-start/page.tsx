import { getLocale, getTranslations } from "next-intl/server";
import ReactMarkdown from "react-markdown";

import { BackgroundBeamsWithCollision } from "@/components/BackgroundBeamsWithCollision";
import { getUSDRate } from "@/app/requests/rate";
import { getAnnouncement } from "@/app/requests/announcement";
import { getPlans } from "@/app/requests/plan";
import SourceTracker from "@/components/SourceTracker";
import Exposure from "@/components/Exposure";
import ProjectBanner from "@/components/ProjectsBanner";
import Announcement from "@/components/home/Announcement";
import Plans from "@/components/home/Plans";
import HomeFooter from "@/components/home/HomeFooter";
import { Slot } from "@/config/group";

export default async function GetStart({
  searchParams,
}: {
  searchParams: Promise<{ type_id?: string; source?: string }>;
}) {
  const t = await getTranslations("GetStart");

  const locale = await getLocale();

  const { type_id, source } = await searchParams;

  const [plans, announcement, C2URate] = await Promise.all([
    getPlans(type_id),
    getAnnouncement(locale as "zh" | "en"),
    // 人民币->美元汇率
    locale === "zh" ? 1 : getUSDRate(),
  ]);
  const { homePlans, morePlans } = plans;

  return (
    <div className="relative" suppressHydrationWarning>
      <SourceTracker source={source} />
      <Exposure slot={Slot.PageGroup} />
      <BackgroundBeamsWithCollision className="min-h-screen">
        <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-8">
          <div className="px-6 py-12 sm:px-6 sm:py-8 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl dark:text-white">
                {t("title")}
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-lg/8 text-gray-600">
                {t.rich("description", {
                  br: () => <br />,
                })}
              </p>
            </div>
          </div>
          {announcement.ec === 200 && (
            <Announcement
              summary={announcement.data.summary}
              content={<ReactMarkdown>{announcement.data.details}</ReactMarkdown>}
            />
          )}

          <ProjectBanner />

          <Plans morePlans={morePlans} homePlans={homePlans} C2URate={C2URate} />
          <HomeFooter pinLegal />
        </div>
      </BackgroundBeamsWithCollision>
    </div>
  );
}
