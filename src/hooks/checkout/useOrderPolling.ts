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
  const [orderInfo, setOrderInfo] = useState<OrderInfoType | undefined>();
  const [isPolling, setIsPolling] = useState(false);

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
            setOrderInfo({
              cdk: data.cdk,
              expired_at: data.expired_at,
              created_at: data.created_at,
              is_renewal: renewCdk.length > 0,
            });
            // 支付完成，停止轮询，也不再自动刷新页面
            clearTimeout(reloadTimer);
            setIsPolling(false);
            return;
          }
          setOrderInfo(undefined);
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

    setIsPolling(true);
    pollTimer = setTimeout(poll, FIRST_POLL_DELAY);

    return () => {
      stopped = true;
      clearTimeout(pollTimer);
      clearTimeout(reloadTimer);
      setIsPolling(false);
    };
  }, [customOrderId, renewCdk, t]);

  return { orderInfo, isPolling };
}
