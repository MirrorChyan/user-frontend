"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@heroui/react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { CLIENT_BACKEND } from "@/app/requests/misc";
import { ArrowLeft, CreditCard, ShieldCheck } from "lucide-react";
import NoOrder from "@/app/[locale]/checkout/NoOrder";
import QRCodePayModal from "@/components/checkout/QRCodePayModal";
import WaitForPayModal from "@/components/checkout/WaitForPayModal";
import HtmlFormPayModal from "@/components/checkout/HtmlFormPayModal";
import { addToast } from "@heroui/toast";
import PaymentOption from "@/components/checkout/PaymentOption";
import { isMobile } from "react-device-detect"
import { getSource } from "@/components/SourceTracker";


export interface CheckoutProps {
  planId: Array<string>;
  rate: number;
}

export interface PlanInfoDetail {
  title: string;
  price: string;
  original_price: string;
  checkout_price: string;
  popular: boolean;
  afdian_info: {
    plan_id: string;
    sku_id: string;
  };
  yimapay_id: string;
  weixin_id: string;
  alipay_id: string;
}

type PaymentMethod = "alipay" | "wechatPay" | "afdian";

type ShowedType = "none" | PaymentMethod;

type YmPayType = "AlipayQRCode" | "WeChatQRCode" | "AlipayH5" | "WeChatH5"

const PayWithQrcode: Record<PaymentMethod | any, YmPayType> = {
  alipay: "AlipayQRCode",
  wechatPay: "WeChatQRCode",
};

const PayWithH5: Record<PaymentMethod | any, YmPayType> = {
  alipay: "AlipayH5",
  wechatPay: "WeChatH5",
};

type CreateOrderType = {
  pay_url?: string,
  html?: string,
  custom_order_id: string,
  amount: number,
  title: string,
}

interface OrderInfoType {
  cdk?: string;
  expired_at?: string;
  created_at?: string;
}


export default function Checkout(params: CheckoutProps) {
  const t = useTranslations("Checkout");
  const gT = useTranslations('GetStart');


  const router = useRouter();


  const planId = params.planId[0];
  const [loading, setLoading] = useState(false);
  const [planInfoLoading, setPlanInfoLoading] = useState(true);
  const [planInfo, setPlanInfo] = useState<PlanInfoDetail | undefined>();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("alipay");
  const [showModal, setShowModal] = useState<ShowedType>("none");

  const [paymentUrl, setPaymentUrl] = useState<string>("");
  const [paymentHtml, setPaymentHtml] = useState<string>("");
  const [customOrderId, setCustomOrderId] = useState<string>();
  const [orderInfo, setOrderInfo] = useState<OrderInfoType>();
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  const [hasError, setHasError] = useState(false);

  const usePayWithH5 = isMobile;

  useEffect(() => {
    (async () => {
      setPlanInfoLoading(true);
      try {
        const response = await fetch(`${CLIENT_BACKEND}/api/misc/plan/${planId}`);
        if (response.ok) {
          const { ec, data } = await response.json();
          if (ec !== 200) {
            addToast({
              color: "warning",
              description: t("errorWithPollingOrder"),
            });
            setHasError(true);
            return;
          }
          const detail = data as PlanInfoDetail
          setPaymentMethod(detail.alipay_id ? 'alipay' : 'wechatPay')
          setPlanInfo(detail);
        }
      } catch (error) {
        console.error("获取Plan信息失败", error);
      } finally {
        setPlanInfoLoading(false);
      }
    })();
  }, []);


  const fetchOrderStatus = async () => {
    if (!customOrderId) return;

    try {
      const response = await fetch(`${CLIENT_BACKEND}/api/billing/order/query?custom_order_id=${customOrderId}`);
      if (response.ok) {
        const { ec, code, data } = await response.json();
        console.log(ec, code, data);
        if (code === 0) {
          setOrderInfo({
            cdk: data.cdk,
            expired_at: data.expired_at,
            created_at: data.created_at,
          });
          if (intervalIdRef.current) {
            clearInterval(intervalIdRef.current);
            intervalIdRef.current = null;
            setIsPolling(false);
          }
        } else {
          setOrderInfo(undefined);
        }
      }
    } catch (error) {
      addToast({
        color: "warning",
        description: t("errorWithPollingOrder"),
      });
    }
  };

  useEffect(() => {
    if (customOrderId) {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }

      setIsPolling(true);
      intervalIdRef.current = setInterval(fetchOrderStatus, 1500);

      setTimeout(() => {
        location.reload();
      }, 40 * 1000 * 60)

      return () => {
        if (intervalIdRef.current) {
          clearInterval(intervalIdRef.current);
          intervalIdRef.current = null;
          setIsPolling(false);
        }
      };
    }
  }, [customOrderId]);

  if (!params.planId || params.planId.length > 1 || hasError) {
    return <NoOrder />;
  }

  const handleAfdianPayment = () => {
    const customOrderId = Date.now() + Math.random().toString(36).slice(2);
    const base = "https://ifdian.net/order/create?product_type=1";
    const planId = planInfo?.afdian_info.plan_id;
    const skuId = planInfo?.afdian_info.sku_id;
    const url = base + `&plan_id=${planId}&sku=%5B%7B%22sku_id%22%3A%22${skuId}%22%2C%22count%22%3A1%7D%5D&viokrz_ex=0&custom_order_id=${customOrderId}`;
    window.open(url, "_blank");

    setShowModal(paymentMethod);
    setCustomOrderId(customOrderId);
  }

  const handlePayment = async () => {
    setLoading(true);
    try {
      if (paymentMethod === "afdian") {
        handleAfdianPayment()
        return;
      }

      const params = new URLSearchParams();

      let platform: string = "";

      if (usePayWithH5) {
        platform = "yimapay";
        params.append('plan_id', planInfo?.yimapay_id as string);
        params.append('pay', PayWithH5[paymentMethod]);
      }
      else {
        if (paymentMethod === "alipay") {
          platform = "alipay";
          params.append('plan_id', planInfo?.alipay_id as string);
        }
        else if (paymentMethod === "wechatPay") {
          platform = "weixin";
          params.append('plan_id', planInfo?.weixin_id as string);
        }
      }

      params.append('source', getSource());

      const resp = await fetch(`${CLIENT_BACKEND}/api/billing/order/${platform}/create?${params}`);
      let jresp = await resp.json();
      if (jresp.code != 0) {
        // fallback
        platform = "yimapay";
        params.set('plan_id', planInfo?.yimapay_id as string);
        params.set('pay', PayWithQrcode[paymentMethod]);
        const resp_bak = await fetch(`${CLIENT_BACKEND}/api/billing/order/${platform}/create?${params}`);
        jresp = await resp_bak.json()
        if (jresp.code != 0) {
          addToast({
            color: "warning",
            description: t("createOrderError"),
          });
          return;
        }
      }

      const orderInfo = jresp.data as CreateOrderType;

      if (usePayWithH5) {
        window.open(orderInfo.pay_url, "_blank");
      }

      if (orderInfo?.pay_url) {
        setPaymentUrl(orderInfo.pay_url);
      }
      else {
        setPaymentHtml(orderInfo.html || "");
      }
      setCustomOrderId(orderInfo.custom_order_id);
      setShowModal(paymentMethod);

    } catch (error) {
      console.log(error);
      addToast({
        color: "warning",
        description: t("createOrderError"),
      });
    } finally {
      setLoading(false);
    }
  };

  const discount = planInfo?.checkout_price !== planInfo?.price;
  const finalPrice = (+((discount ? planInfo?.price : planInfo?.checkout_price) ?? 0) * params.rate).toFixed(2);
  const originPrice = (+(planInfo?.checkout_price ?? 0) * params.rate).toFixed(2)
  const currentPrice = (+(planInfo?.price ?? 0) * params.rate).toFixed(2)

  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setPaymentMethod(method);
  };

  const handleCloseModal = () => {
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
      setIsPolling(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16">
        <div className="mb-8">
          <button
            onClick={() => router.replace('/')}
            className="flex items-center text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span>{t("backToPlans")}</span>
          </button>
        </div>

        <h1 className="text-3xl font-bold text-center mb-1 text-gray-900 dark:text-white">
          {t("checkoutTitle")}
        </h1>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-8">
          {t("completeYourOrder")}
        </p>

        {planInfoLoading ? (
          <div className="flex justify-center items-center py-32">
            <div className="flex flex-col items-center">
              <svg className="animate-spin mb-4 h-12 w-12 text-indigo-600" xmlns="http://www.w3.org/2000/svg"
                fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                  strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-gray-600 dark:text-gray-300 text-lg">{t("loadingPlanInfo")}</p>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <div
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-6">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-xl font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
                  <ShieldCheck className="w-5 h-5 mr-2 text-indigo-600" />
                  {t("orderSummary")}
                </h3>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">{t("productName")}</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {gT.has(`planTitle.${planInfo?.title}`) ? gT(`planTitle.${planInfo?.title}`) : planInfo?.title}
                    </span>
                  </div>

                  <div className="flex justify-between items-center ">
                    <span
                      className="text-gray-600 dark:text-gray-400">{t(discount ? "originalPrice" : "Price")}</span>
                    <span
                      className={
                        discount ? "text-gray-500 dark:text-gray-400 line-through"
                          : "font-medium text-gray-900 dark:text-white"
                      }>
                      {`${gT('priceSymbol')} ${originPrice}`}
                    </span>
                  </div>

                  {discount && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">{t("discountPrice")}</span>
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">
                        {`${gT('priceSymbol')} ${currentPrice}`}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">{t("paymentMethod")}</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {t(paymentMethod)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span
                      className="text-lg font-semibold text-gray-900 dark:text-white">{t("totalAmount")}</span>
                    <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                      {gT('priceSymbol')} {finalPrice}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
                  <CreditCard className="w-5 h-5 mr-2 text-indigo-600" />
                  {t("paymentMethod")}
                </h3>

                <div className="space-y-4">

                  {
                    (planInfo?.alipay_id || planInfo?.yimapay_id) &&
                    <PaymentOption checked={paymentMethod === "alipay"}
                      onClick={() => handlePaymentMethodChange("alipay")}
                      name={t("alipay")}
                      recommend={true}
                      mobilePay={true}
                    >
                      <div className="w-10 h-10  rounded-lg flex items-center justify-center mr-3">
                        <svg className="icon" viewBox="0 0 1024 1024" version="1.1"
                          xmlns="http://www.w3.org/2000/svg" p-id="11876" width="200" height="200">
                          <path
                            d="M1024.0512 701.0304V196.864A196.9664 196.9664 0 0 0 827.136 0H196.864A196.9664 196.9664 0 0 0 0 196.864v630.272A196.9152 196.9152 0 0 0 196.864 1024h630.272a197.12 197.12 0 0 0 193.8432-162.0992c-52.224-22.6304-278.528-120.32-396.4416-176.64-89.7024 108.6976-183.7056 173.9264-325.3248 173.9264s-236.1856-87.2448-224.8192-194.048c7.4752-70.0416 55.552-184.576 264.2944-164.9664 110.08 10.3424 160.4096 30.8736 250.1632 60.5184 23.1936-42.5984 42.496-89.4464 57.1392-139.264H248.064v-39.424h196.9152V311.1424H204.8V267.776h240.128V165.632s2.1504-15.9744 19.8144-15.9744h98.4576V267.776h256v43.4176h-256V381.952h208.8448a805.9904 805.9904 0 0 1-84.8384 212.6848c60.672 22.016 336.7936 106.3936 336.7936 106.3936zM283.5456 791.6032c-149.6576 0-173.312-94.464-165.376-133.9392 7.8336-39.3216 51.2-90.624 134.4-90.624 95.5904 0 181.248 24.4736 284.0576 74.5472-72.192 94.0032-160.9216 150.016-253.0816 150.016z"
                            fill="#009FE8" p-id="11877"></path>
                        </svg>
                      </div>
                    </PaymentOption>
                  }

                  {
                    (planInfo?.weixin_id || planInfo?.yimapay_id) &&
                    <PaymentOption checked={paymentMethod === "wechatPay"}
                      onClick={() => handlePaymentMethodChange("wechatPay")}
                      name={t("wechatPay")}
                      recommend={false}
                      mobilePay={true}
                    >
                      <div className="w-10 h-10  rounded-lg flex items-center justify-center mr-3">
                        <svg className="icon" viewBox="0 0 1228 1024" version="1.1"
                          xmlns="http://www.w3.org/2000/svg" p-id="12841" width="200" height="200">
                          <path
                            d="M530.8928 703.1296a41.472 41.472 0 0 1-35.7376-19.8144l-2.7136-5.5808L278.272 394.752a18.7392 18.7392 0 0 1-2.048-8.1408 19.968 19.968 0 0 1 20.48-19.3536c4.608 0 8.8576 1.4336 12.288 3.84l234.3936 139.9296a64.4096 64.4096 0 0 0 54.528 5.9392L1116.2624 204.8C1004.9536 80.896 821.76 0 614.4 0 275.0464 0 0 216.576 0 483.6352c0 145.7152 82.7392 276.8896 212.2752 365.5168a38.1952 38.1952 0 0 1 17.2032 31.488 44.4928 44.4928 0 0 1-2.1504 12.3904l-27.6992 97.4848c-1.3312 4.608-3.328 9.3696-3.328 14.1312 0 10.752 9.216 19.3536 20.48 19.3536 4.4032 0 8.0384-1.536 11.776-3.584l134.5536-73.3184c10.1376-5.5296 20.7872-8.96 32.6144-8.96 6.2976 0 12.288 0.9216 18.0736 2.5088 62.72 17.0496 130.4576 26.5728 200.5504 26.5728C953.7024 967.168 1228.8 750.592 1228.8 483.6352c0-80.9472-25.4464-157.1328-70.0416-224.1024l-604.9792 436.992-4.4544 2.4064a42.1376 42.1376 0 0 1-18.432 4.1984z"
                            fill="#15BA11" p-id="12842"></path>
                        </svg>
                      </div>
                    </PaymentOption>
                  }


                  {
                    planInfo?.afdian_info &&
                    <PaymentOption checked={paymentMethod === "afdian"}
                      onClick={() => handlePaymentMethodChange("afdian")}
                      name={t("afdian")}
                    >
                      <div className="w-10 h-10 0 rounded-lg flex items-center justify-center mr-3">
                        <svg className="icon" viewBox="0 0 1322 1024" version="1.1"
                          xmlns="http://www.w3.org/2000/svg" p-id="13954" width="200" height="200">
                          <path
                            d="M495.899049 634.906371c-17.304811 0-31.251971 13.947161-31.251971 31.251971S478.594238 697.410314 495.899049 697.410314c17.304811 0 31.251971-13.947161 31.251971-31.251972 0-17.304811-13.947161-31.251971-31.251971-31.251971zM790.855671 728.662285c-17.304811 0-31.251971 13.947161-31.251972 31.251971s13.947161 31.251971 31.251972 31.251972 31.251971-13.947161 31.251971-31.251972c0-17.04653-13.947161-30.993691-31.251971-31.251971z"
                            fill="#8F66DF" p-id="13955"></path>
                          <path
                            d="M1262.99289 719.622459c-13.430599-8.264984-28.927445-13.430599-44.68257-14.980284 34.867902-84.974368 57.080047-196.293374-18.596215-306.837537-115.193217-168.657333-280.75118-256.73107-491.766556-260.863562-60.179416-1.291404-130.948343 1.549685-205.849762 4.649054-87.040614 3.35765-203.008673 8.006703-281.526023 1.549684 15.755126-8.523265 32.543375-16.788249 47.007098-23.761829 55.530362-27.119479 98.921529-48.04022 84.457807-85.232649-7.748423-21.695583-30.218848-33.059937-67.411277-34.09306C206.624604-1.755689 37.967271 43.443443 7.748423 119.636265c-17.04653 42.874605-19.887618 125.524447 152.902206 198.876182 71.027208 30.218848 271.969635 66.894715 349.453861 74.643138 17.563091 1.549685 34.867902 5.165615 51.397871 11.364353-17.821372 11.622634-35.901025 24.02011-54.238959 36.417586-31.768533-18.079653-83.941245-39.516955-122.683358-13.172318-14.463722 9.298107-23.503549 25.053233-24.02011 42.358044-0.516562 21.179022 12.397476 42.099763 26.861198 58.629731-57.080047 45.715694-103.312302 89.881703-119.84227 123.974762-18.337934 41.841482-25.828075 110.544163 8.523265 177.438879 43.391167 84.974368 138.955046 144.120661 284.625391 176.147474 190.352916 41.583202 354.619476 4.132492 463.355674-53.205835 60.437697-32.026814 103.570583-69.994085 124.233043-103.828864 6.457019 2.066246 12.914038 4.132492 19.629338 6.198738 9.298107 2.841088 18.596214 5.682177 27.37776 8.781546 28.669164 10.072949 60.695977 8.523265 85.232649-3.61593l1.291403-0.774843c17.821372-9.039826 31.510252-25.053233 37.708991-44.166009 15.238565-51.139589-29.444006-79.033911-56.563486-96.08044z m-811.776412-239.684541l-17.30481 12.655757c-5.165615-5.165615-9.814669-11.106072-13.430599-17.563091 6.7153-2.066246 18.337934 0.258281 30.735409 4.907334zM1262.99289 798.139808c-1.291404 3.874211-4.132492 6.97358-9.298107 9.814669-10.33123 5.165615-25.569795 5.423896-39.258675 0.774842-9.298107-3.35765-19.371057-6.457019-29.444006-9.556388-18.596214-5.682177-49.848186-15.238565-55.788643-22.470426-9.814669-12.914038-28.152602-15.755126-41.32492-5.940457s-15.755126 28.152602-5.940458 41.324921c3.615931 4.390773 7.490142 8.264984 12.139196 11.622634-44.940851 62.245662-242.267348 186.220424-521.468844 125.007885-125.782728-27.636041-210.498815-77.742507-244.850155-145.412065-24.794952-48.815063-19.112776-98.921529-7.231861-126.299289 34.09306-71.027208 280.75118-234.518925 438.30244-327.241716 13.947161-8.264984 18.596214-26.344637 10.33123-40.291798s-27.119479-19.629337-40.291797-10.33123c-12.655757 7.490142-55.788643 33.059937-111.060725 68.186119-18.596214-12.655757-50.881309-27.894322-102.537459-33.059936-81.874999-8.264984-270.936512-44.42429-332.149051-70.252366C139.471608 245.418993 40.033517 196.34565 61.987381 141.073568c5.165615-12.914038 29.185725-33.576498 81.100157-53.464116 35.384463-13.430599 72.318611-22.470426 109.769321-27.119479l-11.622634 5.682176c-35.384463 17.304811-73.868296 36.417586-99.954652 59.146293-1.807965-1.033123-3.615931-2.324527-5.165615-3.874211-10.847792-11.622634-29.185725-12.397476-41.06664-1.291404l-0.516562 0.516561c-11.880915 11.106072-12.139195 29.702287-1.033123 41.583202 10.589511 11.106072 26.086356 19.371057 45.715694 25.569795 0.774842 0.258281 1.291404 0.516562 2.066246 0.774842 68.702681 21.179022 190.611197 18.596214 362.367899 11.622634 74.126577-2.841088 144.120661-5.682177 202.492111-4.649054 193.710566 3.874211 339.122631 80.841876 444.75946 235.552049 64.828469 95.047318 41.583202 188.544951 4.390773 269.903388-4.649054-3.615931-9.039826-7.748423-12.655757-12.139195-10.33123-12.397476-28.669164-14.463722-41.324921-4.649054-12.655757 10.072949-14.722003 28.669164-4.649054 41.324921 5.940457 7.490142 36.675867 42.874605 74.643138 39.775236h2.066246c1.291404-0.258281 2.324527 0 3.615931-0.258281 25.828075-4.649054 42.358044-3.615931 57.596608 6.198738 20.40418 12.914038 30.218848 20.40418 28.410883 26.861199z"
                            fill="#8F66DF" p-id="13956"></path>
                        </svg>
                      </div>
                    </PaymentOption>
                  }
                </div>
              </div>
            </div>

            <div
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <Button
                onPress={handlePayment}
                isDisabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 transition-colors text-white p-4 rounded-xl font-medium text-base flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                        strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t("processing")}
                  </>
                ) : (
                  <>
                    {t("confirmPayment")}
                  </>
                )}
              </Button>

              <div className="mt-6">
                <div className="flex items-center justify-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <ShieldCheck className="w-4 h-4 mr-2 text-emerald-500" />
                  <span>{t("securePayment")}</span>
                </div>
                <a href="/disclaimer.html" target="_blank"
                  className="block text-center text-xs text-gray-500 dark:text-gray-400">
                  {t("privacyNotice")}
                </a>
              </div>
            </div>
          </div>
        )}

        {
          planInfo && !usePayWithH5 &&
          <>
            <HtmlFormPayModal
              paymentHtml={paymentHtml}
              paymentType={t("alipay")}
              open={paymentHtml !== ""}
              planInfo={planInfo}
              rate={params.rate}
              orderInfo={orderInfo}
              isPolling={isPolling}
              onClose={handleCloseModal}
            />
            <QRCodePayModal
              qrCodeCircleColor={"bg-[#009FE8] border-2 border-[#009FE8]"}
              qrCodeIcon={
                <div className="w-10 h-10 bg-white  rounded-lg flex items-center justify-center mr-3">
                  <svg className="icon" viewBox="0 0 1024 1024" version="1.1"
                    xmlns="http://www.w3.org/2000/svg" p-id="11876" width="200" height="200">
                    <path
                      d="M1024.0512 701.0304V196.864A196.9664 196.9664 0 0 0 827.136 0H196.864A196.9664 196.9664 0 0 0 0 196.864v630.272A196.9152 196.9152 0 0 0 196.864 1024h630.272a197.12 197.12 0 0 0 193.8432-162.0992c-52.224-22.6304-278.528-120.32-396.4416-176.64-89.7024 108.6976-183.7056 173.9264-325.3248 173.9264s-236.1856-87.2448-224.8192-194.048c7.4752-70.0416 55.552-184.576 264.2944-164.9664 110.08 10.3424 160.4096 30.8736 250.1632 60.5184 23.1936-42.5984 42.496-89.4464 57.1392-139.264H248.064v-39.424h196.9152V311.1424H204.8V267.776h240.128V165.632s2.1504-15.9744 19.8144-15.9744h98.4576V267.776h256v43.4176h-256V381.952h208.8448a805.9904 805.9904 0 0 1-84.8384 212.6848c60.672 22.016 336.7936 106.3936 336.7936 106.3936zM283.5456 791.6032c-149.6576 0-173.312-94.464-165.376-133.9392 7.8336-39.3216 51.2-90.624 134.4-90.624 95.5904 0 181.248 24.4736 284.0576 74.5472-72.192 94.0032-160.9216 150.016-253.0816 150.016z"
                      fill="#009FE8" p-id="11877"></path>
                  </svg>
                </div>
              }
              paymentUrl={paymentUrl}
              paymentType={t("alipay")}
              open={showModal === "alipay" && paymentUrl !== ""}
              planInfo={planInfo}
              rate={params.rate}
              orderInfo={orderInfo}
              isPolling={isPolling}
              onClose={handleCloseModal}
            />
            <QRCodePayModal
              qrCodeCircleColor={"bg-[#15BA11] border-2 border-[#15BA11]"}
              qrCodeIcon={
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mr-3">
                  <svg className="icon" viewBox="0 0 1228 1024" version="1.1"
                    xmlns="http://www.w3.org/2000/svg" p-id="12841" width="200" height="200">
                    <path
                      d="M530.8928 703.1296a41.472 41.472 0 0 1-35.7376-19.8144l-2.7136-5.5808L278.272 394.752a18.7392 18.7392 0 0 1-2.048-8.1408 19.968 19.968 0 0 1 20.48-19.3536c4.608 0 8.8576 1.4336 12.288 3.84l234.3936 139.9296a64.4096 64.4096 0 0 0 54.528 5.9392L1116.2624 204.8C1004.9536 80.896 821.76 0 614.4 0 275.0464 0 0 216.576 0 483.6352c0 145.7152 82.7392 276.8896 212.2752 365.5168a38.1952 38.1952 0 0 1 17.2032 31.488 44.4928 44.4928 0 0 1-2.1504 12.3904l-27.6992 97.4848c-1.3312 4.608-3.328 9.3696-3.328 14.1312 0 10.752 9.216 19.3536 20.48 19.3536 4.4032 0 8.0384-1.536 11.776-3.584l134.5536-73.3184c10.1376-5.5296 20.7872-8.96 32.6144-8.96 6.2976 0 12.288 0.9216 18.0736 2.5088 62.72 17.0496 130.4576 26.5728 200.5504 26.5728C953.7024 967.168 1228.8 750.592 1228.8 483.6352c0-80.9472-25.4464-157.1328-70.0416-224.1024l-604.9792 436.992-4.4544 2.4064a42.1376 42.1376 0 0 1-18.432 4.1984z"
                      fill="#15BA11" p-id="12842"></path>
                  </svg>
                </div>
              }
              paymentUrl={paymentUrl}
              paymentType={t("wechatPay")}
              open={showModal === "wechatPay" && paymentUrl !== ""}
              planInfo={planInfo}
              rate={params.rate}
              orderInfo={orderInfo}
              isPolling={isPolling}
              onClose={handleCloseModal}
            />
          </>
        }
        {
          planInfo && usePayWithH5 &&
          <>
            <WaitForPayModal
              open={showModal === "wechatPay"}
              paymentType={t("wechatPay")}
              isLoading={isPolling}
              orderInfo={orderInfo}
              onClose={handleCloseModal}
            />
            <WaitForPayModal
              open={showModal === "alipay"}
              paymentType={t("alipay")}
              isLoading={isPolling}
              orderInfo={orderInfo}
              onClose={handleCloseModal}
            />
          </>
        }
        {
          planInfo?.afdian_info &&
          <WaitForPayModal
            open={showModal === "afdian"}
            paymentType={t("afdianPayment")}
            isLoading={isPolling}
            orderInfo={orderInfo}
            onClose={handleCloseModal}
          />
        }
      </div>
    </div>
  );
} 