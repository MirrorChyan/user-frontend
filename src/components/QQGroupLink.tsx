"use client";

import { getGroupUrl, QQ_GROUP } from "@/lib/utils/constant";
import { useEffect, useState } from "react";

export interface QQGroupProps {
  text: string;
}

const CACHE_KEY = "mirrorchyan_contact_us_url_cache";
const CACHE_DURATION = 4 * 60 * 60 * 1000; // 4 小时

interface CachedData {
  url: string;
  timestamp: number;
}

export default function QQGroupLink({ text }: QQGroupProps) {
  const [url, setUrl] = useState(QQ_GROUP);

  useEffect(() => {
    const getCachedUrl = (): string | null => {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (!cached) return null;

        const data: CachedData = JSON.parse(cached);
        const now = Date.now();

        if (now - data.timestamp < CACHE_DURATION) {
          return data.url;
        }

        localStorage.removeItem(CACHE_KEY);
        return null;
      } catch (error) {
        localStorage.removeItem(CACHE_KEY);
        console.error("Failed to read QQ group URL cache:", error);
        return null;
      }
    };

    const setCachedUrl = (url: string) => {
      try {
        const data: CachedData = {
          url,
          timestamp: Date.now(),
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      } catch (error) {
        console.error("Failed to cache QQ group URL:", error);
      }
    };

    // 先尝试使用缓存
    const cachedUrl = getCachedUrl();
    if (cachedUrl) {
      setUrl(cachedUrl);
    } else {
      // 缓存不存在或已过期，重新获取
      getGroupUrl().then(url => {
        setUrl(url);
        setCachedUrl(url);
      });
    }
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
