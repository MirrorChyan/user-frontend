import { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import React from "react";
import Script from "next/script";

import { routing } from "@/i18n/routing";

import { Providers } from "./provider";

import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Mirror酱",
  description:
    "Mirror酱是一个第三方应用分发平台，让开源应用的更新更简单。用户付费使用，收益与开发者共享。此外，Mirror酱本身也是开源的。",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as "zh" | "en")) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <Script strategy="afterInteractive" id="baidu-analytics">
          {`
var _hmt = _hmt || [];
(function() {
  var hm = document.createElement("script");
  hm.src = "https://hm.baidu.com/hm.js?a4f105236f1f9b2f14ad1653d2a45723";
  var s = document.getElementsByTagName("script")[0]; 
  s.parentNode.insertBefore(hm, s);
})();`}
        </Script>
      </head>
      <body>
        <Providers>
          <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
        </Providers>
      </body>
    </html>
  );
}
