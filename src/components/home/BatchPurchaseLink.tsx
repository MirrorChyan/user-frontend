import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/routing";

export default async function BatchPurchaseLink() {
  const t = await getTranslations("BatchPurchase");

  return (
    <div className="mt-10 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 text-center text-sm">
      <Link
        href="/batch-purchase"
        className="inline-flex items-center gap-1.5 rounded-sm py-2 text-indigo-600 transition-colors hover:text-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-500 dark:text-indigo-400"
      >
        {t("entryTitle")}
        <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
      </Link>
      <span className="text-gray-500 dark:text-gray-400">{t("entryDescription")}</span>
    </div>
  );
}
