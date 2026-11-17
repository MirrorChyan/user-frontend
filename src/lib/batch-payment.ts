import type { PlanInfoDetail } from "@/app/[locale]/[g]/checkout/Checkout";
import { CLIENT_BACKEND } from "@/app/requests/misc";
import { buildPaymentParams, type ApiPaymentMethod } from "@/lib/utils/payment";

export const MAX_ORDER_AMOUNT = 2_147_483_647;

export interface BatchPayment {
  custom_order_id: string;
  amount: number;
  buy_count: number;
  title: string;
  pay_url?: string;
  html?: string;
  payOnNewPage: boolean;
  paymentMethod: ApiPaymentMethod;
}

export function parseBuyCount(value: string): number | undefined {
  if (!/^\d+$/.test(value)) return undefined;
  const count = Number(value);
  return Number.isSafeInteger(count) && count >= 2 ? count : undefined;
}

export async function createBatchPayment({
  planInfo,
  paymentMethod,
  canTryH5,
  buyCount,
  source,
}: {
  planInfo: PlanInfoDetail;
  paymentMethod: ApiPaymentMethod;
  canTryH5: boolean;
  buyCount: number;
  source: string;
}): Promise<BatchPayment> {
  if (parseBuyCount(String(buyCount)) === undefined) throw new Error("invalidQuantity");
  const { platform, planId, payType, payOnNewPage } = buildPaymentParams(
    paymentMethod,
    planInfo,
    canTryH5
  );
  if (!planId) throw new Error("paymentUnavailable");
  const params = new URLSearchParams({
    plan_id: planId,
    buy_count: String(buyCount),
    source,
  });
  if (payType) params.set("pay", payType);
  const response = await fetch(`${CLIENT_BACKEND}/api/billing/order/${platform}/create?${params}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(30_000),
  });
  const body = await response.json();
  if (
    !response.ok ||
    (body.ec !== undefined ? body.ec !== 200 : body.code !== 0) ||
    (body.code !== undefined && body.code !== 0)
  ) {
    throw new Error("createFailed");
  }
  const data = body.data;
  // An older backend silently ignores buy_count. Never offer its single-card payment to a bulk buyer.
  if (
    !data ||
    data.buy_count !== buyCount ||
    !Number.isSafeInteger(data.amount) ||
    data.amount <= 0 ||
    data.amount > MAX_ORDER_AMOUNT ||
    typeof data.custom_order_id !== "string" ||
    !data.custom_order_id ||
    (typeof data.pay_url !== "string" && typeof data.html !== "string") ||
    !(data.pay_url || data.html)
  ) {
    throw new Error("batchUnavailable");
  }
  return {
    custom_order_id: data.custom_order_id,
    amount: data.amount,
    buy_count: data.buy_count,
    title: typeof data.title === "string" ? data.title : planInfo.title,
    pay_url: data.pay_url,
    html: data.html,
    payOnNewPage,
    paymentMethod,
  };
}
