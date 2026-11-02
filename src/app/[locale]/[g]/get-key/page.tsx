"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { KeyIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import styles from "@/components/design-a/flow.module.css";
import { useRouter } from "@/i18n/routing";
import QQGroupLink from "@/components/QQGroupLink";

export default function GetKey() {
  const t = useTranslations("GetKey");
  const [inputOrderId, setInputOrderId] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    const orderId = inputOrderId.trim();
    if (!orderId) return;
    router.push(`/projects?order_id=${encodeURIComponent(orderId)}`);
  };

  return (
    <div className={styles.center}>
      <section className={styles.formCard}>
        <div className={styles.formIcon}>
          <KeyIcon />
        </div>
        <h1 className={styles.title}>{t("title")}</h1>
        <p className={styles.description}>{t.rich("orderId", { br: () => <br /> })}</p>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div>
            <label htmlFor="key" className={styles.label}>
              {t("inputPlaceholder")}
            </label>
            <input
              id="key"
              name="key"
              type="text"
              autoComplete="off"
              required
              onChange={e => setInputOrderId(e.target.value)}
              className={styles.input}
            />
          </div>
          <button type="submit" className={styles.primary}>
            {t("getKey")}
            <ArrowRightIcon />
          </button>
        </form>
        <div className={styles.formFooter}>
          <QQGroupLink text={t("haveQuestion")} />
        </div>
      </section>
    </div>
  );
}
