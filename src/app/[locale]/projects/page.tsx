import { useTranslations } from "next-intl";
import { BackgroundLines } from "@/components/BackgroundLines";
import ProjectCard from "@/components/ProjectCard";
import ProjectIntegratedCard from "@/components/ProjectIntegratedCard";
import { PROJECTS } from "@/data/projects";

export default function ProjectsPage() {
  const t = useTranslations("Projects");

  return (
    <BackgroundLines className="min-h-screen">
      <div className="container mx-auto px-3 py-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-auto">
          {PROJECTS.map((project) => (
            <ProjectCard
              key={project.resource}
              {...project}
            />
          ))}
          <ProjectIntegratedCard />
        </div>
      </div>
    </BackgroundLines>
  );
}