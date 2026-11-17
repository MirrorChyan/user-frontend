import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import { getPlans } from "@/app/requests/plan";
import BatchPurchase from "./BatchPurchase";

// CI builds have no billing backend. Fetch the catalogue when the page is requested.
export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { homePlans, morePlans } = await getPlans();
  const plans = [
    ...new Map([...homePlans, ...morePlans].map(plan => [plan.plan_id, plan])).values(),
  ];
  return (
    <Suspense>
      <BatchPurchase plans={plans} />
    </Suspense>
  );
}
