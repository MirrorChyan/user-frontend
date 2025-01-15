import { BackgroundBeamsWithCollision } from "@/components/BackgroundBeamsWithCollision"
import { FlipWords } from "@/components/FlipWord"
import { Link } from "@/i18n/routing"
import { cn } from "@/lib/utils/css"
import { useTranslations } from "next-intl"
// import { CheckIcon } from '@heroicons/react/20/solid'

export default function GetStart() {
  const t = useTranslations('GetStart')

  const plans = [
    // {
    //   name: 'Mirror酱日卡',
    //   price: '￥3.9',
    //   itemId: '83f9d3b8cac611ef8fc352540025c377',
    //   mostPopular: false,
    // },
    {
      name: 'Mirror酱月卡',
      price: '￥6.9',
      itemId: '3134f94ac9aa11ef9d725254001e7c00',
      mostPopular: false,
    },
    {
      name: 'Mirror酱季卡',
      price: '￥12.9',
      itemId: '9e6c7b28c9aa11efb47452540025c377',
      mostPopular: false,
    },
    {
      name: 'Mirror酱年卡',
      price: '￥29.9',
      itemId: '69c45576c9aa11ef9ace52540025c377',
      mostPopular: true,
    },
  ]

  return (
    <BackgroundBeamsWithCollision className="min-h-screen">
      <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="px-6 py-12 sm:px-6 sm:py-8 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
              {t('title')}
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-pretty text-lg/8 text-gray-600">
              {t('description')}
            </p>
          </div>
        </div>
        <div className="isolate mx-auto mt-10 grid max-w-md grid-cols-1 gap-8 md:max-w-2xl md:grid-cols-2 lg:max-w-4xl xl:mx-0 xl:max-w-none xl:max-w-6xl self-center">
          {plans.map((plan) => (
            <div
              key={plan.itemId}
              className={cn(
                plan.mostPopular ? 'ring-2 ring-indigo-600' : 'ring-1 ring-gray-200',
                'rounded-3xl p-8 bg-white dark:bg-white/5 shadow-sm',
              )}
            >
              <h3
                id={plan.itemId}
                className={cn(
                  plan.mostPopular ? 'text-indigo-600' : 'text-gray-900 dark:text-white',
                  'text-lg/8 font-semibold',
                )}
              >
                {plan.name}
              </h3>
              <p className="mt-6 flex items-baseline gap-x-1">
                <span className="text-4xl font-semibold tracking-tight text-gray-900 dark:text-white">
                  {plan.price}
                </span>
              </p>
              <a
                href={`https://afdian.com/item/${plan.itemId}`}
                target="_blank"
                aria-describedby={plan.itemId}
                className={cn(
                  plan.mostPopular
                    ? 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-500'
                    : 'text-indigo-600 ring-1 ring-inset ring-indigo-200 hover:ring-indigo-300 dark:text-white',
                  'mt-6 block rounded-md px-3 py-2 text-center text-sm/6 font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600',
                )}
              >
                {t('buyAtAfdian')}
              </a>
              {/* <ul role="list" className="mt-8 space-y-3 text-sm/6 text-gray-600">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      <CheckIcon aria-hidden="true" className="h-6 w-5 flex-none text-indigo-600" />
                      {feature}
                    </li>
                  ))}
                </ul> */}
            </div>
          ))}
        </div>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            href="/get-key"
            className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            {t('getKey')}
          </Link>
          <a href="https://apifox.com/apidoc/shared-ffdc8453-597d-4ba6-bd3c-5e375c10c789/253583257e0" target="_blank" className="text-sm/6 font-semibold">
            {t('apiDoc')}<span aria-hidden="true">&nbsp;→</span>
          </a>
        </div>
      </div>
    </BackgroundBeamsWithCollision>
  )
}
