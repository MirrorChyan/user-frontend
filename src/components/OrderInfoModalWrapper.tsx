"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import OrderInfoModal from "@/components/OrderInfoModal";
import { useLocale } from "next-intl";

export default function OrderInfoModalWrapper() {
  const searchParams = useSearchParams();
  const router = useRouter();
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
    // Remove order_id from URL without page reload
    const newUrl = `/${locale}/projects`;
    router.replace(newUrl);
  };

  if (!orderId || !showModal) {
    return null;
  }

  return <OrderInfoModal orderId={orderId} onClose={handleClose} />;
}
