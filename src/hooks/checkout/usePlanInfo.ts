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

export function usePlanInfo({ planId }: UsePlanInfoProps): UsePlanInfoResult {
  const t = useTranslations("Checkout");
  const [planInfo, setPlanInfo] = useState<PlanInfoDetail | undefined>();
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const abortController = new AbortController();

    (async () => {
      setLoading(true);
      setHasError(false);

      try {
        const response = await fetch(`${CLIENT_BACKEND}/api/misc/plan/${planId}`, {
          signal: abortController.signal,
        });

        if (response.ok) {
          const { ec, data } = await response.json();
          if (ec !== 200) {
            if (!abortController.signal.aborted) {
              addToast({
                color: "warning",
                description: t("errorWithPollingOrder"),
              });
              setHasError(true);
            }
            return;
          }
          if (!abortController.signal.aborted) {
            const detail = data as PlanInfoDetail;
            setPlanInfo(detail);
          }
        }
      } catch (error) {
        if (!abortController.signal.aborted) {
          console.error("获取Plan信息失败", error);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      abortController.abort();
    };
  }, [planId]);

  return { planInfo, loading, hasError };
}
