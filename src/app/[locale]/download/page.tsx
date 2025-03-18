'use client'

import { useState } from "react"
import { useTranslations } from "next-intl"
import {Button} from "@heroui/react"
import { Link } from "@/i18n/routing"
import { useSearchParams } from 'next/navigation'
import {addToast, ToastProvider} from "@heroui/toast";
export default function Download() {
  const t = useTranslations('Download');
  const searchParams = useSearchParams();
  const rid = searchParams.get('rid') ?? 'MAA';
  const os = searchParams.get('os') ?? 'windows';
  const arch = searchParams.get('arch') ?? 'x64';
  const channel = searchParams.get('channel') ?? 'stable';

  const [CDKey, setCDKey] = useState('')
  const [loading, setLoading] = useState(false)


  async function downloadByCDK() {
    setLoading(true)
      try {
          if (!CDKey) {
              addToast({
                  description: t('noCDKey'),
                  color:'warning'
              });
              return
          }

          const response = await fetch(`/api/resources/${rid}/latest?os=${os}&arch=${arch}&channel=${channel}&cdk=${CDKey}&user_agent=mirrorchyan_web`)

          const {code, msg, data} = await response.json()
          if (code !== 0) {
              addToast({
                  description: msg,
                  color:'warning'
              });
              return
          }

          const url = data.url
          if (!url) {
              addToast({
                  description: msg,
                  color:'danger'
              });
              return
          }
          window.location.href = url

          addToast({
              description: t('downloading'),
              color:'primary',
          })

      } finally {
        setLoading(false)
      }
  }

  return (
    <>
        <div className="px-3 flex min-h-screen flex-1 flex-col justify-center relative">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight">
                    {t('title', { rid, os, arch, channel })}
                </h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                <form className="space-y-6">
                    <div>
                        <label htmlFor="key" className="block text-sm/6 font-medium">
                            {t('cdkey')}
                            <span style={{ float: 'right' }}>
                <Link
                    href="/get-start"
                    target="_blank"
                >
                    <u><em>{t('buyCDKey')}</em></u>
                </Link>
                </span>
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
                    <ToastProvider placement={'top-center'} toastOffset={60} />
                    <Button
                        isLoading={loading}
                        onPress={downloadByCDK}
                        className="mt-6 flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                    >
                        {t('download')}
                    </Button>
                </form>
            </div>

            <div className="mt-10 bottom-4 w-full text-center">
                <a href="/disclaimer.html" target="_blank" className="text-xs text-gray-500 dark:text-gray-400">
                    {t.rich('disclaimer', {
                        rid,
                        br: () => <br />
                    })}<span aria-hidden="true">&nbsp;</span>
                </a>
            </div>
        </div>
    </>
  )
}
