import Checkout from "@/app/[locale]/checkout/Checkout";
import { getUSDRate } from "@/app/requests/rate";
import { getLocale } from "next-intl/server";

export default async function View(params: { params: Promise<{ planId: string[] }> }) {
  const locale = await getLocale();
  const rate = locale === "zh" ? 1 : await getUSDRate();
  const planId = (await params.params).planId;
  return <Checkout planId={planId} rate={rate} />;
}
