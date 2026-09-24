"use client";

import { HeroUIProvider } from "@heroui/react";
import { ToastProvider } from "@heroui/toast";
import { MotionConfig } from "framer-motion";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <HeroUIProvider>
      {/* 系统开启“减少动画”时，framer-motion 驱动的动画（含 HeroUI 弹窗）跳过位移和缩放 */}
      <MotionConfig reducedMotion="user">
        <NextThemesProvider attribute="class">
          <ToastProvider placement="top-center" toastOffset={60} />
          {children}
        </NextThemesProvider>
      </MotionConfig>
    </HeroUIProvider>
  );
}
