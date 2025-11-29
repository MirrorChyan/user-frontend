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
      className="flex w-full items-center justify-center rounded-xl bg-primary p-4 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
    >
      {loading ? (
        <>
          <Spinner size="sm" className="-ml-1 mr-3 text-primary-foreground" />
          {t("processing")}
        </>
      ) : (
        <>{t("confirmPayment")}</>
      )}
    </Button>
  );
}
