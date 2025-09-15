"use client";

import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Input,
  Textarea,
  Link,
} from "@heroui/react";
import { useTranslations } from "next-intl";
import { addToast } from "@heroui/toast";
import { PlusIcon } from "@heroicons/react/24/outline";

export default function ProjectIntegratedCard() {
  const t = useTranslations("Projects");
  const url = "https://github.com/MirrorChyan/docs";
  return (
    <div className="group flex h-full transform cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border border-gray-100 bg-gradient-to-br from-white to-gray-50 p-4 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-gray-600 dark:from-gray-800 dark:to-gray-900 dark:hover:shadow-primary-500/30">
      <Link href={url} target="_blank" rel="noreferrer">
        <div className="flex h-full w-full flex-col items-center justify-center">
          <div className="mb-4 rounded-full bg-primary-100 p-4 dark:bg-primary-900/30">
            <PlusIcon className="h-10 w-10 text-primary-600 dark:text-primary-400" />
          </div>
          <h3 className="text-center text-lg font-semibold text-gray-900 transition-colors duration-300 group-hover:text-primary-600 dark:text-white dark:group-hover:text-primary-400">
            {t("joinUs")}
          </h3>
          <p className="mt-2 text-center text-sm text-gray-600 transition-colors duration-300 group-hover:text-gray-800 dark:text-gray-300 dark:group-hover:text-gray-200">
            {t("contactUs")}
          </p>
        </div>
      </Link>
    </div>
  );
}
