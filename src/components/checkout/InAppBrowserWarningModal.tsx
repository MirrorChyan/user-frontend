"use client";

import { useTranslations } from "next-intl";
import AppDialog from "@/components/AppDialog";
import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@heroui/react";
import { copyText } from "@/lib/utils/clipboard";

interface InAppBrowserWarningModalProps {
  open: boolean;
  onClose: () => void;
  onSwitchToWechat?: () => void;
}

export default function InAppBrowserWarningModal({
  open,
  onClose,
  onSwitchToWechat,
}: InAppBrowserWarningModalProps) {
  const t = useTranslations("Checkout");

  const [copied, setCopied] = useState(false);

  const handleSwitchToWechat = () => {
    onSwitchToWechat?.();
    onClose();
  };

  const handleCopyLink = async () => {
    if (await copyText(window.location.href)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <AppDialog open={open} onClose={onClose} dismissable size="md">
      {/* 警告图标 */}
      <div className="mb-4 flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
          <AlertTriangle className="h-8 w-8 text-amber-500" />
        </div>
      </div>

      {/* 标题 */}
      <h3 className="mb-3 text-center text-lg font-semibold text-gray-900 dark:text-white">
        {t("inAppBrowserWarningTitle")}
      </h3>

      {/* 说明文字 */}
      <p className="mb-6 text-center text-sm text-gray-600 dark:text-gray-400">
        {t("inAppBrowserWarningDesc")}
      </p>

      {/* 操作按钮 */}
      <div className="space-y-3">
        {onSwitchToWechat && (
          <Button
            onPress={handleSwitchToWechat}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#15BA11] p-4 text-base font-medium text-white transition-colors hover:bg-[#0fa00d]"
          >
            {t("switchToWechatPay")}
          </Button>
        )}

        <Button
          onPress={handleCopyLink}
          variant="bordered"
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-blue-200 bg-blue-50 p-4 text-base font-medium text-blue-700 transition-colors hover:bg-blue-100 dark:border-blue-600 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/40"
        >
          {copied ? <>{t("linkCopied")}</> : <>{t("copyPageLink")}</>}
        </Button>

        {/* <Button
            onPress={onClose}
            variant="bordered"
            className="flex w-full items-center justify-center rounded-xl border-2 border-gray-200 p-4 text-base font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            {t("understood")}
          </Button> */}
      </div>
    </AppDialog>
  );
}
