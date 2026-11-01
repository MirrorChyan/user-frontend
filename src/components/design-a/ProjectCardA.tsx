"use client";

import { ArrowRightIcon, ArrowUpRightIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { useTranslations } from "next-intl";

import type { ProjectCardProps } from "@/components/ProjectCard";
import { supportedSystems, systemLabel } from "./platform";
import styles from "./design-a.module.css";

export default function ProjectCardA({
  project,
  onOpen,
}: {
  project: ProjectCardProps;
  onOpen: () => void;
}) {
  const t = useTranslations("Projects");
  const a = useTranslations("LayoutA");
  const d = useTranslations("Download");
  const platforms = supportedSystems(project.support);
  return (
    <>
      <div className={styles.cardHeading}>
        {project.image ? (
          <img
            className={styles.projectIcon}
            src={project.image}
            alt=""
            width="46"
            height="46"
            loading="lazy"
          />
        ) : (
          <span className={styles.projectInitial} aria-hidden="true">
            {project.name.slice(0, 1)}
          </span>
        )}
        <div>
          <h3>{project.name}</h3>
          <span>
            {project.type_id === "Dependencies" ? t("dependencies") : a("applicationProjects")}
          </span>
        </div>
        {project.url && (
          <a
            className={styles.projectWebsite}
            href={project.url}
            target="_blank"
            rel="noreferrer"
            aria-label={`${project.name}: ${t("openProjectHomepage")}`}
          >
            <ArrowUpRightIcon />
          </a>
        )}
      </div>
      <p className={styles.projectDescription}>{project.desc}</p>
      <div className={styles.platforms}>
        {platforms.map(system => (
          <span key={system}>{systemLabel(system, a("genericResource"))}</span>
        ))}
      </div>
      <div className={styles.cardActions}>
        {project.download ? (
          <button type="button" className={styles.detailAction} onClick={onOpen}>
            {a("viewDetails")}
            <ArrowRightIcon />
          </button>
        ) : project.url ? (
          <a className={styles.detailAction} href={project.url} target="_blank" rel="noreferrer">
            {a("viewDetails")}
            <ArrowUpRightIcon />
          </a>
        ) : (
          <span />
        )}
        <button
          type="button"
          className={styles.downloadAction}
          onClick={onOpen}
          aria-label={`${project.download ? d("download") : a("internalUpdate")} ${project.name}`}
        >
          <ArrowDownTrayIcon />
          {project.download ? d("download") : a("internalUpdate")}
        </button>
      </div>
    </>
  );
}
