"use client";

import { Accordion, AccordionItem, Input } from "@heroui/react";
import { useFormatter, useTranslations } from "next-intl";
import { HelpCircle } from "lucide-react";
import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from "react";
import { debounce } from "lodash";
import moment from "moment";
import { addToast } from "@heroui/toast";
import { CLIENT_BACKEND } from "@/app/requests/misc";

interface RenewalCdkInputProps {
  value: string;
  onChange: (value: string) => void;
  onValidationChange?: (isValid: boolean) => void;
}

export interface RenewalCdkInputRef {
  validate: () => Promise<boolean>;
}

interface CdkValidationResult {
  isValid: boolean;
  ec: number;
  message?: string;
}

const RenewalCdkInput = forwardRef<RenewalCdkInputRef, RenewalCdkInputProps>(
  ({ value, onChange, onValidationChange }, ref) => {
    const t = useTranslations("Checkout");
    const format = useFormatter();

    const [message, setMessage] = useState("");
    const [isValid, setIsValid] = useState(false);
    const lastValidatedValueRef = useRef<string>("");
    const lastValidationResultRef = useRef<CdkValidationResult | null>(null);

    const performValidation = async (cdk: string): Promise<CdkValidationResult> => {
      if (!cdk || cdk.length === 0) {
        return { isValid: false, ec: 0 };
      }

      try {
        const response = await fetch(`${CLIENT_BACKEND}/api/billing/order/query?cdk=${cdk}`);
        const { ec, data } = await response.json();

        if (ec === 200) {
          const expiredAt = moment(data.expired_at);
          const now = moment();
          const formattedDate = format.dateTime(expiredAt.toDate(), {
            year: "numeric",
            month: "short",
            day: "numeric",
          });

          let message = "";
          if (expiredAt.isBefore(now)) {
            message = t("cdkExpiredAt", { date: formattedDate });
          } else {
            message = t("cdkExpiresAt", { date: formattedDate });
          }

          return { isValid: true, ec, message };
        }

        return { isValid: false, ec };
      } catch (error) {
        console.error("CDK validation error:", error);
        return { isValid: false, ec: 0 };
      }
    };

    const validateForDisplay = async (cdk: string) => {
      const result = await performValidation(cdk);

      if (result.isValid && result.message) {
        setIsValid(true);
        setMessage(result.message);
        onValidationChange?.(true);
      } else {
        setIsValid(false);
        setMessage("");
        onValidationChange?.(false);
      }

      lastValidatedValueRef.current = cdk;
      lastValidationResultRef.current = result;
    };

    const validateCdkDebounced = useCallback(debounce(validateForDisplay, 1500), []);

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

          if (result.ec === 404) {
            addToast({
              color: "warning",
              description: t("cdkNotFound"),
            });
          } else {
            addToast({
              color: "warning",
              description: t("cdkCheckError"),
            });
          }
          return false;
        }

        const result = await performValidation(value);

        lastValidatedValueRef.current = value;
        lastValidationResultRef.current = result;

        if (result.isValid) {
          return true;
        }

        if (result.ec === 404) {
          addToast({
            color: "warning",
            description: t("cdkNotFound"),
          });
        } else {
          addToast({
            color: "warning",
            description: t("cdkCheckError"),
          });
        }
        return false;
      },
    }));

    const handleChange = (newValue: string) => {
      onChange(newValue);
      setMessage("");
      setIsValid(false);
      onValidationChange?.(false);

      if (newValue !== lastValidatedValueRef.current) {
        lastValidatedValueRef.current = "";
        lastValidationResultRef.current = null;
      }

      if (newValue.length > 0) {
        validateCdkDebounced(newValue);
      }
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
            <div className="space-y-2">
              <Input
                placeholder={t("oldCdkPlaceholder")}
                value={value}
                onChange={e => handleChange(e.target.value.trim())}
                color="default"
                classNames={{
                  input: "font-mono",
                }}
              />
              {message && (
                <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                  <span>✓</span>
                  <span>{message}</span>
                </div>
              )}
            </div>
          </AccordionItem>
        </Accordion>
      </div>
    );
  }
);

RenewalCdkInput.displayName = "RenewalCdkInput";

export default RenewalCdkInput;
