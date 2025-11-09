import { Button } from "@heroui/react";
import { useTranslations } from "next-intl";
import Spinner from "./Spinner";

interface PaymentButtonProps {
  onClick: () => void;
  loading: boolean;
  disabled?: boolean;
}

export default function PaymentButton({ onClick, loading, disabled = false }: PaymentButtonProps) {
  const t = useTranslations("Checkout");
  return (
    <Button
      onPress={onClick}
      isDisabled={loading || disabled}
      className="flex w-full items-center justify-center rounded-xl bg-indigo-600 p-4 text-base font-medium text-white transition-colors hover:bg-indigo-700"
    >
      {loading ? (
        <>
          <Spinner size="sm" className="-ml-1 mr-3 text-white" />
          {t("processing")}
        </>
      ) : (
        <>{t("confirmPayment")}</>
      )}
    </Button>
  );
}
