"use client";

import { ReactNode } from "react";
import { BackgroundLines } from "@/components/BackgroundLines";

interface LoadingStateProps {
  title?: ReactNode;
  description?: ReactNode;
}

export default function LoadingState({ title, description }: LoadingStateProps) {
  return (
    <BackgroundLines className="select-none">
      <div className="flex min-h-screen flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            {title && (
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
            )}
            {description && <div className="mt-6 text-lg/8 text-gray-600">{description}</div>}

            <div className="mt-8 flex justify-center">
              <div className="h-16 w-16 animate-spin rounded-full border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          </div>
        </div>
      </div>
    </BackgroundLines>
  );
}
