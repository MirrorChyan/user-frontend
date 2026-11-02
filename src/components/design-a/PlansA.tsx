"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import type { Plan } from "@/app/requests/plan";
import PlanCardA from "./PlanCardA";
import styles from "./design-a.module.css";

export default function PlansA({
  homePlans,
  morePlans,
  C2URate,
}: {
  homePlans: Plan[];
  morePlans: Plan[];
  C2URate: number;
}) {
  const t = useTranslations("GetStart");
  const [expanded, setExpanded] = useState(false);
  return (
    <section className={styles.plans} aria-label={t("subscribeCdk")}>
      <div className={styles.planGrid}>
        {homePlans.map(plan => (
          <PlanCardA key={plan.plan_id} plan={plan} C2URate={C2URate} />
        ))}
      </div>
      {morePlans.length > 0 && (
        <>
          <button
            type="button"
            className={styles.morePlans}
            aria-expanded={expanded}
            aria-controls="additional-plans"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? t("hide") : t("more")}
          </button>
          {expanded && (
            <div className={styles.planGrid} id="additional-plans">
              {morePlans.map(plan => (
                <PlanCardA key={plan.plan_id} plan={plan} C2URate={C2URate} />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
