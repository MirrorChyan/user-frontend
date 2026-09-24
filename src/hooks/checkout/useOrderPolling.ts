import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { CLIENT_BACKEND } from "@/app/requests/misc";
import { addToast } from "@heroui/toast";

interface OrderInfoType {
  cdk?: string;
  expired_at?: string;
  created_at?: string;
  is_renewal?: boolean;
}

interface UseOrderPollingProps {
  customOrderId: string | undefined;
  renewCdk: string;
}

interface UseOrderPollingResult {
  orderInfo: OrderInfoType | undefined;
  isPolling: boolean;
}

const POLL_INTERVAL = 1500;
// 不用马上触发查询
const FIRST_POLL_DELAY = 1200;
// 40 分钟仍未支付则刷新页面
const RELOAD_AFTER = 40 * 60 * 1000;

export function useOrderPolling({
  customOrderId,
  renewCdk,
}: UseOrderPollingProps): UseOrderPollingResult {
  const t = useTranslations("Checkout");
  // 按订单号记录支付结果，未拿到当前订单的结果前都视为轮询中
  const [paidOrder, setPaidOrder] = useState<{ orderId: string; info: OrderInfoType }>();
  const orderInfo = paidOrder?.orderId === customOrderId ? paidOrder?.info : undefined;
  const isPolling = !!customOrderId && !orderInfo;

  useEffect(() => {
    if (!customOrderId) return;

    let stopped = false;
    let pollTimer: ReturnType<typeof setTimeout> | undefined;
    const reloadTimer = setTimeout(() => location.reload(), RELOAD_AFTER);

    // 上一次请求结束后再排下一次，避免慢请求堆积
    const poll = async () => {
      try {
        const response = await fetch(
          `${CLIENT_BACKEND}/api/billing/order/query?custom_order_id=${encodeURIComponent(customOrderId)}`
        );
        if (stopped) return;
        if (response.ok) {
          const { code, data } = await response.json();
          if (stopped) return;
          if (code === 0) {
            setPaidOrder({
              orderId: customOrderId,
              info: {
                cdk: data.cdk,
                expired_at: data.expired_at,
                created_at: data.created_at,
                is_renewal: renewCdk.length > 0,
              },
            });
            // 支付完成，停止轮询，也不再自动刷新页面
            clearTimeout(reloadTimer);
            return;
          }
        }
      } catch {
        if (stopped) return;
        addToast({
          color: "warning",
          description: t("errorWithPollingOrder"),
        });
      }
      pollTimer = setTimeout(poll, POLL_INTERVAL);
    };

    pollTimer = setTimeout(poll, FIRST_POLL_DELAY);

    return () => {
      stopped = true;
      clearTimeout(pollTimer);
      clearTimeout(reloadTimer);
    };
  }, [customOrderId, renewCdk, t]);

  return { orderInfo, isPolling };
}
