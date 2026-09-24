"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@heroui/react";
import { copyText } from "@/lib/utils/clipboard";

/** 微信、QQ 等 App 内置浏览器会拦截文件下载，引导用户复制链接到系统浏览器中下载 */
export default function InAppDownloadNotice({ url }: { url: string }) {
  const t = useTranslations("Download");
  const [copied, setCopied] = useState<boolean | null>(null);

  const handleCopy = async () => {
    setCopied(await copyText(url));
  };

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-left dark:border-amber-800 dark:bg-amber-900/20">
      <h4 className="text-sm font-medium text-amber-800 dark:text-amber-300">
        {t("inAppBrowserTitle")}
      </h4>
      <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">{t("inAppBrowserDesc")}</p>
      <Button size="sm" color="warning" variant="flat" className="mt-3" onPress={handleCopy}>
        {copied ? t("linkCopied") : t("copyDownloadLink")}
      </Button>
      {copied === false && (
        <p className="mt-2 text-xs break-all text-amber-700 select-all dark:text-amber-400">
          {url}
        </p>
      )}
    </div>
  );
}
