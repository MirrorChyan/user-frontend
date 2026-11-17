"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft, Gift, Loader2 } from "lucide-react";
import type { Plan } from "@/app/requests/plan";
import { Link, useSearchParams } from "@/i18n/routing";
import styles from "@/components/design-a/flow.module.css";
import { usePlanInfo } from "@/hooks/checkout/usePlanInfo";
import { useBatchOrderPolling } from "@/hooks/checkout/useBatchOrderPolling";
import PaymentMethodSelector from "@/components/checkout/PaymentMethodSelector";
import SecurityFooter from "@/components/checkout/SecurityFooter";
import InAppBrowserWarningModal from "@/components/checkout/InAppBrowserWarningModal";
import BatchPaymentDialog from "@/components/batch/BatchPaymentDialog";
import BatchOrderResult from "@/components/batch/BatchOrderResult";
import QQGroupLink from "@/components/QQGroupLink";
import { getSource } from "@/components/SourceTracker";
import { track } from "@/lib/analytics";
import {
  createBatchPayment,
  MAX_ORDER_AMOUNT,
  parseBuyCount,
  type BatchPayment,
} from "@/lib/batch-payment";
import type { ApiPaymentMethod } from "@/lib/utils/payment";
import {
  isInAppBrowser,
  isMobileDevice,
  shouldUseQRCodePayment,
} from "@/lib/utils/browserDetection";

function updateOrderUrl(orderId: string) {
  const url = new URL(window.location.href);
  url.searchParams.delete("order_id");
  url.searchParams.set("custom_order_id", orderId);
  window.history.replaceState(null, "", url);
}

function PurchaseForm({
  plans,
  onPayment,
}: {
  plans: Plan[];
  onPayment: (payment: BatchPayment) => void;
}) {
  const t = useTranslations("BatchPurchase");
  const planT = useTranslations("GetStart");
  const locale = useLocale();
  const [planId, setPlanId] = useState(plans[0]?.plan_id ?? "");
  const [quantity, setQuantity] = useState("10");
  const [selectedMethod, setSelectedMethod] = useState<ApiPaymentMethod>();
  const [loading, setLoading] = useState(false);
  const submitting = useRef(false);
  const [error, setError] = useState<string>();
  const [showInAppWarning, setShowInAppWarning] = useState(false);
  const { planInfo, loading: planLoading } = usePlanInfo({ planId });
  const paymentMethod =
    selectedMethod && (selectedMethod === "alipay" ? planInfo?.alipay_id : planInfo?.weixin_id)
      ? selectedMethod
      : planInfo?.alipay_id
        ? "alipay"
        : "wechatPay";
  const buyCount = parseBuyCount(quantity);
  const unitCents = Math.round(Number(planInfo?.price) * 100);
  const totalCents = buyCount ? unitCents * buyCount : 0;
  const validTotal =
    Number.isSafeInteger(totalCents) && totalCents > 0 && totalCents <= MAX_ORDER_AMOUNT;
  const canPay = !!(planInfo?.alipay_id || planInfo?.weixin_id);
  const money = (amount: number) =>
    new Intl.NumberFormat(locale, { style: "currency", currency: "CNY" }).format(amount / 100);
  const planTitle = (title: string) =>
    planT.has(`planTitle.${title}`) ? planT(`planTitle.${title}`) : title;

  const handlePayment = async () => {
    if (submitting.current || !planInfo || !buyCount || !validTotal || !canPay) return;
    if (isMobileDevice() && isInAppBrowser() && paymentMethod === "alipay") {
      setShowInAppWarning(true);
      return;
    }
    submitting.current = true;
    setLoading(true);
    setError(undefined);
    try {
      const payment = await createBatchPayment({
        planInfo,
        paymentMethod,
        canTryH5: isMobileDevice() && !shouldUseQRCodePayment(),
        buyCount,
        source: getSource(),
      });
      track("order_create", {
        plan_id: planId,
        pay: paymentMethod,
        renew: false,
        buy_count: buyCount,
      });
      onPayment(payment);
      // The dialog retains the link if the browser blocks this new tab.
      if (payment.payOnNewPage && payment.pay_url)
        window.open(payment.pay_url, "_blank", "noopener,noreferrer");
    } catch (failure) {
      const key = failure instanceof Error ? failure.message : "createFailed";
      setError(t.has(key) ? key : "createFailed");
    } finally {
      submitting.current = false;
      setLoading(false);
    }
  };

  if (!plans.length) {
    return (
      <div className={`${styles.card} p-7`}>
        <p role="alert">{t("plansUnavailable")}</p>
        <button className={`${styles.secondary} mt-5`} onClick={() => window.location.reload()}>
          {t("retry")}
        </button>
      </div>
    );
  }

  return (
    <>
      <div className={styles.checkoutGrid}>
        <fieldset disabled={loading} className={`${styles.card} min-w-0 p-6 sm:p-7`}>
          <legend className="sr-only">{t("purchaseDetails")}</legend>
          <label htmlFor="batch-plan" className={styles.label}>
            {t("plan")}
          </label>
          <select
            id="batch-plan"
            className={styles.input}
            value={planId}
            onChange={event => {
              setPlanId(event.target.value);
              setError(undefined);
            }}
          >
            {plans.map(plan => (
              <option value={plan.plan_id} key={plan.plan_id}>
                {planTitle(plan.title)}
              </option>
            ))}
          </select>
          <label htmlFor="batch-quantity" className={`${styles.label} mt-7`}>
            {t("quantity")}
          </label>
          <input
            id="batch-quantity"
            type="number"
            inputMode="numeric"
            min={2}
            max={
              Number.isFinite(unitCents) && unitCents > 0
                ? Math.floor(MAX_ORDER_AMOUNT / unitCents)
                : undefined
            }
            step={1}
            value={quantity}
            onChange={event => {
              setQuantity(event.target.value);
              setError(undefined);
            }}
            className={styles.input}
            aria-describedby="batch-quantity-note"
            aria-invalid={!buyCount || (!!planInfo && !validTotal)}
          />
          <p id="batch-quantity-note" className="mt-2 text-sm text-gray-500">
            {!buyCount
              ? t("invalidQuantity")
              : planInfo && !validTotal
                ? t("amountTooLarge")
                : t("independentKeys")}
          </p>
          <div className="mt-7 border-t border-gray-200 pt-5 dark:border-gray-700">
            {planLoading ? (
              <p className="flex items-center gap-2 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("loadingPlan")}
              </p>
            ) : planInfo ? (
              <dl className="space-y-3">
                <div className="flex justify-between gap-4 text-sm">
                  <dt>{t("unitPrice")}</dt>
                  <dd>{money(unitCents)}</dd>
                </div>
                <div className="flex justify-between gap-4 text-lg font-semibold">
                  <dt>{t("estimatedTotal")}</dt>
                  <dd>{validTotal ? money(totalCents) : "—"}</dd>
                </div>
              </dl>
            ) : (
              <p role="alert" className="text-sm text-red-600">
                {t("plansUnavailable")}
              </p>
            )}
          </div>
          <p className="mt-6 text-sm leading-7 text-gray-500">{t("expiryNote")}</p>
        </fieldset>
        <div className={styles.card}>
          <fieldset disabled={loading}>
            {planInfo && canPay && (
              <PaymentMethodSelector
                planInfo={planInfo}
                value={paymentMethod}
                onChange={method => {
                  if (!loading && method !== "afdian") setSelectedMethod(method);
                }}
              />
            )}
          </fieldset>
          <div className={styles.section}>
            {!planLoading && planInfo && !canPay && (
              <p role="alert" className="mb-4 text-sm text-red-600">
                {t("paymentUnavailable")}
              </p>
            )}
            {error && (
              <p role="alert" className="mb-4 text-sm leading-6 text-red-600">
                {t(error)}
              </p>
            )}
            <button
              type="button"
              className={`${styles.primary} w-full`}
              disabled={loading || planLoading || !planInfo || !buyCount || !validTotal || !canPay}
              onClick={handlePayment}
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? t("creating") : t("pay", { count: buyCount ?? 0 })}
            </button>
            <p className="mt-4 text-center text-xs leading-6 text-gray-500">
              {t("attributionAfterPayment")}
            </p>
            <SecurityFooter />
          </div>
        </div>
      </div>
      <InAppBrowserWarningModal
        open={showInAppWarning}
        onClose={() => setShowInAppWarning(false)}
        onSwitchToWechat={planInfo?.weixin_id ? () => setSelectedMethod("wechatPay") : undefined}
      />
    </>
  );
}

function BatchOrderView({
  orderId,
  queryKey,
  payment,
}: {
  orderId: string;
  queryKey: "order_id" | "custom_order_id";
  payment?: BatchPayment;
}) {
  const t = useTranslations("BatchPurchase");
  const orderT = useTranslations("BatchOrder");
  const [paymentOpen, setPaymentOpen] = useState(!!payment);
  const { orderInfo, status, error, retry, refreshPayment } = useBatchOrderPolling({
    orderId,
    queryKey,
    expectedBuyCount: payment?.buy_count,
  });
  const reportedPaid = useRef(false);
  useEffect(() => {
    if (!orderInfo || !payment || reportedPaid.current) return;
    reportedPaid.current = true;
    track("pay_success", {
      amount: payment.amount / 100,
      pay: payment.paymentMethod,
      renew: false,
      buy_count: payment.buy_count,
    });
  }, [orderInfo, payment]);
  const waiting = status === "loading" || status === "unpaid" || status === "issuing";
  const statusPanel = (
    <div aria-live="polite" className="space-y-3">
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        {waiting && <Loader2 className="h-5 w-5 shrink-0 animate-spin" />}
        {orderT(`statusTitle.${status}`)}
      </h2>
      <p className="text-sm leading-7 text-gray-500">{orderT(`statusDescription.${status}`)}</p>
      {error && <p className="text-sm text-red-600">{orderT(error)}</p>}
      {status === "unpaid" && (
        <button className={styles.secondary} onClick={refreshPayment}>
          {t("alreadyPaid")}
        </button>
      )}
      {!waiting && (
        <button className={styles.secondary} onClick={retry}>
          {t("retryQuery")}
        </button>
      )}
    </div>
  );

  if (orderInfo) return <BatchOrderResult orderInfo={orderInfo} orderId={orderId} />;
  return (
    <>
      <div className={`${styles.card} space-y-6 p-6 sm:p-8`}>
        {statusPanel}
        <div className="border-t border-gray-200 pt-5 dark:border-gray-700">
          <p className="mb-2 text-sm text-gray-500">{t("orderReference")}</p>
          <p className="font-mono text-sm break-all select-all">{orderId}</p>
          <p className="mt-3 text-sm leading-7 text-gray-500">{t("keepOrderReference")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {payment && (status === "loading" || status === "unpaid") && (
            <button className={styles.primary} onClick={() => setPaymentOpen(true)}>
              {t("showPayment")}
            </button>
          )}
          <QQGroupLink text={t("contactSupport")} />
        </div>
      </div>
      {payment && paymentOpen && (status === "loading" || status === "unpaid") && (
        <BatchPaymentDialog payment={payment} onClose={() => setPaymentOpen(false)}>
          {statusPanel}
        </BatchPaymentDialog>
      )}
    </>
  );
}

export default function BatchPurchase({ plans }: { plans: Plan[] }) {
  const t = useTranslations("BatchPurchase");
  const searchParams = useSearchParams();
  const [payment, setPayment] = useState<BatchPayment>();
  const customOrderId = searchParams.get("custom_order_id");
  const orderId = customOrderId || searchParams.get("order_id") || undefined;
  return (
    <div>
      <Link
        href="/get-start"
        className="mb-8 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("backToPlans")}
      </Link>
      <div className="mb-8">
        <h1 className={`${styles.title} flex items-center gap-3`}>
          <Gift className="h-6 w-6 shrink-0 text-indigo-500" />
          {t("title")}
        </h1>
        <p className={styles.description}>{t("description")}</p>
      </div>
      {orderId ? (
        <BatchOrderView
          key={orderId}
          orderId={orderId}
          queryKey={customOrderId ? "custom_order_id" : "order_id"}
          payment={payment?.custom_order_id === orderId ? payment : undefined}
        />
      ) : (
        <PurchaseForm
          plans={plans}
          onPayment={created => {
            setPayment(created);
            updateOrderUrl(created.custom_order_id);
          }}
        />
      )}
      <p className="mt-7 text-center text-sm">
        <Link href="/get-key" className="text-indigo-600 hover:underline dark:text-indigo-400">
          {t("queryExistingOrder")}
        </Link>
      </p>
    </div>
  );
}
