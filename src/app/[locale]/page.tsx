import { redirect } from "@/i18n/routing";
import { getLocale } from "next-intl/server";
import { QueryParams } from "next-intl/navigation";

export default async function Home({ searchParams }: { searchParams: Promise<QueryParams> }) {
  const locale = await getLocale();
  redirect({
    href: {
      pathname: "/get-start",
      query: await searchParams,
    },
    locale,
  });
}
