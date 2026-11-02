import { CLIENT_BACKEND, SERVER_BACKEND } from "@/app/requests/misc";

export type ICP = {
  icp_beian: string;
  icp_url: string;
  icp_entity: string;
};

/** 服务端按域名查询备案信息，失败时返回 null */
export async function getIcpInfo(domain: string): Promise<ICP | null> {
  try {
    const query = new URLSearchParams({ domain });
    const res = await fetch(`${SERVER_BACKEND}/api/misc/icp?${query}`, {
      // 备案信息几乎不变，按域名缓存 1 小时
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      return null;
    }
    return (await res.json()) as ICP;
  } catch (error) {
    console.error("Failed to query ICP", error);
    return null;
  }
}

/** 浏览器端查询当前域名的备案信息，供不读请求头的静态页面使用，失败时返回 null */
export async function fetchIcpInfo(domain: string, signal?: AbortSignal): Promise<ICP | null> {
  try {
    const query = new URLSearchParams({ domain });
    const res = await fetch(`${CLIENT_BACKEND}/api/misc/icp?${query}`, { signal });
    if (!res.ok) {
      return null;
    }
    return (await res.json()) as ICP;
  } catch (error) {
    if (!signal?.aborted) {
      console.error("Failed to query ICP", error);
    }
    return null;
  }
}
