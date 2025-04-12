"use client";

import React, { useMemo, useState } from "react";
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
import { useTranslations } from "next-intl";
import { addToast, ToastProps } from "@heroui/toast";
import { CLIENT_BACKEND } from "@/app/requests/misc";

export interface ProjectCardProps {
  resource: string;
  name: string;
  desc: string;
  url?: string;
  image?: string;
  support: string[];
}


export default function ProjectCard(props: ProjectCardProps) {
  const { name, desc, image, url, support, resource } = props;

  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  const [os, setOs] = useState("");
  const [arch, setArch] = useState("");
  const [channel, setChannel] = useState("");
  const [cdk, setCdk] = useState("");


  const t = useTranslations("Download");
  const common = useTranslations("Common");

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


  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
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
    setLoading(true);
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

      window.location.href = url;

      addToast({
        description: t("downloading"),
        color: "primary",
      });

    } finally {
      setLoading(false);
    }

    console.log(`downloading ${name} tuple: ${os}-${arch}-${channel}${cdk ? ` cdk: ${cdk}` : ""}`);


    onOpenChange();
  };
  const Conditioned = ({ children, condition }: {
    condition: () => boolean
    children: React.ReactElement
  }) => {
    return condition() ? children : <></>;
  };


  return (
    <div
      className={"rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg dark:hover:shadow-primary-500/30 transform hover:-translate-y-1 group cursor-pointer bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-100 dark:border-gray-600"}
      onClick={onOpen}
    >
      <div className="flex p-4">
        <div className="relative overflow-hidden flex-shrink-0 mr-4 bg-gray-50 dark:bg-gray-700 rounded-md shadow-sm"
          style={{ width: "80px", height: "80px" }}>
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover rounded-md opacity-90 transition-transform duration-500 ease-in-out group-hover:scale-105 group-hover:opacity-100"
          />
        </div>
        <div className="flex flex-col justify-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">
            {url ?
              <Tooltip content={
                <div className="px-1 py-2">
                  <Link href={url} underline="hover" color="primary" target="_blank"
                    showAnchorIcon={true}> 查看项目地址 </Link>
                </div>
              } showArrow={true} placement="top-start">
                {name}
              </Tooltip>
              : <div>{name}</div>
            }
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
        placement="center"
        scrollBehavior="inside"
      >
        <ModalContent>
          <>
            <ModalHeader className="flex flex-col gap-1">
              下载 {name}
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
                    onChange={e => setCdk(e.target.value)}
                    className="w-full"
                  />
                  <div className="mt-1 text-right">
                    <Link href="/" target="_blank" size="sm" color="primary" underline="hover">
                      {t("buyCDKey")}
                    </Link>
                  </div>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                {common("cancel")}
              </Button>
              <Button color="primary" onPress={handleDownload} isLoading={loading}>
                {t("download")}
              </Button>
            </ModalFooter>
          </>
        </ModalContent>
      </Modal>

    </div>

  );
}