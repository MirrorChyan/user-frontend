"use client";

import { useTranslations } from "next-intl";
import { ArrowRightIcon, CalendarDaysIcon } from "@heroicons/react/24/outline";

import type { Plan } from "@/app/requests/plan";
import { Link } from "@/i18n/routing";
import { track } from "@/lib/analytics";
import { usePlanDisplay } from "@/hooks/usePlanDisplay";
import styles from "./design-a.module.css";

export default function PlanCardA({ plan, C2URate }: { plan: Plan; C2URate: number }) {
  const t = useTranslations("GetStart");
  const { planName, price, originalPrice } = usePlanDisplay(plan, C2URate);
  return (
    <article className={`${styles.planCard} ${plan.popular ? styles.popularPlan : ""}`}>
      <div className={styles.planHeading}>
        <div className={styles.planSymbol}>
          <CalendarDaysIcon aria-hidden="true" />
        </div>
        <h3 id={plan.plan_id}>{planName}</h3>
      </div>
      <p className={styles.planPrice}>
        <span>{t("priceSymbol")}</span>
        <strong>{price}</strong>
        {originalPrice !== null && (
          <del>
            {t("priceSymbol")}
            {originalPrice}
          </del>
        )}
      </p>
      <Link
        href={`/checkout/${plan.plan_id}`}
        aria-describedby={plan.plan_id}
        onClick={() => track("plan_click", { plan_id: plan.plan_id })}
        className={styles.planAction}
      >
        {t("subscribeNow")}
        <ArrowRightIcon aria-hidden="true" />
      </Link>
    </article>
  );
}
