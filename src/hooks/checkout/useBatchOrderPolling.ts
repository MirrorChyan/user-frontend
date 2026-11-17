"use client";

import { useCallback, useEffect, useState } from "react";
import { CLIENT_BACKEND } from "@/app/requests/misc";
import {
  type BatchOrderQueryKey,
  type BatchOrderQueryResult,
  parseBatchOrderResponse,
  shouldPollBatchOrder,
} from "@/lib/batch-order";

interface UseBatchOrderPollingProps {
  orderId?: string;
  queryKey?: BatchOrderQueryKey;
  expectedBuyCount?: number;
}

const POLL_INTERVAL = 2_000;
const PAYMENT_QUERY_INTERVAL = 10_000;
const REQUEST_TIMEOUT = 30_000;
const POLL_TIMEOUT = 10 * 60_000;
const MAX_NETWORK_FAILURES = 3;

export function useBatchOrderPolling({
  orderId,
  queryKey = "custom_order_id",
  expectedBuyCount,
}: UseBatchOrderPollingProps) {
  const [attempt, setAttempt] = useState({ number: 0, refreshOrderId: "" });
  const [result, setResult] = useState<BatchOrderQueryResult & { identity: string }>();
  const identity = `${queryKey}:${orderId ?? ""}:${expectedBuyCount ?? ""}:${attempt.number}`;
  const current = result?.identity === identity ? result : undefined;
  const retry = useCallback(
    () => setAttempt(value => ({ number: value.number + 1, refreshOrderId: "" })),
    []
  );
  // Explicitly checking payment can recover a missed callback. Ordinary retries
  // preserve the original lookup mode and never query the payment channel silently.
  const refreshPayment = useCallback(
    () => setAttempt(value => ({ number: value.number + 1, refreshOrderId: orderId ?? "" })),
    [orderId]
  );

  useEffect(() => {
    if (!orderId) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let requestController: AbortController | undefined;
    const startedAt = Date.now();
    let networkFailures = 0;
    let checkPaymentOnce = attempt.refreshOrderId === orderId;

    const publish = (next: BatchOrderQueryResult) => {
      if (!cancelled) setResult({ ...next, identity });
    };

    const poll = async () => {
      if (cancelled) return;
      if (Date.now() - startedAt >= POLL_TIMEOUT) {
        publish({ status: "timeout" });
        return;
      }

      requestController = new AbortController();
      const controller = requestController;
      const requestTimeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
      let next: BatchOrderQueryResult;
      try {
        const requestKey = checkPaymentOnce ? "order_id" : queryKey;
        checkPaymentOnce = false;
        const query = new URLSearchParams({ [requestKey]: orderId });
        const response = await fetch(`${CLIENT_BACKEND}/api/billing/order/query?${query}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const body: unknown = await response.json();
        if (cancelled) return;
        next = parseBatchOrderResponse(body, response.status, expectedBuyCount);
        networkFailures = 0;
      } catch {
        if (cancelled) return;
        networkFailures += 1;
        if (networkFailures < MAX_NETWORK_FAILURES) {
          timer = setTimeout(poll, POLL_INTERVAL * networkFailures);
          return;
        }
        next = { status: "error", error: "errors.network" };
      } finally {
        clearTimeout(requestTimeout);
      }

      publish(next);
      // Schedule only after the previous request completes, including slow issuance.
      if (shouldPollBatchOrder(next.status)) {
        // Generic order references can trigger a payment-channel lookup while
        // unpaid. Avoid hammering that endpoint at the normal delivery interval.
        const delay =
          queryKey === "order_id" && next.status === "unpaid"
            ? PAYMENT_QUERY_INTERVAL
            : POLL_INTERVAL;
        timer = setTimeout(poll, delay);
      }
    };

    void poll();
    return () => {
      cancelled = true;
      clearTimeout(timer);
      requestController?.abort();
    };
  }, [orderId, queryKey, expectedBuyCount, identity, attempt.refreshOrderId]);

  return {
    orderInfo: current?.orderInfo,
    status: current?.status ?? (orderId ? "loading" : "idle"),
    error: current?.error,
    retry,
    refreshPayment,
  };
}
