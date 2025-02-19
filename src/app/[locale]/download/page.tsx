'use client'

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/routing"
import { Button } from "@heroui/react"

export default function Download() {
  const t = useTranslations('Download')
  const [CDKey, setCDKey] = useState('')

  async function downloadByCDK(cdkey: string) {
    if (!cdkey) {
      alert(t('noCDKey'))
      return
    }

    const response = await fetch(`/api/resources/MAA/latest?os=win&arch=x64&channel=stable&cdk=${cdkey}`)

    const { code, msg, data } = await response.json()
    if (code !== 0) {
      alert(msg)
      return
    }

    const url = data.url
    if (!url) {
      alert(msg)
      return
    }
    window.location.href = url
  }

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
                {t('cdkey')}
              </label>
              <div className="mt-2">
                <input
                  id="key"
                  name="key"
                  onChange={(e) => setCDKey(e.target.value)}
                  className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base dark:text-white outline outline-1 -outline-offset-1 dark:outline-white/10 placeholder:text-gray-500 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                />
              </div>
            </div>
            <Button
              onPress={() => downloadByCDK(CDKey)}
              className="mt-6 flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
            >
              {t('download')}
            </Button>
          </form>
        </div>
      </div>
    </>
  )
}
