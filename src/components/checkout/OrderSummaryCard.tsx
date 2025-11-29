import { ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { PlanInfoDetail } from "@/app/[locale]/checkout/Checkout";

interface PriceInfo {
  finalPrice: string;
  originPrice: string;
  currentPrice: string;
  hasDiscount: boolean;
}

interface OrderSummaryCardProps {
  planInfo: PlanInfoDetail;
  paymentMethod: string;
  priceInfo: PriceInfo;
}

export default function OrderSummaryCard({
  planInfo,
  paymentMethod,
  priceInfo,
}: OrderSummaryCardProps) {
  const t = useTranslations("Checkout");
  const gT = useTranslations("GetStart");
  const { finalPrice, originPrice, currentPrice, hasDiscount } = priceInfo;

  return (
    <div className="border-b border-border p-6">
      <h3 className="mb-4 flex items-center text-xl font-semibold text-foreground">
        <ShieldCheck className="mr-2 h-5 w-5 text-primary" />
        {t("orderSummary")}
      </h3>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">{t("productName")}</span>
          <span className="font-medium text-foreground">
            {gT.has?.(`planTitle.${planInfo.title}`)
              ? gT(`planTitle.${planInfo.title}`)
              : planInfo.title}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">
            {t(hasDiscount ? "originalPrice" : "Price")}
          </span>
          <span
            className={
              hasDiscount ? "text-muted-foreground line-through" : "font-medium text-foreground"
            }
          >
            {`${gT("priceSymbol")} ${originPrice}`}
          </span>
        </div>

        {hasDiscount && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{t("discountPrice")}</span>
            <span className="font-medium text-emerald-600 dark:text-emerald-400">
              {`${gT("priceSymbol")} ${currentPrice}`}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">{t("paymentMethod")}</span>
          <span className="font-medium text-foreground">{t(paymentMethod)}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-foreground">{t("totalAmount")}</span>
          <span className="text-xl font-bold text-primary">
            {gT("priceSymbol")} {finalPrice}
          </span>
        </div>
      </div>
    </div>
  );
}
