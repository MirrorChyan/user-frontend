"use client";

import { useRouter, useSearchParams } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import LoadingState from "@/components/LoadingState";

export default function Download() {
  const t = useTranslations("Download");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const params = new URLSearchParams();

    Array.from(searchParams.entries()).forEach(([key, value]) => {
      params.set(key, value);
    });

    const queryString = params.toString();
    const redirectUrl = `/projects${queryString ? `?${queryString}` : ""}`;
    router.push(redirectUrl);
  }, [searchParams, router]);

  return <LoadingState title={t("pleaseWait")} />;
}
