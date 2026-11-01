import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { getTranslations } from "next-intl/server";

import type { Plan } from "@/app/requests/plan";
import { getProjects } from "@/app/requests/project";
import { Link } from "@/i18n/routing";
import { FooterA, HeaderA, HeroA, ShortcutsA } from "./Shell";
import PlansA from "./PlansA";
import styles from "./design-a.module.css";

export default async function HomeA({
  homePlans,
  morePlans,
  C2URate,
  children,
}: {
  homePlans: Plan[];
  morePlans: Plan[];
  C2URate: number;
  children?: React.ReactNode;
}) {
  const t = await getTranslations("GetStart");
  const projects = await getProjects();
  const appCount = projects.length - (projects.length % 5);
  return (
    <div className={styles.page} data-page-design="a">
      <HeaderA current="home" />
      <main className={styles.homeMain}>
        <HeroA />
        {children}
        <Link href="/projects" className={styles.projectBanner}>
          <span className={styles.avatars}>
            {projects
              .slice(0, 5)
              .map(
                project =>
                  project.image && (
                    <img
                      key={project.resource}
                      src={project.image}
                      alt={project.name}
                      width="28"
                      height="28"
                    />
                  )
              )}
          </span>
          <span>{t("viewProjects", { appCount })}</span>
          <ArrowRightIcon />
        </Link>
        <PlansA homePlans={homePlans} morePlans={morePlans} C2URate={C2URate} />
        <ShortcutsA />
      </main>
      <FooterA />
    </div>
  );
}
