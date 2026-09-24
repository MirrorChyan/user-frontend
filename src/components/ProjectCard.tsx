"use client";

import { useMemo, useState } from "react";
import {
  Button,
  Input,
  Link,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Tooltip,
  useDisclosure,
} from "@heroui/react";
import { stringToColor } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";
import { addToast } from "@heroui/toast";
import { CLIENT_BACKEND } from "@/app/requests/misc";
import { ArrowTopRightOnSquareIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/16/solid";
import { getGroupUrl } from "@/lib/utils/constant";
import { detectPlatform, isInAppBrowser } from "@/lib/utils/browserDetection";
import {
  matchSupportSelection,
  parseSupportOptions,
  type SupportOption,
} from "@/lib/utils/support";
import { copyText } from "@/lib/utils/clipboard";
import InAppDownloadNotice from "@/components/InAppDownloadNotice";

export interface ProjectCardProps {
  type_id: string;
  resource: string;
  name: string;
  desc: string;
  url?: string;
  image?: string;
  support: string[];
  download: boolean;
  showModal?: boolean;
  osParam?: string | null;
  archParam?: string | null;
  channelParam?: string | null;
}

// 锁定选项的只读展示：禁用鼠标交互，键盘聚焦时也不显示输入光标
const lockedInputClassNames = {
  inputWrapper: "pointer-events-none",
  input: "caret-transparent",
};

type LatestDownloadResult =
  | { status: "ok"; url: string; version: string }
  | { status: "error"; code: number; msg: string }
  | { status: "noUrl"; msg: string };

async function fetchLatestDownload(
  resource: string,
  query: URLSearchParams
): Promise<LatestDownloadResult> {
  const response = await fetch(
    `${CLIENT_BACKEND}/api/resources/${encodeURIComponent(resource)}/latest?${query}`
  );
  const { code, msg, data } = await response.json();
  if (code !== 0) {
    return { status: "error", code, msg };
  }
  if (!data.url) {
    return { status: "noUrl", msg };
  }
  return { status: "ok", url: data.url, version: data.version_name };
}

type SelectionParams = Pick<
  ProjectCardProps,
  "showModal" | "osParam" | "archParam" | "channelParam"
>;

function getInitialSelection(
  options: SupportOption[],
  { showModal, osParam, archParam, channelParam }: SelectionParams
) {
  // 取解析后的首项，避免带 rid 前缀的条目被 split("-") 拆错
  const first = options[0];
  let channel = first?.channel ?? "";
  let os = first?.os === "any" ? "" : (first?.os ?? "");
  let arch = first?.arch === "any" ? "" : (first?.arch ?? "");

  // URL 参数只对被 rid 命中、即将自动打开的卡片生效
  if (showModal) {
    if (channelParam != null) {
      channel = channelParam;
    }
    if (osParam != null) {
      os = osParam;
    }
    if (archParam != null) {
      arch = archParam;
    } else if (osParam != null) {
      // URL 中指定了 os 但没有 arch 参数时，清空 arch 以避免残留不匹配的默认值
      arch = "";
    }
  }

  const fromUrl = showModal && (osParam != null || archParam != null);
  if (!fromUrl) {
    const matched = matchSupportSelection(options, channel, detectPlatform());
    if (matched) {
      os = matched.os;
      arch = matched.arch;
    }
  }

  return { channel, os, arch };
}

export default function ProjectCard(props: ProjectCardProps) {
  const {
    name,
    desc,
    image,
    url,
    support,
    resource,
    download,
    showModal,
    osParam,
    archParam,
    channelParam,
  } = props;

  const avatarBgColor = useMemo(() => stringToColor(name), [name]);
  const avatarText = useMemo(() => name.charAt(0).toUpperCase(), [name]);

  // 被 URL 中 rid 命中的卡片直接打开下载弹窗
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure({ defaultOpen: showModal });

  const locale = useLocale();

  const supportOptions = useMemo(() => parseSupportOptions(support), [support]);

  // 初始选中项只在首次渲染时计算。选项只在弹窗里展示，弹窗不参与服务端渲染，
  // 因此客户端按 UA 算出的值与服务端不同也不会导致水合不一致
  const [initialSelection] = useState(() =>
    getInitialSelection(supportOptions, { showModal, osParam, archParam, channelParam })
  );
  const [channel, setChannel] = useState(initialSelection.channel);
  const [os, setOs] = useState(initialSelection.os);
  const [arch, setArch] = useState(initialSelection.arch);

  const [cdk, setCdk] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [downloadStarted, setDownloadStarted] = useState(false);
  const [isLoadingAnimation, setIsLoadingAnimation] = useState(false);
  const [version, setVersion] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  // 自动打开下载是否成功，失败(被拦截或 App 内置浏览器)时引导用户手动下载
  const [autoDownloaded, setAutoDownloaded] = useState(false);
  const [inAppBrowser, setInAppBrowser] = useState(false);
  // 复制失败时展示分享链接，供用户手动复制
  const [shareUrl, setShareUrl] = useState("");

  const t = useTranslations("Download");
  const p = useTranslations("Projects");
  const common = useTranslations("Common");

  const availableChannel = useMemo(() => {
    return [...new Set(supportOptions.map(item => item.channel))];
  }, [supportOptions]);

  // 只有一个具体选项(非 any)时锁定为该值，不允许展开选择
  const lockedValue = (items: { value: string }[]) =>
    items.length === 1 && items[0].value !== "any" ? items[0].value : null;

  const lockedChannel = availableChannel.length === 1 ? availableChannel[0] : null;
  const selectedChannel = lockedChannel ?? channel;

  const availableOS = useMemo(() => {
    if (!selectedChannel) return [];
    return [
      ...new Set(
        supportOptions.filter(item => item.channel === selectedChannel).map(item => item.os)
      ),
    ].map(item => ({
      label: item,
      value: item,
    }));
  }, [selectedChannel, supportOptions]);

  const lockedOs = lockedValue(availableOS);
  const selectedOs = lockedOs ?? os;

  const renderFixedSelect = (value: any[]) => {
    return !(value.length === 0 || (value.length === 1 && value[0].value === "any"));
  };

  const availableArch = useMemo(() => {
    if (!selectedChannel) return [];
    // OS 全为 "any" 时 os 状态保持空字符串，此时用 "any" 作为过滤值
    const effectiveOs = !renderFixedSelect(availableOS) ? "any" : selectedOs;
    if (!effectiveOs) return [];
    return [
      ...new Set(
        supportOptions
          .filter(item => item.channel === selectedChannel && item.os === effectiveOs)
          .map(item => item.arch)
      ),
    ].map(item => ({
      label: item,
      value: item,
    }));
  }, [selectedChannel, supportOptions, selectedOs, availableOS]);

  const lockedArch = lockedValue(availableArch);
  const selectedArch = lockedArch ?? arch;

  const updateUrlParams = (newChannel: string, newOs: string, newArch: string) => {
    if (typeof window === "undefined") return;
    const s = new URLSearchParams(window.location.search);
    if (s.has("rid")) {
      if (newChannel) {
        s.set("channel", newChannel);
      } else {
        s.delete("channel");
      }
      if (newOs) {
        s.set("os", newOs);
      } else {
        s.delete("os");
      }
      if (newArch) {
        s.set("arch", newArch);
      } else {
        s.delete("arch");
      }
      window.history.replaceState(null, "", `${window.location.pathname}?${s}`);
    }
  };

  const handleChannelChange = (value: any) => {
    setChannel(value);
    setOs("");
    setArch("");
    updateUrlParams(value, "", "");
  };

  const handleOSChange = (value: any) => {
    setOs(value);
    setArch("");
    updateUrlParams(selectedChannel, value, "");
  };

  const handleArchChange = (value: any) => {
    setArch(value);
    updateUrlParams(selectedChannel, selectedOs, value);
  };

  // 互斥的状态
  const [loading, setLoading] = useState<{
    loading: boolean;
    type?: "Share" | "Download";
  }>({
    loading: false,
  });

  const queryUrl = async (type: "Share" | "Download") => {
    if (!selectedChannel) {
      addToast({
        description: t("noChannel"),
        color: "warning",
      });
      return;
    }
    if (renderFixedSelect(availableOS) && selectedOs === "") {
      addToast({
        description: t("noOs"),
        color: "warning",
      });
      return;
    }
    if (renderFixedSelect(availableArch) && selectedArch === "") {
      addToast({
        description: t("noArch"),
        color: "warning",
      });
      return;
    }
    if (!cdk) {
      addToast({
        description: t("noCDKey"),
        color: "warning",
      });
      return;
    }
    // 根据当前选择的 channel、os、arch 找到对应的 supportOption，获取其 rid
    const currentOption = supportOptions.find(
      item =>
        item.channel === selectedChannel &&
        (item.os === selectedOs || item.os === "any") &&
        (item.arch === selectedArch || item.arch === "any")
    );
    // 如果 supportOption 中有自定义的 rid，使用它；否则使用原始的 resource
    const targetResource = currentOption?.rid || resource;

    const query = new URLSearchParams({
      os: selectedOs === "any" ? "" : selectedOs,
      arch: selectedArch === "any" ? "" : selectedArch,
      channel: selectedChannel,
      cdk: cdk.trim(),
      user_agent: "mirrorchyan_web",
    });

    setLoading({ loading: true, type });
    const result = await fetchLatestDownload(targetResource, query).catch((error: unknown) => {
      console.error(error);
      return null;
    });
    setLoading({ loading: false, type });

    if (!result) {
      addToast({ description: common("networkError"), color: "danger" });
      return;
    }
    if (result.status === "error") {
      // code 为 1 时直接展示后端返回的信息，其余错误码使用本地化文案
      addToast({
        description: result.code === 1 ? result.msg : t(result.code.toString()),
        color: "warning",
      });
      return;
    }
    if (result.status === "noUrl") {
      addToast({ description: result.msg, color: "danger" });
      return;
    }

    setVersion(result.version);
    return result.url;
  };

  const handleShare = async () => {
    const url = await queryUrl("Share");
    if (!url) {
      return;
    }
    const downloadKey = url.substring(url.lastIndexOf("/") + 1);
    const link = `${window.location.origin}/${locale}/projects/?${new URLSearchParams({
      source: `dlshare-${resource}`,
      download: downloadKey,
    })}`;

    // 接口返回后已失去用户激活，Safari/iOS 可能拒绝写入剪贴板，此时展示链接让用户手动复制
    if (await copyText(link)) {
      setShareUrl("");
      addToast({
        description: t("shared"),
        color: "primary",
      });
    } else {
      setShareUrl(link);
    }
    console.log(
      `shared key ${downloadKey} for ${name} tuple: ${selectedOs}-${selectedArch}-${selectedChannel}${cdk ? ` cdk: ${cdk}` : ""}`
    );
  };

  const handleDownload = async () => {
    const url = await queryUrl("Download");
    if (!url) {
      return;
    }

    // App 内置浏览器会拦截下载；其他浏览器在 await 之后打开新窗口也可能被拦截
    const inApp = isInAppBrowser();
    const opened = !inApp && window.open(url, "_blank") !== null;

    setDownloadUrl(new URL(url, window.location.href).href);
    setInAppBrowser(inApp);
    setAutoDownloaded(opened);
    setDownloadStarted(true);
    if (!opened) {
      return;
    }
    setIsLoadingAnimation(true);

    // 糊点安慰剂)
    setTimeout(() => {
      setIsLoadingAnimation(false);
    }, 1000);
  };

  const openModal = () => {
    if (!download) {
      addToast({
        variant: "solid",
        description: p
          .rich("onlyInternalUpdate", {
            name,
          })
          ?.toString(),
        color: "secondary",
      });
      return;
    }
    onOpen();
    if (!showModal) {
      const s = new URLSearchParams(window.location.search);
      s.set("rid", resource);
      if (selectedOs) {
        s.set("os", selectedOs);
      }
      if (selectedArch) {
        s.set("arch", selectedArch);
      }
      if (selectedChannel) {
        s.set("channel", selectedChannel);
      }
      window.history.replaceState(null, "", `/${locale}/projects?${s}`);
    }
  };

  const onModalClose = () => {
    const s = new URLSearchParams(window.location.search);
    s.delete("rid");
    s.delete("os");
    s.delete("arch");
    s.delete("channel");
    // URLSearchParams.size 在 Chrome 113 / Safari 17 以下不存在
    if (s.toString() === "") {
      window.history.replaceState(null, "", `/${locale}/projects`);
    } else {
      window.history.replaceState(null, "", `/${locale}/projects?${s}`);
    }

    setDownloadStarted(false);
    setIsLoadingAnimation(false);
    setShareUrl("");
  };

  return (
    <div
      className={
        "group dark:hover:shadow-primary-500/30 relative transform cursor-pointer overflow-hidden rounded-lg border border-gray-100 bg-gradient-to-br from-white to-gray-50 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-gray-600 dark:from-gray-800 dark:to-gray-900"
      }
      onClick={openModal}
    >
      {url && (
        <div className="absolute top-2 right-2 z-10">
          <Tooltip
            content={<span className="px-1 py-2">{p("openProjectHomepage")}</span>}
            showArrow={true}
            placement="top"
          >
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="flex h-8 w-8 items-center justify-center transition-colors duration-200"
            >
              <ArrowTopRightOnSquareIcon className="group-hover:text-primary-600 dark:group-hover:text-primary-400 h-4 w-4 text-gray-600 dark:text-gray-300" />
            </a>
          </Tooltip>
        </div>
      )}
      <div className="flex p-4">
        {image ? (
          <div
            className="relative mr-4 flex-shrink-0 overflow-hidden rounded-md bg-gray-50 shadow-sm dark:bg-gray-700"
            style={{ width: "80px", height: "80px" }}
          >
            <img
              src={CLIENT_BACKEND + image}
              alt={name}
              className="h-full w-full rounded-md object-cover opacity-90 transition-transform duration-500 ease-in-out group-hover:scale-105 group-hover:opacity-100"
            />
          </div>
        ) : (
          <div
            className="relative mr-4 flex flex-shrink-0 items-center justify-center overflow-hidden rounded-md text-2xl font-bold text-white shadow-sm"
            style={{
              width: "80px",
              height: "80px",
              backgroundColor: avatarBgColor,
            }}
          >
            {avatarText}
          </div>
        )}
        <div className="flex flex-col justify-center">
          <h3 className="group-hover:text-primary-600 dark:group-hover:text-primary-400 text-lg font-semibold text-gray-900 transition-colors duration-300 dark:text-white">
            {name}
          </h3>
        </div>
      </div>
      <div className="mt-3.5 px-4 pb-4">
        <p className="text-sm text-gray-600 transition-colors duration-300 group-hover:text-gray-800 dark:text-gray-300 dark:group-hover:text-gray-200">
          {desc}
        </p>
      </div>

      <Modal
        isDismissable={false}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onClose={onModalClose}
        backdrop="opaque"
        size="2xl"
        placement="center"
        scrollBehavior="inside"
        classNames={{
          wrapper: "sm:items-center",
          base: "max-sm:my-2 max-sm:mx-2 max-sm:max-h-[calc(100vh-1rem)] max-sm:h-[calc(100vh-1rem)]",
        }}
      >
        <ModalContent>
          <>
            <ModalHeader className="flex flex-col gap-1">
              {downloadStarted ? "" : `${t("download")} ${name}`}
            </ModalHeader>
            <ModalBody>
              {downloadStarted ? (
                <div className="space-y-6 py-8">
                  <div className="text-center">
                    <div className="mb-4">
                      <div
                        className={`mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full ${
                          isLoadingAnimation
                            ? "bg-primary-100 dark:bg-primary-900"
                            : "bg-green-100 dark:bg-green-900"
                        }`}
                      >
                        {isLoadingAnimation ? (
                          <svg
                            className="text-primary-600 dark:text-primary-400 h-8 w-8 animate-spin"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                              className="opacity-25"
                            ></circle>
                            <path
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              className="opacity-75"
                            ></path>
                          </svg>
                        ) : (
                          <svg
                            className="h-8 w-8 text-green-600 dark:text-green-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                      <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                        {isLoadingAnimation
                          ? t("downloading")
                          : autoDownloaded
                            ? t("downloadStarted", { name, version })
                            : t("downloadReady", { name, version })}
                      </h3>
                      {(isLoadingAnimation || autoDownloaded) && (
                        <p className="text-gray-600 dark:text-gray-300">
                          {isLoadingAnimation ? t("pleaseWait") : t("downloadInProgress")}
                        </p>
                      )}
                      {!isLoadingAnimation &&
                        !inAppBrowser &&
                        (autoDownloaded ? (
                          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                            {t("manualDownloadHint")}
                            <a
                              href={downloadUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-600 dark:text-primary-400 ml-1 underline"
                            >
                              {t("manualDownloadLink")}
                            </a>
                          </p>
                        ) : (
                          <Button
                            as="a"
                            href={downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            color="primary"
                            className="mt-4"
                          >
                            {t("clickToDownload")}
                          </Button>
                        ))}
                    </div>
                  </div>

                  {inAppBrowser && <InAppDownloadNotice url={downloadUrl} />}

                  <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-900/20">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-orange-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-orange-800 dark:text-orange-300">
                          {t("importantNote")}
                        </h4>
                        <div className="mt-1 text-sm text-orange-700 dark:text-orange-400">
                          <p>{t("downloadWarning")}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-blue-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <a
                        className="group cursor-pointer"
                        onClick={() => {
                          getGroupUrl().then(url => {
                            window.open(url, "_blank");
                          });
                        }}
                      >
                        <div className="ml-3">
                          <h4 className="text-sm font-medium text-blue-800 group-hover:underline dark:text-blue-300">
                            {t("downloadProblems")}
                          </h4>
                          <div className="mt-1 text-sm text-blue-700 group-hover:underline dark:text-blue-400">
                            <ul className="list-inside list-disc space-y-1">
                              <li className="group-hover:underline">{t("troubleshoot1")}</li>
                            </ul>
                          </div>
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex p-4">
                    {image ? (
                      <div
                        className="relative mr-4 flex-shrink-0 overflow-hidden rounded-md bg-gray-50 shadow-sm dark:bg-gray-700"
                        style={{ width: "80px", height: "80px" }}
                      >
                        <img
                          src={CLIENT_BACKEND + image}
                          alt={name}
                          className="h-full w-full rounded-md object-cover opacity-90 transition-transform duration-500 ease-in-out group-hover:scale-105 group-hover:opacity-100"
                        />
                      </div>
                    ) : (
                      <div
                        className="relative mr-4 flex flex-shrink-0 items-center justify-center overflow-hidden rounded-md text-2xl font-bold text-white shadow-sm"
                        style={{
                          width: "80px",
                          height: "80px",
                          backgroundColor: avatarBgColor,
                        }}
                      >
                        {avatarText}
                      </div>
                    )}
                    {/* <div className="flex flex-col justify-center">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">
                        {name}
                      </h3>
                    </div> */}
                    <div className="self-center px-4 pb-4">
                      <p className="text-sm text-gray-600 transition-colors duration-300 group-hover:text-gray-800 dark:text-gray-300 dark:group-hover:text-gray-200">
                        {desc}
                      </p>
                      {url && (
                        <div className="mt-6">
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 inline-flex items-center gap-1 text-sm transition-colors"
                          >
                            <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                            {p("openProjectHomepage")}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="flex-1">
                      {lockedChannel ? (
                        <Input
                          label={t("channel")}
                          value={t(lockedChannel)}
                          isReadOnly
                          className="w-full"
                          classNames={lockedInputClassNames}
                        />
                      ) : (
                        <Select
                          label={t("channel")}
                          placeholder={t("noChannel")}
                          onChange={e => handleChannelChange(e.target.value)}
                          className="w-full"
                          isDisabled={availableChannel.length === 0}
                          selectedKeys={[selectedChannel]}
                        >
                          {availableChannel.map(channelOption => (
                            <SelectItem key={channelOption}>{t(channelOption)}</SelectItem>
                          ))}
                        </Select>
                      )}
                    </div>

                    {renderFixedSelect(availableOS) && (
                      <div className="flex-1">
                        {lockedOs ? (
                          <Input
                            label={t("os")}
                            value={lockedOs}
                            isReadOnly
                            className="w-full"
                            classNames={lockedInputClassNames}
                          />
                        ) : (
                          <Select
                            label={t("os")}
                            placeholder={t("noOs")}
                            onChange={e => handleOSChange(e.target.value)}
                            className="w-full"
                            items={availableOS}
                            selectedKeys={[selectedOs]}
                          >
                            {item => <SelectItem key={item.value}>{item.label}</SelectItem>}
                          </Select>
                        )}
                      </div>
                    )}

                    {renderFixedSelect(availableArch) && (
                      <div className="flex-1">
                        {lockedArch ? (
                          <Input
                            label={t("arch")}
                            value={lockedArch}
                            isReadOnly
                            className="w-full"
                            classNames={lockedInputClassNames}
                          />
                        ) : (
                          <Select
                            label={t("arch")}
                            placeholder={t("noArch")}
                            onChange={e => handleArchChange(e.target.value)}
                            className="w-full"
                            items={availableArch}
                            selectedKeys={[selectedArch]}
                          >
                            {item => <SelectItem key={item.value}>{item.label}</SelectItem>}
                          </Select>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-row gap-3">
                    <div className="flex-1">
                      <Input
                        label="CDK"
                        placeholder={t("noCDKey")}
                        value={cdk}
                        type={isPasswordVisible ? "text" : "password"}
                        onChange={e => setCdk(e.target.value)}
                        className="w-full"
                        endContent={
                          <div className="flex h-5/6">
                            <button
                              type="button"
                              onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                              className="focus:outline-none dark:text-gray-300"
                            >
                              {isPasswordVisible ? (
                                <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-300" />
                              ) : (
                                <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-300" />
                              )}
                            </button>
                          </div>
                        }
                      />
                    </div>
                    <div className="self-center whitespace-nowrap">
                      <Link href="/" target="_blank" size="sm" color="primary" underline="hover">
                        {t("buyCDKey")}
                      </Link>
                    </div>
                  </div>

                  {shareUrl && (
                    <Input
                      label={t("shareLink")}
                      description={t("copyShareLinkManually")}
                      value={shareUrl}
                      isReadOnly
                      onFocus={e => e.target.select()}
                      endContent={
                        <Button
                          size="sm"
                          variant="flat"
                          onPress={async () => {
                            if (await copyText(shareUrl)) {
                              addToast({ description: t("shared"), color: "primary" });
                            }
                          }}
                        >
                          {t("copy")}
                        </Button>
                      }
                    />
                  )}
                </div>
              )}
              {!downloadStarted && (
                <div className="bottom-4 mt-10 w-full text-center text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                  {t.rich("disclaimer", {
                    rid: name,
                    br: () => <br />,
                  })}
                  <a href="/disclaimer.html" target="_blank">
                    {t("disclaimerLink")}
                    <span aria-hidden="true">&nbsp;</span>
                  </a>
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              {downloadStarted ? (
                <Button
                  color="primary"
                  onPress={() => {
                    setDownloadStarted(false);
                  }}
                  className="w-full"
                >
                  {common("close")}
                </Button>
              ) : (
                <>
                  <Button
                    color="danger"
                    variant="light"
                    onPress={() => {
                      onClose();
                      onModalClose();
                    }}
                  >
                    {common("cancel")}
                  </Button>
                  <Button
                    color="secondary"
                    onPress={handleShare}
                    isLoading={loading.loading && loading.type === "Share"}
                  >
                    {t("shareLink")}
                  </Button>
                  <Button
                    color="primary"
                    onPress={handleDownload}
                    isLoading={loading.loading && loading.type === "Download"}
                  >
                    {t("download")}
                  </Button>
                </>
              )}
            </ModalFooter>
          </>
        </ModalContent>
      </Modal>
    </div>
  );
}
