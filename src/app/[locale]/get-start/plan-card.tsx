"use client";

import { cn } from "@/lib/utils/css";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";

import Countdown from "./countdown";

type Discount = {
  beginAt: number
  endAt: number
  discountPrice: string
}

type Plan = {
  name: string
  price: string
  planId: string
  skuId: string
  mostPopular: boolean
  discount?: Discount
}

type PropsType = {
  plan: Plan
  customOrderId: string
  C2URate: number
  locale: string
}

export default function PlanCard({ plan, customOrderId, C2URate, locale }: PropsType) {
  const t = useTranslations("GetStart");
  const router = useRouter();

  const generatePlanUrl = (plan: Plan) => {
    return "https://ifdian.net/order/create?product_type=1" +
      `&plan_id=${plan.planId}&sku=%5B%7B%22sku_id%22%3A%22${plan.skuId}%22%2C%22count%22%3A1%7D%5D&viokrz_ex=0&custom_order_id=${customOrderId}`;
  };

  const jumpToOrder = () => {
    router.push(`/order?customId=${customOrderId}`);
  };

  return (
    <div
      key={plan.planId}
      className={cn(
        plan.mostPopular ? "ring-2 ring-indigo-600" : "ring-1 ring-gray-200",
        "rounded-3xl p-8 bg-white dark:bg-white/5 shadow-sm flex flex-col",
      )}
    >
      <h3
        id={plan.planId}
        className={cn(
          plan.mostPopular ? "text-indigo-600" : "text-gray-900 dark:text-white",
          "text-lg/8 font-semibold",
        )}
      >
        {plan.name}
      </h3>
      {plan.discount ? (
        <p className="mt-6 flex items-baseline gap-x-1 basis-full">
          <span className="text-4xl font-semibold tracking-tight text-gray-900 dark:text-white">
            {plan.discount.discountPrice}
          </span>
          <span className="text-sm/6 line-through text-gray-500 dark:text-gray-400">
            {`
              ${locale === "en" ? "$" : "￥"}
              ${(Number(plan.price.split(" ").pop()) * C2URate).toFixed(2)}
            `}
          </span>
        </p>
      ) : (
        <p className="mt-6 flex items-baseline gap-x-1 basis-full">
          <span className="text-4xl font-semibold tracking-tight text-gray-900 dark:text-white">
            {`
              ${locale === "en" ? "$" : "￥"}
              ${(Number(plan.price.split(" ").pop()) * C2URate).toFixed(2)}
            `}
          </span>
        </p>
      )}
      {/* {plan.discount && (
        <div className="mt-1 text-sm/6 text-gray-900 dark:text-white">
          {t('LimitTimeOffer')}
          <Countdown toTime={plan.discount.endAt} />
        </div>
      )} */}
      <a
        href={generatePlanUrl(plan)}
        target="_blank"
        aria-describedby={plan.planId}
        onClick={jumpToOrder}
        className={cn(
          plan.mostPopular
            ? "bg-indigo-600 text-white shadow-sm hover:bg-indigo-500"
            : "text-indigo-600 ring-1 ring-inset ring-indigo-200 hover:ring-indigo-300 dark:text-white",
          "mt-6 block rounded-md px-3 py-2 text-center text-sm/6 font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600",
        )}
      >
        {t("buyAtAfdian")}
      </a>
      {/* <ul role="list" className="mt-8 space-y-3 text-sm/6 text-gray-600">
        {plan.features.map((feature) => (
          <li key={feature} className="flex gap-x-3">
            <CheckIcon aria-hidden="true" className="h-6 w-5 flex-none text-indigo-600" />
            {feature}
          </li>
        ))}
      </ul> */}
    </div >
  );
}
