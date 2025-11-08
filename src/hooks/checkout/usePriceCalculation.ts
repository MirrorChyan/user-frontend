import { useMemo } from "react";
import { PlanInfoDetail } from "@/app/[locale]/checkout/Checkout";

interface UsePriceCalculationProps {
  planInfo: PlanInfoDetail | undefined;
  rate: number;
}

interface PriceCalculationResult {
  finalPrice: string;
  originPrice: string;
  currentPrice: string;
  hasDiscount: boolean;
}

export function usePriceCalculation({
  planInfo,
  rate,
}: UsePriceCalculationProps): PriceCalculationResult {
  return useMemo(() => {
    if (!planInfo) {
      return {
        finalPrice: "0.00",
        originPrice: "0.00",
        currentPrice: "0.00",
        hasDiscount: false,
      };
    }

    const hasDiscount = planInfo.checkout_price !== planInfo.price;
    const finalPrice = (
      +((hasDiscount ? planInfo.price : planInfo.checkout_price) ?? 0) * rate
    ).toFixed(2);
    const originPrice = (+(planInfo.checkout_price ?? 0) * rate).toFixed(2);
    const currentPrice = (+(planInfo.price ?? 0) * rate).toFixed(2);

    return {
      finalPrice,
      originPrice,
      currentPrice,
      hasDiscount,
    };
  }, [planInfo, rate]);
}
