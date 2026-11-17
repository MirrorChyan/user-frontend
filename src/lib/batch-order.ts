export type BatchOrderQueryKey = "custom_order_id" | "order_id";

export interface BatchOrderInfo {
  buy_count: number;
  cdks: string[];
  amount?: number;
  created_at?: string;
  expired_at?: string;
  custom_order_id?: string;
  order_id?: string;
  plan?: { title?: string; valid_days?: number };
}

export type BatchOrderStatus =
  | "idle"
  | "loading"
  | "unpaid"
  | "issuing"
  | "review"
  | "ambiguous"
  | "blocked"
  | "invalid"
  | "error"
  | "timeout"
  | "complete";

export interface BatchOrderQueryResult {
  status: BatchOrderStatus;
  orderInfo?: BatchOrderInfo;
  /** Translation key in the BatchOrder namespace; never render upstream errors verbatim. */
  error?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

/** Billing returns business status in `ec`, even when the HTTP response is 200. */
export function parseBatchOrderResponse(
  body: unknown,
  httpStatus = 200,
  expectedBuyCount?: number
): BatchOrderQueryResult {
  if (!isRecord(body)) return { status: "error", error: "errors.invalidResponse" };

  // A gateway's HTTP 503/404 says nothing about payment or delivery. Only the
  // documented Billing business codes can establish those states.
  const ec =
    typeof body.ec === "number" ? body.ec : httpStatus === 200 && body.code === 0 ? 200 : undefined;
  if (ec === 404 && body.code === 21002) return { status: "unpaid" };
  if ((ec === 202 || ec === 503) && body.code === 21005) return { status: "issuing" };
  if (ec === 409 && body.code === 21006) return { status: "review" };
  if (ec === 409 && body.code === 21007) return { status: "ambiguous" };
  if (ec === 403 && body.code === 21004) return { status: "blocked" };
  if (ec === 400 && body.code === 21001) return { status: "invalid" };
  if (ec !== 200 || httpStatus !== 200 || (body.code !== undefined && body.code !== 0)) {
    return { status: "error", error: "errors.query" };
  }

  const data = body.data;
  if (!isRecord(data)) return { status: "error", error: "errors.invalidResponse" };
  const buyCount = data.buy_count;
  if (
    typeof buyCount !== "number" ||
    !Number.isSafeInteger(buyCount) ||
    buyCount < 1 ||
    (expectedBuyCount !== undefined && buyCount !== expectedBuyCount)
  ) {
    return { status: "error", error: "errors.quantityMismatch" };
  }

  // The first-card compatibility field is never sufficient for a batch. Only a
  // completed delivery may be displayed; blocked cards may be absent from cdks.
  if (buyCount > 1 && data.delivered === false) return { status: "issuing" };
  if (buyCount > 1 && data.delivered !== true) {
    return { status: "error", error: "errors.invalidResponse" };
  }
  const cdks = Array.isArray(data.cdks)
    ? data.cdks
    : buyCount === 1 && typeof data.cdk === "string"
      ? [data.cdk]
      : [];
  if (
    cdks.length === 0 ||
    cdks.length > buyCount ||
    !cdks.every((cdk): cdk is string => typeof cdk === "string" && /^[a-zA-Z0-9]{24}$/.test(cdk)) ||
    new Set(cdks).size !== cdks.length
  ) {
    return { status: "error", error: "errors.invalidResponse" };
  }

  return {
    status: "complete",
    orderInfo: {
      buy_count: buyCount,
      cdks,
      amount:
        typeof data.amount === "number" && Number.isSafeInteger(data.amount) && data.amount > 0
          ? data.amount
          : undefined,
      created_at: optionalString(data.created_at),
      expired_at: optionalString(data.expired_at),
      custom_order_id: optionalString(data.custom_order_id),
      order_id: optionalString(data.order_id),
      plan: isRecord(data.plan)
        ? {
            title: optionalString(data.plan.title),
            valid_days: typeof data.plan.valid_days === "number" ? data.plan.valid_days : undefined,
          }
        : undefined,
    },
  };
}

export function shouldPollBatchOrder(status: BatchOrderStatus): boolean {
  return status === "unpaid" || status === "issuing";
}
