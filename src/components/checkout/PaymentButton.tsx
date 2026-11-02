import styles from "@/components/design-a/flow.module.css";
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
      className={`${styles.primary} w-full`}
    >
      {loading ? (
        <>
          <Spinner size="sm" className="mr-3 -ml-1 text-white" />
          {t("processing")}
        </>
      ) : (
        <>{t("confirmPayment")}</>
      )}
    </Button>
  );
}
