"use client";

import ProjectCard, { ProjectCardAppearance, ProjectCardProps } from "@/components/ProjectCard";
import { useSearchParams } from "next/navigation";

export default function ProjectCardView({
  projects,
  appearance,
}: {
  projects: Array<ProjectCardProps>;
  /** 不传时使用原版卡片外观 */
  appearance?: ProjectCardAppearance;
}) {
  const searchParams = useSearchParams();
  const rid = searchParams.get("rid");

  return (
    <>
      {projects.map(project => (
        <ProjectCard
          key={project.resource}
          showModal={project.download && rid === project.resource}
          osParam={searchParams.get("os")}
          archParam={searchParams.get("arch")}
          channelParam={searchParams.get("channel")}
          {...project}
          appearance={appearance}
        />
      ))}
    </>
  );
}
