import { PlanInfoDetail } from "@/app/[locale]/checkout/Checkout";

export type PaymentMethod = "alipay" | "wechatPay" | "afdian";

// 用于 API 支付创建的支付方式（不包括 afdian，因为它有独立的处理流程）
export type ApiPaymentMethod = Exclude<PaymentMethod, "afdian">;

export interface PaymentParams {
  platform: string;
  planId: string;
  payType?: string;
  payOnNewPage: boolean;
}

export function getDefaultPaymentMethod(planInfo: PlanInfoDetail): PaymentMethod {
  return planInfo.alipay_id ? "alipay" : "wechatPay";
}

export function buildPaymentParams(
  paymentMethod: ApiPaymentMethod,
  planInfo: PlanInfoDetail,
  canTryH5: boolean
): PaymentParams {
  let platform = "";
  let planId = "";
  let payType: string | undefined;
  let payOnNewPage = false;

  if (canTryH5 && paymentMethod === "alipay") {
    platform = "alipay";
    planId = planInfo.alipay_id;
    payType = "H5";
    payOnNewPage = true;
  } else if (paymentMethod === "alipay") {
    platform = "alipay";
    planId = planInfo.alipay_id;
  } else if (paymentMethod === "wechatPay") {
    platform = "weixin";
    planId = planInfo.weixin_id;
  }

  return { platform, planId, payType, payOnNewPage };
}
