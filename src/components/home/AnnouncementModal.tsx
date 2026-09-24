"use client";

import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/react";
import { useTranslations } from "next-intl";
import { ReactNode } from "react";

type AnnouncementModalProps = {
  summary: string;
  content: ReactNode;
  isOpen: boolean;
  onOpenChange: () => void;
};

export default function AnnouncementModal({
  summary,
  content,
  isOpen,
  onOpenChange,
}: AnnouncementModalProps) {
  const t = useTranslations("Component.Announcement");

  return (
    <Modal backdrop="blur" scrollBehavior="inside" isOpen={isOpen} onClose={onOpenChange}>
      <ModalContent>
        {onClose => (
          <>
            <ModalHeader className="flex flex-col gap-1">{summary}</ModalHeader>
            <ModalBody>{content}</ModalBody>
            <ModalFooter>
              <Button color="primary" onPress={onClose}>
                {t("close")}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
