import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { PlusIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

import type { ProjectCardProps } from "@/components/ProjectCard";
import { FooterA, HeaderA, HeroA, ShortcutsA } from "./Shell";
import ProjectsCatalogA from "./ProjectsCatalogA";
import styles from "./design-a.module.css";

export default async function ProjectsA({ projects }: { projects: ProjectCardProps[] }) {
  const t = await getTranslations("GetStart");
  const p = await getTranslations("Projects");
  const count = `${projects.length - (projects.length % 5)}+`;
  const countLabel = t("viewProjects", { appCount: projects.length - (projects.length % 5) });
  const countPosition = countLabel.indexOf(count);
  return (
    <div className={styles.page} data-page-design="a1">
      <HeaderA current="projects" />
      <main className={styles.projectsMain}>
        <div className={styles.projectsIntro}>
          <HeroA compact />
          <span className={styles.catalogTotal}>
            {countPosition >= 0 ? (
              <>
                <span>{countLabel.slice(0, countPosition)}</span>
                <strong>{count}</strong>
                <span>{countLabel.slice(countPosition + count.length)}</span>
              </>
            ) : (
              countLabel
            )}
          </span>
        </div>
        <Suspense fallback={null}>
          <ProjectsCatalogA projects={projects} />
        </Suspense>
        <a
          className={styles.integration}
          href="https://github.com/MirrorChyan/docs"
          target="_blank"
          rel="noreferrer"
        >
          <span>
            <PlusIcon />
          </span>
          <div>
            <h2>{p("joinUs")}</h2>
            <p>{p("contactUs")}</p>
          </div>
          <span className={styles.integrationAction}>
            {t("apiDoc")}
            <ArrowRightIcon />
          </span>
        </a>
        <ShortcutsA showSubscribe />
      </main>
      <FooterA />
    </div>
  );
}
