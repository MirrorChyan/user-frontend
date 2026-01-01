"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Tooltip } from "@heroui/react";

export default function CopyButton({ text }: { text: string }) {
  const t = useTranslations("Component.CopyButton");
  const [copied, setCopied] = useState(false);
  const [tooltip, setTooltip] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text).then(() => setCopied(true));
  };

  return (
    <Tooltip
      content={<span className="p-1">{t(copied ? "copied" : "copy")}</span>}
      showArrow
      isOpen={tooltip}
    >
      <span
        className="tooltip cursor-pointer text-indigo-600 select-text"
        onClick={copyToClipboard}
        onMouseEnter={() => setTooltip(true)}
        onMouseLeave={() => setTooltip(false)}
      >
        {text}
      </span>
    </Tooltip>
  );
}
