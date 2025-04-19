"use client";

import React, { useLayoutEffect, useMemo, useState } from "react";
import {
  Link,
  Tooltip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Input,
  Select,
  SelectItem
} from "@heroui/react";
import { stringToColor } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";
import { addToast, ToastProps } from "@heroui/toast";
import { CLIENT_BACKEND } from "@/app/requests/misc";
import { EyeIcon, EyeSlashIcon, ArrowTopRightOnSquareIcon } from "@heroicons/react/16/solid";
import { useSearchParams } from "next/navigation";

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


export default function ProjectCard(props: ProjectCardProps) {
  const { name, desc, image, url, support, resource, download, showModal, osParam, archParam, channelParam } = props;

  const avatarBgColor = useMemo(() => stringToColor(name), [name]);
  const avatarText = useMemo(() => name.charAt(0).toUpperCase(), [name]);

  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  const locale = useLocale()


  const first = (support?.[0]?.split("-")) || [];

  const [channel, setChannel] = useState(first[0] ?? "");
  const [os, setOs] = useState(first[1] === "any" ? "" : (first[1] ?? ""));
  const [arch, setArch] = useState(first[2] === "any" ? "" : (first[2] ?? ""));

  const [cdk, setCdk] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);


  const t = useTranslations("Download");
  const p = useTranslations("Projects");
  const common = useTranslations("Common");

  useLayoutEffect(() => {
    if (showModal) {
      if (osParam) {
        setOs(osParam);
      }
      if (archParam) {
        setArch(archParam);
      }
      if (channelParam) {
        setChannel(channelParam);
      }
      onOpen();
    }
  }, []);


  const supportOptions = useMemo(() => {
    return support.map(item => {
      const parts = item.split("-");
      return {
        channel: parts[0],
        os: parts[1],
        arch: parts[2],
      };
    });
  }, [support]);

  const availableChannel = useMemo(() => {
    return [...new Set(supportOptions.map(item => item.channel))];
  }, [supportOptions]);

  const availableOS = useMemo(() => {
    if (!channel) return [];
    return [...new Set(supportOptions
      .filter(item => item.channel === channel)
      .map(item => item.os))]
      .map(item => ({
        label: item,
        value: item,
      }));
  }, [channel, supportOptions]);

  const availableArch = useMemo(() => {
    if (!channel || !os) return [];
    return [...new Set(supportOptions
      .filter(item => item.channel === channel && item.os === os)
      .map(item => item.arch))]
      .map(item => ({
        label: item,
        value: item,
      }));
  }, [channel, supportOptions, os]);

  const renderFixedSelect = (value: any[]) => {
    return !(value.length === 0 || (value.length === 1 && value[0].value === "any"));
  };

  const handleChannelChange = (value: any) => {
    setChannel(value);
    setOs("");
    setArch("");
  };

  const handleOSChange = (value: any) => {
    setOs(value);
    setArch("");
  };

  const handleArchChange = (value: any) => {
    setArch(value);
  };


  // 互斥的状态
  const [loading, setLoading] = useState<{
    loading: boolean;
    type?: "Share" | "Download";
  }>({
    loading: false,
  });

  const queryUrl = async (type: "Share" | "Download") => {
    if (!channel) {
      addToast({
        description: t("noChannel"),
        color: "warning"
      });
      return;
    }
    if (renderFixedSelect(availableOS) && os === "") {
      addToast({
        description: t("noOs"),
        color: "warning"
      });
      return;
    }
    if (renderFixedSelect(availableArch) && arch === "") {
      addToast({
        description: t("noArch"),
        color: "warning"
      });
      return;
    }
    if (!cdk) {
      addToast({
        description: t("noCDKey"),
        color: "warning"
      });
      return;
    }
    setLoading({
      loading: true,
      type: type
    });
    try {
      const dl = `${CLIENT_BACKEND}/api/resources/${resource}/latest?os=${os}&arch=${arch}&channel=${channel}&cdk=${cdk}&user_agent=mirrorchyan_web`;
      const response = await fetch(dl);

      const { code, msg, data } = await response.json();
      if (code !== 0) {
        const props = {
          description: msg,
          color: "warning"
        };
        if (code !== 1) {
          props.description = t(code.toString());
        }
        addToast(props as ToastProps);
        return;
      }

      const url = data.url;
      if (!url) {
        addToast({
          description: msg,
          color: "danger"
        });
        return;
      }

      return url;

    } finally {
      setLoading({
        loading: false,
        type: type
      });
    }
  }

  const handleShare = async () => {
    const url = await queryUrl("Share");
    if (!url) {
      return;
    }
    const downloadKey = url.substring(url.lastIndexOf("/") + 1);
    const shareUrl = `${window.location.origin}/${locale}/projects/?download=${downloadKey}`
    await navigator.clipboard.writeText(shareUrl);

    addToast({
      description: t("shared"),
      color: "primary",
    });
    console.log(`shared key ${downloadKey} for ${name} tuple: ${os}-${arch}-${channel}${cdk ? ` cdk: ${cdk}` : ""}`);

    onOpenChange();
  }

  const handleDownload = async () => {
    const url = await queryUrl("Download");
    if (!url) {
      return;
    }
    window.location.href = url;

    addToast({
      description: t("downloading"),
      color: "primary",
    });

    onOpenChange();
  };

  const Conditioned = ({ children, condition }: {
    condition: () => boolean
    children: React.ReactElement
  }) => {
    return condition() ? children : <></>;
  };
  const openModal = () => {
    if (!download) {
      addToast({
        variant: "solid",
        description: p.rich("onlyInternalUpdate", {
          name
        })?.toString(),
        color: "secondary"
      });
      return;
    }
    onOpen();
    if (!showModal) {
      const s = new URLSearchParams(window.location.search);
      s.set('rid', resource)
      window.history.replaceState(null, "", `/${locale}/projects?${s}`)
    }
  };


  return (
    <div
      className={"rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg dark:hover:shadow-primary-500/30 transform hover:-translate-y-1 group cursor-pointer bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-100 dark:border-gray-600 relative"}
      onClick={openModal}
    >
      {url && (
        <div className="absolute top-2 right-2 z-10">
          <Tooltip content={<span className="px-1 py-2">{p("openProjectHomepage")}</span>} showArrow={true} placement="top">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-center w-8 h-8 transition-colors duration-200"
            >
              <ArrowTopRightOnSquareIcon className="h-4 w-4 text-gray-600 dark:text-gray-300 group-hover:text-primary-600 dark:group-hover:text-primary-400" />
            </a>
          </Tooltip>
        </div>
      )}
      <div className="flex p-4">
        {
          image ? (
            <div className="relative overflow-hidden flex-shrink-0 mr-4 bg-gray-50 dark:bg-gray-700 rounded-md shadow-sm"
              style={{ width: "80px", height: "80px" }}>
              <img
                src={image}
                alt={name}
                className="w-full h-full object-cover rounded-md opacity-90 transition-transform duration-500 ease-in-out group-hover:scale-105 group-hover:opacity-100"
              />
            </div>
          ) : (
            <div
              className="relative overflow-hidden flex-shrink-0 mr-4 rounded-md shadow-sm flex items-center justify-center text-white font-bold text-2xl"
              style={{
                width: "80px",
                height: "80px",
                backgroundColor: avatarBgColor
              }}
            >
              {avatarText}
            </div>
          )
        }
        <div className="flex flex-col justify-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">
            {name}
          </h3>
        </div>
      </div>
      <div className="px-4 pb-4 mt-3.5">
        <p className="text-gray-600 dark:text-gray-300 text-sm group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors duration-300">{desc}</p>
      </div>

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        backdrop="blur"
        size="2xl"
        placement="center"
        scrollBehavior="inside"
      >
        <ModalContent>
          <>
            <ModalHeader className="flex flex-col gap-1">
              {`${t("download")} ${name}`}
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <div>
                  <Select
                    label={t("channel")}
                    placeholder={t("noChannel")}
                    onChange={e => handleChannelChange(e.target.value)}
                    className="w-full"
                    isDisabled={availableChannel.length === 0}
                    selectedKeys={[channel]}
                  >
                    {availableChannel.map(channelOption => (
                      <SelectItem key={channelOption} value={channelOption}>
                        {t(channelOption)}
                      </SelectItem>
                    ))}
                  </Select>
                </div>

                <>
                  <Conditioned condition={() => renderFixedSelect(availableOS)}>
                    <Select
                      label={t("os")}
                      placeholder={t("noOs")}
                      onChange={e => handleOSChange(e.target.value)}
                      className="w-full"
                      items={availableOS}
                      selectedKeys={[os]}
                    >
                      {item => (
                        <SelectItem key={item.value}>
                          {item.label}
                        </SelectItem>
                      )}
                    </Select>
                  </Conditioned>
                </>

                <>
                  <Conditioned condition={() => renderFixedSelect(availableArch)}>
                    <Select
                      label={t("arch")}
                      placeholder={t("noArch")}
                      onChange={e => handleArchChange(e.target.value)}
                      className="w-full"
                      items={availableArch}
                      selectedKeys={[arch]}
                    >
                      {item => (
                        <SelectItem key={item.value}>
                          {item.label}
                        </SelectItem>
                      )}
                    </Select>
                  </Conditioned>
                </>

                <div>
                  <Input
                    label="CDK"
                    placeholder={t("noCDKey")}
                    value={cdk}
                    type={isPasswordVisible ? "text" : "password"}
                    onChange={e => setCdk(e.target.value)}
                    className="w-full"
                    endContent={
                      <div className="h-5/6 flex ">
                        <button
                          type="button"
                          onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                          className="focus:outline-none dark:text-gray-300"
                        >
                          {isPasswordVisible ?
                            <EyeSlashIcon
                              className="h-5 w-5 text-gray-400 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-300" />
                            :
                            <EyeIcon
                              className="h-5 w-5 text-gray-400 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-300" />
                          }
                        </button>
                      </div>
                    }
                  />
                  <div className="mt-10 text-right">
                    <Link href="/" target="_blank" size="sm" color="primary" underline="hover">
                      {t("buyCDKey")}
                    </Link>
                  </div>
                </div>
              </div>
              <div>
                <div className="mt-10 bottom-4 w-full text-center">
                  <a href="/disclaimer.html" target="_blank" className="text-xs text-gray-500 dark:text-gray-400">
                    {t.rich("disclaimer", {
                      rid: name,
                      br: () => <br />
                    })}<span aria-hidden="true">&nbsp;</span>
                  </a>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                {common("cancel")}
              </Button>
              <Button color="secondary" onPress={handleShare} isLoading={loading.loading && loading.type === "Share"}>
                {t("shareLink")}
              </Button>
              <Button color="primary" onPress={handleDownload} isLoading={loading.loading && loading.type === "Download"}>
                {t("download")}
              </Button>
            </ModalFooter>
          </>
        </ModalContent>
      </Modal>

    </div>

  );
}