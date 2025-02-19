'use client'

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/routing"

export default function GetKey() {
  const t = useTranslations('GetKey')
  const [orderId, setOrderId] = useState('')

  return (
    <>
      <div className="px-3 flex min-h-screen flex-1 flex-col justify-center relative">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight">
            {t('title')}
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form className="space-y-6">
            <div>
              <label htmlFor="key" className="block text-sm/6 font-medium">
                {t('orderId')}
                <span style={{ float: 'right' }}>
                <Link
                    href="https://afdian.com/dashboard/order"
                    >
                    <u><em>{t('queryOrderId')}</em></u>
                </Link>
                </span>
              </label>
              <div className="mt-2">
                <input
                  id="key"
                  name="key"
                  onChange={(e) => setOrderId(e.target.value)}
                  className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base dark:text-white outline outline-1 -outline-offset-1 dark:outline-white/10 placeholder:text-gray-500 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                />
              </div>
            </div>

            <Link href={`/show-key?order_id=${orderId}`}>
              <button
                className="mt-6 flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
              >
                {t('getKey')}
              </button>
            </Link>
          </form>
        </div>
      </div>
    </>
  )
}
