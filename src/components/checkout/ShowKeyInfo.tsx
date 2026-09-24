import { useLocale, useTranslations } from "next-intl";
import { CheckCircle, Gift, Layers, MessageCircle, TrendingUp } from "lucide-react";
import { OrderInfoType } from "@/components/checkout/QRCodePayModal";
import { addToast } from "@heroui/toast";
import { getGroupUrl } from "@/lib/utils/constant";
import { useState } from "react";
import { DAY_MS, formatDateTime } from "@/lib/utils/date";
import { copyText } from "@/lib/utils/clipboard";

// 先展示少一天的到期时间，抽取额外天数后再加回来；
// relativeDays 为抽取前的剩余天数，抽取后展示为 relativeDays + extraDays
function getInitialExpiry(expiredAt: string | undefined) {
  const now = Date.now();
  const initialExpiredTime = (expiredAt ? new Date(expiredAt).getTime() : now) - DAY_MS;
  return {
    initialExpiredTime,
    relativeDays: Math.round((initialExpiredTime - now) / DAY_MS),
  };
}

const CONFETTI_COLORS = ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff"];

// 只有点击抽奖时才加载 canvas-confetti，避免打进结账页的首屏包
async function fireConfetti() {
  const { default: confetti } = await import("canvas-confetti");
  const end = Date.now() + 100;

  const frame = () => {
    confetti({
      particleCount: 20,
      angle: 60,
      spread: 70,
      origin: { x: 0, y: 0.5 },
      colors: CONFETTI_COLORS,
      zIndex: 1000,
    });
    confetti({
      particleCount: 20,
      angle: 120,
      spread: 70,
      origin: { x: 1, y: 0.5 },
      colors: CONFETTI_COLORS,
      zIndex: 1000,
    });
    confetti({
      particleCount: 30,
      spread: 120,
      origin: { x: 0.5, y: 0 },
      colors: CONFETTI_COLORS,
      zIndex: 1000,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };
  frame();
}

export default function ShowKeyInfo(props: { info?: OrderInfoType }) {
  const t = useTranslations("ShowKey");
  const locale = useLocale();
  const info = props.info;
  const [showConfetti, setShowConfetti] = useState(false);
  const [extraDays, setExtraDays] = useState(0);
  const randomDays = 1;

  // 到期时间和剩余天数只在首次渲染时计算
  const [{ initialExpiredTime, relativeDays }] = useState(() => getInitialExpiry(info?.expired_at));
  const expiredTime = initialExpiredTime + extraDays * DAY_MS;

  if (!info) {
    return <></>;
  }

  const copyToClipboard = async () => {
    if (!info.cdk) return;
    const copied = await copyText(info.cdk);
    addToast({
      color: copied ? "success" : "danger",
      description: copied ? t("copySuccess") : t("copyFailed"),
    });
  };

  const handleJoinQQGroup = async () => {
    window.open(await getGroupUrl(), "_blank");
  };

  const handleViewProjects = () => {
    window.open(`/${locale}/projects`, "_blank");
  };

  const handleGetExtraDays = () => {
    setExtraDays(randomDays);
    setShowConfetti(true);

    addToast({
      color: "success",
      description: t.rich("confettiText", { randomDays })?.toString() ?? "",
    });

    fireConfetti().catch(error => console.error(error));
  };

  return (
    <>
      <div className="mb-6 text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
        </div>
        <h4 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
          {info.is_renewal ? t("renewalSuccess") : t("thanksForBuying")}
        </h4>
        <p className="mb-2 text-base text-gray-600 dark:text-gray-300">{t("yourKey")}</p>
        <div
          className="mb-4 flex items-center justify-between rounded-lg bg-gray-50 p-4 dark:bg-gray-700"
          onClick={copyToClipboard}
        >
          <span className="cursor-pointer font-mono text-indigo-600 select-all dark:text-indigo-400">
            {info.cdk}
          </span>
          <button className="ml-2 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400">
            {t("copy")}
          </button>
        </div>
        {info.expired_at && (
          <div className="mb-4">
            {showConfetti ? (
              <span className="text-sm whitespace-pre-line text-gray-500 dark:text-gray-400">
                {t.rich("timeConfettiAfter", {
                  addDay: extraDays,
                  time: formatDateTime(expiredTime),
                })}
                <div className="mt-2 flex items-center justify-center gap-1 text-sm text-emerald-600 dark:text-emerald-400">
                  {t.rich("remainingDays", { originDay: relativeDays })}
                  <TrendingUp className="mx-1 h-3 w-3" />
                  <span className="font-semibold">
                    {relativeDays + extraDays} {t("day")}
                  </span>
                </div>
              </span>
            ) : (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {t.rich("timeConfettiBefore", {
                  time: formatDateTime(expiredTime),
                  days: relativeDays,
                })}
              </span>
            )}
          </div>
        )}

        <div className="mb-8">
          <button
            onClick={handleGetExtraDays}
            disabled={showConfetti}
            className={`mx-auto flex items-center justify-center rounded-lg px-4 py-2 transition-colors ${
              showConfetti
                ? "cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500"
                : "bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-800/50"
            }`}
          >
            <Gift className="mr-2 h-4 w-4" />
            <span>
              {showConfetti
                ? t.rich("confettiGotText", { days: randomDays })
                : t("getRandomDaysText")}
            </span>
          </button>
        </div>

        <div className="mt-4 flex items-center justify-center">
          <span className="text-sm text-gray-500 dark:text-gray-400">{t("lostCDK")}</span>
        </div>
        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <button
            onClick={handleJoinQQGroup}
            className="flex items-center justify-center rounded-lg bg-indigo-50 px-6 py-3 text-indigo-600 transition-colors hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-800/50"
          >
            <MessageCircle className="mr-2 h-5 w-5" />
            <span>{t("joinQQGroup")}</span>
          </button>

          <button
            onClick={handleViewProjects}
            className="flex items-center justify-center rounded-lg bg-emerald-50 px-6 py-3 text-emerald-600 transition-colors hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-800/50"
          >
            <Layers className="mr-2 h-5 w-5" />
            <span>{t("viewProjects")}</span>
          </button>
        </div>
      </div>
    </>
  );
}
