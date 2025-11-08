"use client";

import { getGroupUrl, QQ_GROUP } from "@/lib/utils/constant";
import { useEffect, useState } from "react";

export interface QQGroupProps {
  text: string;
}

export default function QQGroupLink({ text }: QQGroupProps) {
  const [url, setUrl] = useState(QQ_GROUP);

  useEffect(() => {
    getGroupUrl().then(url => {
      setUrl(url);
    });
  }, []);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
    >
      {text}
    </a>
  );
}
