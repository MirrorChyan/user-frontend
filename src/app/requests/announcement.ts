import { SERVER_BACKEND } from "@/app/requests/misc";

type Announcement = {
  ec: number;
  msg: string;
  data: {
    summary: string;
    details: string;
  };
};

const EMPTY_ANNOUNCEMENT: Announcement = {
  ec: 400,
  msg: "",
  data: {
    summary: "",
    details: "",
  },
};

export async function getAnnouncement(lang: "zh" | "en"): Promise<Announcement> {
  try {
    const res = await fetch(`${SERVER_BACKEND}/api/misc/anno?${new URLSearchParams({ lang })}`, {
      // 由 Next.js 数据缓存按语言分别缓存 1 分钟
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      console.error("Get Announcement resp error:", res.status);
      return EMPTY_ANNOUNCEMENT;
    }
    return await res.json();
  } catch (error) {
    console.error("Get Announcement error:", error);
    return EMPTY_ANNOUNCEMENT;
  }
}
