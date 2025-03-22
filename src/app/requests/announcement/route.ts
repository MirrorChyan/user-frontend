import { NextResponse } from 'next/server';
import {SERVER_BACKEND} from "@/app/requests/misc";

type Announcement = {
  ec: number
  msg: string
  data: {
    summary: string
    details: string
  }
}

// 缓存的公告
let cachedAnnouncement: Announcement | null = null;
// 缓存的汇率更新时间
let lastFetchTime = 0;
// 缓存的持续时间
const CACHE_DURATION = 60 * 1000; // 24小时（毫秒）

export async function GET(req): Promise<NextResponse<Announcement>> {
  // Use absolute URL with origin to work properly in server components
  const now = Date.now();
  if (now - lastFetchTime < CACHE_DURATION && cachedAnnouncement) {
    return NextResponse.json(cachedAnnouncement);
  }
  try {
    const res = await fetch(`${SERVER_BACKEND}/api/misc/anno?${req.url.split('?').pop()}`);
    const response = await res.json();
    cachedAnnouncement = response;
    lastFetchTime = now;

    return NextResponse.json(response);
  } catch (error) {
    console.error("Get Announcement error:", error);
    return NextResponse.json({
      "ec": 500,
      "msg": "获取公告失败",
      "data": {
        "summary": "",
        "details": ""
      }
    });
  }
}
