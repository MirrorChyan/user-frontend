import { SERVER_BACKEND } from "@/app/requests/misc";
import { headers } from "next/headers";

type ICP = {
  icp_beian: string;
  icp_url: string;
  icp_entity: string;
};

async function getIcpInfo() {
  try {
    const head = await headers();
    const query = new URLSearchParams({ domain: head.get("Host") ?? "" });
    const res = await fetch(`${SERVER_BACKEND}/api/misc/icp?${query}`, {
      // 备案信息几乎不变，按域名缓存 1 小时
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      return null;
    }
    return (await res.json()) as Promise<ICP>;
  } catch (error) {
    console.error("Failed to query ICP", error);
    return null;
  }
}

export default async function IcpInfo() {
  const icp = await getIcpInfo();

  return icp ? (
    <div>
      <a
        href={icp.icp_url}
        target="_blank"
        className="text-xs text-gray-500 dark:text-gray-400"
        rel="noreferrer"
      >
        {icp.icp_beian}
        <span aria-hidden="true">&nbsp;&nbsp;</span>
        {icp.icp_entity}
      </a>
    </div>
  ) : null;
}
