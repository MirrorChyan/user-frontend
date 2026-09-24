import { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import React from "react";
import Script from "next/script";

import { routing } from "@/i18n/routing";

import { Providers } from "./provider";

import "@/app/globals.css";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import OutdatedBrowserScript from "@/components/OutdatedBrowserScript";

export const metadata: Metadata = {
  title: "Mirror酱",
  description:
    "Mirror酱是一个第三方应用分发平台，让开源应用的更新更简单。用户付费使用，收益与开发者共享。此外，Mirror酱本身也是开源的。",
};

// 构建时为每种语言预渲染，未使用请求期 API 的页面可以静态生成
export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

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
  // 让 next-intl 的服务端 API 从这里读取语言，而不是请求头
  setRequestLocale(locale);

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();
  const browserSupport = await getTranslations("BrowserSupport");

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <meta name="renderer" content="webkit" />
        <OutdatedBrowserScript
          message={browserSupport("outdated")}
          closeLabel={browserSupport("close")}
        />
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
          <NextIntlClientProvider messages={messages}>
            <LanguageSwitcher />
            {children}
          </NextIntlClientProvider>
        </Providers>
      </body>
    </html>
  );
}
