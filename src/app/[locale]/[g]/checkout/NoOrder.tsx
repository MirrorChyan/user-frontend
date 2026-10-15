import { Button } from "@heroui/react";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";

export default function NoOrder() {
  const t = useTranslations("Checkout");
  const router = useRouter();
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md rounded-xl bg-white p-8 text-center shadow-lg dark:bg-gray-800">
        <div className="mb-4 text-red-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mx-auto h-16 w-16"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="mb-4 text-2xl font-bold">{t("invalidOrder") || "无效订单"}</h2>
        <p className="mb-6 text-gray-600 dark:text-gray-300">{t("incompleteOrder")}</p>
        <Button
          onPress={() => router.push("/get-start")}
          className="mx-auto flex items-center justify-center rounded-full bg-indigo-600 px-6 py-2 font-medium text-white hover:bg-indigo-700"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("backToPlans")}
        </Button>
      </div>
    </div>
  );
}
