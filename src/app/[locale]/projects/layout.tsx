import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata");
  return {
    title: t("projects"),
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
