"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { useRouter } from "@/i18n/routing";
import HomeButton from "@/components/HomeButton";
import QQGroupLink from "@/components/QQGroupLink";
import { cn } from "@/lib/utils/css";

export default function GetKey() {
  const t = useTranslations("GetKey");
  const [inputOrderId, setInputOrderId] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    const orderId = inputOrderId.trim();
    if (!orderId) return;
    router.push(`/projects?order_id=${orderId}`);
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-muted/30 p-4">
      {/* Return Home Button - Top Left */}
      <div className="absolute left-4 top-4 z-10 md:left-8 md:top-8">
        <HomeButton className="border border-border bg-background text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[420px]"
      >
        <div className="w-full overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-xl shadow-black/5 md:p-10">
          {/* Header Section */}
          <div className="mb-10 text-center">
            <h1 className="mb-3 text-2xl font-bold tracking-tight text-card-foreground">
              {t("title")}
            </h1>
            <p className="text-left text-sm leading-relaxed text-muted-foreground">
              {t.rich("orderId", {
                br: () => <br />,
              })}
            </p>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="group relative">
              <label
                htmlFor="key"
                className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground"
              >
                {t("inputPlaceholder")}
              </label>
              <input
                id="key"
                name="key"
                type="text"
                autoComplete="off"
                required
                onChange={e => setInputOrderId(e.target.value)}
                className={cn(
                  "block w-full rounded-lg border border-input bg-muted/50 px-4 py-3.5 text-base text-foreground transition-all",
                  "placeholder:text-muted-foreground focus:border-ring focus:bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                )}
              />
            </div>

            <button
              type="submit"
              className={cn(
                "relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-all",
                "hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98]"
              )}
            >
              <span>{t("getKey")}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-4 w-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                />
              </svg>
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-8 flex justify-center border-t border-border pt-6">
            <div className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              <QQGroupLink text={t("haveQuestion")} />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
