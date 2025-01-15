import { BackgroundLines } from "@/components/BackgroundLines"
import { getTranslations, getFormatter } from "next-intl/server"

import CopyButton from "@/components/CopyButton"
import { Link } from "@/i18n/routing"

type Props = {
  searchParams: Promise<{ order_id: string }>
}

export default async function ShowKey({ searchParams }: Props) {
  const t = await getTranslations('ShowKey')
  const format = await getFormatter()
  const { order_id } = await searchParams
  const response = await fetch(`https://mirrorc.top/api/billing/order/afdian?order_id=${order_id}`)

  const { ec, msg, data } = await response.json()
  const isSuccessful = ec === 200
  const isExpired = isSuccessful && new Date(data.expired_at) < new Date()

  const time = isSuccessful ? format.dateTime(new Date(data.expired_at), {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }) : null

  return isSuccessful && !isExpired ? (
    <BackgroundLines>
      <div className="flex min-h-screen flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
              {t('thanksForBuying')}
            </h2>
            <div className="mt-6 text-pretty text-lg/8 text-gray-600">
              <p>{t('yourKey')}:&nbsp;
                <CopyButton text={data.cdk} />
              </p>
              <p><span>{t('expireAt', { time })}</span></p>
            </div>
          </div>
        </div>
      </div>
    </BackgroundLines>
  ) : (
    <div className="flex min-h-screen flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            {isExpired ? t('orderExpired') : msg}
          </h2>
          <button
            type="button"
            className="mt-6 rounded-md bg-white/10 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-white/20"
          >
            <Link href="/get-key">{t('goBack')}</Link>
          </button>
        </div>
      </div>
    </div>
  )
}
