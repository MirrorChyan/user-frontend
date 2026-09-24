import Checkout from "@/app/[locale]/checkout/Checkout";
import { getUSDRate } from "@/app/requests/rate";
import { setRequestLocale } from "next-intl/server";

export default async function View({
  params,
}: {
  params: Promise<{ locale: string; planId?: string[] }>;
}) {
  // 语言取自路由参数而非请求头，页面可以按套餐缓存
  const { locale, planId } = await params;
  setRequestLocale(locale);
  const rate = locale === "zh" ? 1 : await getUSDRate();
  // 可选路由段，访问 /checkout 时 planId 为 undefined
  return <Checkout planId={planId ?? []} rate={rate} />;
}
