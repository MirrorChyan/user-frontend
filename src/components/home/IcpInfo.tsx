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
    const res = await fetch(`${SERVER_BACKEND}/api/misc/icp?domain=${head.get("Host")}`);
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
      <a href={icp.icp_url} target="_blank" className="text-xs text-gray-500 dark:text-gray-400">
        {icp.icp_beian}
        <span aria-hidden="true">&nbsp;&nbsp;</span>
        {icp.icp_entity}
      </a>
    </div>
  ) : null;
}
