import { PageFrameA } from "@/components/design-a/Shell";
import { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return {
    title: t("checkout"),
  };
}

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // 布局之间可能并行渲染，框架里的服务端组件要用到语言，这里也要设置，
  // 否则 next-intl 会改读请求头，页面无法静态生成
  const { locale } = await params;
  setRequestLocale(locale);
  return <PageFrameA>{children}</PageFrameA>;
}
