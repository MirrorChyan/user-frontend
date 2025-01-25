'use client'

import { useState } from "react";
import { Button, CircularProgress } from "@heroui/react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { useSearchParams } from 'next/navigation'

export default function App() {
  const t = useTranslations("Order");
  const router = useRouter();
  const searchParams = useSearchParams();

  const customId = searchParams.get('customId');
  if (!customId) {
    return (
      <div className="flex h-screen justify-center items-center">
        <Button onClick={() => router.push('/get-key')}>
          {t("InputOrderId")}
        </Button>
      </div>
    )
  }

  const fetcher = async () => {
    const response = await fetch(`/api/billing/order/afdian?custom_order_id=${customId}`);
    if (response.ok) {
      const data = await response.json();
      if (data.ec === 200) {
        window.clearInterval(fetchIntervalTimer);
        window.clearTimeout(timeoutTimer);
        const { order_id } = data.data;
        router.push(`/show-key?order_id=${order_id}`);
      }
    }
  }

  const [timeout, setTimeout] = useState(false);
  const [error, setError] = useState(false);

  const timeoutTimer = window.setTimeout(() => {
    setTimeout(true)
  }, 20 * 1000)

  const stopFetchTimer = window.setTimeout(() => {
    setError(error)
  }, 10 * 60 * 1000)

  const fetchIntervalTimer = window.setInterval(() => {
    if (error) {
      window.clearInterval(fetchIntervalTimer);
      return;
    }
    fetcher();
  }, 3000);

  return (
    <div className="flex h-screen justify-center items-center relative">
      <CircularProgress isIndeterminate label={t("ProcessingOrder")} className="max-w-md" />
      {(error || timeout) && (
        <div className="absolute right-4 bottom-4">
          <Button onClick={() => router.push('/get-key')}>
            {t("InputOrderId")}
          </Button>
        </div>
      )}
    </div>
  );
}
