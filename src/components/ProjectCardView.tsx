"use client";

import ProjectCard, { ProjectCardProps } from "@/components/ProjectCard";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CLIENT_BACKEND } from "@/app/requests/misc";
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/react";
import { getGroupUrl } from "@/lib/utils/constant";

const COOKIE_NAME = "resourceClickCounts";
const COOKIE_MAX_AGE = 3600 * 24 * 30; // 30天

const getClickCounts = (): Record<string, number> => {
  if (typeof document === "undefined") return {};
  const cookieValue = document.cookie
    .split("; ")
    .find(row => row.startsWith(`${COOKIE_NAME}=`))
    ?.split("=")[1];

  if (cookieValue) {
    try {
      return JSON.parse(decodeURIComponent(cookieValue));
    } catch {
      return {};
    }
  }
  return {};
};

const saveClickCountsToCookie = (counts: Record<string, number>) => {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(counts))};max-age=${COOKIE_MAX_AGE};path=/`;
};

export default function ProjectCardView({ projects }: { projects: Array<ProjectCardProps> }) {
  const searchParams = useSearchParams();
  const rid = searchParams.get("rid");
  const download = searchParams.get("download");
  const t = useTranslations("Download");
  const common = useTranslations("Common");
  const locale = useLocale();

  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [isLoadingAnimation, setIsLoadingAnimation] = useState(false);
  const [clickCounts, setClickCounts] = useState<Record<string, number>>({});
  const [isLoadingSort, setIsLoadingSort] = useState(true);

  useEffect(() => {
    setClickCounts(getClickCounts());
    setIsLoadingSort(false);
  }, []);

  const handleCardClick = useCallback((resource: string) => {
    const savedCounts = getClickCounts();
    const currentCount = savedCounts[resource] ?? 0;
    const newCounts = { ...savedCounts, [resource]: currentCount + 1 };
    saveClickCountsToCookie(newCounts);
  }, []);

  // 最终权重 = 基础权重 / 2^点击次数
  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => {
      const indexA = projects.indexOf(a);
      const indexB = projects.indexOf(b);
      const baseWeightA = indexA + 1;
      const baseWeightB = indexB + 1;
      const clickCountA = clickCounts[a.resource] ?? 0;
      const clickCountB = clickCounts[b.resource] ?? 0;
      const weightA = baseWeightA / Math.pow(2, clickCountA);
      const weightB = baseWeightB / Math.pow(2, clickCountB);
      return weightA - weightB;
    });
  }, [projects, clickCounts]);

  useEffect(() => {
    if (download) {
      const url = `${CLIENT_BACKEND}/api/resources/download/${download}`;
      window.location.href = url;

      setShowDownloadModal(true);
      setIsLoadingAnimation(true);

      // Simulated loading animation
      const timerId = setTimeout(() => {
        setIsLoadingAnimation(false);
      }, 1000);

      console.log(`downloading ${url}`);

      const s = new URLSearchParams(window.location.search);
      s.delete("download");
      window.history.replaceState(null, "", `/${locale}/projects?${s}`);

      return () => {
        clearTimeout(timerId);
      };
    }
  }, []);

  const handleCloseModal = () => {
    setShowDownloadModal(false);
    setIsLoadingAnimation(false);
  };

  return (
    <>
      {isLoadingSort && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/50 dark:bg-black/50">
          <div className="flex flex-col items-center gap-3">
            <svg
              className="h-10 w-10 animate-spin text-primary-600 dark:text-primary-400"
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
          </div>
        </div>
      )}

      {sortedProjects.map(project => (
        <ProjectCard
          key={project.resource}
          showModal={project.download && rid === project.resource}
          osParam={searchParams.get("os")}
          archParam={searchParams.get("arch")}
          channelParam={searchParams.get("channel")}
          onCardClick={handleCardClick}
          {...project}
        />
      ))}

      <Modal
        isDismissable={false}
        isOpen={showDownloadModal}
        onOpenChange={setShowDownloadModal}
        onClose={handleCloseModal}
        backdrop="opaque"
        size="2xl"
        placement="center"
        scrollBehavior="inside"
      >
        <ModalContent>
          <>
            <ModalBody>
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
                          className="h-8 w-8 animate-spin text-primary-600 dark:text-primary-400"
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
                      {t("downloadStartedForShare")}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {isLoadingAnimation ? t("pleaseWait") : t("downloadInProgress")}
                    </p>
                  </div>
                </div>

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
            </ModalBody>
            <ModalFooter>
              <Button color="primary" onPress={handleCloseModal} className="w-full">
                {common("close")}
              </Button>
            </ModalFooter>
          </>
        </ModalContent>
      </Modal>
    </>
  );
}
