import { useTranslations } from "next-intl";
import QRCodePayModal from "./QRCodePayModal";
import WaitForPayModal from "./WaitForPayModal";
import HtmlFormPayModal from "./HtmlFormPayModal";
import PaymentIcon from "./PaymentIcon";
import { PlanInfoDetail } from "@/app/[locale]/checkout/Checkout";

type ShowedType = "none" | "alipay" | "wechatPay" | "afdian";

interface OrderInfoType {
  cdk?: string;
  expired_at?: string;
  created_at?: string;
  is_renewal?: boolean;
}

interface PaymentModalsContainerProps {
  showModal: ShowedType;
  paymentUrl: string;
  paymentHtml: string;
  planInfo: PlanInfoDetail | undefined;
  rate: number;
  orderInfo: OrderInfoType | undefined;
  isPolling: boolean;
  usePayWithH5: boolean;
  onClose: () => void;
}

export default function PaymentModalsContainer({
  showModal,
  paymentUrl,
  paymentHtml,
  planInfo,
  rate,
  orderInfo,
  isPolling,
  usePayWithH5,
  onClose,
}: PaymentModalsContainerProps) {
  const t = useTranslations("Checkout");
  if (!planInfo) return null;

  return (
    <>
      {!usePayWithH5 && (
        <>
          <HtmlFormPayModal
            qrCodeCircleColor="bg-[#009FE8] border-2 border-[#009FE8]"
            paymentHtml={paymentHtml}
            paymentType={t("alipay")}
            open={paymentHtml !== ""}
            planInfo={planInfo}
            rate={rate}
            orderInfo={orderInfo}
            isPolling={isPolling}
            onClose={onClose}
          />
          <QRCodePayModal
            qrCodeCircleColor="bg-[#009FE8] border-2 border-[#009FE8]"
            qrCodeIcon={<PaymentIcon type="alipay" className="h-10 w-10 rounded-lg bg-white" />}
            paymentUrl={paymentUrl}
            paymentType={t("alipay")}
            open={showModal === "alipay" && paymentUrl !== ""}
            planInfo={planInfo}
            rate={rate}
            orderInfo={orderInfo}
            isPolling={isPolling}
            onClose={onClose}
          />
          <QRCodePayModal
            qrCodeCircleColor="bg-[#15BA11] border-2 border-[#15BA11]"
            qrCodeIcon={<PaymentIcon type="wechat" className="h-10 w-10 rounded-lg bg-white" />}
            paymentUrl={paymentUrl}
            paymentType={t("wechatPay")}
            open={showModal === "wechatPay" && paymentUrl !== ""}
            planInfo={planInfo}
            rate={rate}
            orderInfo={orderInfo}
            isPolling={isPolling}
            onClose={onClose}
          />
        </>
      )}
      {usePayWithH5 && (
        <>
          <WaitForPayModal
            open={showModal === "wechatPay"}
            paymentType={t("wechatPay")}
            isLoading={isPolling}
            orderInfo={orderInfo}
            onClose={onClose}
          />
          <WaitForPayModal
            open={showModal === "alipay"}
            paymentType={t("alipay")}
            isLoading={isPolling}
            orderInfo={orderInfo}
            onClose={onClose}
          />
        </>
      )}
      {planInfo.afdian_info && (
        <WaitForPayModal
          open={showModal === "afdian"}
          paymentType={t("afdianPayment")}
          isLoading={isPolling}
          orderInfo={orderInfo}
          onClose={onClose}
        />
      )}
    </>
  );
}
