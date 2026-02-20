import React, { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";

export interface HtmlFormPayPageProps {
  paymentHtml: string;
}

export default function HtmlFormPayPage({ paymentHtml }: HtmlFormPayPageProps) {
  const [ready, setReady] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const blob = new Blob([paymentHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);

    const iframe = iframeRef.current;
    if (!iframe) return;

    iframe.src = url;

    const handleLoad = async () => {
      try {
        const doc = iframe.contentDocument;
        if (!doc?.body) return;

        // 等待内部图片等资源加载完成
        const images = doc.querySelectorAll("img");
        await Promise.all(
          Array.from(images).map(
            img =>
              new Promise<void>(resolve => {
                if (img.complete) return resolve();
                img.onload = () => resolve();
                img.onerror = () => resolve();
              })
          )
        );

        const canvas = await html2canvas(doc.body, {
          useCORS: true,
          backgroundColor: "#ffffff",
          windowWidth: 200,
          windowHeight: 200,
        });

        const container = canvasContainerRef.current;
        if (container) {
          canvas.style.width = "100%";
          canvas.style.height = "100%";
          canvas.style.display = "block";
          container.innerHTML = "";
          container.appendChild(canvas);
          setReady(true);
        }
      } catch {
        // 截图失败时保持 loading 状态
      }
    };

    iframe.addEventListener("load", handleLoad);

    return () => {
      iframe.removeEventListener("load", handleLoad);
      URL.revokeObjectURL(url);
    };
  }, [paymentHtml]);

  return (
    <div className="flex justify-center">
      {/* 隐藏的 iframe 用于渲染 HTML */}
      <iframe
        ref={iframeRef}
        sandbox="allow-scripts allow-same-origin"
        title="支付宝支付"
        style={{
          position: "absolute",
          left: "-9999px",
          width: 240,
          height: 240,
          visibility: "hidden",
        }}
      />
      <div
        ref={canvasContainerRef}
        className={`box-border h-60 w-60 p-1 ${ready ? "" : "hidden"}`}
      />
      {!ready && (
        <div className="flex h-60 w-60 items-center justify-center rounded-lg bg-gray-100 p-4 dark:bg-gray-700">
          <div className="flex flex-col items-center">
            <svg
              className="mb-2 h-16 w-16 animate-spin text-indigo-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
