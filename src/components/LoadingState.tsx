"use client";

import { useTranslations } from "next-intl";
import { BackgroundLines } from "@/components/BackgroundLines";

export default function LoadingState() {
    const t = useTranslations("ShowKey");

    return (
        <BackgroundLines className="select-none">
            <div className="flex min-h-screen flex-1 flex-col justify-center px-6 py-12 lg:px-8">
                <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                            {t("thanksForBuying")}
                        </h2>
                        <div className="mt-6 text-pretty text-lg/8 text-gray-600">
                            {t.raw("msg.Loading")}
                        </div>

                        {/* Loading spinner */}
                        <div className="flex justify-center mt-8">
                            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
                        </div>
                    </div>
                </div>
            </div>
        </BackgroundLines>
    );
}
