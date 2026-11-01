import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { PlusIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

import type { ProjectCardProps } from "@/components/ProjectCard";
import { Link } from "@/i18n/routing";
import { FooterA, HeaderA, HeroA, ShortcutsA } from "./Shell";
import ProjectsCatalogA from "./ProjectsCatalogA";
import styles from "./design-a.module.css";

export default async function ProjectsA({ projects }: { projects: ProjectCardProps[] }) {
  const t = await getTranslations("GetStart");
  const p = await getTranslations("Projects");
  const a = await getTranslations("LayoutA");
  return (
    <div className={styles.page} data-page-design="a1">
      <HeaderA current="projects" />
      <main className={styles.projectsMain}>
        <nav className={styles.breadcrumb} aria-label={a("breadcrumb")}>
          <Link href="/get-start">{a("home")}</Link>
          <span>/</span>
          <span>{a("projects")}</span>
        </nav>
        <div className={styles.projectsIntro}>
          <HeroA compact />
          <span className={styles.catalogTotal}>
            {t("viewProjects", { appCount: projects.length - (projects.length % 5) })}
          </span>
        </div>
        <Suspense fallback={null}>
          <ProjectsCatalogA projects={projects} />
        </Suspense>
        <section className={styles.integration}>
          <span>
            <PlusIcon />
          </span>
          <div>
            <h2>{p("joinUs")}</h2>
            <p>{p("contactUs")}</p>
          </div>
          <a href="https://github.com/MirrorChyan/docs" target="_blank" rel="noreferrer">
            {t("apiDoc")}
            <ArrowRightIcon />
          </a>
        </section>
        <ShortcutsA showSubscribe />
      </main>
      <FooterA />
    </div>
  );
}
