import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { PlanInfoDetail } from "@/app/[locale]/checkout/Checkout";
import { CLIENT_BACKEND } from "@/app/requests/misc";
import { addToast } from "@heroui/toast";
import { getSource } from "@/components/SourceTracker";
import { isMobile } from "react-device-detect";
import { buildFallbackParams, buildPaymentParams, PaymentMethod } from "@/lib/utils/payment";

interface CreateOrderType {
  pay_url?: string;
  html?: string;
  custom_order_id: string;
  amount: number;
  title: string;
}

interface UsePaymentCreationProps {
  planInfo: PlanInfoDetail | undefined;
  paymentMethod: PaymentMethod;
  usePayWithH5: boolean;
  renewCdk: string;
}

interface UsePaymentCreationResult {
  createPayment: () => Promise<{
    success: boolean;
    data?: CreateOrderType;
    shouldOpenLink?: boolean;
  }>;
  loading: boolean;
}

// 构建请求参数
function buildURLParams(
  planId: string,
  payType: string | null | undefined,
  renewCdk: string
): URLSearchParams {
  const params = new URLSearchParams();
  params.append("plan_id", planId);
  if (payType) {
    params.append("pay", payType);
  }
  params.append("source", getSource());
  if (renewCdk && renewCdk.length > 0) {
    params.append("renew", renewCdk);
  }
  return params;
}

// 发起订单创建请求
async function createOrder(
  platform: string,
  params: URLSearchParams
): Promise<{ code: number; data?: CreateOrderType }> {
  const resp = await fetch(`${CLIENT_BACKEND}/api/billing/order/${platform}/create?${params}`);
  return await resp.json();
}

export function usePaymentCreation({
  planInfo,
  paymentMethod,
  usePayWithH5,
  renewCdk,
}: UsePaymentCreationProps): UsePaymentCreationResult {
  const t = useTranslations("Checkout");
  const [loading, setLoading] = useState(false);

  const createPayment = useCallback(async () => {
    if (!planInfo) {
      return { success: false };
    }

    setLoading(true);
    try {
      // 构建主要支付参数
      const { platform, planId, payType, shouldOpenLink } = buildPaymentParams(
        paymentMethod,
        planInfo,
        usePayWithH5
      );

      const params = buildURLParams(planId, payType, renewCdk);
      const response = await createOrder(platform, params);

      if (response.code !== 0) {
        addToast({
          color: "warning",
          description: t("createOrderError"),
        });
        return { success: false };
      }

      const orderInfo = response.data as CreateOrderType;

      return {
        success: true,
        data: orderInfo,
        shouldOpenLink: shouldOpenLink && !!orderInfo.pay_url,
      };
    } catch (error) {
      console.log(error);
      addToast({
        color: "warning",
        description: t("createOrderError"),
      });
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, [planInfo, paymentMethod, usePayWithH5, renewCdk, t]);

  return { createPayment, loading };
}
