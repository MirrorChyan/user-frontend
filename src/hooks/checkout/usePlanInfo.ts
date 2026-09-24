import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { PlanInfoDetail } from "@/app/[locale]/checkout/Checkout";
import { CLIENT_BACKEND } from "@/app/requests/misc";
import { addToast } from "@heroui/toast";

interface UsePlanInfoProps {
  planId: string;
}

interface UsePlanInfoResult {
  planInfo: PlanInfoDetail | undefined;
  loading: boolean;
  hasError: boolean;
}

type PlanInfoResult = {
  planInfo?: PlanInfoDetail;
  hasError: boolean;
};

async function fetchPlanInfo(planId: string, signal: AbortSignal): Promise<PlanInfoResult> {
  const response = await fetch(`${CLIENT_BACKEND}/api/misc/plan/${encodeURIComponent(planId)}`, {
    signal,
  });
  if (!response.ok) {
    return { hasError: false };
  }
  const { ec, data } = await response.json();
  if (ec !== 200) {
    return { hasError: true };
  }
  return { planInfo: data as PlanInfoDetail, hasError: false };
}

export function usePlanInfo({ planId }: UsePlanInfoProps): UsePlanInfoResult {
  const t = useTranslations("Checkout");
  // 按 planId 记录结果，planId 变化后旧结果自动失效，加载状态由此推导
  const [result, setResult] = useState<PlanInfoResult & { planId: string }>();

  useEffect(() => {
    if (!planId) return;
    const abortController = new AbortController();

    fetchPlanInfo(planId, abortController.signal)
      .catch((error: unknown): PlanInfoResult => {
        if (!abortController.signal.aborted) {
          console.error("获取Plan信息失败", error);
        }
        return { hasError: false };
      })
      .then(planResult => {
        if (abortController.signal.aborted) return;
        if (planResult.hasError) {
          addToast({
            color: "warning",
            description: t("errorWithPollingOrder"),
          });
        }
        setResult({ ...planResult, planId });
      });

    return () => {
      abortController.abort();
    };
  }, [planId, t]);

  const current = result?.planId === planId ? result : undefined;
  return {
    planInfo: current?.planInfo,
    loading: !current,
    hasError: current?.hasError ?? false,
  };
}
