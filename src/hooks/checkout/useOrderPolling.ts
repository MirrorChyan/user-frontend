import { useEffect, useRef, useState } from "react";
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

export function useOrderPolling({
  customOrderId,
  renewCdk,
}: UseOrderPollingProps): UseOrderPollingResult {
  const t = useTranslations("Checkout");
  const [orderInfo, setOrderInfo] = useState<OrderInfoType | undefined>();
  const [isPolling, setIsPolling] = useState(false);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchOrderStatus = async () => {
      if (!customOrderId) return;

      try {
        const response = await fetch(
          `${CLIENT_BACKEND}/api/billing/order/query?custom_order_id=${customOrderId}`
        );
        if (response.ok) {
          const { ec, code, data } = await response.json();
          console.log(ec, code, data);
          if (code === 0) {
            setOrderInfo({
              cdk: data.cdk,
              expired_at: data.expired_at,
              created_at: data.created_at,
              is_renewal: renewCdk.length > 0,
            });
            if (intervalIdRef.current) {
              clearInterval(intervalIdRef.current);
              intervalIdRef.current = null;
              setIsPolling(false);
            }
          } else {
            setOrderInfo(undefined);
          }
        }
      } catch (error) {
        addToast({
          color: "warning",
          description: t("errorWithPollingOrder"),
        });
      }
    };
    if (customOrderId) {
      // 清理之前的轮询和超时
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }

      setIsPolling(true);
      // 不用马上触发查询
      setTimeout(() => {
        intervalIdRef.current = setInterval(fetchOrderStatus, 1500);

        // 40分钟后自动刷新页面
        timeoutIdRef.current = setTimeout(
          () => {
            location.reload();
          },
          40 * 1000 * 60
        );
      }, 1200);

      return () => {
        if (intervalIdRef.current) {
          clearInterval(intervalIdRef.current);
          intervalIdRef.current = null;
        }
        if (timeoutIdRef.current) {
          clearTimeout(timeoutIdRef.current);
          timeoutIdRef.current = null;
        }
        setIsPolling(false);
      };
    }
  }, [customOrderId, renewCdk, t]);

  return { orderInfo, isPolling };
}
