import { ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";

export default function SecurityFooter() {
  const t = useTranslations("Checkout");
  return (
    <div className="mt-6">
      <div className="mb-4 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
        <ShieldCheck className="mr-2 h-4 w-4 text-emerald-500" />
        <span>{t("securePayment")}</span>
      </div>
      <a
        href="/disclaimer.html"
        target="_blank"
        className="block text-center text-xs text-gray-500 dark:text-gray-400"
      >
        {t("privacyNotice")}
      </a>
    </div>
  );
}
