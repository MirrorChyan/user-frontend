import { useTranslations } from "next-intl";

import type { Plan } from "@/app/requests/plan";

/** 套餐卡片显示的名称和价格，原版和设计 A 共用 */
export function usePlanDisplay(plan: Plan, C2URate: number) {
  const t = useTranslations("GetStart");
  const planName = t.has(`planTitle.${plan.title}`) ? t(`planTitle.${plan.title}`) : plan.title;

  const priceFixed = Number(t("priceFixed"));
  // 现价和原价按同一规则格式化并去掉末尾的 0，避免同一张卡上小数位数不一致
  const formatPrice = (value: string) => parseFloat((Number(value) * C2URate).toFixed(priceFixed));
  const price = formatPrice(plan.price);
  // 接口返回的是字符串，按字典序比较会把 "12.9" 判成小于 "9.9"，必须转成数值
  const originalPrice =
    Number(plan.original_price) > Number(plan.price) ? formatPrice(plan.original_price) : null;

  return { planName, price, originalPrice };
}
