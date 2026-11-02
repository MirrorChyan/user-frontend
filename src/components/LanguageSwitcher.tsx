"use client";

import { useTransition } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import styles from "./language-switcher.module.css";

export function LanguageToolbar() {
  return (
    <header className={styles.toolbar}>
      <LanguageSwitcher />
    </header>
  );
}

export default function LanguageSwitcher({ className = "" }: { className?: string }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const isZh = locale === "zh";
  const otherLocale = isZh ? "en" : "zh";

  const toggleLocale = () => {
    startTransition(() => {
      router.replace(pathname, { locale: otherLocale });
    });
  };

  return (
    <button
      type="button"
      onClick={toggleLocale}
      disabled={isPending}
      aria-label="Switch language"
      aria-busy={isPending}
      className={`${styles.switcher} ${className}`}
    >
      {isPending ? (
        <span className="flex items-center px-2">
          <svg className="text-primary-500 h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
              className="opacity-25"
            />
            <path
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              className="opacity-75"
            />
          </svg>
        </span>
      ) : (
        <>
          <span data-active={isZh}>中</span>
          <span data-active={!isZh}>EN</span>
        </>
      )}
    </button>
  );
}
