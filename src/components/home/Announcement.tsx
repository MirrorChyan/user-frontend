"use client";

import { ReactNode, useEffect, useState } from "react";
import { useDisclosure } from "@heroui/react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { addToast, closeAll } from "@heroui/toast";

// 公告弹窗只有点击通知后才需要，按需加载
const AnnouncementModal = dynamic(() => import("@/components/home/AnnouncementModal"));

type PropsType = {
  summary: string;
  // 公告详情已在服务端渲染为 Markdown，客户端不需要加载 react-markdown
  content: ReactNode;
};

export default function Announcement({ content, summary }: PropsType) {
  const t = useTranslations("Component.Announcement");
  // model state
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  // 首次打开后保持挂载，保留关闭动画
  const [modalLoaded, setModalLoaded] = useState(false);

  useEffect(() => {
    const openModal = () => {
      setModalLoaded(true);
      onOpen();
    };

    closeAll();
    addToast({
      title: (
        <div onClick={openModal} className={"h-full w-full cursor-pointer"}>
          {t("newAnnouncement")} - {summary}
        </div>
      ),
      timeout: 60 * 1000,
      classNames: {
        base: "border-1 before:bg-primary border-primary-200 dark:border-primary-100 hover:bg-primary-100 dark:hover:bg-primary-200 transition-all duration-300",
      },
    });
  }, [summary, t, onOpen]);

  return modalLoaded ? (
    <AnnouncementModal
      summary={summary}
      content={content}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    />
  ) : null;
}
