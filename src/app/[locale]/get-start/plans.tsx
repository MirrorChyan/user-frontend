'use client'

import { Plan } from "@/app/requests/planInfo";
import { useTranslations } from "next-intl";
import PlanCard from "./plan-card";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils/css";

type PlansProps = {
  morePlans: (Plan | null)[]
  homePlans: (Plan | null)[]
  customOrderId: string
  C2URate: number
}

export default function Plans({
  morePlans,
  homePlans,
  ...rest
}: PlansProps) {
  const t = useTranslations("GetStart");

  const [isOpenMore, setIsOpenMore] = useState(false);

  const _morePlans = useMemo(() => morePlans.filter((plan) => plan !== null), [morePlans]);
  const _homePlans = useMemo(() => homePlans.filter((plan) => plan !== null), [homePlans]);

  const renderPlans = (plans: Plan[]) => plans.map((plan) => (
    <PlanCard key={plan.planId} plan={plan} {...rest} />
  ))

  return (
    <div className="mx-auto max-w-md md:max-w-2xl lg:max-w-4xl xl:mx-0 xl:max-w-6xl self-center">
      <div className={cn(
        'isolate self-center px-2 relative',
        'grid grid-cols-1 gap-8 md:grid-cols-3',
      )}>
        {renderPlans(_homePlans)}
        { _morePlans.length ? (
          <button
            className="absolute left-full bottom-10 text-nowrap text-indigo-600 hover:text-indigo-500 translate-x-0 md:translate-x-6"
            onClick={() => setIsOpenMore(val => !val)}>
            { isOpenMore ? t('hide') : t('more') }
          </button>
        ) : null }
      </div>
      { _morePlans.length ? (
        <div className={cn(
          'transition-all duration-400 overflow-hidden grid',
          isOpenMore ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        )}>
          <div className="min-h-0">
            <div className={cn(
              'isolate self-center p-2 pt-8',
              'grid grid-cols-1 gap-8 md:grid-cols-3',
            )}>
              {renderPlans(_morePlans)}
            </div>
          </div>
        </div>
      ) : null }
    </div>
  )
}
