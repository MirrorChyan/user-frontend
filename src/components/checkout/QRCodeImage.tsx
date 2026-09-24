"use client";

import React, { useEffect, useState } from "react";

interface QRCodeImageProps {
  value: string;
  size?: number;
  logo?: React.ReactNode;
  className?: string;
}

// qrcode 只在弹出支付二维码时才需要，按需加载
async function createQRCodeDataURL(value: string, size: number) {
  const { default: QRCode } = await import("qrcode");
  return QRCode.toDataURL(value, {
    width: size,
    margin: 1,
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
  });
}

export default function QRCodeImage({ value, size = 256, logo }: QRCodeImageProps) {
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    let cancelled = false;
    createQRCodeDataURL(value, size)
      .then(url => {
        if (!cancelled) {
          setImageUrl(url);
        }
      })
      .catch((err: Error) => {
        console.error("生成二维码失败:", err);
      });
    return () => {
      cancelled = true;
    };
  }, [value, size]);

  return (
    <div className={"relative inline-block"}>
      {imageUrl && (
        <img src={imageUrl} alt="QR Code" width={size} height={size} className="block" />
      )}
      {logo && <div className="absolute inset-0 flex items-center justify-center">{logo}</div>}
    </div>
  );
}
