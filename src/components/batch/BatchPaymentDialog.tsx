"use client";

import { useLocale, useTranslations } from "next-intl";
import AppDialog from "@/components/AppDialog";
import QRCodeImage from "@/components/checkout/QRCodeImage";
import HtmlFormPayPage from "@/components/checkout/HtmlFormPayPage";
import PaymentIcon from "@/components/checkout/PaymentIcon";
import styles from "@/components/design-a/flow.module.css";
import type { BatchPayment } from "@/lib/batch-payment";

export default function BatchPaymentDialog({
  payment,
  children,
  onClose,
}: {
  payment: BatchPayment;
  children: React.ReactNode;
  onClose: () => void;
}) {
  const t = useTranslations("BatchPurchase");
  const checkoutT = useTranslations("Checkout");
  const locale = useLocale();
  const amount = new Intl.NumberFormat(locale, { style: "currency", currency: "CNY" }).format(
    payment.amount / 100
  );
  return (
    <AppDialog open title={checkoutT(payment.paymentMethod)} onClose={onClose}>
      <p className="text-center text-sm text-gray-500">
        {t("paymentSummary", { count: payment.buy_count })}
      </p>
      <p className="my-3 text-center text-3xl font-semibold">{amount}</p>
      <p className="mb-6 text-center text-sm text-gray-500">{t("chargedInCny")}</p>
      {payment.payOnNewPage && payment.pay_url ? (
        <a
          href={payment.pay_url}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.primary}
        >
          {checkoutT("openPaymentPage")}
        </a>
      ) : payment.pay_url ? (
        <div className="mx-auto rounded-xl bg-white p-3">
          <QRCodeImage
            value={payment.pay_url}
            size={240}
            logo={
              <PaymentIcon
                type={payment.paymentMethod === "wechatPay" ? "wechat" : "alipay"}
                className="h-10 w-10 rounded-lg bg-white"
              />
            }
          />
        </div>
      ) : payment.html ? (
        <HtmlFormPayPage paymentHtml={payment.html} />
      ) : null}
      <div className="mt-5">{children}</div>
      <p className="mt-3 text-center text-xs text-gray-500">{t("closePaymentNote")}</p>
    </AppDialog>
  );
}
