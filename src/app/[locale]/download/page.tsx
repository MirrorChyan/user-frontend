import { redirect } from "@/i18n/routing";
import { getLocale } from "next-intl/server";
import { QueryParams } from "next-intl/navigation";

// 旧版下载链接的入口，在服务端直接重定向到项目页并保留全部查询参数
export default async function Download({ searchParams }: { searchParams: Promise<QueryParams> }) {
  const locale = await getLocale();
  redirect({
    href: {
      pathname: "/projects",
      query: await searchParams,
    },
    locale,
  });
}
