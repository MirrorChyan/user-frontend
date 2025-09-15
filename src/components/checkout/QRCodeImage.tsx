"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";

interface QRCodeImageProps {
  value: string;
  size?: number;
  logo?: React.ReactNode;
  className?: string;
}

export default function QRCodeImage({ value, size = 256, logo }: QRCodeImageProps) {
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    QRCode.toDataURL(value, {
      width: size,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    })
      .then(url => {
        setImageUrl(url);
      })
      .catch((err: Error) => {
        console.error("生成二维码失败:", err);
      });
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
