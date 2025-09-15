import { BackgroundLines } from "@/components/BackgroundLines";
import { getTranslations, getFormatter, getLocale } from "next-intl/server";
import moment from "moment";

import CopyButton from "@/components/CopyButton";
import { Link } from "@/i18n/routing";
import { SERVER_BACKEND } from "@/app/requests/misc";
import QQGroupLink from "@/components/QQGroupLink";
import { Suspense } from "react";
import LoadingState from "@/components/LoadingState";

type Props = {
  searchParams: Promise<{ order_id: string }>;
};

async function OrderContent({ order_id }: { order_id: string }) {
  const t = await getTranslations("ShowKey");
  const locale = await getLocale();
  const format = await getFormatter();
  const response = await fetch(`${SERVER_BACKEND}/api/billing/order/query?order_id=${order_id}`);
  const { ec, msg, data } = await response.json();
  const isSuccessful = ec === 200;
  const isExpired = isSuccessful && moment(data.expired_at).isBefore(moment());

  const time = isSuccessful
    ? format.dateTime(moment(data.expired_at).toDate(), {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      })
    : null;

  moment.locale(locale);

  const relativeTime = isSuccessful
    ? moment.duration(moment(data.expired_at).diff(moment())).humanize()
    : null;

  return isSuccessful && !isExpired ? (
    <BackgroundLines className="select-none">
      <div className="flex min-h-screen flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
              {t("thanksForBuying")}
            </h2>
            <div className="mt-6 text-pretty text-lg/8 text-gray-600">
              <p>
                {t("yourKey")}:&nbsp;
                <CopyButton text={data.cdk} />
              </p>
              <p>
                <span>{t("expireAt", { time })}</span>
                <span>{t("timeLeft", { relativeTime })}</span>
              </p>
            </div>
            <p className="mt-6 text-center text-sm">
              <QQGroupLink text={t("haveQuestion")} />
            </p>
          </div>
        </div>
      </div>
    </BackgroundLines>
  ) : (
    <div className="flex min-h-screen flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            {isExpired ? t("orderExpired") : t(`msg.${msg}`)}
          </h2>
          <Link href="/get-key">
            <button
              type="button"
              className="mt-6 flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
            >
              {t("goBack")}
            </button>
          </Link>
          <p className="mt-6 text-center text-sm">
            <QQGroupLink text={t("haveQuestion")} />
          </p>
        </div>
      </div>
    </div>
  );
}

export default async function ShowKey({ searchParams }: Props) {
  const t = await getTranslations("GetKey");
  const { order_id } = await searchParams;

  return (
    <Suspense fallback={<LoadingState title={t("thanksForBuying")} description={t("loading")} />}>
      <OrderContent order_id={order_id} />
    </Suspense>
  );
}
