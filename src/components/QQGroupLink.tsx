"use client";

import { getGroupUrl, QQ_GROUP } from "@/lib/utils/constant";
import { useEffect, useState } from "react";
import { getStorageItem, removeStorageItem, setStorageItem } from "@/lib/utils/storage";

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
        const cached = getStorageItem(CACHE_KEY);
        if (!cached) return null;

        const data: CachedData = JSON.parse(cached);
        const now = Date.now();

        if (now - data.timestamp < CACHE_DURATION) {
          return data.url;
        }

        removeStorageItem(CACHE_KEY);
        return null;
      } catch (error) {
        removeStorageItem(CACHE_KEY);
        console.error("Failed to read QQ group URL cache:", error);
        return null;
      }
    };

    const setCachedUrl = (url: string) => {
      const data: CachedData = {
        url,
        timestamp: Date.now(),
      };
      setStorageItem(CACHE_KEY, JSON.stringify(data));
    };

    let cancelled = false;
    // 先尝试使用缓存，缓存不存在或已过期时重新获取
    const cachedUrl = getCachedUrl();
    const urlPromise = cachedUrl
      ? Promise.resolve(cachedUrl)
      : getGroupUrl().then(url => {
          setCachedUrl(url);
          return url;
        });
    urlPromise.then(url => {
      if (!cancelled) {
        setUrl(url);
      }
    });
    return () => {
      cancelled = true;
    };
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
