'use client'

import { Plan } from "@/app/requests/planInfo";
import { useTranslations } from "next-intl";
import PlanCard from "./plan-card";
import { useEffect, useMemo, useRef, useState } from "react";
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

  const homePlansRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState<number | null>(10000);

  useEffect(() => {
    if (_homePlans.length === 0) return;
    if(homePlansRef.current){
      const { left } = homePlansRef.current!.getBoundingClientRect();
      const { right } = homePlansRef.current?.lastElementChild?.getBoundingClientRect() ?? { right: 0 };
      if (document.body.clientWidth < 768) {
        setOffset(null);
      } else {
        setOffset(right - left);
      }
    }
  }, [homePlansRef.current, _homePlans]);

  return (
    <div className="mx-auto max-w-md md:max-w-2xl lg:max-w-4xl xl:mx-0 xl:max-w-6xl self-center">
      <div className="relative">
        <div ref={homePlansRef} className={cn(
          'isolate self-center px-2',
          'grid grid-cols-1 gap-8 md:grid-cols-3',
        )}>
          {renderPlans(_homePlans)}
        </div>
        { _morePlans.length ? (
          <button
            className={cn(
              'absolute -bottom-9 left-1/2 -translate-x-1/2 z-10',
              'md:left-auto md:translate-x-6 md:bottom-10',
              'text-indigo-600 hover:text-indigo-500 text-nowrap',
            )}
            style={offset ? { left: offset } : {}}
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
              'isolate self-center p-2 md:pt-8 pt-12',
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
