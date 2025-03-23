"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@heroui/react";
import ReactMarkdown from "react-markdown";
import { useTranslations } from "next-intl";
import { closeAll, addToast } from "@heroui/toast";
import { useEffect, useState } from "react";
import type { ToastProps } from "@heroui/toast/dist/use-toast";
import {SERVER_BACKEND} from "@/app/requests/misc";

type Announcement = {
  summary: string
  details: string
}

export default function Announcement({locale = "zh"}: { locale: "zh" | "en" }) {
  const t = useTranslations("Component.Announcement");
  // model state
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  const [announcement, setAnnouncement] = useState<Announcement>();

  const getAnnouncementInfo = async () => {
    try {
      const response = await fetch(`${SERVER_BACKEND}/api/misc/anno?lang=${locale}`);
      const announcement = await response.json()

      closeAll();
      addToast({
        title: (
          <div onClick={onOpen}
               className={'cursor-pointer w-full h-full'}
          >{t("newAnnouncement")} - {announcement.data.summary}</div>
        ),
        timeout: 60000,
        classNames: {
          base: `border-1 before:bg-primary border-primary-200 dark:border-primary-100 hover:bg-primary-100 dark:hover:bg-primary-200 transition-all duration-300`
        },
      } as ToastProps);
      setAnnouncement(announcement.data);
    } catch (err) {
      console.log(err);
    }
  }
  useEffect(() => {
    getAnnouncementInfo();
    const timer = setInterval(() => {
      getAnnouncementInfo();
    }, 1000 * 60);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <Modal backdrop='blur' scrollBehavior="inside" isOpen={isOpen} onClose={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">{announcement?.summary}</ModalHeader>
              <ModalBody>
                <ReactMarkdown>{announcement?.details}</ReactMarkdown>
              </ModalBody>
              <ModalFooter>
                {/* <Button color="danger" variant="light" onPress={onClose}>
                  {t('doNotShow')}
                </Button> */}
                <Button color="primary" onPress={onClose}>
                  {t("close")}
                </Button>
              </ModalFooter>
            </>
          ) as any}
        </ModalContent>
      </Modal>
    </>
  );
}
