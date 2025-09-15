"use client";

import { useFormatter, useTranslations } from "next-intl";
import { ChangeEvent, useCallback, useState } from "react";
import { Button, Input } from "@heroui/react";
import { debounce } from "lodash";
import moment from "moment";

import { useRouter } from "@/i18n/routing";
import { CLIENT_BACKEND } from "@/app/requests/misc";
import HomeButton from "@/components/HomeButton";

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
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="relative w-full max-w-md px-4 text-center md:min-w-[48rem]">
        <HomeButton className="absolute left-3" />
        <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
          {t("title")}
        </h2>
        <div className="mt-4 text-pretty text-base/7 text-gray-600 md:mt-6 md:text-lg/8">
          {t("description")}
        </div>
        <div className="mt-6 flex flex-col items-center justify-center space-y-4 md:flex-row md:space-x-6 md:space-y-0">
          <Input
            className="w-full md:min-w-[10rem]"
            label={t("fromCdk")}
            value={fromCdk}
            onChange={handleFromCdkChange}
            description={fromCdkDescription}
          />
          <div className="hidden flex-1 text-nowrap px-2 py-1 md:block md:py-0">
            {t("transferTo")}
          </div>
          <div className="rotate-90 px-2 py-1 md:rotate-0 md:py-0">→</div>
          <Input
            className="w-full md:min-w-[10rem]"
            label={t("toCdk")}
            value={toCdk}
            onChange={handleToCdkChange}
            description={toCdkDescription}
          />
        </div>
        <div className="mt-4"></div>
        <Button
          className="mt-6"
          onClick={handleTransfer}
          color="primary"
          isLoading={transfering}
          isDisabled={!fromCdkValid || !toCdkValid}
        >
          {t("transfer")}
        </Button>
      </div>
    </div>
  );
}
