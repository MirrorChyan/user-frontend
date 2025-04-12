"use client";

import React, {useState} from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Input,
  Textarea, Link
} from "@heroui/react";
import {useTranslations} from "next-intl";
import {addToast} from "@heroui/toast";
import {PlusIcon} from "@heroicons/react/24/outline";

export default function ProjectIntegratedCard() {

  const t = useTranslations("Projects");
  const url = 'https://qm.qq.com/cgi-bin/qm/qr?k=t3aoBGz5v-sDgcMnfs3WADRaeV2pAVLg&jump_from=webapi&authKey=U2cSrxI5+rQ08EtHzuKoQIfcMPYnytyd25mJ6b5sW5M5xgA6S5naSx83LN4DA3Li'
  return (
      <div
          className="rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg dark:hover:shadow-primary-500/30 transform hover:-translate-y-1 group cursor-pointer bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-100 dark:border-gray-600 flex flex-col justify-center items-center p-4 h-full"
      >
        <Link href={url} target="_blank" rel="noreferrer">
          <div className="flex flex-col items-center justify-center h-full w-full">

            <div className="bg-primary-100 dark:bg-primary-900/30 p-4 rounded-full mb-4">


              <PlusIcon className="w-10 h-10 text-primary-600 dark:text-primary-400"/>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300 text-center">
              {t("joinUs")}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors duration-300 text-center mt-2">
              {t("contactUs")}
            </p>
          </div>
        </Link>

      </div>
  );
}