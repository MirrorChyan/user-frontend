import { BackgroundBeamsWithCollision } from "@/components/BackgroundBeamsWithCollision"
import { Link } from "@/i18n/routing"
import { getTranslations } from "next-intl/server"
import PlanCard from "./plan-card"
// import { CheckIcon } from '@heroicons/react/20/solid'

type Discount = {
  beginAt: number // timestamp
  endAt: number   // timestamp
  discountPrice: string
}

type Plan = {
  name: string
  price: string
  planId: string
  skuId: string
  mostPopular: boolean
  discount?: Discount
}

export default async function GetStart() {
  const t = await getTranslations('GetStart')

  const planIds = [
    // '83f9d3b8cac611ef8fc352540025c377',
    '3134f94ac9aa11ef9d725254001e7c00',
    '9e6c7b28c9aa11efb47452540025c377',
    '69c45576c9aa11ef9ace52540025c377',
  ]

  const getPlanInfo = async (planId: string): Promise<Plan | null> => {
    const response = await fetch(`https://afdian.com/api/creator/get-plan-skus?plan_id=${planId}&is_ext=`)
    if (response.ok) {
      const data = await response.json()
      const { plan, list } = data.data
      return {
        name: plan.name,
        price: plan.price,
        planId: plan.plan_id,
        skuId: list[0].sku_id,
        mostPopular: planIds.indexOf(plan.plan_id) === planIds.length - 1,
        discount: plan.time_limit_price && {
          beginAt: plan.time_limit_price.begin_time,
          endAt: plan.time_limit_price.end_time,
          discountPrice: plan.time_limit_price.price,
        }
      }
    }
    return null
  }

  const plans = await Promise.all(planIds.map(getPlanInfo))

  const customOrderId = Date.now() + Math.random().toString(36).slice(2)

  return (
    <div suppressHydrationWarning>
      <BackgroundBeamsWithCollision className="min-h-screen">
        <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-8">
          <div className="px-6 py-12 sm:px-6 sm:py-8 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl text-gray-900 dark:text-white">
                {t('title')}
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-pretty text-lg/8 text-gray-600">
                {t.rich('description', {
                  br: () => <br />
                })}
              </p>
            </div>
          </div>
          <div className="isolate mx-auto mt-10 grid max-w-md grid-cols-1 gap-8 md:max-w-2xl md:grid-cols-3 lg:max-w-4xl xl:mx-0 xl:max-w-6xl self-center">
            {plans.map((plan) => {
              if (!plan) return null
              return <PlanCard key={plan.planId} plan={plan} customOrderId={customOrderId} />
            })}
          </div>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/get-key"
              className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              {t('getKey')}
            </Link>
            <Link
              href="/transfer"
              className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              {t('transfer')}
            </Link>
            <a href="https://github.com/MirrorChyan/docs" target="_blank" className="text-sm/6 font-semibold">
              {t('apiDoc')}<span aria-hidden="true">&nbsp;→</span>
            </a>
            <a href="https://github.com/MirrorChyan/user-frontend" target="_blank" className="text-sm/6 font-semibold">
              {t('openSource')}<span aria-hidden="true">&nbsp;</span>
            </a>
          </div>
        </div>
      </BackgroundBeamsWithCollision>
    </div>
  )
}
