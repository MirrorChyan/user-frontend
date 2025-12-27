import { PlanInfoDetail } from "@/app/[locale]/checkout/Checkout";

export type PaymentMethod = "alipay" | "wechatPay" | "afdian";
export type YmPayType = "AlipayQRCode" | "WeChatQRCode" | "AlipayH5" | "WeChatH5";

export const YmPayQrcode: Record<PaymentMethod, YmPayType> = {
  alipay: "AlipayQRCode",
  wechatPay: "WeChatQRCode",
  afdian: "AlipayQRCode", // fallback, not used
};

export interface PaymentParams {
  platform: string;
  planId: string;
  payType?: string;
  shouldOpenLink?: boolean;
}

export function getDefaultPaymentMethod(planInfo: PlanInfoDetail): PaymentMethod {
  return planInfo.alipay_id ? "alipay" : "wechatPay";
}

export function buildPaymentParams(
  paymentMethod: PaymentMethod,
  planInfo: PlanInfoDetail,
  usePayWithH5: boolean
): PaymentParams {
  let platform = "";
  let planId = "";
  let payType: string | undefined;
  let shouldOpenLink = false;

  if (usePayWithH5 && paymentMethod === "alipay") {
    platform = "alipay";
    planId = planInfo.alipay_id;
    payType = "H5";
    shouldOpenLink = true;
  } else if (paymentMethod === "alipay") {
    platform = "alipay";
    planId = planInfo.alipay_id;
  } else if (paymentMethod === "wechatPay") {
    platform = "weixin";
    planId = planInfo.weixin_id;
  }

  return { platform, planId, payType, shouldOpenLink };
}

export function buildFallbackParams(
  paymentMethod: PaymentMethod,
  planInfo: PlanInfoDetail,
  usePayWithH5: boolean
): PaymentParams {
  let platform = "";
  let planId = "";
  let payType: string | undefined;

  if (paymentMethod === "alipay") {
    platform = "alipay";
    planId = planInfo.alipay_id;
  } else if (paymentMethod === "wechatPay") {
    platform = "weixin";
    planId = planInfo.weixin_id;
  }

  return { platform, planId, payType };
}
