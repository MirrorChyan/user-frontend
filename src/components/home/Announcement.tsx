"use client";

import { useEffect } from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@heroui/react";
import ReactMarkdown from "react-markdown";
import { useTranslations } from "next-intl";
import { addToast, closeAll } from "@heroui/toast";

type PropsType = {
  summary: string;
  details: string;
};

export default function Announcement({ details, summary }: PropsType) {
  const t = useTranslations("Component.Announcement");
  // model state
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  useEffect(() => {
    closeAll();
    addToast({
      title: (
        <div onClick={onOpen} className={"h-full w-full cursor-pointer"}>
          {t("newAnnouncement")} - {summary}
        </div>
      ),
      timeout: 60 * 1000,
      classNames: {
        base: "border-1 before:bg-primary border-primary-200 dark:border-primary-100 hover:bg-primary-100 dark:hover:bg-primary-200 transition-all duration-300",
      },
    });
  }, [summary, t, onOpen]);

  return (
    <>
      <Modal backdrop="blur" scrollBehavior="inside" isOpen={isOpen} onClose={onOpenChange}>
        <ModalContent>
          {onClose => (
            <>
              <ModalHeader className="flex flex-col gap-1">{summary}</ModalHeader>
              <ModalBody>
                <ReactMarkdown>{details}</ReactMarkdown>
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
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
