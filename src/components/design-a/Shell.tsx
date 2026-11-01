import { getLocale, getTranslations } from "next-intl/server";
import { ArrowUpRightIcon, KeyIcon } from "@heroicons/react/24/outline";

import { Link } from "@/i18n/routing";
import IcpInfo from "@/components/home/IcpInfo";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import styles from "./design-a.module.css";
import flow from "./flow.module.css";

export async function HeaderA({ current }: { current?: "home" | "projects" }) {
  const t = await getTranslations("GetStart");
  const a = await getTranslations("LayoutA");
  const locale = await getLocale();
  return (
    <header className={styles.header}>
      <Link href="/get-start" className={styles.brand} aria-label={a("home")}>
        <img
          className={styles.brandIcon}
          src="/brand/mirrorchyan-logo.webp"
          alt=""
          width="40"
          height="40"
        />
        <span>
          {locale === "zh" ? "Mirror酱" : "MirrorChyan"}
          <small>MIRRORCHYAN</small>
        </span>
      </Link>
      <nav aria-label={a("navigation")}>
        <Link href="/get-start" aria-current={current === "home" ? "page" : undefined}>
          {t("subscribeCdk")}
        </Link>
        <Link href="/projects" aria-current={current === "projects" ? "page" : undefined}>
          {a("projects")}
        </Link>
        <a href="https://github.com/MirrorChyan/docs" target="_blank" rel="noreferrer">
          {t("apiDoc")} <ArrowUpRightIcon />
        </a>
      </nav>
      <div className={styles.headerTools}>
        <Link href="/get-key" className={styles.lookup} aria-label={t("getKey")}>
          <KeyIcon />
          <span>{t("getKey")}</span>
          <ArrowUpRightIcon />
        </Link>
        <LanguageSwitcher />
      </div>
    </header>
  );
}

/** Shared frame for user flows that are outside the homepage/catalog experiment. */
export function PageFrameA({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${styles.page} ${flow.frame}`}>
      <HeaderA />
      <main className={flow.main}>{children}</main>
      <FooterA />
    </div>
  );
}

/** Developer workspace: keep its navigation separate from the public website. */
export async function DashboardFrameA({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const t = await getTranslations("Metadata");
  return (
    <div className={`${styles.page} ${flow.frame}`}>
      <header className={flow.dashboardHeader}>
        <Link href="/dashboard" className={styles.brand} aria-label={t("dashboard")}>
          <img
            className={styles.brandIcon}
            src="/brand/mirrorchyan-logo.webp"
            alt=""
            width="40"
            height="40"
          />
          <span>
            {locale === "zh" ? "Mirror酱" : "MirrorChyan"}
            <small>MIRRORCHYAN</small>
          </span>
        </Link>
        <span className={flow.dashboardLabel}>DASHBOARD</span>
        <LanguageSwitcher className={flow.dashboardLanguage} />
      </header>
      <main className={flow.wideMain}>{children}</main>
      <footer className={flow.dashboardFooter}>
        <IcpInfo />
      </footer>
    </div>
  );
}

export async function HeroA({ compact = false }: { compact?: boolean }) {
  const t = await getTranslations("GetStart");
  const locale = await getLocale();
  const title = t("title");
  const brand = locale === "zh" ? "Mirror酱" : "MirrorChyan";
  const split = locale === "zh" ? title.indexOf(brand) + brand.length : -1;
  return (
    <div className={compact ? styles.compactHero : styles.hero}>
      <h1>
        {split > 0 ? (
          <>
            {title.slice(0, split)}
            <span>{title.slice(split)}</span>
          </>
        ) : (
          title
        )}
      </h1>
      <p>{t.rich("description", { br: () => <br /> })}</p>
    </div>
  );
}

export async function ShortcutsA({ showSubscribe = false }: { showSubscribe?: boolean }) {
  const t = await getTranslations("GetStart");
  const p = await getTranslations("Projects");
  return (
    <section className={styles.shortcuts} aria-label={p("shortcuts")}>
      <span>
        <KeyIcon />
        {p("shortcuts")}
      </span>
      <div>
        {showSubscribe && (
          <Link href="/get-start">
            {t("subscribeCdk")} <ArrowUpRightIcon />
          </Link>
        )}
        <Link href="/get-key">
          {t("getKey")} <ArrowUpRightIcon />
        </Link>
        <Link href="/transfer">
          {t("transfer")} <ArrowUpRightIcon />
        </Link>
        <a href="https://pd.qq.com/g/MirrorChyan" target="_blank" rel="noreferrer">
          {t("discussion")} <ArrowUpRightIcon />
        </a>
      </div>
    </section>
  );
}

export async function FooterA() {
  const t = await getTranslations("GetStart");
  return (
    <footer className={styles.footer}>
      <div className={styles.footerLinks}>
        <a href="https://github.com/MirrorChyan/docs" target="_blank" rel="noreferrer">
          {t("apiDoc")} <ArrowUpRightIcon />
        </a>
        <a href="https://github.com/MirrorChyan/user-frontend" target="_blank" rel="noreferrer">
          {t("openSource")} <ArrowUpRightIcon />
        </a>
        <a href="/disclaimer.html" target="_blank" rel="noreferrer">
          {t("disclaimer")}
        </a>
      </div>
      <IcpInfo />
    </footer>
  );
}
