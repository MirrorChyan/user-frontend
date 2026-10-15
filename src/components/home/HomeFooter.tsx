import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/routing";
import IcpInfo from "@/components/home/IcpInfo";
import { cn } from "@/lib/utils/css";

const actionButtonClass =
  "rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600";

type HomeFooterProps = {
  /** 在「查询CDK」左侧显示跳转主页的订阅按钮 */
  showSubscribe?: boolean;
  /** 备案与用户协议固定在视口底部 */
  pinLegal?: boolean;
  /** 上方已有分割线时，去掉按钮区额外的上边距 */
  compact?: boolean;
};

export default async function HomeFooter({
  showSubscribe = false,
  pinLegal = false,
  compact = false,
}: HomeFooterProps) {
  const t = await getTranslations("GetStart");

  return (
    <>
      <div
        className={cn(
          "mt-12 flex flex-wrap items-center justify-center gap-6 md:mt-10",
          compact && "mt-0 md:mt-0"
        )}
      >
        {showSubscribe && (
          <Link href="/get-start" className={actionButtonClass}>
            {t("subscribeCdk")}
          </Link>
        )}
        <Link href="/get-key" className={actionButtonClass}>
          {t("getKey")}
        </Link>
        <Link href="/transfer" className={actionButtonClass}>
          {t("transfer")}
        </Link>
        <Link href="https://pd.qq.com/g/MirrorChyan" target="_blank" className={actionButtonClass}>
          {t("discussion")}
        </Link>
      </div>
      <div className="mt-16 flex flex-wrap items-center justify-center gap-6 md:mt-10">
        <a
          href="https://github.com/MirrorChyan/docs"
          target="_blank"
          className="text-sm/6 font-semibold text-gray-900 dark:text-white"
          rel="noreferrer"
        >
          {t("apiDoc")}
          <span aria-hidden="true">&nbsp;</span>
        </a>
        <a
          href="https://github.com/MirrorChyan/user-frontend"
          target="_blank"
          className="text-sm/6 font-semibold text-gray-900 dark:text-white"
          rel="noreferrer"
        >
          {t("openSource")}
          <span aria-hidden="true">&nbsp;</span>
        </a>
      </div>
      <div
        className={
          pinLegal
            ? "absolute bottom-4 left-0 mt-16 flex w-full items-center justify-center gap-1.5"
            : "mt-10 mb-2 flex w-full items-center justify-center gap-1.5"
        }
      >
        <IcpInfo />
        <div>
          <a
            href="/disclaimer.html"
            target="_blank"
            className="text-xs text-gray-500 dark:text-gray-400"
          >
            {t("disclaimer")}
            <span aria-hidden="true">&nbsp;</span>
          </a>
        </div>
      </div>
    </>
  );
}
