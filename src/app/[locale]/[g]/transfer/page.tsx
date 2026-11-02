"use client";

import { useFormatter, useTranslations } from "next-intl";
import { ChangeEvent, useRef, useState } from "react";
import { Button, Input } from "@heroui/react";
import { ArrowsRightLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import styles from "@/components/design-a/flow.module.css";

import { useRouter } from "@/i18n/routing";
import { CLIENT_BACKEND } from "@/app/requests/misc";
import { DAY_MS, formatExpiry, isPast } from "@/lib/utils/date";

// 输入停止后延迟多久校验 CDK
const CHECK_DELAY = 2000;

async function queryOrder(cdk: string) {
  const params = new URLSearchParams({ cdk });
  const response = await fetch(`${CLIENT_BACKEND}/api/billing/order/query?${params}`);
  return response.json();
}

export default function Transmission() {
  const format = useFormatter();
  const t = useTranslations("Transmission");
  const router = useRouter();

  const [fromCdk, setFromCdk] = useState("");
  const [fromCdkDescription, setFromCdkDescription] = useState("");
  const [fromCdkValid, setFromCdkValid] = useState(false);
  const [fromCdkHasSameError, setFromCdkHasSameError] = useState(false);
  const [toCdk, setToCdk] = useState("");
  const [toCdkDescription, setToCdkDescription] = useState("");
  const [toCdkValid, setToCdkValid] = useState(false);
  const [toCdkHasSameError, setToCdkHasSameError] = useState(false);
  const [showOrderId, setShowOrderId] = useState("");
  const [transfering, setTransfering] = useState(false);

  // 延迟校验时需要读到另一侧输入框的最新值，在输入事件里同步更新
  const fromCdkRef = useRef("");
  const toCdkRef = useRef("");
  // 输入停止一段时间后再发起校验
  const fromCheckTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const toCheckTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  async function handleReward(key: string) {
    const params = new URLSearchParams({ reward_key: key });
    const response = await fetch(`${CLIENT_BACKEND}/api/billing/reward?${params}`);
    const { ec, data } = await response.json();
    // 请求期间输入已改变，丢弃过期结果
    if (key !== fromCdkRef.current) return;
    if (ec === 200) {
      if (data.remaining <= 0) {
        setFromCdkDescription(t("rewardUsedUp"));
        return;
      }
      if (!isPast(data.start_at)) {
        setFromCdkDescription(t("rewardNotStarted"));
        return;
      }
      if (isPast(data.expired_at)) {
        setFromCdkDescription(t("rewardExpired"));
        return;
      }
      const valid_days = data.valid_days;
      setFromCdkDescription(t("rewardValidDays", { valid_days }));
      setFromCdkValid(true);
    } else {
      setFromCdkDescription(t("fromNotFound"));
      setFromCdkValid(false);
    }
  }

  function IsReward(cdk: string) {
    return cdk.length != 24;
  }

  async function requestFromCdk(cdk: string) {
    if (IsReward(cdk)) {
      await handleReward(cdk);
      return;
    }

    if (cdk === toCdkRef.current) {
      setFromCdkDescription(t("sameCdk"));
      setFromCdkValid(false);
      setFromCdkHasSameError(true);
      return;
    }

    const { ec, msg, data } = await queryOrder(cdk);
    if (cdk !== fromCdkRef.current) return;
    if (ec === 200) {
      const expiredAt = new Date(data.expired_at);
      if (isPast(expiredAt)) {
        setFromCdkDescription(t("cdkExpired"));
        return;
      }
      // 创建超过 3 天
      if (isPast(new Date(data.created_at).getTime() + 3 * DAY_MS)) {
        setFromCdkDescription(t("cdkTooOld"));
        return;
      }
      const relativeTime = format.relativeTime(expiredAt, { unit: "day" });
      setFromCdkDescription(`${relativeTime} (${formatExpiry(format, expiredAt)})`);
      setFromCdkValid(true);
    } else {
      setFromCdkDescription(msg);
      setFromCdkValid(false);
    }
  }

  async function requestToCdk(cdk: string) {
    if (IsReward(cdk)) {
      setToCdkDescription(t("rewardFillInLeft"));
      setToCdkValid(false);
      return;
    }

    if (cdk === fromCdkRef.current) {
      setToCdkDescription(t("sameCdk"));
      setToCdkValid(false);
      setToCdkHasSameError(true);
      return;
    }

    const { ec, msg, data } = await queryOrder(cdk);
    if (cdk !== toCdkRef.current) return;
    if (ec === 200) {
      const expiredAt = new Date(data.expired_at);
      if (isPast(expiredAt)) {
        setToCdkDescription(t("cdkExpired"));
      } else {
        const relativeTime = format.relativeTime(expiredAt, { unit: "day" });
        setToCdkDescription(`${relativeTime} (${formatExpiry(format, expiredAt)})`);
      }
      setToCdkValid(true);
      setShowOrderId(data.custom_order_id);
    } else {
      setToCdkDescription(msg);
      setToCdkValid(false);
    }
  }

  // 网络错误或返回非 JSON 时提示重试；请求期间输入已改变则不提示
  async function checkFromCdk(cdk: string) {
    try {
      await requestFromCdk(cdk);
    } catch {
      if (cdk !== fromCdkRef.current) return;
      setFromCdkDescription(t("networkError"));
      setFromCdkValid(false);
    }
  }

  async function checkToCdk(cdk: string) {
    try {
      await requestToCdk(cdk);
    } catch {
      if (cdk !== toCdkRef.current) return;
      setToCdkDescription(t("networkError"));
      setToCdkValid(false);
    }
  }

  function requestFromCdkDebounced(cdk: string) {
    clearTimeout(fromCheckTimerRef.current);
    // 输入清空后不再校验
    if (!cdk) return;
    fromCheckTimerRef.current = setTimeout(() => checkFromCdk(cdk), CHECK_DELAY);
  }

  function requestToCdkDebounced(cdk: string) {
    clearTimeout(toCheckTimerRef.current);
    if (!cdk) return;
    toCheckTimerRef.current = setTimeout(() => checkToCdk(cdk), CHECK_DELAY);
  }

  async function handleFromCdkChange(e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    // 校验和转移都用去掉首尾空白的值，避免粘贴时带上的空格导致误判
    fromCdkRef.current = value.trim();
    setFromCdk(value);
    setFromCdkDescription("");
    setFromCdkValid(false);
    setFromCdkHasSameError(false);
    // 如果目标CDK之前因为"相同CDK"而报错，现在来源改变了需要重新验证
    if (toCdkHasSameError && toCdkRef.current) {
      setToCdkDescription("");
      setToCdkValid(false);
      setToCdkHasSameError(false);
      requestToCdkDebounced(toCdkRef.current);
    }
    requestFromCdkDebounced(fromCdkRef.current);
  }

  async function handleToCdkChange(e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    toCdkRef.current = value.trim();
    setToCdk(value);
    setToCdkDescription("");
    setToCdkValid(false);
    setToCdkHasSameError(false);
    // 如果来源CDK之前因为"相同CDK"而报错，现在目标改变了需要重新验证
    if (fromCdkHasSameError && fromCdkRef.current) {
      setFromCdkDescription("");
      setFromCdkValid(false);
      setFromCdkHasSameError(false);
      requestFromCdkDebounced(fromCdkRef.current);
    }
    requestToCdkDebounced(toCdkRef.current);
  }

  async function handleTransfer() {
    setTransfering(true);
    try {
      const params = new URLSearchParams({ from: fromCdkRef.current, to: toCdkRef.current });
      const response = await fetch(`${CLIENT_BACKEND}/api/billing/order/transfer?${params}`);
      const { ec, msg } = await response.json();
      if (ec === 200) {
        router.replace(`/show-key?order_id=${encodeURIComponent(showOrderId)}`);
      } else {
        alert(msg);
      }
    } catch {
      alert(t("networkError"));
    } finally {
      setTransfering(false);
    }
  }

  return (
    <div className={styles.center}>
      <section className={styles.transferCard}>
        <div className={styles.transferBody}>
          <div className={styles.formIcon}>
            <ArrowsRightLeftIcon />
          </div>
          <h1 className={styles.title}>{t("title")}</h1>
          <p className={styles.description}>{t("description")}</p>
          <div className={styles.transferGrid}>
            <div className={styles.transferField}>
              <div className={styles.label}>
                <span className={styles.step}>1</span>
                {t("fromCdk")}
              </div>
              <Input
                aria-label={t("fromCdk")}
                variant="bordered"
                value={fromCdk}
                onChange={handleFromCdkChange}
                description={fromCdkDescription}
                color={fromCdkValid ? "success" : "default"}
              />
            </div>
            <div className={styles.transferArrow}>
              <span>{t("transferTo")}</span>
              <ArrowRightIcon />
            </div>
            <div className={styles.transferField}>
              <div className={styles.label}>
                <span className={styles.step}>2</span>
                {t("toCdk")}
              </div>
              <Input
                aria-label={t("toCdk")}
                variant="bordered"
                value={toCdk}
                onChange={handleToCdkChange}
                description={toCdkDescription}
                color={toCdkValid ? "success" : "default"}
              />
            </div>
          </div>
          <Button
            onClick={handleTransfer}
            isLoading={transfering}
            isDisabled={!fromCdkValid || !toCdkValid}
            className={styles.primary}
            startContent={!transfering && <ArrowsRightLeftIcon />}
          >
            {t("transfer")}
          </Button>
        </div>
        <div className={styles.note}>{t("transferTip")}</div>
      </section>
    </div>
  );
}
