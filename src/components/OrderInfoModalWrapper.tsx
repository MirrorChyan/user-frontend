"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import OrderInfoModal from "@/components/OrderInfoModal";
import { useLocale } from "next-intl";

export default function OrderInfoModalWrapper() {
  const searchParams = useSearchParams();
  const locale = useLocale();
  const orderId = searchParams.get("order_id");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (orderId) {
      setShowModal(true);
    }
  }, [orderId]);

  const handleClose = () => {
    setShowModal(false);
    // 使用 history API 直接修改 URL，避免 next-intl 中间件重复添加 locale 前缀
    const params = new URLSearchParams(searchParams.toString());
    params.delete("order_id");
    const queryString = params.toString();
    const newUrl = `/${locale}/projects${queryString ? `?${queryString}` : ""}`;
    window.history.replaceState(null, "", newUrl);
  };

  if (!orderId || !showModal) {
    return null;
  }

  return <OrderInfoModal orderId={orderId} onClose={handleClose} />;
}
