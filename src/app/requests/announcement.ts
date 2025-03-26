import { SERVER_BACKEND } from "@/app/requests/misc";

type Announcement = {
  ec: number
  msg: string
  data: {
    summary: string
    details: string
  }
}

// 缓存的公告
let zhCachedAnnouncement: Announcement = {
  "ec": 400,
  "msg": "",
  "data": {
    "summary": "",
    "details": ""
  }
};
let enCachedAnnouncement: Announcement = {
  "ec": 400,
  "msg": "",
  "data": {
    "summary": "",
    "details": ""
  }
};
// 缓存的公告更新时间
let lastFetchTime = 0;
// 缓存的持续时间
const CACHE_DURATION = 60 * 1000; // 1分钟（毫秒）

export async function getAnnouncement(lang: "zh" | "en"): Promise<Announcement> {
  // Use absolute URL with origin to work properly in server components
  const now = Date.now();

  if (now - lastFetchTime < CACHE_DURATION && lang === "zh" && zhCachedAnnouncement) {
    return zhCachedAnnouncement;
  }
  if (now - lastFetchTime < CACHE_DURATION && lang === "en" && enCachedAnnouncement) {
    return enCachedAnnouncement;
  }
  try {
    const res = await fetch(`${SERVER_BACKEND}/api/misc/anno?lang=${lang}`);
    const response = await res.json();

    if (lang === "zh") {
      zhCachedAnnouncement = response;
    } else {
      enCachedAnnouncement = response;
    }
    lastFetchTime = now;

    return response;
  } catch (error) {
    console.error("Get Announcement error:", error);
    return {
      "ec": 400,
      "msg": "",
      "data": {
        "summary": "",
        "details": ""
      }
    };
  }
}
