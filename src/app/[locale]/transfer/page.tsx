"use client";

import { useFormatter, useTranslations } from "next-intl";
import { ChangeEvent, useCallback, useState } from "react";
import { Button, Input } from "@heroui/react";
import { debounce } from "lodash";
import moment from "moment";
import { motion } from "framer-motion";

import { useRouter } from "@/i18n/routing";
import { CLIENT_BACKEND } from "@/app/requests/misc";
import HomeButton from "@/components/HomeButton";
import { BackgroundBeamsWithCollision } from "@/components/BackgroundBeamsWithCollision";

export default function Transmission() {
  const format = useFormatter();
  const t = useTranslations("Transmission");
  const router = useRouter();

  const [fromCdk, setFromCdk] = useState("");
  const [fromCdkDescription, setFromCdkDescription] = useState("");
  const [fromCdkValid, setFromCdkValid] = useState(false);
  const [toCdk, setToCdk] = useState("");
  const [toCdkDescription, setToCdkDescription] = useState("");
  const [toCdkValid, setToCdkValid] = useState(false);
  const [showOrderId, setShowOrderId] = useState("");
  const [transfering, setTransfering] = useState(false);

  async function handleReward(key: string) {
    const response = await fetch(`${CLIENT_BACKEND}/api/billing/reward?reward_key=${key}`);
    const { ec, msg, data } = await response.json();
    if (ec === 200) {
      if (data.remaining <= 0) {
        setFromCdkDescription(t("rewardUsedUp"));
        return;
      }
      const startAt = moment(data.start_at);
      const expiredAt = moment(data.expired_at);
      if (startAt.isAfter(moment())) {
        setFromCdkDescription(t("rewardNotStarted"));
        return;
      }
      if (expiredAt.isBefore(moment())) {
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

    const response = await fetch(`${CLIENT_BACKEND}/api/billing/order/query?cdk=${cdk}`);
    const { ec, msg, data } = await response.json();
    if (ec === 200) {
      const expiredAt = moment(data.expired_at);
      const createdAt = moment(data.created_at);
      if (expiredAt.isBefore(moment())) {
        setFromCdkDescription(t("cdkExpired"));
        return;
      }
      if (createdAt.isBefore(moment().subtract(3, "day"))) {
        setFromCdkDescription(t("cdkTooOld"));
        return;
      }
      const relativeTime = format.relativeTime(expiredAt.toDate(), { unit: "day" });
      setFromCdkDescription(`${relativeTime} (${timeFormat(expiredAt.toDate())})`);
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

    const response = await fetch(`${CLIENT_BACKEND}/api/billing/order/query?cdk=${cdk}`);
    const { ec, msg, data } = await response.json();
    if (ec === 200) {
      const expiredAt = moment(data.expired_at);
      if (expiredAt.isBefore(moment())) {
        setToCdkDescription(t("cdkExpired"));
      } else {
        const relativeTime = format.relativeTime(expiredAt.toDate(), { unit: "day" });
        setToCdkDescription(`${relativeTime} (${timeFormat(expiredAt.toDate())})`);
      }
      setToCdkValid(true);
      setShowOrderId(data.custom_order_id);
    } else {
      setToCdkDescription(msg);
      setToCdkValid(false);
    }
  }

  const requestFromCdkDebounced = useCallback(debounce(requestFromCdk, 2000), []);
  const requestToCdkDebounced = useCallback(debounce(requestToCdk, 2000), []);

  async function handleFromCdkChange(e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setFromCdk(value);
    setFromCdkDescription("");
    setFromCdkValid(false);
    requestFromCdkDebounced(value);
  }

  async function handleToCdkChange(e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setToCdk(value);
    setToCdkDescription("");
    setToCdkValid(false);
    requestToCdkDebounced(value);
  }

  async function handleTransfer() {
    setTransfering(true);
    const response = await fetch(
      `${CLIENT_BACKEND}/api/billing/order/transfer?from=${fromCdk}&to=${toCdk}`
    );
    const { ec, msg } = await response.json();
    if (ec === 200) {
      router.replace(`/show-key?order_id=${showOrderId}`);
    } else {
      alert(msg);
    }
    setTransfering(false);
  }

  function timeFormat(time: Date) {
    return format.dateTime(time, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  }

  return (
    <BackgroundBeamsWithCollision className="min-h-screen">
      <div className="relative flex min-h-screen w-full flex-col items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative w-full max-w-3xl"
        >
          {/* 返回首页按钮 */}
          <div className="absolute -top-12 left-0">
            <HomeButton className="border border-border bg-background text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground" />
          </div>

          {/* 主卡片 */}
          <div className="overflow-hidden rounded-2xl border border-border bg-card/80 shadow-xl backdrop-blur-sm">
            {/* 卡片内容 */}
            <div className="px-8 py-10">
              {/* 标题 */}
              <h2 className="mb-2 text-center text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                {t("title")}
              </h2>
              <p className="mb-8 text-center text-sm text-muted-foreground md:text-base">
                {t("description")}
              </p>

              {/* 转移表单 */}
              <div className="flex flex-col items-center justify-center gap-6 md:flex-row md:gap-4">
                {/* 来源CDK */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="w-full flex-1"
                >
                  <div className="rounded-xl border border-border bg-muted/30 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        1
                      </div>
                      <span className="text-sm font-medium text-foreground">{t("fromCdk")}</span>
                    </div>
                    <Input
                      className="w-full"
                      classNames={{
                        inputWrapper: "bg-background border-border",
                      }}
                      value={fromCdk}
                      onChange={handleFromCdkChange}
                      description={fromCdkDescription}
                      color={fromCdkValid ? "success" : "default"}
                    />
                  </div>
                </motion.div>

                {/* 箭头指示器 */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="flex flex-col items-center justify-center"
                >
                  <div className="hidden flex-col items-center md:flex">
                    <span className="mb-1 text-xs font-medium text-muted-foreground">
                      {t("transferTo")}
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="h-5 w-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 md:hidden">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="h-4 w-4 rotate-90"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                        />
                      </svg>
                    </div>
                  </div>
                </motion.div>

                {/* 目标CDK */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="w-full flex-1"
                >
                  <div className="rounded-xl border border-border bg-muted/30 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        2
                      </div>
                      <span className="text-sm font-medium text-foreground">{t("toCdk")}</span>
                    </div>
                    <Input
                      className="w-full"
                      classNames={{
                        inputWrapper: "bg-background border-border",
                      }}
                      value={toCdk}
                      onChange={handleToCdkChange}
                      description={toCdkDescription}
                      color={toCdkValid ? "success" : "default"}
                    />
                  </div>
                </motion.div>
              </div>

              {/* 转移按钮 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-8 flex justify-center"
              >
                <Button
                  onClick={handleTransfer}
                  isLoading={transfering}
                  isDisabled={!fromCdkValid || !toCdkValid}
                  className="bg-primary px-8 py-6 text-base font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-primary/20 disabled:opacity-50"
                  startContent={
                    !transfering && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="h-5 w-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
                        />
                      </svg>
                    )
                  }
                >
                  {t("transfer")}
                </Button>
              </motion.div>
            </div>

            {/* 底部提示 */}
            <div className="border-t border-border bg-muted/30 px-8 py-4">
              <div className="flex items-center justify-center gap-2 text-center text-sm text-muted-foreground">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
                  />
                </svg>
                <span>{t("transferTip")}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </BackgroundBeamsWithCollision>
  );
}
