"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { ArrowLeft } from "lucide-react";
import { isMobile } from "react-device-detect";
import { isInAppBrowser, shouldUseQRCodePayment } from "@/lib/utils/browserDetection";
import NoOrder from "@/app/[locale]/checkout/NoOrder";
import RenewalCdkInput, { RenewalCdkInputRef } from "@/components/checkout/RenewalCdkInput";
import OrderSummaryCard from "@/components/checkout/OrderSummaryCard";
import PaymentMethodSelector from "@/components/checkout/PaymentMethodSelector";
import PaymentButton from "@/components/checkout/PaymentButton";
import SecurityFooter from "@/components/checkout/SecurityFooter";
import PaymentModalsContainer from "@/components/checkout/PaymentModalsContainer";
import InAppBrowserWarningModal from "@/components/checkout/InAppBrowserWarningModal";
import Spinner from "@/components/checkout/Spinner";
import { usePlanInfo } from "@/hooks/checkout/usePlanInfo";
import { usePriceCalculation } from "@/hooks/checkout/usePriceCalculation";
import { useOrderPolling } from "@/hooks/checkout/useOrderPolling";
import { usePaymentCreation } from "@/hooks/checkout/usePaymentCreation";
import { getDefaultPaymentMethod, PaymentMethod } from "@/lib/utils/payment";

export interface CheckoutProps {
  planId: Array<string>;
  rate: number;
}

export interface PlanInfoDetail {
  title: string;
  price: string;
  original_price: string;
  checkout_price: string;
  popular: boolean;
  afdian_info: {
    plan_id: string;
    sku_id: string;
  };
  weixin_id: string;
  alipay_id: string;
}

type ShowedType = "none" | PaymentMethod;

export default function Checkout(params: CheckoutProps) {
  const t = useTranslations("Checkout");
  const router = useRouter();

  const planId = params.planId[0];
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("alipay");
  const [showModal, setShowModal] = useState<ShowedType>("none");
  const [paymentUrl, setPaymentUrl] = useState<string>("");
  const [paymentHtml, setPaymentHtml] = useState<string>("");
  const [customOrderId, setCustomOrderId] = useState<string>();
  const [renewCdk, setRenewCdk] = useState("");
  const [showInAppWarning, setShowInAppWarning] = useState(false);

  // 判断是否使用H5支付
  const usePayWithH5 = shouldUseQRCodePayment() ? false : isMobile;

  const renewalCdkInputRef = useRef<RenewalCdkInputRef>(null);

  const { planInfo, loading: planInfoLoading, hasError } = usePlanInfo({ planId });
  const priceInfo = usePriceCalculation({ planInfo, rate: params.rate });
  const { orderInfo, isPolling } = useOrderPolling({ customOrderId, renewCdk });
  const { createPayment, loading: paymentLoading } = usePaymentCreation({
    planInfo,
    paymentMethod,
    usePayWithH5,
    renewCdk,
  });

  // 当 planInfo 加载完成后，设置默认支付方式
  useEffect(() => {
    if (planInfo) {
      setPaymentMethod(getDefaultPaymentMethod(planInfo));
    }
  }, [planInfo]);

  // 爱发电支付处理
  const handleAfdianPayment = () => {
    if (!planInfo) return;

    const customOrderId = Date.now() + Math.random().toString(36).slice(2);
    const base = "https://ifdian.net/order/create?product_type=1";
    const planId = planInfo.afdian_info.plan_id;
    const skuId = planInfo.afdian_info.sku_id;
    const url =
      base +
      `&plan_id=${planId}&sku=%5B%7B%22sku_id%22%3A%22${skuId}%22%2C%22count%22%3A1%7D%5D&viokrz_ex=0&custom_order_id=${customOrderId}`;
    window.open(url, "_blank");

    setShowModal(paymentMethod);
    setCustomOrderId(customOrderId);
  };

  // 支付处理
  const handlePayment = async () => {
    // 验证续费CDK
    const isValidCdk = await renewalCdkInputRef.current?.validate();
    if (isValidCdk === false) {
      return;
    }

    // 在移动端的 App 内浏览器中使用支付宝时，弹出警告提示
    if (isMobile && isInAppBrowser() && paymentMethod === "alipay") {
      setShowInAppWarning(true);
      return;
    }

    if (paymentMethod === "afdian") {
      handleAfdianPayment();
      return;
    }

    const result = await createPayment();
    if (!result.success || !result.data) {
      return;
    }

    const orderInfo = result.data;

    // 如果是移动端H5支付且有支付链接，自动打开
    if (result.shouldOpenLink && orderInfo.pay_url) {
      window.open(orderInfo.pay_url, "_blank");
    }

    // 设置支付URL或HTML
    if (orderInfo.pay_url) {
      setPaymentUrl(orderInfo.pay_url);
    } else {
      setPaymentHtml(orderInfo.html || "");
    }

    setCustomOrderId(orderInfo.custom_order_id);
    setShowModal(paymentMethod);
  };

  const handleCloseModal = () => {
    setShowModal("none");
  };

  const handleSwitchToWechat = () => {
    setPaymentMethod("wechatPay");
  };

  // 参数校验
  if (!params.planId || params.planId.length > 1 || hasError) {
    return <NoOrder />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="mx-auto max-w-4xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        {/* 返回按钮 */}
        <div className="mb-8">
          <button
            onClick={() => router.replace("/")}
            className="flex items-center text-gray-600 transition-colors hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span>{t("backToPlans")}</span>
          </button>
        </div>

        {/* 标题 */}
        <h1 className="mb-1 text-center text-3xl font-bold text-gray-900 dark:text-white">
          {t("checkoutTitle")}
        </h1>
        <p className="mb-8 text-center text-gray-500 dark:text-gray-400">
          {t("completeYourOrder")}
        </p>

        {/* 加载状态 */}
        {planInfoLoading ? (
          <div className="flex items-center justify-center py-32">
            <div className="flex flex-col items-center">
              <Spinner size="lg" className="mb-4 text-indigo-600" />
              <p className="text-lg text-gray-600 dark:text-gray-300">{t("loadingPlanInfo")}</p>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-2xl">
            {/* 主内容卡片 */}
            <div className="mb-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
              {/* 订单摘要 */}
              {planInfo && (
                <OrderSummaryCard
                  planInfo={planInfo}
                  paymentMethod={paymentMethod}
                  priceInfo={priceInfo}
                />
              )}

              {/* 续期CDK输入 */}
              <RenewalCdkInput ref={renewalCdkInputRef} value={renewCdk} onChange={setRenewCdk} />

              {/* 支付方式选择 */}
              {planInfo && (
                <PaymentMethodSelector
                  planInfo={planInfo}
                  value={paymentMethod}
                  onChange={setPaymentMethod}
                />
              )}
            </div>

            {/* 支付按钮和安全提示,神秘小样式 */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <PaymentButton onClick={handlePayment} loading={paymentLoading} />
              <SecurityFooter />
            </div>
          </div>
        )}

        {/* 支付弹窗 */}
        <PaymentModalsContainer
          showModal={showModal}
          paymentUrl={paymentUrl}
          paymentHtml={paymentHtml}
          planInfo={planInfo}
          rate={params.rate}
          orderInfo={orderInfo}
          isPolling={isPolling}
          usePayWithH5={usePayWithH5}
          onClose={handleCloseModal}
        />

        {/* App内浏览器警告弹窗 */}
        <InAppBrowserWarningModal
          open={showInAppWarning}
          onClose={() => setShowInAppWarning(false)}
          onSwitchToWechat={planInfo?.weixin_id ? handleSwitchToWechat : undefined}
        />
      </div>
    </div>
  );
}
