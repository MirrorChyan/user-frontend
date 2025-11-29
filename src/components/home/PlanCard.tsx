"use client";

import { cn } from "@/lib/utils/css";
import { useTranslations } from "next-intl";
import { Plan } from "@/app/requests/plan";
import { Link } from "@/i18n/routing";

type PropsType = {
  plan: Plan;
  C2URate: number;
};

export default function PlanCard({ plan, C2URate }: PropsType) {
  const t = useTranslations("GetStart");
  const planName = t.has(`planTitle.${plan.title}`) ? t(`planTitle.${plan.title}`) : plan.title;

  const priceFixed: number = Number(t("priceFixed"));
  const price: number = parseFloat((Number(plan.price) * C2URate).toFixed(priceFixed));
  const originalPrice: string | null =
    plan.original_price > plan.price
      ? (Number(plan.original_price) * C2URate).toFixed(priceFixed)
      : null;
  return (
    <div
      key={plan.plan_id}
      className={cn(
        plan.popular ? "ring-2 ring-primary" : "ring-1 ring-border",
        "flex flex-col rounded-3xl bg-card p-8 shadow-sm"
      )}
    >
      <h3
        id={plan.plan_id}
        className={cn(
          plan.popular ? "text-primary" : "text-card-foreground",
          "text-lg/8 font-semibold"
        )}
      >
        {planName}
      </h3>
      {originalPrice ? (
        <p className="mt-6 flex basis-full items-baseline gap-x-1 text-nowrap">
          <span className="text-3xl font-semibold tracking-tight text-card-foreground">
            {`
              ${t("priceSymbol")}
              ${price}
            `}
          </span>
          <span className="text-sm/6 text-muted-foreground line-through">
            {`
              ${t("priceSymbol")}
              ${originalPrice}
            `}
          </span>
        </p>
      ) : (
        <p className="mt-6 flex basis-full items-baseline gap-x-1 text-nowrap">
          <span className="text-4xl font-semibold tracking-tight text-card-foreground">
            {`
              ${t("priceSymbol")}
              ${price}
            `}
          </span>
        </p>
      )}
      <Link
        href={`/checkout/${plan.plan_id}`}
        aria-describedby={plan.plan_id}
        className={cn(
          plan.popular
            ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
            : "text-primary ring-1 ring-inset ring-primary/20 hover:ring-primary/30",
          "mt-6 block rounded-md px-3 py-2 text-center text-sm/6 font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        )}
      >
        {t("subscribeNow")}
      </Link>
    </div>
  );
}
