import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { getTranslations } from "next-intl/server";

import type { Plan } from "@/app/requests/plan";
import type { ProjectCardProps } from "@/components/ProjectCard";
import { displayAppCount, listedProjects } from "@/lib/utils/project";
import { CLIENT_BACKEND } from "@/app/requests/misc";
import { Link } from "@/i18n/routing";
import { FooterA, HeaderA, HeroA, ShortcutsA } from "./Shell";
import PlansA from "./PlansA";
import styles from "./design-a.module.css";

export default async function HomeA({
  homePlans,
  morePlans,
  C2URate,
  projects,
  children,
}: {
  homePlans: Plan[];
  morePlans: Plan[];
  C2URate: number;
  /** 由页面和其他请求并行获取，避免在这里串行等待 */
  projects: ProjectCardProps[];
  children?: React.ReactNode;
}) {
  const t = await getTranslations("GetStart");
  // 和项目页使用同一批项目计数，两处显示的接入数量保持一致
  const listed = listedProjects(projects);
  const appCount = displayAppCount(listed.length);
  const featuredProjects = listed.filter(project => project.image).slice(0, 6);
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
              <img
                key={project.resource}
                src={CLIENT_BACKEND + project.image}
                alt=""
                width="40"
                height="40"
              />
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
