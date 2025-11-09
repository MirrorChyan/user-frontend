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

  if (usePayWithH5) {
    if (paymentMethod === "alipay") {
      platform = "alipay";
      planId = planInfo.alipay_id;
      payType = "H5";
    } else if (paymentMethod === "wechatPay") {
      platform = "yimapay";
      planId = planInfo.yimapay_id;
      payType = "WeChatH5";
    }
  } else {
    if (paymentMethod === "alipay") {
      platform = "alipay";
      planId = planInfo.alipay_id;
    } else if (paymentMethod === "wechatPay") {
      platform = "weixin";
      planId = planInfo.weixin_id;
    }
  }

  return { platform, planId, payType };
}

export function buildFallbackParams(
  paymentMethod: PaymentMethod,
  planInfo: PlanInfoDetail,
  usePayWithH5: boolean
): PaymentParams {
  let platform = "";
  let planId = "";
  let payType: string | undefined;

  if (usePayWithH5) {
    // H5 失败,降级为二维码
    if (paymentMethod === "alipay") {
      platform = "alipay";
      planId = planInfo.alipay_id;
    } else if (paymentMethod === "wechatPay") {
      platform = "weixin";
      planId = planInfo.weixin_id;
    }
  } else {
    // 二维码失败,降级为 yimapay
    platform = "yimapay";
    planId = planInfo.yimapay_id;
    payType = YmPayQrcode[paymentMethod];
  }

  return { platform, planId, payType };
}
