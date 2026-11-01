"use client";

import ProjectCard, { ProjectCardProps } from "@/components/ProjectCard";
import { useSearchParams } from "next/navigation";

export default function ProjectCardView({
  projects,
  appearance = "classic",
}: {
  projects: Array<ProjectCardProps>;
  appearance?: "classic" | "a";
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
