import { BackgroundLines } from "@/components/BackgroundLines";
import { ProjectCardProps } from "@/components/ProjectCard";
import ProjectIntegratedCard from "@/components/ProjectIntegratedCard";
import { getTranslations } from "next-intl/server";
import { SERVER_BACKEND } from "@/app/requests/misc";
import ProjectCardView from "@/components/ProjectCardView";
import HomeButton from "@/components/HomeButton";
import SourceTracker from "@/components/SourceTracker";

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string }>;
}) {
  const t = await getTranslations("GetStart");
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

  return (
    <>
      <SourceTracker source={source} />
      <BackgroundLines className="min-h-screen">
        <div className="container mx-auto px-3 py-10">
          <HomeButton className="absolute" />
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

          <div className="mt-12 grid auto-rows-auto grid-cols-1 gap-4 sm:grid-cols-2 md:mt-10 md:grid-cols-3 lg:grid-cols-4">
            <ProjectCardView projects={projects}></ProjectCardView>
            <ProjectIntegratedCard />
          </div>
        </div>
      </BackgroundLines>
    </>
  );
}
