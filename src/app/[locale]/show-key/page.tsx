import { permanentRedirect } from "next/navigation";
import { getLocale } from "next-intl/server";

type Props = {
  searchParams: Promise<{ order_id: string }>;
};

export default async function ShowKey({ searchParams }: Props) {
  const locale = await getLocale();
  const { order_id } = await searchParams;

  // 301 永久重定向到 projects 页面
  permanentRedirect(`/${locale}/projects?order_id=${order_id}`);
}
