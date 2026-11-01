"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import {
  MagnifyingGlassIcon,
  Squares2X2Icon,
  CubeIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

import type { ProjectCardProps } from "@/components/ProjectCard";
import ProjectCardView from "@/components/ProjectCardView";
import { supportedSystems, systemLabel } from "./platform";
import styles from "./design-a.module.css";

const PAGE_SIZE = 12;

export default function ProjectsCatalogA({ projects }: { projects: ProjectCardProps[] }) {
  const a = useTranslations("LayoutA");
  const p = useTranslations("Projects");
  const d = useTranslations("Download");
  const params = useSearchParams();
  const rid = params.get("rid");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [system, setSystem] = useState("all");
  const [page, setPage] = useState(
    () =>
      Math.floor(
        Math.max(
          0,
          projects.findIndex(project => project.resource === rid)
        ) / PAGE_SIZE
      ) + 1
  );
  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    return projects.filter(
      project =>
        (category === "all" || project.type_id === category) &&
        (!term ||
          `${project.name} ${project.resource} ${project.desc}`
            .toLocaleLowerCase()
            .includes(term)) &&
        (system === "all" ||
          supportedSystems(project.support).some(value => value === system || value === "any"))
    );
  }, [projects, query, category, system]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const activePage = Math.min(page, pages);
  const visible = filtered.slice((activePage - 1) * PAGE_SIZE, activePage * PAGE_SIZE);
  const linkedProject = projects.find(
    project =>
      project.download && project.resource === rid && !visible.some(item => item.resource === rid)
  );
  const categories = [
    { id: "all", label: a("allProjects") },
    { id: "GameTools", label: a("applicationProjects") },
    { id: "Dependencies", label: p("dependencies") },
  ];
  const heading = categories.find(item => item.id === category)?.label;
  const reset = () => {
    setQuery("");
    setCategory("all");
    setSystem("all");
    setPage(1);
  };
  const changePage = (next: number) => {
    setPage(next);
    document.getElementById("catalog-heading")?.scrollIntoView({ block: "start" });
  };
  return (
    <section className={styles.catalog}>
      <div className={styles.categories} role="group" aria-label={a("categories")}>
        {categories.map(item => (
          <button
            key={item.id}
            type="button"
            aria-pressed={category === item.id}
            onClick={() => {
              setCategory(item.id);
              setPage(1);
            }}
          >
            {item.id === "Dependencies" ? <CubeIcon /> : <Squares2X2Icon />}
            {item.label}
            <span>
              {item.id === "all"
                ? projects.length
                : projects.filter(project => project.type_id === item.id).length}
            </span>
          </button>
        ))}
      </div>
      <div className={styles.catalogToolbar}>
        <label className={styles.search}>
          <MagnifyingGlassIcon />
          <input
            type="search"
            aria-label={a("search")}
            placeholder={a("search")}
            value={query}
            onChange={event => {
              setQuery(event.target.value);
              setPage(1);
            }}
          />
        </label>
        <label className={styles.systemFilter}>
          <span>{d("os")}</span>
          <select
            value={system}
            aria-label={a("filterSystem")}
            onChange={event => {
              setSystem(event.target.value);
              setPage(1);
            }}
          >
            <option value="all">{a("allSystems")}</option>
            {["windows", "macos", "linux", "android"].map(value => (
              <option key={value} value={value}>
                {systemLabel(value, a("genericResource"))}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className={styles.catalogHeading}>
        <h2 id="catalog-heading">
          {heading} <span>{filtered.length}</span>
        </h2>
        <span aria-live="polite">
          {query || system !== "all"
            ? a("resultsCount", { count: filtered.length })
            : a("defaultOrder")}
        </span>
      </div>
      {filtered.length ? (
        <div className={styles.projectGrid}>
          <ProjectCardView projects={visible} appearance="a" />
        </div>
      ) : (
        <div className={styles.empty}>
          <MagnifyingGlassIcon />
          <h3>{a("noResults")}</h3>
          <p>{a("noResultsHint")}</p>
          <button type="button" onClick={reset}>
            {a("clearFilters")}
            <ArrowRightIcon />
          </button>
        </div>
      )}
      {linkedProject && (
        <div className="hidden">
          <ProjectCardView projects={[linkedProject]} appearance="a" />
        </div>
      )}
      {filtered.length > 0 && (
        <nav className={styles.pagination} aria-label={a("pagination")}>
          <span>
            {a("showing", {
              start: (activePage - 1) * PAGE_SIZE + 1,
              end: Math.min(activePage * PAGE_SIZE, filtered.length),
              total: filtered.length,
            })}
          </span>
          <div>
            <button
              type="button"
              aria-label={a("previousPage")}
              disabled={activePage <= 1}
              onClick={() => changePage(activePage - 1)}
            >
              <ArrowLeftIcon />
            </button>
            <span>
              {activePage} <small>/ {pages}</small>
            </span>
            <button
              type="button"
              aria-label={a("nextPage")}
              disabled={activePage >= pages}
              onClick={() => changePage(activePage + 1)}
            >
              <ArrowRightIcon />
            </button>
          </div>
        </nav>
      )}
    </section>
  );
}
