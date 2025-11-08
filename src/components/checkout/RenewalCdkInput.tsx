"use client";

import {
  Accordion,
  AccordionItem,
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import { useTranslations } from "next-intl";
import { HelpCircle } from "lucide-react";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { CLIENT_BACKEND } from "@/app/requests/misc";

interface RenewalCdkInputProps {
  value: string;
  onChange: (value: string) => void;
}

export interface RenewalCdkInputRef {
  validate: () => Promise<boolean>;
}

interface CdkValidationResult {
  isValid: boolean;
  ec: number;
}

const RenewalCdkInput = forwardRef<RenewalCdkInputRef, RenewalCdkInputProps>(
  ({ value, onChange }, ref) => {
    const t = useTranslations("Checkout");

    const [errorModalOpen, setErrorModalOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const lastValidatedValueRef = useRef<string>("");
    const lastValidationResultRef = useRef<CdkValidationResult | null>(null);

    const performValidation = async (cdk: string): Promise<CdkValidationResult> => {
      if (!cdk || cdk.length === 0) {
        return { isValid: false, ec: 0 };
      }

      try {
        const response = await fetch(`${CLIENT_BACKEND}/api/billing/order/query?cdk=${cdk}`);
        const { ec } = await response.json();

        if (ec === 200) {
          return { isValid: true, ec };
        }

        return { isValid: false, ec };
      } catch (error) {
        console.error("CDK validation error:", error);
        return { isValid: false, ec: 0 };
      }
    };

    // 暴露验证方法给父组件
    useImperativeHandle(ref, () => ({
      validate: async () => {
        if (!value || value.length === 0) {
          return true; // 空值视为有效（可选字段）
        }

        if (lastValidatedValueRef.current === value && lastValidationResultRef.current) {
          const result = lastValidationResultRef.current;

          if (result.isValid) {
            return true;
          }

          // 显示错误 Modal
          const errorMsg = result.ec === 404 ? t("cdkInvalid") : t("cdkCheckError");
          setErrorMessage(errorMsg);
          setErrorModalOpen(true);
          return false;
        }

        const result = await performValidation(value);

        lastValidatedValueRef.current = value;
        lastValidationResultRef.current = result;

        if (result.isValid) {
          return true;
        }

        // 显示错误 Modal
        const errorMsg = result.ec === 404 ? t("cdkInvalid") : t("cdkCheckError");
        setErrorMessage(errorMsg);
        setErrorModalOpen(true);
        return false;
      },
    }));

    const handleChange = (newValue: string) => {
      onChange(newValue);
      lastValidatedValueRef.current = "";
      lastValidationResultRef.current = null;
    };

    const handleCloseErrorModal = () => {
      setErrorModalOpen(false);
      setErrorMessage("");
    };

    return (
      <div className="border-b border-gray-100 px-6 py-4 dark:border-gray-700">
        <Accordion className="px-0">
          <AccordionItem
            key="renewal"
            aria-label={t("renewalTitle")}
            title={
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>{t("renewalTitle")}</span>
              </div>
            }
            classNames={{
              title: "text-sm font-normal",
              trigger: "py-2",
              content: "pt-2 pb-4",
            }}
          >
            <Input
              placeholder={t("oldCdkPlaceholder")}
              value={value}
              onChange={e => handleChange(e.target.value.trim())}
              color="default"
              classNames={{
                input: "font-mono",
              }}
            />
          </AccordionItem>
        </Accordion>

        <Modal isOpen={errorModalOpen} onClose={handleCloseErrorModal}>
          <ModalContent>
            <ModalHeader className="flex flex-col gap-1">{t("cdkValidationError")}</ModalHeader>
            <ModalBody>
              <p>{errorMessage}</p>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" onPress={handleCloseErrorModal}>
                {t("confirmButton")}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    );
  }
);

RenewalCdkInput.displayName = "RenewalCdkInput";

export default RenewalCdkInput;
