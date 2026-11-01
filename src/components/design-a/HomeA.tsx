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
  const featuredProjects = projects.filter(project => project.image).slice(0, 6);
  return (
    <div className={`${styles.page} ${styles.homePage}`} data-page-design="a">
      <HeaderA current="home" />
      <main className={styles.homeMain}>
        <HeroA />
        {children}
        <Link href="/projects" className={styles.projectBanner}>
          <span className={styles.bannerCopy}>
            {t("viewProjects", { appCount })}
            <ArrowRightIcon aria-hidden="true" />
          </span>
          <span className={styles.avatars}>
            {featuredProjects.map(project => (
              <img key={project.resource} src={project.image} alt="" width="40" height="40" />
            ))}
          </span>
        </Link>
        <PlansA homePlans={homePlans} morePlans={morePlans} C2URate={C2URate} />
        <ShortcutsA />
      </main>
      <FooterA />
    </div>
  );
}
