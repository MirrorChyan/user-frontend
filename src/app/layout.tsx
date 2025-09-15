import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mirror酱",
  description:
    "Mirror酱是一个第三方应用分发平台，让开源应用的更新更简单。用户付费使用，收益与开发者共享。此外，Mirror酱本身也是开源的。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
