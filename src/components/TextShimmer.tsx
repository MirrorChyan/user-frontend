"use client";

import { FC } from "react";
import { cn } from "@/lib/utils/css";
import "./TextShimmer.css";

interface TextShimmerProps {
  /** 要显示的文字内容 */
  children: string;
  /** 自定义类名 */
  className?: string;
}

export const TextShimmer: FC<TextShimmerProps> = ({ children, className = "" }) => {
  return <span className={cn("text-shimmer", className)}>{children}</span>;
};
