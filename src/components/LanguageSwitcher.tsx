"use client";

import { useTransition, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";

const LOCALE_STORAGE_KEY = "preferred-locale";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);

  const isZh = locale === "zh";
  const otherLocale = isZh ? "en" : "zh";

  useEffect(() => {
    setMounted(true);
  }, []);

  // 首次访问时，如果 localStorage 中有存储的语言偏好且与当前不同，自动切换
  useEffect(() => {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored && stored !== locale && (stored === "zh" || stored === "en")) {
      router.replace(pathname, { locale: stored });
    }
  }, []);

  useEffect(() => {
    router.prefetch(pathname, { locale: otherLocale });
  }, [pathname, otherLocale, router]);

  const toggleLocale = () => {
    localStorage.setItem(LOCALE_STORAGE_KEY, otherLocale);
    startTransition(() => {
      router.replace(pathname, { locale: otherLocale });
    });
  };

  if (!mounted) return null;

  return createPortal(
    <button
      onClick={toggleLocale}
      disabled={isPending}
      aria-label="Switch language"
      className="absolute top-4 right-4 z-50 flex h-8 items-center gap-1 rounded-full border border-gray-200/60 bg-white/70 px-1 backdrop-blur-md transition-all dark:border-gray-700/60 dark:bg-gray-900/70"
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
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold transition-all ${
              isZh
                ? "bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300"
                : "text-gray-400 dark:text-gray-500"
            }`}
          >
            中
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold transition-all ${
              !isZh
                ? "bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300"
                : "text-gray-400 dark:text-gray-500"
            }`}
          >
            EN
          </span>
        </>
      )}
    </button>,
    document.body
  );
}
