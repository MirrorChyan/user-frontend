import { BackgroundLines } from "@/components/BackgroundLines";
import { ProjectCardProps } from "@/components/ProjectCard";
import ProjectIntegratedCard from "@/components/ProjectIntegratedCard";
import { getTranslations } from "next-intl/server";
import { SERVER_BACKEND } from "@/app/requests/misc";
import ProjectCardView from "@/components/ProjectCardView";
import HomeButton from "@/components/HomeButton";
import SourceTracker from "@/components/SourceTracker";
import OrderInfoModalWrapper from "@/components/OrderInfoModalWrapper";
import DownloadModalWrapper from "@/components/DownloadModalWrapper";
import { Suspense } from "react";
import { Divider } from "@heroui/divider";

const GAME_TOOLS_TYPE_ID = "GameTools";
const DEPENDENCIES_TYPE_ID = "Dependencies";

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string }>;
}) {
  const t = await getTranslations("GetStart");
  const p = await getTranslations("Projects");
  const resp = await fetch(`${SERVER_BACKEND}/api/misc/project`);
  const projects: Array<ProjectCardProps> = [];
  try {
    const { ec, data } = await resp.json();
    if (ec === 200) {
      projects.push(...data);
    }
  } catch (e) {
    console.log(e);
  }
  const { source } = await searchParams;

  const mainProjects = projects.filter(project => project.type_id === GAME_TOOLS_TYPE_ID);
  const dependenciesProjects = projects.filter(project => project.type_id === DEPENDENCIES_TYPE_ID);

  return (
    <>
      <SourceTracker source={source} />
      <Suspense fallback={null}>
        <OrderInfoModalWrapper />
        <DownloadModalWrapper />
      </Suspense>
      <BackgroundLines className="min-h-screen">
        <div className="container mx-auto px-3 py-10">
          <HomeButton className="absolute" />
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

          <div className="mt-12 grid auto-rows-auto grid-cols-1 gap-4 sm:grid-cols-2 md:mt-10 md:grid-cols-3 lg:grid-cols-4">
            <ProjectCardView projects={mainProjects} />
            <ProjectIntegratedCard />
          </div>

          {dependenciesProjects.length > 0 && (
            <>
              <div className="my-12 flex items-center">
                <Divider className="flex-1" />
                <span className="mx-4 flex-shrink-0 text-lg font-medium text-gray-500 dark:text-gray-400">
                  {p("dependencies")}
                </span>
                <Divider className="flex-1" />
              </div>

              <div className="grid auto-rows-auto grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                <ProjectCardView projects={dependenciesProjects} />
              </div>
            </>
          )}
        </div>
      </BackgroundLines>
    </>
  );
}
