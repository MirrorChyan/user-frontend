import { cn } from "@/lib/utils/css";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { CLIENT_BACKEND, SERVER_BACKEND } from "@/app/requests/misc";
import { ProjectCardProps } from "@/components/ProjectCard";

export default async function ProjectBanner() {
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

  const displayCount = 6;
  const displayProjects = projects.slice(0, displayCount);
  const hasMore = projects.length > displayCount;

  const appCount = projects.length - (projects.length % 5);

  return (
    <div className="mt-5 flex justify-center">
      <Link
        href={"/projects"}
        className={cn(
          "relative inline-flex items-center justify-center",
          "flex-col sm:flex-row",
          "gap-3 sm:gap-3",
          "rounded-2xl px-5 py-4 text-center text-lg font-semibold sm:px-6 sm:py-4 sm:text-xl",
          "bg-muted/50",
          "backdrop-blur-lg backdrop-saturate-150",
          "text-foreground",
          "shadow-lg shadow-muted/30",
          "sm:hover:shadow-xl sm:hover:shadow-muted/40",
          "sm:hover:bg-muted/60",
          "transition-all duration-500 ease-out",
          "group overflow-hidden",
          "sm:hover:px-5 sm:hover:py-4",
          "before:absolute before:inset-0 before:bg-muted/20",
          "before:opacity-0 before:transition-opacity before:duration-500",
          "sm:hover:before:opacity-100",
          "w-auto max-w-[90vw]"
        )}
      >
        <div className="absolute -inset-x-4 -inset-y-4 bg-gradient-to-r from-muted/30 to-muted/50 opacity-0 blur-3xl transition-opacity duration-1000 sm:group-hover:opacity-20" />

        <span className="relative z-10 flex items-center gap-2 transition-all duration-300">
          {t("viewProjects", { appCount })}
          <svg
            className="h-5 w-5 translate-x-1 transition-transform duration-300 sm:translate-x-0 sm:group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </span>

        {/* 图片容器 */}
        <div className="relative z-10 mr-0 flex items-center justify-center gap-1 transition-all duration-300 sm:ml-2 sm:mr-1 sm:justify-end sm:gap-0 sm:group-hover:gap-1">
          {displayProjects.map(
            (project, index) =>
              project.image && (
                <div
                  key={`${project.name}-${index}`}
                  className={cn(
                    "relative h-9 w-9 rounded-full sm:h-10 sm:w-10",
                    "shadow-md",
                    "-ml-1 first:ml-0",
                    "sm:-ml-3 sm:first:ml-0",
                    "transform transition-all duration-300",
                    "scale-105 sm:scale-100",
                    "sm:group-hover:scale-110",
                    "sm:group-hover:-ml-1 sm:group-hover:first:ml-0",
                    "p-[2px]"
                  )}
                  style={{
                    zIndex: displayProjects.length + 1 - index,
                  }}
                >
                  <div className="relative h-full w-full overflow-hidden rounded-full bg-muted">
                    <img
                      src={CLIENT_BACKEND + project.image}
                      alt={project.name}
                      className="rounded-full object-cover"
                    />
                  </div>
                </div>
              )
          )}

          {/* 省略图标 */}
          {hasMore && (
            <div
              className={cn(
                "relative h-9 w-9 rounded-full sm:h-10 sm:w-10",
                "shadow-md",
                "-ml-1 sm:-ml-3",
                "transform transition-all duration-300",
                "scale-105 sm:scale-100",
                "sm:group-hover:scale-110",
                "sm:group-hover:-ml-1",
                "bg-gradient-to-r from-muted-foreground/60 to-muted-foreground/80",
                "p-[2px]",
                "flex items-center justify-center"
              )}
              style={{ zIndex: 0 }}
            >
              <div className="flex h-full w-full items-center justify-center rounded-full bg-muted-foreground">
                <span className="text-xs font-semibold text-background">
                  +{projects.length - displayCount}
                </span>
              </div>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}
