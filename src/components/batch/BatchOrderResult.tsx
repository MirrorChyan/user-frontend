"use client";

import { useFormatter, useTranslations } from "next-intl";
import { CheckCircle2, Copy, Download, KeyRound } from "lucide-react";
import { addToast } from "@heroui/toast";
import type { BatchOrderInfo } from "@/lib/batch-order";
import { copyText } from "@/lib/utils/clipboard";
import { formatExpiry, isPast } from "@/lib/utils/date";
import BatchAttribution from "@/components/batch/BatchAttribution";
import styles from "@/components/design-a/flow.module.css";
import batchStyles from "./batch-order.module.css";

interface BatchOrderResultProps {
  orderInfo: BatchOrderInfo;
  orderId: string;
}

export default function BatchOrderResult({ orderInfo, orderId }: BatchOrderResultProps) {
  const t = useTranslations("BatchOrder");
  const planT = useTranslations("GetStart");
  const format = useFormatter();
  const { cdks, buy_count: buyCount, expired_at: expiredAt } = orderInfo;
  const title = orderInfo.plan?.title;
  const planTitle = title
    ? planT.has(`planTitle.${title}`)
      ? planT(`planTitle.${title}`)
      : title
    : t("planFallback");
  const hasExpiry = !!expiredAt && !Number.isNaN(new Date(expiredAt).getTime());
  const expiry = hasExpiry ? formatExpiry(format, expiredAt) : t("expiryUnknown");
  const expired = hasExpiry && isPast(expiredAt);
  const keys = cdks.join("\n");
  const partial = cdks.length < buyCount;

  const handleCopy = async () => {
    const copied = await copyText(keys);
    addToast({
      color: copied ? "success" : "warning",
      description: t(copied ? "copySuccess" : "copyFailed"),
    });
  };

  const handleDownload = () => {
    const text = [
      t("exportTitle"),
      `${t("orderId")}: ${orderId}`,
      `${t("plan")}: ${planTitle}`,
      `${t("quantity")}: ${buyCount}`,
      `${t("available")}: ${cdks.length}`,
      `${t("expires")}: ${expiry}`,
      "",
      t("keepOrderPrivate"),
      "",
      keys,
      "",
    ].join("\r\n");
    const url = URL.createObjectURL(
      new Blob(["\ufeff", text], { type: "text/plain;charset=utf-8" })
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `mirrorchyan-${orderId.replace(/[^a-zA-Z0-9_-]/g, "_")}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1_000);
  };

  return (
    <div className={batchStyles.result}>
      <section
        className={`${styles.card} ${batchStyles.summary}`}
        aria-labelledby="batch-result-title"
      >
        <div className={batchStyles.heading}>
          <CheckCircle2 className={batchStyles.successIcon} aria-hidden="true" />
          <div>
            <h1 className={styles.title} id="batch-result-title">
              {t("resultTitle")}
            </h1>
            <p className={styles.description}>{t("resultDescription", { count: cdks.length })}</p>
          </div>
        </div>
        <dl className={batchStyles.details}>
          <div>
            <dt>{t("plan")}</dt>
            <dd>{planTitle}</dd>
          </div>
          <div>
            <dt>{t("quantity")}</dt>
            <dd>{t("cardCount", { count: buyCount })}</dd>
          </div>
          {orderInfo.amount !== undefined && (
            <div>
              <dt>{t("paid")}</dt>
              <dd>
                {format.number(orderInfo.amount / 100, { style: "currency", currency: "CNY" })}
              </dd>
            </div>
          )}
          <div>
            <dt>{t("expires")}</dt>
            <dd>{expiry}</dd>
          </div>
          <div className={batchStyles.orderId}>
            <dt>{t("orderId")}</dt>
            <dd>{orderId}</dd>
          </div>
        </dl>
        <p className={batchStyles.note}>{t("keepOrderPrivate")}</p>
        {partial && (
          <p className={batchStyles.warning} role="status">
            {t("partial", { count: cdks.length, total: buyCount })}
          </p>
        )}
        {expired && <p className={batchStyles.warning}>{t("expired")}</p>}
      </section>

      <BatchAttribution key={orderId} cdks={cdks} expiredAt={expiredAt} />

      <section
        className={`${styles.card} ${batchStyles.summary}`}
        aria-labelledby="batch-keys-title"
      >
        <h2 id="batch-keys-title" className={batchStyles.keysTitle}>
          <KeyRound size={20} aria-hidden="true" />
          {t("keysTitle")}
        </h2>
        <p className={styles.description}>{t("keysDescription")}</p>
        <div className={batchStyles.actions}>
          <button type="button" className={styles.primary} onClick={handleCopy}>
            <Copy aria-hidden="true" />
            {t("copyAll")}
          </button>
          <button type="button" className={styles.secondary} onClick={handleDownload}>
            <Download aria-hidden="true" />
            {t("download")}
          </button>
        </div>
        <label className={batchStyles.keyLabel} htmlFor="batch-cdk-list">
          {t("keyList", { count: cdks.length })}
        </label>
        <textarea
          id="batch-cdk-list"
          className={`${styles.input} ${batchStyles.keys}`}
          readOnly
          spellCheck={false}
          autoComplete="off"
          rows={Math.min(10, Math.max(3, cdks.length))}
          value={keys}
        />
      </section>
    </div>
  );
}
