"use client";

import { ReactNode } from "react";
import { Modal, ModalBody, ModalContent, ModalHeader, ModalProps } from "@heroui/react";

type AppDialogProps = {
  open: boolean;
  title?: ReactNode;
  children: ReactNode;
  /** 传入时显示右上角的关闭按钮 */
  onClose?: () => void;
  /** 是否允许点击遮罩或按 Esc 关闭；支付过程中的弹窗应关闭此项，避免误触 */
  dismissable?: boolean;
  size?: ModalProps["size"];
};

/** 全站统一的居中弹窗外壳 */
export default function AppDialog({
  open,
  title,
  children,
  onClose,
  dismissable = false,
  size = "2xl",
}: AppDialogProps) {
  const closable = !!onClose;

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      isDismissable={closable && dismissable}
      isKeyboardDismissDisabled={!closable || !dismissable}
      hideCloseButton={!closable}
      backdrop="blur"
      size={size}
      placement="center"
      scrollBehavior="inside"
      classNames={{
        base: "rounded-2xl max-sm:mx-2",
        header: "px-6 pt-8 pb-0 text-xl leading-6 font-medium sm:px-8",
        body: "px-6 pt-6 pb-8 sm:px-8",
        closeButton: "top-6 right-6",
      }}
    >
      <ModalContent>
        {title && <ModalHeader>{title}</ModalHeader>}
        <ModalBody>{children}</ModalBody>
      </ModalContent>
    </Modal>
  );
}
