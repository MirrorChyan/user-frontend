import type { ProjectCardProps } from "@/components/ProjectCard";
import { SERVER_BACKEND } from "@/app/requests/misc";

// 后端无响应时不能让页面一直挂起
const REQUEST_TIMEOUT = 10_000;

/** 获取项目列表，后端异常时返回空数组，避免整个页面渲染失败 */
export async function getProjects(): Promise<ProjectCardProps[]> {
  try {
    const res = await fetch(`${SERVER_BACKEND}/api/misc/project`, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT),
    });
    if (!res.ok) {
      console.error("Get Projects resp error:", res.status);
      return [];
    }
    const { ec, data } = await res.json();
    return ec === 200 && Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Get Projects error:", error);
    return [];
  }
}
