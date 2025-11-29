"use client";

import { PlusIcon } from "@heroicons/react/24/outline";
import { Link } from "@heroui/react";
import { useTranslations } from "next-intl";

export default function ProjectIntegratedCard() {
  const t = useTranslations("Projects");
  const url = "https://github.com/MirrorChyan/docs";
  return (
    <div className="group flex h-full transform cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border border-border bg-gradient-to-br from-card to-muted/20 p-4 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10">
      <Link href={url} target="_blank" rel="noreferrer">
        <div className="flex h-full w-full flex-col items-center justify-center">
          <div className="mb-4 rounded-full bg-primary/10 p-4">
            <PlusIcon className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-center text-lg font-semibold text-foreground transition-colors duration-300 group-hover:text-primary">
            {t("joinUs")}
          </h3>
          <p className="mt-2 text-center text-sm text-muted-foreground transition-colors duration-300 group-hover:text-foreground">
            {t("contactUs")}
          </p>
        </div>
      </Link>
    </div>
  );
}
