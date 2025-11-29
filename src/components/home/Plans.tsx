"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils/css";
import { Plan } from "@/app/requests/plan";
import PlanCard from "@/components/home/PlanCard";

type PlansProps = {
  morePlans: Plan[];
  homePlans: Plan[];
  C2URate: number;
};

export default function Plans({ morePlans, homePlans, ...rest }: PlansProps) {
  const t = useTranslations("GetStart");

  const [isOpenMore, setIsOpenMore] = useState(false);

  const renderPlans = (plans: Plan[]) =>
    plans.map((plan, index) => <PlanCard key={index} plan={plan} {...rest} />);

  const homePlansRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState<number | null>(10000);

  useEffect(() => {
    if (!homePlans.length || !morePlans.length) return;
    if (homePlansRef.current) {
      if (document.body.clientWidth < 768) {
        setOffset(null);
      } else {
        const { left } = homePlansRef.current!.getBoundingClientRect();
        const { right } = homePlansRef.current!.lastElementChild!.getBoundingClientRect();
        setOffset(right - left);
      }
    }
  }, [homePlansRef.current, homePlans]);

  return (
    <div className="mx-auto mt-16 max-w-md self-center md:max-w-2xl lg:max-w-4xl xl:mx-0 xl:max-w-6xl">
      <div className="relative">
        <div
          ref={homePlansRef}
          className={cn("isolate self-center px-2", "grid grid-cols-1 gap-8 md:grid-cols-3")}
        >
          {renderPlans(homePlans)}
        </div>
        {morePlans.length ? (
          <button
            className={cn(
              "absolute -bottom-9 left-1/2 z-10 -translate-x-1/2",
              "md:-bottom-1 md:left-auto md:translate-x-6",
              "text-nowrap text-primary hover:text-primary/80"
            )}
            style={offset ? { left: offset } : {}}
            onClick={() => setIsOpenMore(val => !val)}
          >
            {isOpenMore ? t("hide") : t("more")}
          </button>
        ) : null}
      </div>
      {morePlans.length ? (
        <div
          className={cn(
            "grid overflow-hidden transition-all duration-400",
            isOpenMore ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          )}
        >
          <div className="min-h-0">
            <div
              className={cn(
                "isolate self-center p-2 pt-12 md:pt-8",
                "grid grid-cols-1 gap-8 md:grid-cols-3"
              )}
            >
              {renderPlans(morePlans)}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
