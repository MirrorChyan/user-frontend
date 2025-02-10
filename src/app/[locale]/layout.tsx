import { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

import { Providers } from './provider';

import "@/app/globals.css";

export const metadata: Metadata = {
  title: "MirrorChyan",
  description: "Next generation of CDN for developers",
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
  if (!routing.locales.includes(locale as 'zh' | 'en')) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <Providers>
          <NextIntlClientProvider messages={messages}>
            {children}
          </NextIntlClientProvider>
        </Providers>
        {/* ICP备案 */}
        <div className="fixed bottom-4 w-full text-center">
          <a href="http://beian.miit.gov.cn/" target="_blank" className="text-xs text-gray-500 dark:text-gray-400">
            皖ICP备2025075166号
          </a>
        </div>
      </body>
    </html>
  );
}
