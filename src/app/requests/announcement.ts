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
const announcementCache: Record<string, Announcement> = {};

// 缓存的公告更新时间
const lastFetchTime: Record<string, number> = {};
// 缓存的持续时间
const CACHE_DURATION = 60 * 1000; // 1分钟（毫秒）

export async function getAnnouncement(lang: "zh" | "en"): Promise<Announcement> {
  // Use absolute URL with origin to work properly in server components
  const now = Date.now();
  if (lastFetchTime[lang] && now - lastFetchTime[lang] < CACHE_DURATION && announcementCache[lang]) {
    return announcementCache[lang];
  }

  try {
    const res = await fetch(`${SERVER_BACKEND}/api/misc/anno?lang=${lang}`);
    const response = await res.json();

    announcementCache[lang] = response;
    lastFetchTime[lang] = now;

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
