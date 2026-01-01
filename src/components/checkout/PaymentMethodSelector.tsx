import { CreditCard } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { PlanInfoDetail } from "@/app/[locale]/checkout/Checkout";
import PaymentOption from "./PaymentOption";
import PaymentIcon from "./PaymentIcon";

type PaymentMethod = "alipay" | "wechatPay" | "afdian";

interface PaymentMethodSelectorProps {
  planInfo: PlanInfoDetail;
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
}

export default function PaymentMethodSelector({
  planInfo,
  value,
  onChange,
}: PaymentMethodSelectorProps) {
  const t = useTranslations("Checkout");
  const locale = useLocale();
  return (
    <div className="p-6">
      <h3 className="mb-4 flex items-center text-xl font-semibold text-gray-900 dark:text-white">
        <CreditCard className="mr-2 h-5 w-5 text-indigo-600" />
        {t("paymentMethod")}
      </h3>

      <div className="space-y-4">
        {planInfo.alipay_id && (
          <PaymentOption
            checked={value === "alipay"}
            onClick={() => onChange("alipay")}
            name={t("alipay")}
            recommend={true}
            mobilePay={true}
          >
            <PaymentIcon type="alipay" className="mr-3 h-10 w-10" />
          </PaymentOption>
        )}

        {planInfo.weixin_id && (
          <PaymentOption
            checked={value === "wechatPay"}
            onClick={() => onChange("wechatPay")}
            name={t("wechatPay")}
            recommend={false}
            mobilePay={true}
          >
            <PaymentIcon type="wechat" className="mr-3 h-10 w-10" />
          </PaymentOption>
        )}

        {/* TODO: 爱发电支付暂时禁用
        {planInfo.afdian_info && (
          <PaymentOption
            checked={value === "afdian"}
            onClick={() => onChange("afdian")}
            name={t("afdian")}
          >
            <PaymentIcon type="afdian" className="mr-3 h-10 w-10" />
          </PaymentOption>
        )}
        */}
      </div>
    </div>
  );
}
